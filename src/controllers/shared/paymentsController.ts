// controllers/payment.controller.ts
import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import { PaymentService } from "../../services/shared/payments.service";
import { WalletService } from "../../services/shared/wallet.service";
import { TransactionService } from "../../services/shared/transaction.service";
import { EntityType, PaymentType } from "@/types/payment";

export class PaymentController {
  /**
   * Initialize payment (consolidated endpoint for all payment types)
   */
  static async initializePayment(req: AuthRequest, res: Response) {
    try {
      const {
        amount,
        purpose = "Wallet Funding",
        type = "wallet_funding",
      } = req.body;
      const user = req.user!;
      const { id: entityId, role: entityType, email } = user;

      // Validate request
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid amount",
        });
      }

      if (!email) {
        return res.status(400).json({
          success: false,
          error: "User email is required",
        });
      }

      // Initialize payment
      const result = await PaymentService.initializePayment({
        entityId,
        entityType: entityType as "customer" | "vendor" | "rider",
        amount,
        purpose,
        email,
        type,
        metadata: req.body.metadata || {},
      });

      res.json({
        success: true,
        message: "Payment initialized successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Initialize payment error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to initialize payment",
      });
    }
  }

  /**
   * Register frontend payment controller
   */
  static async registerFrontendPayment(req: AuthRequest, res: Response) {
    try {
      const {
        reference,
        entityId,
        entityType,
        amount,
        purpose,
        type,
        email,
        metadata,
        currency,
        expectedAmount,
      } = req.body;

      // Validate required fields
      if (
        !reference ||
        !entityId ||
        !entityType ||
        !amount ||
        !purpose ||
        !type
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: reference, entityId, entityType, amount, purpose, type are required",
        });
      }

      // Validate amount
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        return res.status(400).json({
          success: false,
          error: "Amount must be a positive number",
        });
      }

      // Validate entity type
      const validEntityTypes: EntityType[] = [
        "customer",
        "vendor",
        "rider",
        // "admin",
        // "business",
      ];
      if (!validEntityTypes.includes(entityType as EntityType)) {
        return res.status(400).json({
          success: false,
          error: `Invalid entity type. Must be one of: ${validEntityTypes.join(
            ", "
          )}`,
        });
      }

      // Validate payment type
      const validPaymentTypes: PaymentType[] = [
        "wallet_funding",
        "order_payment",
        "service_payment",
        "subscription",
        "donation",
        "other",
      ];
      if (!validPaymentTypes.includes(type as PaymentType)) {
        return res.status(400).json({
          success: false,
          error: `Invalid payment type. Must be one of: ${validPaymentTypes.join(
            ", "
          )}`,
        });
      }

      // Optional: Validate user authorization
      // For example, ensure the authenticated user matches the entityId
      if (req.user && req.user.id !== entityId && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Not authorized to register payment for this entity",
        });
      }

      const result = await PaymentService.registerFrontendPayment(req, {
        reference,
        entityId,
        entityType: entityType as EntityType,
        amount: amountNumber,
        purpose,
        type: type as PaymentType,
        email,
        metadata,
        currency: currency || "NGN",
        expectedAmount: expectedAmount ? parseFloat(expectedAmount) : undefined,
      });

      res.json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error: any) {
      console.error("Register frontend payment error:", error);

      // Handle specific errors
      if (
        error.message.includes("already registered") ||
        error.message.includes("data mismatch")
      ) {
        return res.status(409).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message.includes("Amount must be")) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || "Failed to register payment",
      });
    }
  }

  /**
   * Verify payment
   */
  static async verifyPayment(req: Request, res: Response) {
    try {
      const { reference } = req.params;

      if (!reference) {
        return res.status(400).json({
          success: false,
          error: "Reference is required",
        });
      }

      const result = await PaymentService.verifyPayment(reference);

      res.json({
        success: true,
        message: "Payment verified successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Verify payment error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to verify payment",
      });
    }
  }

  /**
   * Get wallet balance
   */
  static async getWalletBalance(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const { id: entityId, role: entityType } = user;

      const wallet = await WalletService.getWalletBalance(entityId, entityType);

      res.json({
        success: true,
        data: wallet,
      });
    } catch (error: any) {
      console.error("Get wallet balance error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get wallet balance",
      });
    }
  }

  /**
   * Withdraw from wallet
   */
  static async withdrawFromWallet(req: AuthRequest, res: Response) {
    try {
      const { amount, accountNumber, bankCode, accountName } = req.body;
      const user = req.user!;
      const { id: entityId, role: entityType } = user;

      // Validate request
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid amount",
        });
      }

      if (!accountNumber || !bankCode) {
        return res.status(400).json({
          success: false,
          error: "Account number and bank code are required",
        });
      }

      const result = await WalletService.withdrawWallet({
        entityId,
        entityType: entityType as "customer" | "vendor" | "rider",
        amount,
        accountNumber,
        bankCode,
        accountName,
        narration: `Wallet withdrawal - ${accountName || "VENDA User"}`,
      });

      res.json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error: any) {
      console.error("Withdraw error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to process withdrawal",
      });
    }
  }

  /**
   * Finalize withdrawal with OTP
   */
  static async finalizeWithdrawal(req: AuthRequest, res: Response) {
    try {
      const { reference, otp } = req.body;
      const user = req.user!;

      // Validate request
      if (!reference || !otp) {
        return res.status(400).json({
          success: false,
          error: "Reference and OTP are required",
        });
      }

      const result = await WalletService.finalizeWithdrawalOTP(reference, otp);

      res.json({
        success: true,
        message: "Withdrawal finalized successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Finalize withdrawal error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to finalize withdrawal",
      });
    }
  }

  /**
   * Resend withdrawal OTP
   */
  static async resendWithdrawalOTP(req: AuthRequest, res: Response) {
    try {
      const { reference } = req.body;

      // Validate request
      if (!reference) {
        return res.status(400).json({
          success: false,
          error: "Reference is required",
        });
      }

      const result = await WalletService.resendWithdrawalOTP(reference);

      res.json({
        success: true,
        message: "OTP resent successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to resend OTP",
      });
    }
  }

  /**
   * Get payment methods for authenticated user
   */
  static async getPaymentMethods(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;

      const paymentMethods = await PaymentService.getPaymentMethods(
        user.id,
        user.role as "customer" | "vendor" | "rider"
      );

      res.json({
        success: true,
        data: paymentMethods,
      });
    } catch (error: any) {
      console.error("Get payment methods error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get payment methods",
      });
    }
  }

  /**
   * Charge saved payment method
   */
  static async chargeSavedMethod(req: AuthRequest, res: Response) {
    try {
      const { amount, paymentMethodId, purpose = "Wallet Funding" } = req.body;
      const user = req.user!;

      // Validate request
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid amount",
        });
      }

      if (!paymentMethodId) {
        return res.status(400).json({
          success: false,
          error: "Payment method ID is required",
        });
      }

      const result = await PaymentService.chargeSavedPaymentMethod({
        entityId: user.id,
        entityType: user.role as "customer" | "vendor" | "rider",
        amount,
        paymentMethodId,
        purpose,
      });

      res.json({
        success: true,
        message: "Payment charged successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Charge saved method error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to charge payment method",
      });
    }
  }

  /**
   * Set default payment method
   */
  static async setDefaultPaymentMethod(req: AuthRequest, res: Response) {
    try {
      const { paymentMethodId } = req.body;
      const user = req.user!;

      if (!paymentMethodId) {
        return res.status(400).json({
          success: false,
          error: "Payment method ID is required",
        });
      }

      const result = await PaymentService.setDefaultPaymentMethod(
        user.id,
        user.role as "customer" | "vendor" | "rider",
        paymentMethodId
      );

      res.json({
        success: true,
        message: "Default payment method updated",
        data: result,
      });
    } catch (error: any) {
      console.error("Set default payment method error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to set default payment method",
      });
    }
  }

  /**
   * Delete payment method
   */
  static async deletePaymentMethod(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user!;

      await PaymentService.deletePaymentMethod(
        user.id,
        user.role as "customer" | "vendor" | "rider",
        id
      );

      res.json({
        success: true,
        message: "Payment method deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete payment method error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to delete payment method",
      });
    }
  }

  /**
   * Add payment method (after successful card charge)
   */
  static async savePaymentMethod(req: AuthRequest, res: Response) {
    try {
      const {
        authorizationCode,
        cardType,
        last4,
        expMonth,
        expYear,
        bank,
        countryCode,
        brand,
        isDefault = false,
      } = req.body;

      const user = req.user!;

      // Validate required fields
      const requiredFields = [
        "authorizationCode",
        "cardType",
        "last4",
        "expMonth",
        "expYear",
        "bank",
        "countryCode",
        "brand",
      ];

      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({
            success: false,
            error: `${field} is required`,
          });
        }
      }

      const paymentMethod = await PaymentService.savePaymentMethod({
        ownerId: user.id,
        ownerType: user.role as "customer" | "vendor" | "rider",
        authorizationCode,
        cardType,
        last4,
        expMonth,
        expYear,
        bank,
        countryCode,
        brand,
        isDefault,
      });

      res.json({
        success: true,
        message: "Payment method added successfully",
        data: {
          id: paymentMethod.id,
          cardType: paymentMethod.cardType,
          last4: paymentMethod.last4,
          isDefault: paymentMethod.isDefault,
        },
      });
    } catch (error: any) {
      console.error("Add payment method error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to add payment method",
      });
    }
  }

  /**
   * Get transaction history
   */
  static async getTransactionHistory(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const { id: entityId, role: entityType } = user;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await TransactionService.getEntityTransactions({
        entityId,
        entityType: entityType as "customer" | "vendor" | "rider",
        page,
        limit,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Get transactions error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get transactions",
      });
    }
  }

  /**
   * Handle Paystack webhook
   */
  static async handlePaystackWebhook(req: Request, res: Response) {
    try {
      const result = await PaymentService.handleWebhook(req.body, req.headers);

      res.json({
        success: true,
        message: "Webhook processed successfully",
      });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to process webhook",
      });
    }
  }
}
