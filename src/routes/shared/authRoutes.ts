import express from 'express';
import { body } from 'express-validator';
import authController from '../../controllers/shared/authController';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

router.post('/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('role').optional().isIn(['customer', 'vendor', 'rider']).withMessage('Invalid role')
  ],
  authController.register
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

export default router;
