import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError.js'
import { UserRole } from '../db/schema/users.js'

/**
 * Role hierarchy: admin > accountant > cashier
 * Usage: router.get('/journal', authenticate, authorize('admin', 'accountant'), handler)
 */
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('UNAUTHORIZED', 401))
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('FORBIDDEN', 403))
    }
    next()
  }
}

/** Shorthand role sets */
export const ADMIN_ONLY         = ['admin'] as UserRole[]
export const ACCOUNTANT_PLUS    = ['admin', 'accountant'] as UserRole[]
export const ALL_ROLES          = ['admin', 'accountant', 'cashier'] as UserRole[]
