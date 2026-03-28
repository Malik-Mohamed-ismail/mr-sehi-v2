import { eq, and, desc, sql } from 'drizzle-orm'
import { Request, Response, NextFunction, Router } from 'express'
import { db } from '../../config/database.js'
import { pettyCash } from '../../db/schema/pettyCash.js'
import { reconcilePettyCash } from '../../utils/accounting.js'
import { writeAuditLog } from '../../utils/auditLogger.js'
import { AppError } from '../../utils/AppError.js'
import { authenticate } from '../../middleware/auth.js'
import { authorize, ADMIN_ONLY, ACCOUNTANT_PLUS, ALL_ROLES } from '../../middleware/authorize.js'

export async function createPettyCash(dto: any, userId: string) {
  const reconciliation = reconcilePettyCash(dto)
  return db.transaction(async (tx) => {
    const [row] = await tx.insert(pettyCash).values({
      ...dto,
      variance:    String(reconciliation.variance),
      is_balanced: reconciliation.isBalanced,
      created_by:  userId,
    } as any).returning()
    await writeAuditLog(tx, { userId, action: 'CREATE', tableName: 'petty_cash', recordId: row.id, newValues: row })
    return row
  })
}

export async function listPettyCash(query: any) {
  const conditions: any[] = []
  if (query.from) conditions.push(sql`${pettyCash.transaction_date} >= ${query.from}`)
  if (query.to)   conditions.push(sql`${pettyCash.transaction_date} <= ${query.to}`)
  return db.select().from(pettyCash)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(pettyCash.transaction_date))
}

export async function getReconciliation(date?: string) {
  const d = date ?? new Date().toISOString().split('T')[0]
  const [row] = await db.select().from(pettyCash)
    .where(eq(pettyCash.transaction_date, d))
  if (!row) return { date: d, message: 'لا توجد بيانات لهذا اليوم' }
  const reconciliation = reconcilePettyCash(row)
  return { date: d, ...row, ...reconciliation }
}

export async function updatePettyCash(id: string, dto: any, userId: string) {
  const [old] = await db.select().from(pettyCash).where(eq(pettyCash.id, id))
  if (!old) throw new AppError('NOT_FOUND', 404)
  const reconciliation = reconcilePettyCash(dto)
  return db.transaction(async (tx) => {
    const [row] = await tx.update(pettyCash)
      .set({
        ...dto,
        variance:    String(reconciliation.variance),
        is_balanced: reconciliation.isBalanced,
      } as any)
      .where(eq(pettyCash.id, id))
      .returning()
    await writeAuditLog(tx, { userId, action: 'UPDATE', tableName: 'petty_cash', recordId: id, oldValues: old, newValues: row })
    return row
  })
}

export async function deletePettyCash(id: string, userId: string) {
  const [old] = await db.select().from(pettyCash).where(eq(pettyCash.id, id))
  if (!old) throw new AppError('NOT_FOUND', 404)
  return db.transaction(async (tx) => {
    const [row] = await tx.delete(pettyCash)
      .where(eq(pettyCash.id, id)).returning()
    await writeAuditLog(tx, { userId, action: 'DELETE', tableName: 'petty_cash', recordId: id, oldValues: old })
    return row
  })
}

// ── Rollover: carry closing balance to next day's opening ─────────────────
export async function rolloverPettyCash() {
  const today     = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const [last]    = await db.select().from(pettyCash)
    .where(eq(pettyCash.transaction_date, yesterday))
  if (!last) return

  const exists = await db.select().from(pettyCash).where(eq(pettyCash.transaction_date, today))
  if (exists.length) return  // already exists today

  await db.insert(pettyCash).values({
    transaction_date:      today,
    opening_balance:       last.closing_balance,
    cashier_replenishment: '0',
    cash_purchases:        '0',
    card_purchases:        '0',
    closing_balance:       last.closing_balance,
    variance:              '0',
    is_balanced:           true,
  } as any)
}

// ── Controller + Routes ───────────────────────────────────────────────────
async function listCtrl(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await listPettyCash(req.query) }) } catch (e) { next(e) }
}
async function createCtrl(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: await createPettyCash(req.body, req.user.id), message: 'تم حفظ العهدة' }) } catch (e) { next(e) }
}
async function updateCtrl(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await updatePettyCash(req.params.id, req.body, req.user.id), message: 'تم تعديل العهدة بنجاح' }) } catch (e) { next(e) }
}
async function reconciliationCtrl(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await getReconciliation(req.query.date as string) }) } catch (e) { next(e) }
}
async function removeCtrl(req: Request, res: Response, next: NextFunction) {
  try { await deletePettyCash(req.params.id, req.user.id); res.json({ success: true, message: 'تم الحذف بنجاح' }) } catch (e) { next(e) }
}

const router = Router()
router.use(authenticate)
router.get ('/',                authorize(...ACCOUNTANT_PLUS), listCtrl)
router.get ('/reconciliation',  authorize(...ACCOUNTANT_PLUS), reconciliationCtrl)
router.post('/',                authorize(...ALL_ROLES),       createCtrl)
router.put ('/:id',             authorize(...ACCOUNTANT_PLUS), updateCtrl)
router.delete('/:id',           authorize(...ADMIN_ONLY),      removeCtrl)

export default router
