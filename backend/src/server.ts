import { createApp } from './app.js'
import { testConnection, pool } from './config/database.js'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { startAllCronJobs } from './cron/index.js'

async function main() {
  // 1. Verify database connection before accepting traffic
  await testConnection()

  // 2. Build Express app
  const app    = createApp()
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Mr. Sehi API running on port ${env.PORT} [${env.NODE_ENV}]`)
    logger.info(`📖 API base: http://localhost:${env.PORT}/api/v1`)
  })

  // 3. Start background cron jobs
  startAllCronJobs()

  // ── Graceful shutdown ────────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`)
    server.close(async () => {
      await pool.end()
      logger.info('PostgreSQL pool closed')
      process.exit(0)
    })
    // Force exit after 10s
    setTimeout(() => { logger.error('Force exit after timeout'); process.exit(1) }, 10_000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))
  process.on('uncaughtException',  (err) => { logger.error({ err }, 'Uncaught exception'); process.exit(1) })
  process.on('unhandledRejection', (reason) => { logger.error({ reason }, 'Unhandled rejection'); process.exit(1) })
}

main().catch((err) => {
  console.error('❌ Failed to start server:', err)
  process.exit(1)
})
