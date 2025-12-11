import { Router } from 'express';
import { body } from 'express-validator';
import { contentController } from '../../controllers/admin/contentController';
import { authenticateToken, requireAdmin } from '../../middleware/auth';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.post('/news',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('image').optional().isString(),
    body('author').optional().isString()
  ],
  contentController.createNews
);

router.get('/news', contentController.getAllNews);

router.get('/news/:id', contentController.getNewsById);

router.put('/news/:id',
  [
    body('title').optional().notEmpty(),
    body('content').optional().notEmpty(),
    body('image').optional().isString(),
    body('author').optional().isString(),
    body('isActive').optional().isBoolean()
  ],
  contentController.updateNews
);

router.delete('/news/:id', contentController.deleteNews);

router.post('/models',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('bio').optional().isString(),
    body('profileImage').optional().isString(),
    body('portfolioImages').optional().isArray(),
    body('instagramHandle').optional().isString(),
    body('twitterHandle').optional().isString()
  ],
  contentController.createModel
);

router.get('/models', contentController.getAllModels);

router.get('/models/:id', contentController.getModelById);

router.put('/models/:id',
  [
    body('name').optional().notEmpty(),
    body('bio').optional().isString(),
    body('profileImage').optional().isString(),
    body('portfolioImages').optional().isArray(),
    body('instagramHandle').optional().isString(),
    body('twitterHandle').optional().isString()
  ],
  contentController.updateModel
);

router.delete('/models/:id', contentController.deleteModel);

export default router;
