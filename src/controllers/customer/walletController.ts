import { Response } from 'express';
import { validationResult } from 'express-validator';
import walletService from '../../services/customer/walletService';
import { successResponse, errorResponse, validationErrorResponse } from '../../utils/response';
import { AuthRequest } from '../../types';

export class WalletController {
  async getWallet(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const wallet = await walletService.getWallet(req.user!.id);
      return successResponse(res, wallet);
    } catch (error) {
      console.error('Get wallet error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async getTransactions(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const transactions = await walletService.getTransactions(req.user!.id, req.query);
      return successResponse(res, transactions);
    } catch (error) {
      console.error('Get transactions error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async fundWallet(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const { amount, method } = req.body;
      const transaction = await walletService.fundWallet(req.user!.id, amount, { method });
      return successResponse(res, transaction, 'Wallet funded successfully', 201);
    } catch (error) {
      console.error('Fund wallet error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async withdraw(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const { amount, recipient, account_number, bank_name } = req.body;
      const transaction = await walletService.withdraw(
        req.user!.id,
        amount,
        { recipient, account_number, bank_name }
      );
      return successResponse(res, transaction, 'Withdrawal successful', 201);
    } catch (error) {
      console.error('Withdraw error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }
}

export default new WalletController();
