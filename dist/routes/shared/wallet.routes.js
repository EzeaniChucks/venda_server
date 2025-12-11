"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallet_service_1 = require("../../services/shared/wallet.service");
const transaction_service_1 = require("../../services/shared/transaction.service");
const auth_1 = require("../../middleware/auth");
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
router.get('/balance', auth_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        const { id: entityId, role: entityType } = user;
        if (entityType === 'admin') {
            return res.status(403).json({ error: 'Admin users do not have wallets' });
        }
        const wallet = await wallet_service_1.WalletService.getWalletBalance(entityId, entityType);
        res.json({
            balance: wallet.balance || 0,
            pendingBalance: wallet.pendingBalance || 0
        });
    }
    catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/fund/initialize', auth_1.authenticate, async (req, res) => {
    try {
        const { amount } = req.body;
        const user = req.user;
        const { id: entityId, role: entityType, email } = user;
        if (entityType === 'admin') {
            return res.status(403).json({ error: 'Admin users cannot fund wallets' });
        }
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) {
            return res.status(500).json({ error: 'Payment service not configured' });
        }
        const reference = `FUND_${Date.now()}_${entityId.substring(0, 8)}`;
        const response = await axios_1.default.post('https://api.paystack.co/transaction/initialize', {
            email,
            amount: amount * 100,
            reference,
            callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/wallet/callback`,
            metadata: {
                entityId,
                entityType,
                purpose: 'wallet_funding'
            }
        }, {
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
                'Content-Type': 'application/json'
            }
        });
        res.json({
            authorization_url: response.data.data.authorization_url,
            access_code: response.data.data.access_code,
            reference
        });
    }
    catch (error) {
        console.error('Fund initialization error:', error.response?.data || error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/withdraw', auth_1.authenticate, async (req, res) => {
    try {
        const { amount, accountNumber, bankCode, accountName } = req.body;
        const user = req.user;
        const { id: entityId, role: entityType } = user;
        if (entityType === 'admin') {
            return res.status(403).json({ error: 'Admin users cannot withdraw from wallets' });
        }
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        if (!accountNumber || !bankCode) {
            return res.status(400).json({ error: 'Bank details are required' });
        }
        const result = await wallet_service_1.WalletService.withdrawWallet({
            entityId,
            entityType: entityType,
            amount,
            accountNumber,
            bankCode,
            accountName,
            narration: `Wallet withdrawal - ${accountName || 'VENDA User'}`
        });
        res.json({
            message: 'Withdrawal initiated successfully',
            reference: result.reference,
            status: result.status
        });
    }
    catch (error) {
        console.error('Withdrawal error:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/transactions', auth_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        const { id: entityId, role: entityType } = user;
        if (entityType === 'admin') {
            return res.status(403).json({ error: 'Admin users do not have transactions' });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await transaction_service_1.TransactionService.getEntityTransactions(entityId, entityType, page, limit);
        res.json(result);
    }
    catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/webhook', async (req, res) => {
    try {
        const hash = crypto_1.default
            .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest('hex');
        if (hash !== req.headers['x-paystack-signature']) {
            return res.status(400).json({ error: 'Invalid signature' });
        }
        const event = req.body;
        if (event.event === 'charge.success') {
            const { reference, amount, channel, metadata } = event.data;
            if (metadata.purpose === 'wallet_funding') {
                await wallet_service_1.WalletService.fundWallet({
                    entityId: metadata.entityId,
                    entityType: metadata.entityType,
                    amount: amount / 100,
                    reference,
                    channel,
                    metadata
                });
            }
        }
        if (event.event === 'transfer.success' || event.event === 'transfer.failed') {
            const { reference, status } = event.data;
            await transaction_service_1.TransactionService.updateTransactionStatus(reference, status === 'success' ? 'completed' : 'failed');
        }
        res.sendStatus(200);
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});
exports.default = router;
//# sourceMappingURL=wallet.routes.js.map