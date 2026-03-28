import pinoHttp from 'pino-http'
import { logger } from '../config/logger.js'

export const requestLogger = (pinoHttp as any)({
  logger,
  customLogLevel: (_req: any, res: any) => {
    if (res.statusCode >= 500) return 'error'
    if (res.statusCode >= 400) return 'warn'
    return 'info'
  },
  customSuccessMessage: (req: any, res: any) =>
    `${req.method} ${req.url} → ${res.statusCode}`,
  redact: ['req.headers.authorization', 'req.headers.cookie'],
})
