import { Router } from 'express';
import { body } from 'express-validator';
import { categoryController } from '../../controllers/admin/categoryController';
import { authenticateToken, requireAdmin } from '../../middleware/auth';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.post('/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('slug').notEmpty().withMessage('Slug is required'),
    body('description').optional().isString(),
    body('icon').optional().isString(),
    body('parentId').optional().isUUID()
  ],
  categoryController.createCategory
);

router.get('/', categoryController.getAllCategories);

router.get('/:id', categoryController.getCategoryById);

router.put('/:id',
  [
    body('name').optional().notEmpty(),
    body('slug').optional().notEmpty(),
    body('description').optional().isString(),
    body('icon').optional().isString(),
    body('parentId').optional().isUUID()
  ],
  categoryController.updateCategory
);

router.delete('/:id', categoryController.deleteCategory);

export default router;
