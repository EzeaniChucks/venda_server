import express from 'express';
import { body } from 'express-validator';
import riderAuthController from '../../controllers/rider/authController';
import { authenticate } from '../../middleware/auth';
import authController from '../../controllers/shared/authController';

const router = express.Router();

// Rider-specific registration
router.post('/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
    body('vehicleType').optional().notEmpty().withMessage('Vehicle type is required if provided'),
    body('vehicleNumber').optional().notEmpty().withMessage('Vehicle number is required if provided')
  ],
  riderAuthController.register
);

// Rider-specific login
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  riderAuthController.login
);

// Profile routes (shared logic, but rider-specific)
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

export default router;
