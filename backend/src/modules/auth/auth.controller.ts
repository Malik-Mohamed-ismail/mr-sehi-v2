import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import * as authService from './auth.service.js'
import { env } from '../../config/env.js'

const COOKIE_NAME    = 'refreshToken'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days in ms
}

/**
 * CSRF double-submit cookie — NOT httpOnly so JS can read & send as X-CSRFToken header.
 * The backend verifies the header matches the cookie value.
 */
const CSRF_COOKIE_OPTIONS = {
  httpOnly: false,
  secure:   env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge:   30 * 24 * 60 * 60 * 1000,
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(
      req.body,
      req.ip,
      req.headers['user-agent']
    )
    const csrfToken = crypto.randomBytes(32).toString('hex')
    res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS)
    res.cookie('csrf-token', csrfToken, CSRF_COOKIE_OPTIONS)
    res.json({ success: true, data: { accessToken: result.accessToken, user: result.user } })
  } catch (err) { next(err) }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[COOKIE_NAME]
    if (!token) return next(new (await import('../../utils/AppError.js')).AppError('UNAUTHORIZED', 401))
    const result = await authService.refreshAccessToken(token)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[COOKIE_NAME]
    if (token) await authService.logout(token, req.ip, req.headers['user-agent'])
    res.clearCookie(COOKIE_NAME)
    res.clearCookie('csrf-token')
    res.json({ success: true, data: null, message: 'تم تسجيل الخروج' })
  } catch (err) { next(err) }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: req.user })
  } catch (err) { next(err) }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.changePassword(req.user.id, req.body)
    res.json({ success: true, data: null, message: 'تم تغيير كلمة المرور' })
  } catch (err) { next(err) }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.createUser(req.body, req.user.id)
    res.status(201).json({ success: true, data: user, message: 'تم إنشاء المستخدم' })
  } catch (err) { next(err) }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await authService.listUsers()
    res.json({ success: true, data: users })
  } catch (err) { next(err) }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.updateUser(req.params.id, req.body)
    res.json({ success: true, data: user, message: 'تم تحديث المستخدم' })
  } catch (err) { next(err) }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.deleteUser(req.params.id)
    res.json({ success: true, data: null, message: 'تم حذف المستخدم بنجاح' })
  } catch (err) { next(err) }
}
