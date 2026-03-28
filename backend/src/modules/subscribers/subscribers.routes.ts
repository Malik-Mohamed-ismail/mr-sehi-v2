// ── Controller ────────────────────────────────────────────────────────────
import { Request, Response, NextFunction } from 'express'
import * as svc from './subscribers.service.js'

export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, ...(await svc.listSubscribers(req.query)) }) }
  catch (err) { next(err) }
}
export async function expiring(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getExpiringSubscribers(Number(req.query.days ?? 7)) }) }
  catch (err) { next(err) }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: await svc.createSubscriber(req.body, req.user.id), message: 'تم إضافة المشترك' }) }
  catch (err) { next(err) }
}
export async function update(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.updateSubscriber(req.params.id, req.body, req.user.id), message: 'تم تحديث المشترك' }) }
  catch (err) { next(err) }
}
export async function renew(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.renewSubscriber(req.params.id, req.user.id), message: 'تم تجديد الاشتراك وإنشاء قيد الإيراد' }) }
  catch (err) { next(err) }
}
export async function remove(req: Request, res: Response, next: NextFunction) {
  try { await svc.deleteSubscriber(req.params.id, req.user.id); res.json({ success: true, message: 'تم الحذف بنجاح' }) }
  catch (err) { next(err) }
}
export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try { await svc.updateAllStatuses(); res.json({ success: true, data: null, message: 'تم تحديث حالة الاشتراكات' }) }
  catch (err) { next(err) }
}
export async function stats(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getStats() }) }
  catch (err) { next(err) }
}

// ── Routes ─────────────────────────────────────────────────────────────────
import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { authorize, ADMIN_ONLY, ACCOUNTANT_PLUS, ALL_ROLES } from '../../middleware/authorize.js'

const router = Router()
router.use(authenticate)

router.get ('/',               authorize(...ALL_ROLES),       list)
router.get ('/expiring',       authorize(...ALL_ROLES),       expiring)
router.get ('/stats',          authorize(...ACCOUNTANT_PLUS), stats)
router.post('/',               authorize(...ALL_ROLES),       create)
router.put ('/:id',            authorize(...ALL_ROLES),       update)
router.post('/:id/renew',      authorize(...ALL_ROLES),       renew)
router.delete('/:id',          authorize(...ADMIN_ONLY),      remove)
router.patch('/update-status', authorize(...ACCOUNTANT_PLUS), updateStatus)

export default router
