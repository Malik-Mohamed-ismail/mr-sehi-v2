import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import { env } from './config/env.js'
import { requestLogger } from './middleware/requestLogger.js'
import { errorHandler } from './middleware/errorHandler.js'
import { apiLimiter } from './middleware/rateLimiter.js'

import authRoutes        from './modules/auth/auth.routes.js'
import suppliersRoutes   from './modules/suppliers/suppliers.routes.js'
import purchasesRoutes   from './modules/purchases/purchases.routes.js'
import revenueRoutes     from './modules/revenue/revenue.routes.js'
import subscribersRoutes from './modules/subscribers/subscribers.routes.js'
import expensesRoutes    from './modules/expenses/expenses.routes.js'
import pettyCashRoutes   from './modules/petty-cash/pettyCash.routes.js'
import productionRoutes  from './modules/production/production.routes.js'
import accountsRoutes    from './modules/accounts/accounts.routes.js'
import journalRoutes     from './modules/journal/journal.routes.js'
import reportsRoutes     from './modules/reports/reports.routes.js'
import auditRoutes       from './modules/audit/audit.routes.js'
import settingsRoutes    from './modules/settings/settings.routes.js'
import lookupsRoutes     from './modules/lookups/lookups.routes.js'
import fixedAssetsRoutes from './modules/fixedAssets/fixedAssets.routes.js'
import { authenticate }  from './middleware/auth.js'
import { authorize, ACCOUNTANT_PLUS } from './middleware/authorize.js'
import * as journalCtrl  from './modules/journal/journal.controller.js'

export function createApp() {
  const app = express()

  app.use(compression())
  app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }))

  app.use(cors({
    origin:         env.FRONTEND_URL,
    credentials:    true,
    methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-ID'],
  }))

  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser(env.COOKIE_SECRET))
  app.use(requestLogger)
  app.use('/api/', apiLimiter)

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'mr-sehi-api', timestamp: new Date().toISOString() })
  })

  const api = '/api/v1'
  app.use(`${api}/auth`,        authRoutes)
  app.use(`${api}/suppliers`,   suppliersRoutes)
  app.use(`${api}/purchases`,   purchasesRoutes)
  app.use(`${api}/revenue`,     revenueRoutes)
  app.use(`${api}/subscribers`, subscribersRoutes)
  app.use(`${api}/expenses`,    expensesRoutes)
  app.use(`${api}/petty-cash`,  pettyCashRoutes)
  app.use(`${api}/production`,  productionRoutes)
  app.use(`${api}/accounts`,    accountsRoutes)
  app.use(`${api}/journal`,     journalRoutes)
  app.use(`${api}/reports`,     reportsRoutes)
  app.use(`${api}/audit-log`,   auditRoutes)
  app.use(`${api}/settings`,    settingsRoutes)
  app.use(`${api}/lookups`,      lookupsRoutes)
  app.use(`${api}/fixed-assets`, fixedAssetsRoutes)

  // Standalone ledger + trial balance endpoints
  app.get(`${api}/trial-balance`,         authenticate, authorize(...ACCOUNTANT_PLUS), journalCtrl.trialBalance)
  app.get(`${api}/ledger`,                authenticate, authorize(...ACCOUNTANT_PLUS), journalCtrl.allLedger)
  app.get(`${api}/ledger/:accountCode`,   authenticate, authorize(...ACCOUNTANT_PLUS), journalCtrl.ledger)

  app.use((_req, res) => {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'المسار غير موجود' } })
  })

  app.use(errorHandler)

  return app
}
