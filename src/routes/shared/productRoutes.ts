import express from 'express';
import productController from '../../controllers/shared/productController';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/categories/:id', productController.getProductsByCategory);

export default router;
