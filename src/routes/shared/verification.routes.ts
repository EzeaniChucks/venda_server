import { Router } from 'express';
import { SMSService } from '../../services/shared/sms.service';
import { EmailService } from '../../services/shared/email.service';
import { authenticate } from '../../middleware/auth';

const router = Router();

/**
 * Send SMS verification code
 * POST /api/verification/sms/send
 */
router.post('/sms/send', async (req, res) => {
  try {
    const { phone, entityType, entityId } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await SMSService.sendOTP(phone, entityType, entityId);

    if (result.success) {
      res.json({
        message: 'Verification code sent successfully',
        verificationId: result.verificationId,
        // Include code in development mode only
        ...(process.env.NODE_ENV === 'development' && { code: result.code })
      });
    } else {
      res.status(500).json({ error: ('error' in result ? result.error : 'Failed to send SMS') });
    }
  } catch (error: any) {
    console.error('SMS send error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verify SMS code
 * POST /api/verification/sms/verify
 */
router.post('/sms/verify', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone and code are required' });
    }

    const result = await SMSService.verifyOTP(phone, code);

    if (result.verified) {
      res.json({
        message: 'Phone verified successfully',
        verified: true,
        verificationId: result.verificationId
      });
    } else {
      res.status(400).json({
        verified: false,
        error: result.error || 'Invalid verification code'
      });
    }
  } catch (error: any) {
    console.error('SMS verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Send email verification code
 * POST /api/verification/email/send
 */
router.post('/email/send', async (req, res) => {
  try {
    const { email, entityType, entityId } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await EmailService.sendVerificationEmail(email, entityType, entityId);

    if (result.success) {
      res.json({
        message: 'Verification code sent successfully',
        verificationId: result.verificationId,
        // Include code in development mode only
        ...(process.env.NODE_ENV === 'development' && { code: result.code })
      });
    } else {
      res.status(500).json({ error: ('error' in result ? result.error : 'Failed to send email') });
    }
  } catch (error: any) {
    console.error('Email send error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verify email code
 * POST /api/verification/email/verify
 */
router.post('/email/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const result = await SMSService.verifyOTP(email, code);

    if (result.verified) {
      res.json({
        message: 'Email verified successfully',
        verified: true,
        verificationId: result.verificationId
      });
    } else {
      res.status(400).json({
        verified: false,
        error: result.error || 'Invalid verification code'
      });
    }
  } catch (error: any) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
