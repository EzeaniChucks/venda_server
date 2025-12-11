import express from 'express';
import wishlistController from '../../controllers/customer/wishlistController';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.use(authorize('customer'));

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:id', wishlistController.removeFromWishlist);
router.get('/check/:productId', wishlistController.checkWishlist);

export default router;
