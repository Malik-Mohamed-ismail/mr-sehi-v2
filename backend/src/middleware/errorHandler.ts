import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { randomUUID } from 'crypto'
import { AppError } from '../utils/AppError.js'
import { logger } from '../config/logger.js'

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const requestId = (req.headers['x-request-id'] as string) ?? randomUUID()

  // PostgreSQL unique constraint violation
  if ((err as any)?.code === '23505') {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_ENTRY', message: 'هذا السجل موجود مسبقاً' },
      requestId,
    })
  }

  // Our own AppError
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, requestId, path: req.path }, 'Server error')
    }
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code:    err.code,
        message: err.messageAr,
        details: err.details ?? [],
      },
      requestId,
    })
  }

  // Unknown error — don't leak details in production
  logger.error({ err, requestId, path: req.path }, 'Unhandled error')
  return res.status(500).json({
    success: false,
    error: {
      code:    'INTERNAL_ERROR',
      message: 'حدث خطأ غير متوقع',
    },
    requestId,
  })
}
