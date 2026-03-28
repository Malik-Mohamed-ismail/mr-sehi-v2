import { rateLimit } from 'express-rate-limit'
import { env } from '../config/env.js'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.RATE_LIMIT_AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'محاولات كثيرة — حاول لاحقاً' } },
})

/** Applied to /auth/refresh — prevent token hammering */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 refreshes per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'محاولات تجديد الجلسة كثيرة — حاول لاحقاً' } },
})

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.RATE_LIMIT_API_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'طلبات كثيرة جداً' } },
})

export const reportLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.RATE_LIMIT_REPORT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'تجاوزت حد التقارير المسموح به' } },
})
