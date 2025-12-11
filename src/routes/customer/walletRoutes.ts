import express from 'express';
import { body } from 'express-validator';
import walletController from '../../controllers/customer/walletController';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.use(authorize('customer'));

router.get('/', walletController.getWallet);
router.get('/transactions', walletController.getTransactions);

router.post('/fund',
  [
    body('amount').isFloat({ min: 100 }),
    body('method').trim().notEmpty()
  ],
  walletController.fundWallet
);

router.post('/withdraw',
  [
    body('amount').isFloat({ min: 100 }),
    body('recipient').trim().notEmpty(),
    body('account_number').trim().notEmpty(),
    body('bank_name').trim().notEmpty()
  ],
  walletController.withdraw
);

export default router;
