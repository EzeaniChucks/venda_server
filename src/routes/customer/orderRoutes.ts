import express from 'express';
import { body } from 'express-validator';
import orderController from '../../controllers/customer/orderController';
import * as riderLocationController from '../../controllers/rider/locationController';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.use(authorize('customer'));

router.post('/',
  [
    body('delivery_address').trim().notEmpty(),
    body('delivery_phone').trim().notEmpty(),
    body('payment_method').isIn(['wallet', 'card', 'transfer', 'cash'])
  ],
  orderController.createOrder
);

router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.get('/:id/rider-location', riderLocationController.getRiderLocationForOrder);
router.post('/:id/cancel', orderController.cancelOrder);

export default router;
