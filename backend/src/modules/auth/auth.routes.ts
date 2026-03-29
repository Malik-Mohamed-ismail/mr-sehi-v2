import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { authorize, ADMIN_ONLY } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { authLimiter, refreshLimiter } from '../../middleware/rateLimiter.js'
import * as ctrl from './auth.controller.js'
import {
  LoginSchema, CreateUserSchema, UpdateUserSchema, ChangePasswordSchema,
} from './auth.schema.js'

const router = Router()

router.post('/login',           authLimiter,   validate(LoginSchema),          ctrl.login)
router.post('/refresh',         refreshLimiter, ctrl.refresh)
router.post('/logout',          authLimiter,   ctrl.logout)
router.get ('/me',              authenticate, ctrl.me)
router.post('/change-password', authenticate, validate(ChangePasswordSchema), ctrl.changePassword)
router.post('/users',           authenticate, authorize(...ADMIN_ONLY), validate(CreateUserSchema), ctrl.createUser)
router.get ('/users',           authenticate, authorize(...ADMIN_ONLY), ctrl.listUsers)
router.patch('/users/:id',      authenticate, authorize(...ADMIN_ONLY), validate(UpdateUserSchema), ctrl.updateUser)
router.delete('/users/:id',     authenticate, authorize(...ADMIN_ONLY), ctrl.deleteUser)

export default router
