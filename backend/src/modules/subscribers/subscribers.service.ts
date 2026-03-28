import { eq, and, desc, sql, lte } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { subscribers } from '../../db/schema/subscribers.js'
import { subscriptionRevenue } from '../../db/schema/revenue.js'
import { generateEntryNumber } from '../../utils/entryNumberGenerator.js'
import { journalEntries, journalEntryLines } from '../../db/schema/journal.js'
import { validateJournalBalance } from '../../utils/accounting.js'
import { writeAuditLog } from '../../utils/auditLogger.js'
import { AppError } from '../../utils/AppError.js'

export async function listSubscribers(query: any) {
  const conditions: any[] = [eq(subscribers.is_deleted, false)]
  if (query.status) conditions.push(eq(subscribers.status as any, query.status))
  const page  = Number(query.page  ?? 1)
  const limit = Number(query.limit ?? 25)
  const [rows, [{ count }]] = await Promise.all([
    db.select().from(subscribers).where(and(...conditions))
      .orderBy(desc(subscribers.created_at)).limit(limit).offset((page - 1) * limit),
    db.select({ count: sql<number>`count(*)::int` }).from(subscribers).where(and(...conditions)),
  ])
  return { data: rows, total: count, page, limit }
}

export async function getExpiringSubscribers(days = 7) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + days)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  const todayStr  = new Date().toISOString().split('T')[0]
  return db.select().from(subscribers)
    .where(and(
      eq(subscribers.is_deleted, false),
      eq(subscribers.status as any, 'active'),
      lte(subscribers.end_date, cutoffStr),
      sql`${subscribers.end_date} >= ${todayStr}`,
    ))
    .orderBy(subscribers.end_date)
}

export async function createSubscriber(dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const [row] = await tx.insert(subscribers).values({ ...dto, created_by: userId } as any).returning()
    await writeAuditLog(tx, { userId, action: 'CREATE', tableName: 'subscribers', recordId: row.id, newValues: row })
    return row
  })
}

export async function updateSubscriber(id: string, dto: any, userId: string) {
  const [old] = await db.select().from(subscribers).where(eq(subscribers.id, id))
  if (!old) throw new AppError('NOT_FOUND', 404)
  const [row] = await db.transaction(async (tx) => {
    const [updated] = await tx.update(subscribers)
      .set({ ...dto, updated_at: new Date() } as any)
      .where(eq(subscribers.id, id)).returning()
    await writeAuditLog(tx, { userId, action: 'UPDATE', tableName: 'subscribers', recordId: id, oldValues: old, newValues: updated })
    return [updated]
  })
  return row
}

export async function renewSubscriber(id: string, userId: string) {
  const [sub] = await db.select().from(subscribers).where(eq(subscribers.id, id))
  if (!sub) throw new AppError('NOT_FOUND', 404)

  return db.transaction(async (tx) => {
    // Extend end_date by 30 days from current end_date
    const currentEnd = new Date(sub.end_date)
    currentEnd.setDate(currentEnd.getDate() + 30)
    const newEnd = currentEnd.toISOString().split('T')[0]
    const today  = new Date().toISOString().split('T')[0]

    const [updated] = await tx.update(subscribers)
      .set({ end_date: newEnd, status: 'active', updated_at: new Date() } as any)
      .where(eq(subscribers.id, id)).returning()

    // Create subscription revenue entry
    const REVENUE_ACCOUNT = '410103'
    const BANK_ACCOUNT    = '1104'
    const amount          = Number(sub.plan_amount)
    const lines           = [
      { account_code: BANK_ACCOUNT,    debit_amount: amount, credit_amount: 0 },
      { account_code: REVENUE_ACCOUNT, debit_amount: 0, credit_amount: amount },
    ]
    const entryNumber = await generateEntryNumber(tx, 'R')
    const [entry] = await tx.insert(journalEntries).values({
      entry_number: entryNumber, entry_date: today,
      description: `تجديد اشتراك — ${sub.name}`, source_type: 'revenue',
      is_balanced: true, created_by: userId,
    } as any).returning()
    await tx.insert(journalEntryLines).values(lines.map((l: any) => ({ ...l, entry_id: entry.id })))

    await tx.insert(subscriptionRevenue).values({
      revenue_date: today, subscriber_id: id,
      amount: String(amount), payment_method: sub.payment_method ?? 'بنك',
      journal_entry_id: entry.id, created_by: userId,
      notes: `تجديد اشتراك — ${sub.name}`,
    } as any)

    await writeAuditLog(tx, { userId, action: 'UPDATE', tableName: 'subscribers', recordId: id, oldValues: sub, newValues: updated })
    return { subscriber: updated, entry }
  })
}

export async function updateAllStatuses() {
  const today = new Date().toISOString().split('T')[0]
  await db.update(subscribers)
    .set({ status: 'expired', updated_at: new Date() } as any)
    .where(and(
      eq(subscribers.is_deleted, false),
      eq(subscribers.status as any, 'active'),
      sql`${subscribers.end_date} < ${today}`,
    ))
}

export async function deleteSubscriber(id: string, userId: string) {
  const [old] = await db.select().from(subscribers).where(eq(subscribers.id, id))
  if (!old) throw new AppError('NOT_FOUND', 404)
  return db.transaction(async (tx) => {
    const [row] = await tx.update(subscribers)
      .set({ is_deleted: true, updated_at: new Date() } as any)
      .where(eq(subscribers.id, id)).returning()
    await writeAuditLog(tx, { userId, action: 'DELETE', tableName: 'subscribers', recordId: id, oldValues: old })
    return row
  })
}

export async function getStats() {
  const stats = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'active'  AND is_deleted = false) AS active,
      COUNT(*) FILTER (WHERE status = 'expired' AND is_deleted = false) AS expired,
      COUNT(*) FILTER (WHERE status = 'cancelled' AND is_deleted = false) AS cancelled,
      COALESCE(SUM(plan_amount) FILTER (WHERE status = 'active' AND is_deleted = false), 0) AS active_mrr
    FROM subscribers
  `)
  return (stats as any).rows[0]
}
