// ── Controller ────────────────────────────────────────────────────────────
import { Request, Response, NextFunction } from 'express'
import * as svc from './suppliers.service.js'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await svc.listSuppliers(req.query as any)
    res.json({ success: true, ...result })
  } catch (err) { next(err) }
}
export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.getSupplier(req.params.id) })
  } catch (err) { next(err) }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await svc.createSupplier(req.body, req.user.id), message: 'تم إضافة المورد' })
  } catch (err) { next(err) }
}
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.updateSupplier(req.params.id, req.body, req.user.id), message: 'تم تحديث المورد' })
  } catch (err) { next(err) }
}
export async function deactivate(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.deactivateSupplier(req.params.id, req.user.id), message: 'تم تعطيل المورد' })
  } catch (err) { next(err) }
}
export async function ledger(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as any
    res.json({ success: true, data: await svc.getSupplierLedger(req.params.id, from, to) })
  } catch (err) { next(err) }
}
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.deleteSupplier(req.params.id, req.user.id), message: 'تم الحذف بنجاح' })
  } catch (err) { next(err) }
}
