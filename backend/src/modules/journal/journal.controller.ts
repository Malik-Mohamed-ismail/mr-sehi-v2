// ── Controller ────────────────────────────────────────────────────────────
import { Request, Response, NextFunction } from 'express'
import * as svc from './journal.service.js'

export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, ...(await svc.listEntries(req.query)) }) }
  catch (err) { next(err) }
}
export async function get(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getEntry(req.params.id) }) }
  catch (err) { next(err) }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await svc.createManualEntry(req.body, req.user.id), message: 'تم حفظ القيد' })
  } catch (err) { next(err) }
}
export async function reverse(req: Request, res: Response, next: NextFunction) {
  try {
    const reversal = await svc.reverseEntry(req.params.id, req.body.reason ?? 'عكس يدوي', req.user.id)
    res.json({ success: true, data: reversal, message: 'تم عكس القيد بنجاح' })
  } catch (err) { next(err) }
}
export async function trialBalance(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.getTrialBalance(req.query.date as string) })
  } catch (err) { next(err) }
}
export async function ledger(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as any
    res.json({ success: true, data: await svc.getLedger(req.params.accountCode, from, to) })
  } catch (err) { next(err) }
}
export async function allLedger(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as any
    res.json({ success: true, data: await svc.getLedger(undefined, from, to) })
  } catch (err) { next(err) }
}
