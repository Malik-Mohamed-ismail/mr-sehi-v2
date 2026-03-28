import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL:              z.string().url(),
  TEST_DATABASE_URL:         z.string().url().optional(),
  JWT_SECRET:                z.string().min(64),
  JWT_ACCESS_EXPIRY:         z.string().default('15m'),
  JWT_REFRESH_EXPIRY:        z.string().default('30d'),
  COOKIE_SECRET:             z.string().min(32),
  NODE_ENV:                  z.enum(['development', 'production', 'test']).default('development'),
  PORT:                      z.coerce.number().default(3001),
  FRONTEND_URL:              z.string().url(),
  LOG_LEVEL:                 z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_FORMAT:                z.enum(['json', 'pretty']).default('json'),
  PUPPETEER_EXECUTABLE_PATH: z.string().optional(),
  VAT_RATE:                  z.coerce.number().default(0.15),
  CRON_TIMEZONE:             z.string().default('Asia/Riyadh'),
  RATE_LIMIT_AUTH_MAX:       z.coerce.number().default(10),
  RATE_LIMIT_API_MAX:        z.coerce.number().default(200),
  RATE_LIMIT_REPORT_MAX:     z.coerce.number().default(10),
})

// Crash fast on startup if any required variable is missing
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
