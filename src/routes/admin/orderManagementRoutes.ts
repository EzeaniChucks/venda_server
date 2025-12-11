import { Router } from 'express';
import { orderManagementController } from '../../controllers/admin/orderManagementController';
import { authenticateToken, requireAdmin } from '../../middleware/auth';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/orders', orderManagementController.getAllOrders);

router.get('/orders/stats', orderManagementController.getOrderStats);

router.get('/orders/:id', orderManagementController.getOrderById);

router.get('/transactions', orderManagementController.getAllTransactions);

router.get('/transactions/stats', orderManagementController.getTransactionStats);

router.get('/transactions/:id', orderManagementController.getTransactionById);

export default router;
