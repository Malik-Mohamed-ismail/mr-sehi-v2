import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { authorize, ADMIN_ONLY } from '../../middleware/authorize.js'
import * as ctrl from './settings.controller.js'

const router = Router()
router.use(authenticate)

// Settings are restricted to admins
router.get('/:key', authorize(...ADMIN_ONLY), ctrl.getSetting)
router.put('/:key', authorize(...ADMIN_ONLY), ctrl.updateSetting)

export default router
