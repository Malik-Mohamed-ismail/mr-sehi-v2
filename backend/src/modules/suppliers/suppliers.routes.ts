import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { authorize, ADMIN_ONLY, ACCOUNTANT_PLUS } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { CreateSupplierSchema, UpdateSupplierSchema, SupplierQuerySchema } from './suppliers.schema.js'
import * as ctrl from './suppliers.controller.js'

const router = Router()

router.use(authenticate)

router.get ('/',              authorize(...ACCOUNTANT_PLUS), validate(SupplierQuerySchema, 'query'), ctrl.list)
router.get ('/:id',           authorize(...ACCOUNTANT_PLUS), ctrl.get)
router.get ('/:id/ledger',    authorize(...ACCOUNTANT_PLUS), ctrl.ledger)
router.post('/',              authorize(...ADMIN_ONLY),       validate(CreateSupplierSchema), ctrl.create)
router.put ('/:id',           authorize(...ADMIN_ONLY),       validate(UpdateSupplierSchema), ctrl.update)
router.patch('/:id/deactivate', authorize(...ADMIN_ONLY),     ctrl.deactivate)
router.delete('/:id',           authorize(...ADMIN_ONLY),      ctrl.remove)

export default router
