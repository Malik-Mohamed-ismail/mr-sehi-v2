import { Router } from 'express';
import * as ctrl from './lookups.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize, ADMIN_ONLY } from '../../middleware/authorize.js';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getAll);
router.post('/', authorize(...ADMIN_ONLY), ctrl.create);
router.put('/:id', authorize(...ADMIN_ONLY), ctrl.update);
router.delete('/:id', authorize(...ADMIN_ONLY), ctrl.remove);

export default router;
