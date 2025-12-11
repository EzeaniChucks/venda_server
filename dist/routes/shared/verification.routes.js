"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sms_service_1 = require("../../services/shared/sms.service");
const email_service_1 = require("../../services/shared/email.service");
const router = (0, express_1.Router)();
router.post('/sms/send', async (req, res) => {
    try {
        const { phone, entityType, entityId } = req.body;
        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        const result = await sms_service_1.SMSService.sendOTP(phone, entityType, entityId);
        if (result.success) {
            res.json({
                message: 'Verification code sent successfully',
                verificationId: result.verificationId,
                ...(process.env.NODE_ENV === 'development' && { code: result.code })
            });
        }
        else {
            res.status(500).json({ error: ('error' in result ? result.error : 'Failed to send SMS') });
        }
    }
    catch (error) {
        console.error('SMS send error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/sms/verify', async (req, res) => {
    try {
        const { phone, code } = req.body;
        if (!phone || !code) {
            return res.status(400).json({ error: 'Phone and code are required' });
        }
        const result = await sms_service_1.SMSService.verifyOTP(phone, code);
        if (result.verified) {
            res.json({
                message: 'Phone verified successfully',
                verified: true,
                verificationId: result.verificationId
            });
        }
        else {
            res.status(400).json({
                verified: false,
                error: result.error || 'Invalid verification code'
            });
        }
    }
    catch (error) {
        console.error('SMS verification error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/email/send', async (req, res) => {
    try {
        const { email, entityType, entityId } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const result = await email_service_1.EmailService.sendVerificationEmail(email, entityType, entityId);
        if (result.success) {
            res.json({
                message: 'Verification code sent successfully',
                verificationId: result.verificationId,
                ...(process.env.NODE_ENV === 'development' && { code: result.code })
            });
        }
        else {
            res.status(500).json({ error: ('error' in result ? result.error : 'Failed to send email') });
        }
    }
    catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/email/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }
        const result = await sms_service_1.SMSService.verifyOTP(email, code);
        if (result.verified) {
            res.json({
                message: 'Email verified successfully',
                verified: true,
                verificationId: result.verificationId
            });
        }
        else {
            res.status(400).json({
                verified: false,
                error: result.error || 'Invalid verification code'
            });
        }
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=verification.routes.js.map