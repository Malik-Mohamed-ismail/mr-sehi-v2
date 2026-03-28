import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { authorize, ADMIN_ONLY, ACCOUNTANT_PLUS } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { CreatePurchaseSchema, PurchaseQuerySchema } from './purchases.schema.js'
import * as ctrl from './purchases.controller.js'

const router = Router()
router.use(authenticate)

router.get ('/',            authorize(...ACCOUNTANT_PLUS), validate(PurchaseQuerySchema, 'query'), ctrl.list)
router.get ('/vat-report',  authorize(...ACCOUNTANT_PLUS), ctrl.vatReport)
router.get ('/:id',         authorize(...ACCOUNTANT_PLUS), ctrl.get)
router.post('/',            authorize(...ACCOUNTANT_PLUS), validate(CreatePurchaseSchema),         ctrl.create)
router.put ('/:id',         authorize(...ACCOUNTANT_PLUS), validate(CreatePurchaseSchema),         ctrl.update)
router.delete('/:id',       authorize(...ADMIN_ONLY),       ctrl.remove)

export default router
