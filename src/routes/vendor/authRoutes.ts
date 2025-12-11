import express from 'express';
import { body } from 'express-validator';
import vendorAuthController from '../../controllers/vendor/authController';
import { authenticate } from '../../middleware/auth';
import authController from '../../controllers/shared/authController';

const router = express.Router();

// Vendor-specific registration
router.post('/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('businessName').notEmpty().withMessage('Business name is required'),
    body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required')
  ],
  vendorAuthController.register
);

// Vendor-specific login
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  vendorAuthController.login
);
// Token refresh endpoint
router.post('/refresh', authenticate, vendorAuthController.refreshToken);

// Profile routes (shared logic, but vendor-specific)
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

export default router;
