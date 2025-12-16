import { Response } from "express";
import { validationResult } from "express-validator";
import { WalletService } from "../../services/shared/wallet.service";
import { TransactionService } from "../../services/shared/transaction.service";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "../../utils/response";
import { AuthRequest } from "../../types";

export class WalletController {
  /**
   * Get wallet balance for authenticated user
   */
  async getWallet(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return errorResponse(res, "Unauthorized", 401);
      }

      const wallet = await WalletService.getWalletBalance(
        req.user.id,
        req.user.role
      );
      return successResponse(res, wallet);
    } catch (error) {
      console.error("Get wallet error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  /**
   * Get wallet transactions for authenticated user
   */
  async getTransactions(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return errorResponse(res, "Unauthorized", 401);
      }

      const {
        page = "1",
        limit = "20",
        startDate,
        endDate,
        type,
        status,
      } = req.query;

      const transactions = await WalletService.getTransactions({
        entityId: req.user.id,
        entityType: req.user.role as any,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        transactionType: type as any,
        status: status as any,
      });

      return successResponse(res, transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  /**
   * Withdraw from wallet to bank account
   */
  async withdraw(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return errorResponse(res, "Unauthorized", 401);
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const {
        amount,
        accountNumber,
        bankCode,
        accountName,
        narration = "Wallet withdrawal",
      } = req.body;

      // Validate withdrawal amount
      if (amount <= 0) {
        return errorResponse(res, "Amount must be greater than 0", 400);
      }

      // Check minimum withdrawal amount (₦100 for all users)
      if (amount < 100) {
        return errorResponse(res, "Minimum withdrawal amount is ₦100", 400);
      }

      const result = await WalletService.withdrawWallet({
        entityId: req.user.id,
        entityType: req.user.role as any,
        amount: parseFloat(amount),
        accountNumber,
        bankCode,
        accountName,
        narration,
      });

      return successResponse(
        res,
        result,
        result.requiresOtp
          ? "Withdrawal initiated. OTP sent for confirmation."
          : "Withdrawal initiated successfully"
      );
    } catch (error: any) {
      console.error("Withdraw error:", error);

      // Specific error handling
      if (error.message.includes("Insufficient wallet balance")) {
        return errorResponse(res, "Insufficient wallet balance", 400);
      }
      if (error.message.includes("not found")) {
        return errorResponse(res, "Wallet not found", 404);
      }
      if (error.message.includes("Only customers can use this feature")) {
        return errorResponse(res, error.message, 403);
      }

      return errorResponse(res, error.message || "Withdrawal failed", 400);
    }
  }

  /**
   * Verify withdrawal OTP
   */
  async verifyWithdrawalOTP(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.user) {
        return errorResponse(res, "Unauthorized", 401);
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const { reference, otp } = req.body;

      if (!reference || !otp) {
        return errorResponse(res, "Reference and OTP are required", 400);
      }

      // First, verify the transaction belongs to the user
      const transaction = await TransactionService.getTransactionByReference(
        reference
      );
      if (!transaction) {
        return errorResponse(res, "Transaction not found", 404);
      }

      if (
        transaction.entityId !== req.user.id ||
        transaction.entityType !== req.user.role
      ) {
        return errorResponse(res, "Unauthorized access to transaction", 403);
      }

      const result = await WalletService.finalizeWithdrawalOTP(reference, otp);

      return successResponse(res, result, "Withdrawal completed successfully");
    } catch (error: any) {
      console.error("Verify OTP error:", error);

      if (error.message.includes("Invalid OTP")) {
        return errorResponse(res, error.message, 400);
      }
      if (error.message.includes("Maximum OTP attempts")) {
        return errorResponse(res, error.message, 400);
      }
      if (error.message.includes("Transaction not found")) {
        return errorResponse(res, "Invalid transaction reference", 404);
      }
      if (error.message.includes("already completed")) {
        return errorResponse(
          res,
          "This withdrawal has already been completed",
          400
        );
      }

      return errorResponse(
        res,
        error.message || "OTP verification failed",
        400
      );
    }
  }

  /**
   * Resend withdrawal OTP
   */
  async resendWithdrawalOTP(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.user) {
        return errorResponse(res, "Unauthorized", 401);
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const { reference } = req.body;

      if (!reference) {
        return errorResponse(res, "Transaction reference is required", 400);
      }

      // Verify transaction belongs to user
      const transaction = await TransactionService.getTransactionByReference(
        reference
      );
      if (!transaction) {
        return errorResponse(res, "Transaction not found", 404);
      }

      if (
        transaction.entityId !== req.user.id ||
        transaction.entityType !== req.user.role
      ) {
        return errorResponse(res, "Unauthorized access to transaction", 403);
      }

      const result = await WalletService.resendWithdrawalOTP(reference);

      return successResponse(res, result, "OTP resent successfully");
    } catch (error: any) {
      console.error("Resend OTP error:", error);

      if (error.message.includes("Please wait")) {
        return errorResponse(res, error.message, 400);
      }
      if (error.message.includes("Transaction not found")) {
        return errorResponse(res, "Invalid transaction reference", 404);
      }

      return errorResponse(res, error.message || "Failed to resend OTP", 400);
    }
  }

  /**
   * Make payment from wallet (for orders, services, etc.)
   */
  async makePayment(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return errorResponse(res, "Unauthorized", 401);
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const {
        amount,
        orderId,
        description,
        reference,
        metadata = {},
        recipientId,
        recipientType,
      } = req.body;

      if (amount <= 0) {
        return errorResponse(res, "Amount must be greater than 0", 400);
      }

      // Validate minimum payment amount
      if (amount < 1) {
        return errorResponse(res, "Minimum payment amount is ₦1", 400);
      }

      const result = await WalletService.makePayment({
        entityId: req.user.id,
        entityType: req.user.role as any,
        amount: parseFloat(amount),
        orderId,
        description,
        reference,
        metadata: {
          ...metadata,
          payerId: req.user.id,
          payerType: req.user.role,
          recipientId,
          recipientType,
        },
      });

      return successResponse(res, result, "Payment completed successfully");
    } catch (error: any) {
      console.error("Make payment error:", error);

      if (error.message.includes("Insufficient wallet balance")) {
        return errorResponse(res, "Insufficient wallet balance", 400);
      }
      if (error.message.includes("not found")) {
        return errorResponse(res, "Wallet not found", 404);
      }

      return errorResponse(res, error.message || "Payment failed", 400);
    }
  }

  /**
   * Get specific transaction by reference
   */
  async getTransactionByReference(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.user) {
        return errorResponse(res, "Unauthorized", 401);
      }

      const { reference } = req.params;

      if (!reference) {
        return errorResponse(res, "Transaction reference is required", 400);
      }

      const transaction = await TransactionService.getTransactionByReference(
        reference
      );

      if (!transaction) {
        return errorResponse(res, "Transaction not found", 404);
      }

      // Ensure the transaction belongs to the authenticated user
      if (
        transaction.entityId !== req.user.id ||
        transaction.entityType !== req.user.role
      ) {
        return errorResponse(res, "Unauthorized access to transaction", 403);
      }

      return successResponse(res, transaction);
    } catch (error) {
      console.error("Get transaction error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  /**
   * Get wallet statistics (balance, recent activity, etc.)
   */
  async getWalletStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return errorResponse(res, "Unauthorized", 401);
      }

      const walletBalance = await WalletService.getWalletBalance(
        req.user.id,
        req.user.role
      );

      // Get transaction statistics for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentTransactions = await TransactionService.getEntityTransactions(
        {
          entityId: req.user.id,
          entityType: req.user.role as any,
          startDate: thirtyDaysAgo,
          limit: 100, // Get enough to calculate stats
        }
      );

      // Calculate statistics based on transaction types
      const stats = {
        totalDeposits: recentTransactions.transactions
          .filter(
            (t) =>
              t.transactionType === "wallet_funding" && t.status === "completed"
          )
          .reduce((sum, t) => sum + t.amount, 0),
        totalWithdrawals: recentTransactions.transactions
          .filter(
            (t) =>
              t.transactionType === "wallet_withdrawal" &&
              t.status === "completed"
          )
          .reduce((sum, t) => sum + t.amount, 0),
        totalPayments: recentTransactions.transactions
          .filter(
            (t) =>
              t.transactionType === "wallet_payment" && t.status === "completed"
          )
          .reduce((sum, t) => sum + t.amount, 0),
        pendingWithdrawals: recentTransactions.transactions
          .filter(
            (t) =>
              t.transactionType === "wallet_withdrawal" &&
              ["pending", "processing"].includes(t.status)
          )
          .reduce((sum, t) => sum + t.amount, 0),
        // For vendors/riders, add commission/earnings
        totalEarnings: recentTransactions.transactions
          .filter(
            (t) =>
              (t.transactionType === "commission" ||
                t.transactionType === "transfer") &&
              t.status === "completed"
          )
          .reduce((sum, t) => sum + t.amount, 0),
        transactionCount: {
          deposits: recentTransactions.transactions.filter(
            (t) => t.transactionType === "wallet_funding"
          ).length,
          withdrawals: recentTransactions.transactions.filter(
            (t) => t.transactionType === "wallet_withdrawal"
          ).length,
          payments: recentTransactions.transactions.filter(
            (t) => t.transactionType === "wallet_payment"
          ).length,
          earnings: recentTransactions.transactions.filter(
            (t) =>
              t.transactionType === "commission" ||
              t.transactionType === "transfer"
          ).length,
        },
      };

      return successResponse(res, {
        ...walletBalance,
        statistics: stats,
        userType: req.user.role,
      });
    } catch (error) {
      console.error("Get wallet stats error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  /**
   * Transfer between wallets (e.g., customer to vendor for order)
   */
  async transferToAnotherUser(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.user) {
        return errorResponse(res, "Unauthorized", 401);
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const {
        amount,
        recipientId,
        recipientType,
        description,
        orderId,
        metadata = {},
      } = req.body;

      if (amount <= 0) {
        return errorResponse(res, "Amount must be greater than 0", 400);
      }

      if (amount < 1) {
        return errorResponse(res, "Minimum transfer amount is ₦1", 400);
      }

      // Prevent self-transfer
      if (recipientId === req.user.id && recipientType === req.user.role) {
        return errorResponse(res, "Cannot transfer to yourself", 400);
      }

      // Step 1: Deduct from sender's wallet
      const paymentResult = await WalletService.makePayment({
        entityId: req.user.id,
        entityType: req.user.role as any,
        amount: parseFloat(amount),
        orderId,
        description: `Transfer to ${recipientType}: ${
          description || "Wallet transfer"
        }`,
        metadata: {
          ...metadata,
          transferType: "outgoing",
          recipientId,
          recipientType,
        },
      });

      // Step 2: Add to recipient's wallet (in real scenario, this would be atomic)
      // For now, we'll create a transaction record for the recipient
      const recipientTransaction = await TransactionService.createTransaction({
        entityId: recipientId,
        entityType: recipientType as any,
        amount: parseFloat(amount),
        transactionType: "transfer",
        reference: paymentResult.reference + "_RECIPIENT",
        description: `Transfer from ${req.user.role}: ${
          description || "Wallet transfer"
        }`,
        status: "completed",
        metadata: {
          ...metadata,
          transferType: "incoming",
          senderId: req.user.id,
          senderType: req.user.role,
          originalReference: paymentResult.reference,
        },
      });

      return successResponse(
        res,
        {
          payment: paymentResult,
          recipientTransaction,
          message: "Transfer completed successfully",
        },
        "Transfer completed successfully"
      );
    } catch (error: any) {
      console.error("Transfer error:", error);

      if (error.message.includes("Insufficient wallet balance")) {
        return errorResponse(res, "Insufficient wallet balance", 400);
      }
      if (error.message.includes("not found")) {
        return errorResponse(res, "Wallet not found", 404);
      }

      return errorResponse(res, error.message || "Transfer failed", 400);
    }
  }

  /**
   * Get pending withdrawals (for dashboard display)
   */
  async getPendingWithdrawals(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.user) {
        return errorResponse(res, "Unauthorized", 401);
      }

      const { page = "1", limit = "20" } = req.query;

      const transactions = await TransactionService.getEntityTransactions({
        entityId: req.user.id,
        entityType: req.user.role as any,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        transactionType: "wallet_withdrawal",
        status: "pending",
      });

      // Filter to only show pending/processing withdrawals
      const pendingWithdrawals = transactions.transactions.filter((t) =>
        ["pending", "processing"].includes(t.status)
      );

      return successResponse(res, {
        pendingWithdrawals,
        totalPendingAmount: pendingWithdrawals.reduce(
          (sum, t) => sum + t.amount,
          0
        ),
        count: pendingWithdrawals.length,
        pagination: transactions.pagination,
      });
    } catch (error) {
      console.error("Get pending withdrawals error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }
}

export default new WalletController();
