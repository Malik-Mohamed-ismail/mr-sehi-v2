import { lt, or, eq } from 'drizzle-orm'
import { db } from '../config/database.js'
import { refreshTokens } from '../db/schema/refreshTokens.js'
import { logger } from '../config/logger.js'

/**
 * Deletes all refresh tokens that are either:
 *  - revoked (revoked = true)
 *  - expired (expires_at < NOW())
 *
 * Called nightly by the cron job at 02:00 UTC to keep the table small.
 */
export async function purgeExpiredTokens(): Promise<void> {
  const now    = new Date()
  const result = await db.delete(refreshTokens)
    .where(or(
      eq(refreshTokens.revoked, true),
      lt(refreshTokens.expires_at, now)
    ))

  logger.info({ deletedRows: (result as any).rowCount ?? '?' }, '🧹 Purged expired/revoked refresh tokens')
}
