import { eq, and, desc, sql } from 'drizzle-orm'
import { Request, Response, NextFunction, Router } from 'express'
import { db } from '../../config/database.js'
import { production } from '../../db/schema/production.js'
import { writeAuditLog } from '../../utils/auditLogger.js'
import { AppError } from '../../utils/AppError.js'
import { authenticate } from '../../middleware/auth.js'
import { authorize, ADMIN_ONLY, ACCOUNTANT_PLUS, ALL_ROLES } from '../../middleware/authorize.js'

export async function createProduction(dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const [row] = await tx.insert(production).values({ ...dto, created_by: userId } as any).returning()
    await writeAuditLog(tx, { userId, action: 'CREATE', tableName: 'production', recordId: row.id, newValues: row })
    return row
  })
}

export async function listProduction(query: any) {
  const conditions: any[] = [eq(production.is_deleted, false)]
  if (query.from)         conditions.push(sql`${production.production_date} >= ${query.from}`)
  if (query.to)           conditions.push(sql`${production.production_date} <= ${query.to}`)
  if (query.product_name) conditions.push(sql`${production.product_name} ILIKE ${'%' + query.product_name + '%'}`)
  const page  = Number(query.page  ?? 1)
  const limit = Number(query.limit ?? 25)
  return db.select().from(production)
    .where(and(...conditions))
    .orderBy(desc(production.production_date))
    .limit(limit).offset((page - 1) * limit)
}

export async function getProductionSummary(from?: string, to?: string) {
  const conditions = ['is_deleted = false']
  if (from) conditions.push(`production_date >= '${from}'`)
  if (to)   conditions.push(`production_date <= '${to}'`)
  const result = await db.execute(sql.raw(`
    SELECT product_name,
      SUM(produced_kg) AS total_kg,
      SUM(waste_grams) AS total_waste_grams,
      SUM(waste_value) AS total_waste_value,
      CASE WHEN SUM(produced_kg) > 0
        THEN ROUND(SUM(waste_grams) / (SUM(produced_kg) * 1000) * 100, 2)
        ELSE 0
      END AS waste_pct
    FROM production
    WHERE ${conditions.join(' AND ')}
    GROUP BY product_name
    ORDER BY total_waste_value DESC
  `))
  return result.rows
}

export async function deleteProduction(id: string, userId: string) {
  const [old] = await db.select().from(production).where(eq(production.id, id))
  if (!old) throw new AppError('NOT_FOUND', 404)
  return db.transaction(async (tx) => {
    const [row] = await tx.update(production)
      .set({ is_deleted: true, updated_at: new Date() } as any)
      .where(eq(production.id, id)).returning()
    await writeAuditLog(tx, { userId, action: 'DELETE', tableName: 'production', recordId: id, oldValues: old })
    return row
  })
}

// ── Controller + Routes ───────────────────────────────────────────────────
async function listCtrl(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await listProduction(req.query) }) } catch (e) { next(e) }
}
async function createCtrl(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: await createProduction(req.body, req.user.id), message: 'تم تسجيل الإنتاج' }) } catch (e) { next(e) }
}
async function removeCtrl(req: Request, res: Response, next: NextFunction) {
  try { await deleteProduction(req.params.id, req.user.id); res.json({ success: true, message: 'تم الحذف بنجاح' }) } catch (e) { next(e) }
}
async function summaryCtrl(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await getProductionSummary(req.query.from as any, req.query.to as any) }) } catch (e) { next(e) }
}

const router = Router()
router.use(authenticate)
router.get ('/',        authorize(...ALL_ROLES),       listCtrl)
router.get ('/summary', authorize(...ALL_ROLES),       summaryCtrl)
router.post('/',        authorize(...ALL_ROLES),       createCtrl)
router.delete('/:id',   authorize(...ADMIN_ONLY),      removeCtrl)

export default router
