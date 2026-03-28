import { Request, Response, NextFunction, Router } from 'express'
import * as svc from './reports.service.js'
import { authenticate } from '../../middleware/auth.js'
import { authorize, ADMIN_ONLY, ACCOUNTANT_PLUS, ALL_ROLES } from '../../middleware/authorize.js'
import { reportLimiter } from '../../middleware/rateLimiter.js'

function getDateRange(query: any): { from: string; to: string } {
  const now  = new Date()
  const from = query.from ?? `${now.getFullYear()}-01-01`
  const to   = query.to   ?? now.toISOString().split('T')[0]
  return { from, to }
}

async function incomeStatement(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = getDateRange(req.query)
    res.json({ success: true, data: await svc.getIncomeStatement(from, to) })
  } catch (e) { next(e) }
}

async function balanceSheet(req: Request, res: Response, next: NextFunction) {
  try {
    const date = (req.query.date as string) ?? new Date().toISOString().split('T')[0]
    res.json({ success: true, data: await svc.getBalanceSheet(date) })
  } catch (e) { next(e) }
}

async function dashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = getDateRange(req.query)
    res.json({ success: true, data: await svc.getDashboard(from, to) })
  } catch (e) { next(e) }
}

async function breakeven(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = getDateRange(req.query)
    res.json({ success: true, data: await svc.getBreakevenAnalysis(from, to) })
  } catch (e) { next(e) }
}

async function vatSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = getDateRange(req.query)
    res.json({ success: true, data: await svc.getVATSummary(from, to) })
  } catch (e) { next(e) }
}

async function performanceTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = getDateRange(req.query)
    res.json({ success: true, data: await svc.getPerformanceTrends(from, to) })
  } catch (e) { next(e) }
}

async function channelAnalysis(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = getDateRange(req.query)
    res.json({ success: true, data: await svc.getChannelAnalysis(from, to) })
  } catch (e) { next(e) }
}

async function wasteAnalysis(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = getDateRange(req.query)
    res.json({ success: true, data: await svc.getWasteAnalysis(from, to) })
  } catch (e) { next(e) }
}

async function cashFlow(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = getDateRange(req.query)
    res.json({ success: true, data: await svc.getCashFlow(from, to) })
  } catch (e) { next(e) }
}

const router = Router()
router.use(authenticate)

router.get('/dashboard',          authorize(...ALL_ROLES),       dashboard)
router.get('/performance-trends', authorize(...ALL_ROLES),       reportLimiter, performanceTrends)
router.get('/income-statement',   authorize(...ACCOUNTANT_PLUS), reportLimiter, incomeStatement)
router.get('/balance-sheet',      authorize(...ACCOUNTANT_PLUS), reportLimiter, balanceSheet)
router.get('/breakeven',          authorize(...ACCOUNTANT_PLUS), breakeven)
router.get('/vat-summary',        authorize(...ACCOUNTANT_PLUS), vatSummary)
router.get('/channel-analysis',   authorize(...ACCOUNTANT_PLUS), channelAnalysis)
router.get('/waste-analysis',     authorize(...ACCOUNTANT_PLUS), wasteAnalysis)
router.get('/cash-flow',          authorize(...ACCOUNTANT_PLUS), cashFlow)

export default router
