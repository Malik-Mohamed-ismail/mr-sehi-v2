import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { AppError } from '../utils/AppError.js'

type Target = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      const details = (result.error as ZodError).errors.map(e => ({
        field:   e.path.join('.'),
        message: e.message,
      }))
      return next(new AppError('VALIDATION_ERROR', 400, 'بيانات غير صحيحة', details))
    }
    // Replace with coerced/defaulted values from Zod
    ;(req as any)[target] = result.data
    next()
  }
}
