import { Router } from 'express';
import { WalletService } from '../../services/shared/wallet.service';
import { TransactionService } from '../../services/shared/transaction.service';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import crypto from 'crypto';
import axios from 'axios';

const router = Router();

/**
 * Get wallet balance
 * GET /api/wallet/balance
 */
router.get('/balance', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id: entityId, role: entityType } = user;

    if (entityType === 'admin') {
      return res.status(403).json({ error: 'Admin users do not have wallets' });
    }

    const wallet = await WalletService.getWalletBalance(entityId, entityType);

    res.json({
      balance: wallet.balance || 0,
      pendingBalance: wallet.pendingBalance || 0
    });
  } catch (error: any) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Initialize wallet funding
 * POST /api/wallet/fund/initialize
 */
router.post('/fund/initialize', authenticate, async (req: AuthRequest, res) => {
  try {
    const { amount } = req.body;
    const user = req.user!;
    const { id: entityId, role: entityType, email } = user;

    if (entityType === 'admin') {
      return res.status(403).json({ error: 'Admin users cannot fund wallets' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Initialize Paystack transaction
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return res.status(500).json({ error: 'Payment service not configured' });
    }

    const reference = `FUND_${Date.now()}_${entityId.substring(0, 8)}`;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Convert to kobo
        reference,
        callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/wallet/callback`,
        metadata: {
          entityId,
          entityType,
          purpose: 'wallet_funding'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference
    });
  } catch (error: any) {
    console.error('Fund initialization error:', error.response?.data || error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Withdraw from wallet
 * POST /api/wallet/withdraw
 */
router.post('/withdraw', authenticate, async (req: AuthRequest, res) => {
  try {
    const { amount, accountNumber, bankCode, accountName } = req.body;
    const user = req.user!;
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

    const result = await WalletService.withdrawWallet({
      entityId,
      entityType: entityType as 'customer' | 'vendor' | 'rider',
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
  } catch (error: any) {
    console.error('Withdrawal error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get transaction history
 * GET /api/wallet/transactions
 */
router.get('/transactions', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id: entityId, role: entityType } = user;

    if (entityType === 'admin') {
      return res.status(403).json({ error: 'Admin users do not have transactions' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await TransactionService.getEntityTransactions(
      entityId,
      entityType as 'customer' | 'vendor' | 'rider',
      page,
      limit
    );

    res.json(result);
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Paystack webhook handler
 * POST /api/wallet/webhook
 */
router.post('/webhook', async (req, res) => {
  try {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const { reference, amount, channel, metadata } = event.data;
      
      if (metadata.purpose === 'wallet_funding') {
        await WalletService.fundWallet({
          entityId: metadata.entityId,
          entityType: metadata.entityType,
          amount: amount / 100, // Convert from kobo
          reference,
          channel,
          metadata
        });
      }
    }

    if (event.event === 'transfer.success' || event.event === 'transfer.failed') {
      const { reference, status } = event.data;
      
      await TransactionService.updateTransactionStatus(
        reference,
        status === 'success' ? 'completed' : 'failed'
      );
    }

    res.sendStatus(200);
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

export default router;
