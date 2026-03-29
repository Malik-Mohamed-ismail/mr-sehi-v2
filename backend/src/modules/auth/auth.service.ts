import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { eq, and, gt } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { env } from '../../config/env.js'
import { users, NewUser } from '../../db/schema/users.js'
import { refreshTokens } from '../../db/schema/refreshTokens.js'
import { AppError } from '../../utils/AppError.js'
import { writeAuditLog } from '../../utils/auditLogger.js'
import type { LoginDto, CreateUserDto, UpdateUserDto, ChangePasswordDto } from './auth.schema.js'

const SALT_ROUNDS  = 12
const MAX_ATTEMPTS = 5
const LOCKOUT_MS   = 15 * 60 * 1000 // 15 minutes

// ── In-memory lockout store ────────────────────────────────────────────────
interface LockoutRecord { count: number; firstAttempt: number; lockedUntil?: number }
const loginAttempts = new Map<string, LockoutRecord>()

function checkLockout(email: string): void {
  const now    = Date.now()
  const record = loginAttempts.get(email)
  if (!record) return

  if (record.lockedUntil) {
    if (now < record.lockedUntil) {
      const remainingMin = Math.ceil((record.lockedUntil - now) / 60_000)
      throw new AppError('RATE_LIMITED', 429, `الحساب مقفل مؤقتاً — حاول بعد ${remainingMin} دقيقة`)
    }
    loginAttempts.delete(email)
    return
  }

  if (now - record.firstAttempt > LOCKOUT_MS) {
    loginAttempts.delete(email)
  }
}

function recordFailedAttempt(email: string): void {
  const now    = Date.now()
  const record = loginAttempts.get(email) ?? { count: 0, firstAttempt: now }
  record.count++
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS
  }
  loginAttempts.set(email, record)
}

function clearAttempts(email: string): void {
  loginAttempts.delete(email)
}

function signAccessToken(user: { id: string; role: string; username: string }): string {
  return jwt.sign(
    { sub: user.id, role: user.role, username: user.username },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY as any }
  )
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// ── Login ─────────────────────────────────────────────────────────────────
export async function login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
  const emailKey = dto.email.toLowerCase()

  // 1. Check lockout before hitting the DB
  checkLockout(emailKey)

  const [user] = await db.select().from(users)
    .where(eq(users.email, emailKey))

  if (!user || !user.is_active) {
    recordFailedAttempt(emailKey)
    throw new AppError('UNAUTHORIZED', 401, 'بيانات الدخول غير صحيحة')
  }

  const valid = await bcrypt.compare(dto.password, user.password_hash)
  if (!valid) {
    recordFailedAttempt(emailKey)
    throw new AppError('UNAUTHORIZED', 401, 'بيانات الدخول غير صحيحة')
  }

  // 2. Successful login — clear lockout record
  clearAttempts(emailKey)

  // 3. Generate tokens
  const accessToken   = signAccessToken(user)
  const refreshToken  = crypto.randomBytes(40).toString('hex')
  const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  await db.transaction(async (tx) => {
    await tx.insert(refreshTokens).values({
      user_id:    user.id,
      token_hash: hashToken(refreshToken),
      expires_at: refreshExpiry,
    })
    await tx.update(users)
      .set({ last_login: new Date() })
      .where(eq(users.id, user.id))
    await writeAuditLog(tx, {
      userId: user.id, action: 'LOGIN',
      tableName: 'users', recordId: user.id,
      ipAddress, userAgent,
    })
  })

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username, email: user.email, full_name: user.full_name, role: user.role },
  }
}

// ── Refresh ───────────────────────────────────────────────────────────────
export async function refreshAccessToken(refreshToken: string) {
  const tokenHash = hashToken(refreshToken)
  const now       = new Date()

  const [stored] = await db.select().from(refreshTokens)
    .where(and(
      eq(refreshTokens.token_hash, tokenHash),
      eq(refreshTokens.revoked, false),
      gt(refreshTokens.expires_at, now)
    ))

  if (!stored) throw new AppError('UNAUTHORIZED', 401, 'الجلسة منتهية — سجّل الدخول مجدداً')

  const [user] = await db.select().from(users).where(eq(users.id, stored.user_id!))
  if (!user || !user.is_active) throw new AppError('UNAUTHORIZED', 401, 'الحساب غير نشط')

  const newAccessToken = signAccessToken(user)
  return { accessToken: newAccessToken }
}

// ── Logout ────────────────────────────────────────────────────────────────
export async function logout(refreshToken: string) {
  const tokenHash = hashToken(refreshToken)
  await db.update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.token_hash, tokenHash))
}

// ── Change Password ───────────────────────────────────────────────────────
export async function changePassword(userId: string, dto: ChangePasswordDto) {
  const [user] = await db.select().from(users).where(eq(users.id, userId))
  if (!user) throw new AppError('NOT_FOUND', 404)

  const valid = await bcrypt.compare(dto.old_password, user.password_hash)
  if (!valid) throw new AppError('VALIDATION_ERROR', 400, 'كلمة المرور الحالية غير صحيحة')

  const newHash = await bcrypt.hash(dto.new_password, SALT_ROUNDS)
  await db.update(users).set({ password_hash: newHash }).where(eq(users.id, userId))

  // Revoke all refresh tokens on password change
  await db.update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.user_id, userId))
}

// ── User CRUD (Admin) ─────────────────────────────────────────────────────
export async function createUser(dto: CreateUserDto, createdBy: string) {
  const hash = await bcrypt.hash(dto.password, SALT_ROUNDS)
  const [user] = await db.insert(users).values({
    username:      dto.username,
    email:         dto.email.toLowerCase(),
    password_hash: hash,
    full_name:     dto.full_name,
    role:          dto.role,
  } as NewUser).returning()
  return sanitizeUser(user)
}

export async function listUsers() {
  const rows = await db.select().from(users)
  return rows.map(sanitizeUser)
}

export async function updateUser(userId: string, dto: UpdateUserDto) {
  // Explicitly pick only whitelisted fields — no type-unsafe spread
  type UserUpdateFields = { full_name?: string; role?: 'admin' | 'accountant' | 'cashier'; is_active?: boolean }
  const patch: UserUpdateFields = {}
  if (dto.full_name !== undefined) patch.full_name = dto.full_name
  if (dto.role      !== undefined) patch.role      = dto.role
  if (dto.is_active !== undefined) patch.is_active = dto.is_active

  const [updated] = await db.update(users)
    .set(patch as any)
    .where(eq(users.id, userId))
    .returning()
  if (!updated) throw new AppError('NOT_FOUND', 404)
  return sanitizeUser(updated)
}

export async function deleteUser(userId: string) {
  try {
    const [deleted] = await db.delete(users).where(eq(users.id, userId)).returning()
    if (!deleted) {
      throw new AppError('NOT_FOUND', 404, 'المستخدم غير موجود')
    }
  } catch (error: any) {
    if (error.code === '23503') { // Postgres foreign_key_violation
      throw new AppError('VALIDATION_ERROR', 400, 'لا يمكن حذف المستخدم لوجود سجلات مالية مرتبطة به. يمكنك إيقاف حسابه بدلاً من ذلك.')
    }
    throw error
  }
}

function sanitizeUser(u: typeof users.$inferSelect) {
  const { password_hash, ...safe } = u
  return safe
}
