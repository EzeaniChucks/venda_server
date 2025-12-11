import express from 'express';
import { body } from 'express-validator';
import customerAuthController from '../../controllers/customer/authController';
import { authenticate } from '../../middleware/auth';
import authController from '../../controllers/shared/authController';

const router = express.Router();

// Customer-specific registration
router.post('/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required')
  ],
  customerAuthController.register
);

// Customer-specific login
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  customerAuthController.login
);

// Profile routes (shared logic, but customer-specific)
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

export default router;
