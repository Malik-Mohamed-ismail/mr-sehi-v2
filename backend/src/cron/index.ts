import cron from 'node-cron'
import { logger } from '../config/logger.js'

let updateAllStatuses: () => Promise<void>
let rolloverPettyCash: () => Promise<void>
let purgeTokens: () => Promise<void>

// Lazy-load to avoid circular dependency
async function loadServices() {
  const subSvc  = await import('../modules/subscribers/subscribers.service.js')
  const pcSvc   = await import('../modules/petty-cash/pettyCash.routes.js')
  const authSvc = await import('./purgeExpiredTokens.js')
  updateAllStatuses = subSvc.updateAllStatuses
  rolloverPettyCash = pcSvc.rolloverPettyCash
  purgeTokens       = authSvc.purgeExpiredTokens
}

/**
 * Nightly 00:01 AST (21:01 UTC) — expire subscribers whose end_date has passed.
 */
function startSubscriberStatusJob() {
  cron.schedule('1 21 * * *', async () => {
    logger.info('⏰ [cron] Running subscriber status update')
    try {
      if (!updateAllStatuses) await loadServices()
      await updateAllStatuses()
      logger.info('✅ [cron] Subscriber statuses updated')
    } catch (err) {
      logger.error({ err }, '❌ [cron] Subscriber status update failed')
    }
  }, { timezone: 'UTC' })
}

/**
 * Nightly 00:02 AST (21:02 UTC) — carry petty cash closing → next day opening.
 */
function startPettyCashRolloverJob() {
  cron.schedule('2 21 * * *', async () => {
    logger.info('⏰ [cron] Running petty cash rollover')
    try {
      if (!rolloverPettyCash) await loadServices()
      await rolloverPettyCash()
      logger.info('✅ [cron] Petty cash rolled over')
    } catch (err) {
      logger.error({ err }, '❌ [cron] Petty cash rollover failed')
    }
  }, { timezone: 'UTC' })
}

/**
 * Quarterly VAT reminder — 1st day of month after quarter end.
 */
function startVATFilingReminderJob() {
  cron.schedule('0 6 1 1,4,7,10 *', () => {
    logger.info('⏰ [cron] ZATCA VAT filing reminder — quarterly period ended')
  }, { timezone: 'Asia/Riyadh' })
}

/**
 * Nightly 02:00 UTC — delete revoked/expired refresh tokens older than 1 day.
 */
function startTokenPurgeJob() {
  cron.schedule('0 2 * * *', async () => {
    logger.info('⏰ [cron] Purging expired/revoked refresh tokens')
    try {
      if (!purgeTokens) await loadServices()
      await purgeTokens()
      logger.info('✅ [cron] Refresh token purge complete')
    } catch (err) {
      logger.error({ err }, '❌ [cron] Refresh token purge failed')
    }
  }, { timezone: 'UTC' })
}

export function startAllCronJobs() {
  loadServices().catch(err => logger.error({ err }, 'Failed to load cron service deps'))
  startSubscriberStatusJob()
  startPettyCashRolloverJob()
  startVATFilingReminderJob()
  startTokenPurgeJob()
  logger.info('✅ All cron jobs registered')
}
