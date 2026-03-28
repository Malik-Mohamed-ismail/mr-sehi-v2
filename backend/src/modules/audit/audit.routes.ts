import { Router, Request, Response, NextFunction } from 'express'
import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { auditLog } from '../../db/schema/auditLog.js'
import { users } from '../../db/schema/users.js'
import { authenticate } from '../../middleware/auth.js'
import { authorize, ADMIN_ONLY } from '../../middleware/authorize.js'

const router = Router()
router.use(authenticate, authorize(...ADMIN_ONLY))

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to, user_id, action, table_name } = req.query as any
    const conditions: any[] = []
    if (from)       conditions.push(sql`${auditLog.created_at} >= ${from}`)
    if (to)         conditions.push(sql`${auditLog.created_at} <= ${to + 'T23:59:59'}`)
    if (user_id)    conditions.push(eq(auditLog.user_id, user_id))
    if (action)     conditions.push(eq(auditLog.action as any, action))
    if (table_name) conditions.push(eq(auditLog.table_name, table_name))

    const page  = Number(req.query.page  ?? 1)
    const limit = Number(req.query.limit ?? 50)
    const rows  = await db
      .select({
        id:         auditLog.id,
        user_id:    auditLog.user_id,
        username:   users.username,
        full_name:  users.full_name,
        action:     auditLog.action,
        table_name: auditLog.table_name,
        record_id:  auditLog.record_id,
        ip_address: auditLog.ip_address,
        created_at: auditLog.created_at,
      })
      .from(auditLog)
      .leftJoin(users, eq(auditLog.user_id, users.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(auditLog.created_at))
      .limit(limit).offset((page - 1) * limit)

    res.json({ success: true, data: rows, page, limit })
  } catch (e) { next(e) }
})

export default router
