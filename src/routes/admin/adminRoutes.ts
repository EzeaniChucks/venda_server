import express from 'express';
import { body } from 'express-validator';
import adminController from '../../controllers/admin/adminController';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', adminController.getUsers);
router.put('/users/:id/status',
  [
    body('is_active').isBoolean(),
    body('role').isIn(['customer', 'vendor', 'rider'])
  ],
  adminController.updateUserStatus
);

router.get('/products', adminController.getProductsForApproval);
router.put('/products/:id/approval',
  [body('is_approved').isBoolean()],
  adminController.updateProductApproval
);

router.put('/vendors/:id/approval',
  [body('is_approved').isBoolean()],
  adminController.approveVendor
);

router.put('/riders/:id/approval',
  [body('is_approved').isBoolean()],
  adminController.approveRider
);

router.get('/analytics', adminController.getAnalytics);

export default router;
