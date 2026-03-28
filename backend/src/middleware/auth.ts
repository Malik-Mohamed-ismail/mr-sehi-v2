import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'
import { UserRole } from '../db/schema/users.js'

interface JWTPayload {
  sub:      string
  role:     UserRole
  username: string
  iat:      number
  exp:      number
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', 401)
    }
    const token   = authHeader.split(' ')[1]
    const payload = jwt.verify(token, env.JWT_SECRET) as unknown as JWTPayload
    req.user = { id: payload.sub, role: payload.role, username: payload.username }
    next()
  } catch (err) {
    if (err instanceof AppError) return next(err)
    next(new AppError('UNAUTHORIZED', 401))
  }
}
