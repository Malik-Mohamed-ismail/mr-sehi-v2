import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { authorize, ADMIN_ONLY, ACCOUNTANT_PLUS, ALL_ROLES } from '../../middleware/authorize.js'
import * as ctrl from './revenue.controller.js'

const router = Router()
router.use(authenticate)

// Summary & time-series (all authenticated)
router.get('/summary',      authorize(...ALL_ROLES),       ctrl.summary)
router.get('/daily-series', authorize(...ALL_ROLES),       ctrl.dailySeries)

// Delivery
router.get ('/delivery',    authorize(...ALL_ROLES),       ctrl.listDelivery)
router.post('/delivery',    authorize(...ALL_ROLES),       ctrl.createDelivery)
router.put('/delivery/:id', authorize(...ALL_ROLES),       ctrl.updateDelivery)
router.delete('/delivery/:id', authorize(...ADMIN_ONLY),   ctrl.removeDelivery)

// Restaurant
router.get ('/restaurant',  authorize(...ALL_ROLES),       ctrl.listRestaurant)
router.post('/restaurant',  authorize(...ALL_ROLES),       ctrl.createRestaurant)
router.put('/restaurant/:id',  authorize(...ALL_ROLES),       ctrl.updateRestaurant)
router.delete('/restaurant/:id', authorize(...ADMIN_ONLY), ctrl.removeRestaurant)

// Subscriptions
router.get ('/subscriptions', authorize(...ALL_ROLES),     ctrl.listSubscriptions)
router.post('/subscriptions', authorize(...ALL_ROLES),     ctrl.createSubscription)
router.put('/subscriptions/:id', authorize(...ALL_ROLES),     ctrl.updateSubscription)
router.delete('/subscriptions/:id', authorize(...ADMIN_ONLY), ctrl.removeSubscription)

export default router
