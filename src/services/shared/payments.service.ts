// services/shared/payment.service.ts
import { AppDataSource } from "../../config/data-source";
import { Customer } from "../../entities/Customer";
import { Vendor } from "../../entities/Vendor";
import { Rider } from "../../entities/Rider";
import { PaymentMethod } from "../../entities/PaymentMethod";
import { TransactionService } from "./transaction.service";
import {
  initializePayment,
  verifyPayment,
  chargeAuthorization,
  EntityType,
  listBanks,
  resolveAccountNumber,
} from "../../config/paystack";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { TransactionStatus, TransactionType } from "../../entities/Transaction";
import { PaymentType, RegisterFrontendPaymentParams } from "@/types/payment";
import { Request } from "express";

export interface InitializePaymentParams {
  entityId: string;
  entityType: "customer" | "vendor" | "rider";
  amount: number;
  purpose: string;
  email: string;
  type: "wallet_funding" | "order_payment" | "service_payment";
  metadata: Record<string, any>;
}

export class PaymentService {
  /**
   * Initialize payment for any purpose
   */
  static async initializePayment(params: InitializePaymentParams) {
    const { entityId, entityType, amount, purpose, email, type, metadata } =
      params;

    const reference = `VENDA-${type.toUpperCase()}-${uuidv4()}`;

    const paymentData = await initializePayment({
      email,
      amount,
      reference,
      entityType,
      entityId,
      purpose,
      callbackUrl: this.getCallbackUrl(type),
    });

    // Determine transaction type based on payment type
    let transactionType: TransactionType;
    switch (type) {
      case "wallet_funding":
        transactionType = "wallet_funding";
        break;
      case "order_payment":
        transactionType = "order_payment";
        break;
      case "service_payment":
        transactionType = "commission"; // or create a new type if needed
        break;
      default:
        transactionType = "wallet_funding";
    }

    // Create transaction record using TransactionService
    await TransactionService.createTransaction({
      entityId,
      entityType,
      amount,
      transactionType,
      reference,
      description: purpose,
      status: "pending",
      metadata: {
        entityType,
        entityId,
        paymentType: type,
        paystackReference: reference,
        ...metadata,
      },
    });

    return {
      authorizationUrl: paymentData.data.authorization_url,
      accessCode: paymentData.data.access_code,
      reference: paymentData.data.reference,
    };
  }

  // services/PaymentService.ts

  /**
   * Register frontend-initialized payment
   * This should be called from frontend BEFORE or AFTER payment initialization
   */
  static async registerFrontendPayment(
    req: Request,
    params: RegisterFrontendPaymentParams
  ) {
    const {
      reference,
      entityId,
      entityType,
      amount,
      purpose,
      type,
      email,
      metadata = {},
      currency = "NGN",
      expectedAmount,
    } = params;

    // Validate input
    if (
      !reference ||
      !entityId ||
      !entityType ||
      !amount ||
      !purpose ||
      !type
    ) {
      throw new Error("Missing required parameters");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Validate expected amount if provided
    if (expectedAmount && expectedAmount !== amount) {
      throw new Error("Amount mismatch with expected amount");
    }

    // Check if transaction already exists
    let transaction = await TransactionService.getTransactionByReference(
      reference
    );

    if (transaction) {
      // Transaction already exists, verify it matches the registration data
      if (
        transaction.entityId !== entityId ||
        transaction.entityType !== entityType
      ) {
        // Log security warning
        console.warn(
          `Security alert: Registration data mismatch for reference ${reference}`
        );

        // In production, you might want to flag this for review
        // For now, we'll throw an error
        throw new Error(
          "Payment registration data mismatch. Please contact support."
        );
      }

      return {
        success: true,
        message: "Payment already registered",
        data: {
          transactionId: transaction.id,
          reference: transaction.reference,
          status: transaction.status,
          amount: transaction.amount,
          entityId: transaction.entityId,
          entityType: transaction.entityType,
          paymentType: transaction.metadata?.paymentType || type,
          createdAt: transaction.createdAt,
          metadata: transaction.metadata,
        },
      };
    }

    // Map payment type to transaction type
    const transactionType = this.mapPaymentTypeToTransactionType(type);

    // Create transaction record
    transaction = await TransactionService.createTransaction({
      entityId,
      entityType,
      amount,
      transactionType,
      reference,
      description: purpose,
      status: "pending",
      metadata: {
        entityType,
        entityId,
        paymentType: type,
        currency,
        customerEmail: email,
        initializedFrom: "frontend",
        purpose,
        // Additional metadata for security/auditing
        registeredAt: new Date().toISOString(),
        registeredIp: this.getClientIP(req), // You need to implement this
        userAgent: this.getUserAgent(req), // You need to implement this
        ...metadata,
      },
    });

    // In production, you might want to emit an event or send to analytics
    // this.emitPaymentRegisteredEvent(transaction);

    return {
      success: true,
      message: "Payment registered successfully",
      data: {
        transactionId: transaction.id,
        reference: transaction.reference,
        status: transaction.status,
        amount: transaction.amount,
        entityId: transaction.entityId,
        entityType: transaction.entityType,
        paymentType: type,
        createdAt: transaction.createdAt,
        metadata: transaction.metadata,
      },
    };
  }

  // Helper method to map payment type to transaction type
  private static mapPaymentTypeToTransactionType(
    paymentType: PaymentType
  ): TransactionType {
    const map: Record<PaymentType, TransactionType> = {
      wallet_funding: "wallet_funding",
      order_payment: "order_payment",
      service_payment: "commission",
      subscription: "subscription",
      donation: "donation",
      other: "other",
    };

    return map[paymentType] || "other";
  }

  /**
   * Verify payment by reference - handles both initialization methods
   * This works for paystack sdk only after calling registerFrontendPayment endpoint above
   */
  static async verifyPayment(reference: string) {
    // Verify with Paystack
    const verificationData = await verifyPayment(reference);

    if (!verificationData.status) {
      throw new Error("Payment verification failed");
    }

    const paymentInfo = verificationData.data;

    // Check if transaction exists
    let transaction = await TransactionService.getTransactionByReference(
      reference
    );

    if (!transaction) {
      // Transaction might not exist for frontend-initialized payments
      // Extract metadata from Paystack response or create minimal transaction
      const metadata = paymentInfo.metadata || {};

      // For frontend-initialized payments, we need to identify the user
      // This requires the frontend to send user info after payment
      // or you need to store user info in Paystack metadata during frontend initialization

      throw new Error(
        "Transaction not found. Please register payment first or ensure metadata is properly set."
      );
    }

    if (transaction.status === "completed") {
      return {
        message: "Payment already processed",
        data: paymentInfo,
      };
    }

    // Use metadata from transaction (more reliable than Paystack metadata)
    const { entityType, entityId } = transaction;

    if (!entityType || !entityId) {
      throw new Error(
        "Invalid transaction metadata. Missing entity information."
      );
    }

    // Process based on payment status
    if (paymentInfo.status === "success") {
      await this.handleSuccessfulPayment(
        paymentInfo,
        transaction,
        entityType,
        entityId
      );
    } else {
      await this.handleFailedPayment(transaction);
      throw new Error("Payment was not successful");
    }

    return {
      amount: paymentInfo.amount / 100,
      reference: paymentInfo.reference,
      status: paymentInfo.status,
      transactionId: transaction.id,
      entityType,
      entityId,
    };
  }

  /**
   * Charge saved payment method for any entity
   */
  static async chargeSavedPaymentMethod(params: {
    entityId: string;
    entityType: "customer" | "vendor" | "rider";
    amount: number;
    paymentMethodId: string;
    purpose: string;
  }) {
    const { entityId, entityType, amount, paymentMethodId, purpose } = params;

    // Get payment method (now supports all entity types)
    const paymentMethod = await AppDataSource.getRepository(
      PaymentMethod
    ).findOne({
      where: {
        id: paymentMethodId,
        ownerId: entityId,
        ownerType: entityType,
        isActive: true,
      },
    });

    if (!paymentMethod) {
      throw new Error("Payment method not found or inactive");
    }

    // Get the entity based on type
    let entity: any;
    let email: string;

    switch (entityType) {
      case "customer":
        entity = await AppDataSource.getRepository(Customer).findOne({
          where: { id: entityId },
        });
        email = entity?.email;
        break;
      case "vendor":
        entity = await AppDataSource.getRepository(Vendor).findOne({
          where: { id: entityId },
        });
        email =
          entity?.email || entity?.businessEmail || `${entityId}@vendor.com`;
        break;
      case "rider":
        entity = await AppDataSource.getRepository(Rider).findOne({
          where: { id: entityId },
        });
        email = entity?.email || `${entityId}@rider.com`;
        break;
      default:
        throw new Error(`Invalid entity type: ${entityType}`);
    }

    if (!entity) {
      throw new Error(`${entityType} not found`);
    }

    if (!email) {
      throw new Error("Email is required for payment");
    }

    const reference = `VENDA-SAVED-CARD-${uuidv4()}`;

    // Charge authorization
    const chargeData = await chargeAuthorization({
      email,
      amount,
      authorizationCode: paymentMethod.authorizationCode,
      reference,
      entityType,
      entityId,
      purpose,
      paymentMethodId,
    });

    if (!chargeData.status || chargeData.data.status !== "success") {
      throw new Error(chargeData.message || "Failed to charge card");
    }

    // Handle successful charge - update wallet balance
    const balanceBefore = entity.wallet?.balance || 0;
    const balanceAfter = balanceBefore + amount;

    // Update entity's wallet
    entity.wallet = {
      ...entity.wallet,
      balance: balanceAfter,
      pendingBalance: entity.wallet?.pendingBalance || 0,
    };

    // Save entity based on type
    switch (entityType) {
      case "customer":
        await AppDataSource.getRepository(Customer).save(entity);
        break;
      case "vendor":
        await AppDataSource.getRepository(Vendor).save(entity);
        break;
      case "rider":
        await AppDataSource.getRepository(Rider).save(entity);
        break;
    }

    // Create transaction
    await TransactionService.createTransaction({
      entityId,
      entityType,
      amount,
      transactionType: "wallet_funding",
      reference,
      description: purpose,
      status: "completed",
      balanceBefore,
      balanceAfter,
      paymentMethod: "card",
      metadata: {
        paymentMethodId,
        paystackData: chargeData.data,
        paymentType: "wallet_funding",
      },
    });

    return {
      amount,
      reference,
      newBalance: entity.wallet.balance,
    };
  }

  /**
   * Get payment methods for any entity
   */
  static async getPaymentMethods(
    ownerId: string,
    ownerType: "customer" | "vendor" | "rider"
  ) {
    const paymentMethods = await AppDataSource.getRepository(
      PaymentMethod
    ).find({
      where: { ownerId, ownerType, isActive: true },
      order: { isDefault: "DESC", createdAt: "DESC" },
    });

    return paymentMethods.map((pm) => ({
      id: pm.id,
      cardType: pm.cardType,
      last4: pm.last4,
      expMonth: pm.expMonth,
      expYear: pm.expYear,
      bank: pm.bank,
      brand: pm.brand,
      isDefault: pm.isDefault,
      createdAt: pm.createdAt,
      ownerType: pm.ownerType,
    }));
  }

  /**
   * Set default payment method for any entity
   */
  static async setDefaultPaymentMethod(
    ownerId: string,
    ownerType: "customer" | "vendor" | "rider",
    paymentMethodId: string
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      // 1. Reset all other payment methods to non-default
      await manager
        .getRepository(PaymentMethod)
        .createQueryBuilder()
        .update(PaymentMethod)
        .set({ isDefault: false })
        .where("ownerId = :ownerId AND ownerType = :ownerType", {
          ownerId,
          ownerType,
        })
        .execute();

      // 2. Set the specified payment method as default
      const paymentMethod = await manager.getRepository(PaymentMethod).findOne({
        where: { id: paymentMethodId, ownerId, ownerType, isActive: true },
      });

      if (!paymentMethod) {
        throw new Error("Payment method not found");
      }

      paymentMethod.isDefault = true;
      await manager.getRepository(PaymentMethod).save(paymentMethod);

      await queryRunner.commitTransaction();

      return { success: true, paymentMethod };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete payment method for any entity
   */
  static async deletePaymentMethod(
    ownerId: string,
    ownerType: "customer" | "vendor" | "rider",
    paymentMethodId: string
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const paymentMethod = await manager.getRepository(PaymentMethod).findOne({
        where: { id: paymentMethodId, ownerId, ownerType },
      });

      if (!paymentMethod) {
        throw new Error("Payment method not found");
      }

      // Don't allow deleting default payment method if it's the only one
      if (paymentMethod.isDefault) {
        const otherMethods = await manager.getRepository(PaymentMethod).find({
          where: {
            ownerId,
            ownerType,
            isActive: true,
            id: paymentMethodId,
          },
        });

        if (otherMethods.length > 0) {
          throw new Error(
            "Cannot delete default payment method. Set another as default first."
          );
        }
      }

      paymentMethod.isActive = false;
      await manager.getRepository(PaymentMethod).save(paymentMethod);

      await queryRunner.commitTransaction();

      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Add payment method for any entity
   */
  static async savePaymentMethod(params: {
    ownerId: string;
    ownerType: "customer" | "vendor" | "rider";
    authorizationCode: string;
    cardType: string;
    last4: string;
    expMonth: string;
    expYear: string;
    bank: string;
    countryCode: string;
    brand: string;
    isDefault?: boolean;
  }) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      // If setting as default, reset existing defaults
      if (params.isDefault) {
        await manager
          .getRepository(PaymentMethod)
          .createQueryBuilder()
          .update(PaymentMethod)
          .set({ isDefault: false })
          .where("ownerId = :ownerId AND ownerType = :ownerType", {
            ownerId: params.ownerId,
            ownerType: params.ownerType,
          })
          .execute();
      }

      // Create new payment method
      const paymentMethod = manager.getRepository(PaymentMethod).create({
        ownerId: params.ownerId,
        ownerType: params.ownerType,
        authorizationCode: params.authorizationCode,
        cardType: params.cardType,
        last4: params.last4,
        expMonth: params.expMonth,
        expYear: params.expYear,
        bank: params.bank,
        countryCode: params.countryCode,
        brand: params.brand,
        isDefault: params.isDefault || false,
        isActive: true,
      });

      const savedPaymentMethod = await manager
        .getRepository(PaymentMethod)
        .save(paymentMethod);

      await queryRunner.commitTransaction();

      return savedPaymentMethod;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get list of banks
   */
  static async getBanks(country = "nigeria") {
    const banksData = await listBanks(country);
    return banksData.data;
  }

  /**
   * Resolve bank account
   */
  static async resolveBankAccount(accountNumber: string, bankCode: string) {
    const accountData = await resolveAccountNumber(accountNumber, bankCode);
    return accountData.data;
  }

  /**
   * Handle Paystack webhook
   */
  static async handleWebhook(body: any, headers: any) {
    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(body))
      .digest("hex");

    if (hash !== headers["x-paystack-signature"]) {
      throw new Error("Invalid webhook signature");
    }

    const event = body.event;

    // Handle different webhook events
    switch (event) {
      case "charge.success":
        await this.handleChargeSuccess(body.data);
        break;
      case "transfer.success":
      case "transfer.failed":
      case "transfer.reversed":
        await this.handleTransferEvent(event, body.data);
        break;
      case "subscription.create":
      case "subscription.disable":
        await this.handleSubscriptionEvent(event, body.data);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return { success: true };
  }

  /**
   * Handle successful charge
   */
  private static async handleChargeSuccess(data: any) {
    const { reference, amount, metadata } = data;

    // Verify payment to ensure it's valid
    const verification = await verifyPayment(reference);

    if (!verification.status || verification.data.status !== "success") {
      throw new Error("Invalid charge success event");
    }

    // Process based on payment type
    const paymentType = metadata?.paymentType || "wallet_funding";

    switch (paymentType) {
      case "wallet_funding":
        await this.processWalletFunding(verification.data, metadata);
        break;
      case "order_payment":
        await this.processOrderPayment(verification.data, metadata);
        break;
      case "service_payment":
        await this.processServicePayment(verification.data, metadata);
        break;
      default:
        console.log(`Unknown payment type: ${paymentType}`);
    }
  }

  /**
   * Handle transfer events
   */
  private static async handleTransferEvent(event: string, data: any) {
    const { reference, status } = data;

    // Get transaction
    const transaction = await TransactionService.getTransactionByReference(
      reference
    );
    if (!transaction) {
      console.error(`Transaction not found for reference: ${reference}`);
      return;
    }

    // Update transaction status
    let newStatus: TransactionStatus;
    switch (status) {
      case "success":
        newStatus = "completed";
        break;
      case "failed":
      case "reversed":
        newStatus = "failed";
        break;
      default:
        newStatus = transaction.status;
    }

    await TransactionService.updateTransactionStatus(reference, {
      status: newStatus,
      metadata: {
        ...transaction.metadata,
        paystackStatus: status,
        webhookProcessedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Handle subscription events
   */
  private static async handleSubscriptionEvent(event: string, data: any) {
    console.log(`Subscription event: ${event}`, data);
  }

  /**
   * Process wallet funding
   */
  private static async processWalletFunding(paymentInfo: any, metadata: any) {
    const { entityType, entityId } = metadata;

    let entityRepo;
    switch (entityType) {
      case "customer":
        entityRepo = AppDataSource.getRepository(Customer);
        break;
      case "vendor":
        entityRepo = AppDataSource.getRepository(Vendor);
        break;
      case "rider":
        entityRepo = AppDataSource.getRepository(Rider);
        break;
      default:
        throw new Error(`Invalid entity type: ${entityType}`);
    }

    const user = await entityRepo.findOne({ where: { id: entityId } });
    if (!user) {
      throw new Error(`${entityType} not found`);
    }

    const amount = paymentInfo.amount / 100;
    const balanceBefore = user.wallet?.balance || 0;
    const balanceAfter = balanceBefore + amount;

    // Update wallet
    user.wallet = {
      ...user.wallet,
      balance: balanceAfter,
      pendingBalance: user.wallet?.pendingBalance || 0,
    };

    await (entityRepo as any).save(user);

    // Update transaction
    await TransactionService.updateTransactionStatus(paymentInfo.reference, {
      status: "completed",
      balanceBefore,
      balanceAfter,
      metadata: {
        ...metadata,
        paystackData: paymentInfo,
        processedAt: new Date().toISOString(),
      },
    });

    // Save card if it's a customer and authorization is present
    if (paymentInfo.authorization) {
      await this.uploadPaymentMethod(entityId, entityType, paymentInfo);
    }
  }

  /**
   * Process order payment
   */
  private static async processOrderPayment(paymentInfo: any, metadata: any) {
    // Implement order payment processing
    console.log("Processing order payment:", metadata);
  }

  /**
   * Process service payment
   */
  private static async processServicePayment(paymentInfo: any, metadata: any) {
    // Implement service payment processing
    console.log("Processing service payment:", metadata);
  }

  /**
   * Handle successful payment
   */
  private static async handleSuccessfulPayment(
    paymentInfo: any,
    transaction: any,
    entityType: EntityType,
    entityId: string
  ) {
    let entityRepo;
    let user;

    switch (entityType) {
      case "customer":
        entityRepo = AppDataSource.getRepository(Customer);
        user = await entityRepo.findOne({ where: { id: entityId } });
        break;
      case "vendor":
        entityRepo = AppDataSource.getRepository(Vendor);
        user = await entityRepo.findOne({ where: { id: entityId } });
        break;
      case "rider":
        entityRepo = AppDataSource.getRepository(Rider);
        user = await entityRepo.findOne({ where: { id: entityId } });
        break;
      default:
        throw new Error(`Invalid entity type: ${entityType}`);
    }

    if (!user) {
      throw new Error(`${entityType} not found`);
    }

    const amount = Number(paymentInfo.amount) / 100;
    const balanceBefore = Number(user.wallet?.balance) || 0;
    const balanceAfter = balanceBefore + amount;

    // Update wallet
    user.wallet = {
      ...user.wallet,
      balance: balanceAfter,
      pendingBalance: user.wallet?.pendingBalance || 0,
    };

    await (entityRepo as any).save(user);

    // Update transaction
    await TransactionService.updateTransactionStatus(paymentInfo.reference, {
      status: "completed",
      balanceBefore,
      balanceAfter,
      metadata: {
        ...transaction.metadata,
        paystackData: paymentInfo,
      },
    });

    // Save payment method
    if (paymentInfo.authorization) {
      await this.uploadPaymentMethod(entityId, entityType, paymentInfo);
    }
  }

  /**
   * Handle failed payment
   */
  private static async handleFailedPayment(transaction: any) {
    await TransactionService.updateTransactionStatus(transaction.reference, {
      status: "failed",
    });
  }

  private static async uploadPaymentMethod(
    entityId: string,
    entityType: "customer" | "vendor" | "rider",
    paymentInfo: any
  ) {
    const { authorization } = paymentInfo;

    // Check if payment method already exists
    const existingPaymentMethod = await AppDataSource.getRepository(
      PaymentMethod
    ).findOne({
      where: {
        ownerId: entityId,
        ownerType: entityType,
        authorizationCode: authorization.authorization_code,
        isActive: true,
      },
    });

    if (existingPaymentMethod) {
      return existingPaymentMethod;
    }

    // Get entity to check if this should be default
    let isDefault = false;
    const existingMethods = await AppDataSource.getRepository(
      PaymentMethod
    ).find({
      where: { ownerId: entityId, ownerType: entityType, isActive: true },
    });

    // If this is the first payment method, set as default
    if (existingMethods.length === 0) {
      isDefault = true;
    }

    // Create new payment method
    const paymentMethod = await this.savePaymentMethod({
      ownerId: entityId,
      ownerType: entityType,
      authorizationCode: authorization.authorization_code,
      cardType: authorization.card_type,
      last4: authorization.last4,
      expMonth: authorization.exp_month,
      expYear: authorization.exp_year,
      bank: authorization.bank,
      countryCode: authorization.country_code,
      brand: authorization.brand,
      isDefault,
    });

    return paymentMethod;
  }
  /**
   * Get callback URL based on payment type
   */
  private static getCallbackUrl(type: string): string {
    const baseUrl = process.env.APP_URL || "http://localhost:3000";

    switch (type) {
      case "wallet_funding":
        return `${baseUrl}/api/payments/verify`;
      case "order_payment":
        return `${baseUrl}/api/orders/callback`;
      case "service_payment":
        return `${baseUrl}/api/services/callback`;
      default:
        return `${baseUrl}/api/payments/verify`;
    }
  }

  // Helper to get client IP (you need to implement based on your framework)
  private static getClientIP(req: Request): string | string[] {
    // For Express:
    const ip = req.ip || req.headers["x-forwarded-for"];
    return ip || "unknown";
  }

  // Helper to get user agent
  private static getUserAgent(req: Request): string {
    // This depends on your HTTP framework
    return req.headers["user-agent"] || "unknown";
  }
}
