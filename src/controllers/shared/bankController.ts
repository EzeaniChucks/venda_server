import { asyncHandler } from "../../middleware/asyncHandler";
import BankService from "../../services/shared/bankservice.service";
import { AuthRequest } from "../../types";
import { Request, Response } from "express";

export class BankController {
  /**
   * Get list of banks from Paystack
   */
  static getBanksController = async (req: Request, res: Response) => {
    const banks = await BankService.getBanks();

    res.status(200).json({
      success: true,
      message: "Banks retrieved successfully",
      data: banks,
    });
  };

  /**
   * Verify bank account with Paystack
   */
  static verifyBankAccountController = async (req: Request, res: Response) => {
    const { accountNumber, bankCode } = req.body;

    // Validate required fields
    if (!accountNumber || !bankCode) {
      return res.status(400).json({
        success: false,
        message: "Account number and bank code are required",
      });
    }

    // Validate account number format
    if (accountNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Account number must be 10 digits",
      });
    }

    const verification = await BankService.verifyBankAccount(
      accountNumber,
      bankCode
    );

    if (!verification.status) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    res.status(200).json({
      success: true,
      message: verification.message,
      data: verification.data,
    });
  };

  /**
   * Initialize Paystack transaction
   */
  static initializeTransactionController = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { email, amount, metadata } = req.body;
      const vendorId = req.user?.id;

      if (!email || !amount) {
        return res.status(400).json({
          success: false,
          message: "Email and amount are required",
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }

      try {
        const response = await BankService.initializeTransaction(
          email,
          amount,
          {
            ...metadata,
            vendorId,
          }
        );

        res.status(200).json({
          success: true,
          message: "Transaction initialized successfully",
          data: response,
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: error.message || "Failed to initialize transaction",
        });
      }
    }
  );

  /**
   * Verify Paystack transaction
   */
  static verifyTransactionController = asyncHandler(
    async (req: Request, res: Response) => {
      const { reference } = req.params;

      if (!reference) {
        return res.status(400).json({
          success: false,
          message: "Transaction reference is required",
        });
      }

      try {
        const verification = await BankService.verifyTransaction(reference);

        if (!verification.status) {
          return res.status(400).json({
            success: false,
            message: verification.message || "Transaction verification failed",
          });
        }

        // Check if transaction was successful
        if (verification.data.status !== "success") {
          return res.status(400).json({
            success: false,
            message: `Transaction ${verification.data.status}`,
            data: verification.data,
          });
        }

        // TODO: Process successful transaction here
        // - Update vendor subscription
        // - Record payment in database
        // - Send confirmation email, etc.

        res.status(200).json({
          success: true,
          message: "Transaction verified successfully",
          data: verification.data,
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: error.message || "Failed to verify transaction",
        });
      }
    }
  );

  /**
   * Charge authorization (for recurring payments)
   */
  static chargeAuthorizationController = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { authorizationCode, email, amount, reference, metadata } =
        req.body;
      const vendorId = req.user?.id;

      if (!authorizationCode || !email || !amount || !reference) {
        return res.status(400).json({
          success: false,
          message:
            "Authorization code, email, amount, and reference are required",
        });
      }

      try {
        const response = await BankService.chargeAuthorization(
          authorizationCode,
          email,
          amount,
          reference,
          {
            ...metadata,
            vendorId,
          }
        );

        if (!response.status) {
          return res.status(400).json({
            success: false,
            message: response.message || "Charge failed",
            data: response.data,
          });
        }

        // TODO: Process successful charge here

        res.status(200).json({
          success: true,
          message: "Charge successful",
          data: response.data,
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: error.message || "Failed to charge authorization",
        });
      }
    }
  );

  /**
   * Create or fetch customer
   */
  static handleCustomerController = asyncHandler(
    async (req: Request, res: Response) => {
      const { email, firstName, lastName } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      try {
        // First, try to fetch existing customer
        const existingCustomer = await BankService.fetchCustomer(email);

        if (existingCustomer?.status) {
          return res.status(200).json({
            success: true,
            message: "Customer retrieved successfully",
            data: existingCustomer.data,
          });
        }

        // Create new customer if not found
        const newCustomer = await BankService.createCustomer(
          email,
          firstName,
          lastName
        );

        res.status(201).json({
          success: true,
          message: "Customer created successfully",
          data: newCustomer.data,
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: error.message || "Failed to handle customer",
        });
      }
    }
  );

  /**
   * Generate transaction reference
   */
  static generateReferenceController = asyncHandler(
    async (req: Request, res: Response) => {
      const reference = BankService.generateReference();

      res.status(200).json({
        success: true,
        message: "Reference generated successfully",
        data: { reference },
      });
    }
  );
}
