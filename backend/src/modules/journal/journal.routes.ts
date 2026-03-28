import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { authorize, ADMIN_ONLY, ACCOUNTANT_PLUS } from '../../middleware/authorize.js'
import * as ctrl from './journal.controller.js'

const router = Router()
router.use(authenticate)

router.get ('/',           authorize(...ACCOUNTANT_PLUS), ctrl.list)
router.post('/',           authorize(...ACCOUNTANT_PLUS), ctrl.create)
router.get ('/:id',        authorize(...ACCOUNTANT_PLUS), ctrl.get)
router.post('/:id/reverse',authorize(...ADMIN_ONLY),      ctrl.reverse)

export default router
