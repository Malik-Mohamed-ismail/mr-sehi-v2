// ── Controller ────────────────────────────────────────────────────────────
import { Request, Response, NextFunction } from 'express'
import * as svc from './purchases.service.js'

export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, ...(await svc.listPurchases(req.query as any)) }) }
  catch (err) { next(err) }
}
export async function get(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getPurchase(req.params.id) }) }
  catch (err) { next(err) }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({
      success: true,
      data: await svc.createPurchaseInvoice(req.body, req.user.id),
      message: 'تم حفظ الفاتورة وإنشاء القيد المحاسبي تلقائياً',
    })
  } catch (err) { next(err) }
}
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: await svc.updatePurchaseInvoice(req.params.id, req.body, req.user.id),
      message: 'تم تعديل الفاتورة وتحديث القيد المحاسبي بنجاح',
    })
  } catch (err) { next(err) }
}
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deletePurchase(req.params.id, req.user.id)
    res.json({ success: true, data: null, message: 'تم حذف الفاتورة وعكس القيد المحاسبي' })
  } catch (err) { next(err) }
}
export async function vatReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as any
    res.json({ success: true, data: await svc.getVATReport(from, to) })
  } catch (err) { next(err) }
}
