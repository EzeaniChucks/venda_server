import express from 'express';
import { body } from 'express-validator';
import cartController from '../../controllers/customer/cartController';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.use(authorize('customer'));

router.get('/', cartController.getCart);
router.post('/',
  [
    body('productId').isUUID().withMessage('Valid product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  cartController.addToCart
);
router.put('/:id',
  [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')],
  cartController.updateCartItem
);
router.delete('/:id', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;
