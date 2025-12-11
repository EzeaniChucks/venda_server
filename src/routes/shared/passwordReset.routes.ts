import { Router } from 'express';
import { PasswordResetController } from '../../controllers/shared/passwordResetController';

const router = Router();

// Password reset flow
router.post('/forgot-password', PasswordResetController.forgotPassword);
router.post('/verify-reset-code', PasswordResetController.verifyResetCode);
router.post('/reset-password', PasswordResetController.resetPassword);

export default router;
