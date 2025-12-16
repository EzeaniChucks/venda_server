import { EntityManager, QueryRunner } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { Customer } from "../../entities/Customer";
import { Vendor } from "../../entities/Vendor";
import { Rider } from "../../entities/Rider";
import { TransactionService } from "./transaction.service";
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../../entities/Transaction";
import {
  createTransferRecipient,
  initiateTransfer,
  finalizeTransfer,
  resendTransferOtp,
  verifyTransfer,
} from "../../config/paystack";
import { v4 as uuidv4 } from "uuid";

type Entity = Customer | Vendor | Rider;

export class WalletService {
  private static readonly MAX_OTP_ATTEMPTS = 3;
  private static readonly OTP_RESEND_INTERVAL = 60 * 1000; // 1 minute

  /**
   * Fund wallet via Paystack
   */
  static async fundWallet({
    entityId,
    entityType,
    amount,
    reference,
    channel = "card",
    metadata = {},
    queryRunner,
  }: {
    entityId: string;
    entityType: "customer" | "vendor" | "rider";
    amount: number;
    reference: string;
    channel?: string;
    metadata?: any;
    queryRunner?: QueryRunner;
  }) {
    const manager = queryRunner?.manager || AppDataSource.manager;

    // Handle each entity type separately to avoid union type issues
    if (entityType === "customer") {
      const customerRepo = manager.getRepository(Customer);
      const customer = await customerRepo.findOne({ where: { id: entityId } });
      if (!customer) throw new Error("Customer not found");

      const currentBalance = customer.wallet?.balance || 0;
      customer.wallet = {
        ...customer.wallet,
        balance: currentBalance + amount,
        pendingBalance: customer.wallet?.pendingBalance || 0,
      };

      await customerRepo.save(customer);

      await TransactionService.createTransaction({
        entityId,
        entityType,
        amount,
        transactionType: "wallet_funding",
        reference,
        paymentMethod: channel,
        status: "completed",
        description: `Wallet funded with ₦${amount}`,
        metadata: {
          channel,
          ...metadata,
          previousBalance: currentBalance,
          newBalance: customer.wallet.balance,
        },
        queryRunner,
      });

      return customer;
    } else if (entityType === "vendor") {
      const vendorRepo = manager.getRepository(Vendor);
      const vendor = await vendorRepo.findOne({ where: { id: entityId } });
      if (!vendor) throw new Error("Vendor not found");

      const currentBalance = vendor.wallet?.balance || 0;
      vendor.wallet = {
        ...vendor.wallet,
        balance: currentBalance + amount,
        pendingBalance: vendor.wallet?.pendingBalance || 0,
      };

      await vendorRepo.save(vendor);

      await TransactionService.createTransaction({
        entityId,
        entityType,
        amount,
        transactionType: "wallet_funding",
        reference,
        paymentMethod: channel,
        status: "completed",
        description: `Wallet funded with ₦${amount}`,
        metadata: {
          channel,
          ...metadata,
          previousBalance: currentBalance,
          newBalance: vendor.wallet.balance,
        },
        queryRunner,
      });

      return vendor;
    } else {
      const riderRepo = manager.getRepository(Rider);
      const rider = await riderRepo.findOne({ where: { id: entityId } });
      if (!rider) throw new Error("Rider not found");

      const currentBalance = rider.wallet?.balance || 0;
      rider.wallet = {
        ...rider.wallet,
        balance: currentBalance + amount,
        pendingBalance: rider.wallet?.pendingBalance || 0,
      };

      await riderRepo.save(rider);

      await TransactionService.createTransaction({
        entityId,
        entityType,
        amount,
        transactionType: "wallet_funding",
        reference,
        paymentMethod: channel,
        status: "completed",
        description: `Wallet funded with ₦${amount}`,
        metadata: {
          channel,
          ...metadata,
          previousBalance: currentBalance,
          newBalance: rider.wallet.balance,
        },
        queryRunner,
      });

      return rider;
    }
  }

  /**
   * Withdraw from wallet to bank account
   */
  static async withdrawWallet(params: {
    entityId: string;
    entityType: "customer" | "vendor" | "rider";
    amount: number;
    accountNumber: string;
    bankCode: string;
    accountName?: string;
    narration: string;
  }) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let entity: any = null;
    let transaction: Transaction | null = null;

    const {
      entityId,
      entityType,
      amount,
      accountNumber,
      bankCode,
      accountName,
      narration,
    } = params;

    try {
      const manager = queryRunner.manager;

      // 1. Get entity and validate
      entity = await this.getEntity(manager, entityId, entityType);
      if (!entity) {
        throw new Error(`${entityType} not found`);
      }

      if (!entity.wallet) {
        throw new Error(`${entityType} wallet not found`);
      }

      // 2. Get entity name
      const entityName = this.getEntityName(entity, entityType, accountName);

      // 3. Check balance
      const currentBalance = entity.wallet.balance || 0;
      if (currentBalance < amount) {
        throw new Error("Insufficient wallet balance");
      }

      // 4. Generate reference
      const reference = `WITHDRAW_${Date.now()}_${uuidv4().substring(0, 8)}`;

      const newBalance = currentBalance - amount;

      // 5. Create transaction record
      transaction = await this.createWithdrawalTransaction(
        manager,
        entity,
        entityType,
        amount,
        reference,
        accountNumber,
        bankCode,
        narration,
        currentBalance,
        newBalance
      );

      // 6. Update wallet - move amount to pending balance
      entity.wallet = {
        ...entity.wallet,
        balance: newBalance,
        pendingBalance: (entity.wallet.pendingBalance || 0) + amount,
      };

      await this.saveEntity(manager, entity, entityType);

      // 7. Process Paystack transfer
      const paystackResult = await this.processPaystackTransfer({
        entityName,
        accountNumber,
        bankCode,
        amount,
        reference,
        narration,
      });

      // 8. Update transaction with Paystack response
      const requiresOtp = paystackResult.status === "otp";
      const updatedMetadata = {
        ...transaction.metadata,
        transferReference: paystackResult.reference,
        transferCode: paystackResult.transfer_code,
        recipientCode: paystackResult.recipient_code,
        requiresOtp,
        paystackStatus: paystackResult.status,
        lastOtpSent: requiresOtp ? new Date().toISOString() : undefined,
        otpAttempts: 0,
        accountNumber,
        bankCode,
      };

      // Determine transaction status
      let transactionStatus: TransactionStatus;
      if (requiresOtp) {
        transactionStatus = "pending";
      } else if (paystackResult.status === "pending") {
        transactionStatus = "processing";
      } else if (paystackResult.status === "success") {
        transactionStatus = "completed";
        // Clear pending balance immediately if successful
        entity.wallet.pendingBalance = Math.max(
          0,
          entity.wallet.pendingBalance - amount
        );
        await this.saveEntity(manager, entity, entityType);
      } else {
        transactionStatus = "failed";
        // Revert wallet changes if failed
        await this.revertWalletChanges(
          manager,
          entity,
          entityType,
          amount,
          currentBalance
        );
      }

      // Update transaction
      transaction.metadata = updatedMetadata;
      transaction.status = transactionStatus;

      if (transactionStatus === "completed") {
        transaction.completedAt = new Date();
      }

      await manager.getRepository(Transaction).save(transaction);

      await queryRunner.commitTransaction();

      return {
        success: true,
        reference,
        requiresOtp,
        transferCode: paystackResult.transfer_code,
        status: transactionStatus,
        message: requiresOtp
          ? "OTP required to complete transfer"
          : "Transfer initiated successfully",
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();

      // Attempt to revert wallet changes
      if (entity && transaction) {
        await this.revertFailedWithdrawal(
          entity,
          entityType,
          transaction.amount
        );
      }

      console.error("Withdrawal error:", error.message);
      throw new Error(error.message || "Failed to process withdrawal");
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Finalize withdrawal with OTP
   */
  static async finalizeWithdrawalOTP(reference: string, otp: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      // Get transaction
      const transaction = await manager.getRepository(Transaction).findOne({
        where: {
          reference,
          transactionType: "wallet_withdrawal",
        },
      });

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      if (transaction.status === "completed") {
        throw new Error("Transaction already completed");
      }

      if (!["pending", "processing"].includes(transaction.status)) {
        throw new Error(
          `Transaction cannot be finalized (status: ${transaction.status})`
        );
      }

      // Check OTP attempt limits
      const otpAttempts = transaction.metadata?.otpAttempts || 0;
      if (otpAttempts >= this.MAX_OTP_ATTEMPTS) {
        await this.handleMaxOtpAttempts(transaction);
        throw new Error("Maximum OTP attempts exceeded");
      }

      // Get transfer code
      const transferCode = transaction.metadata?.transferCode;
      if (!transferCode) {
        throw new Error("Transfer reference not found");
      }

      // Finalize transfer with Paystack
      const finalizeResult = await finalizeTransfer(transferCode, otp);

      if (!finalizeResult.status) {
        // Handle OTP failure
        await this.handleOtpFailure(transaction, finalizeResult.message);

        const remainingAttempts =
          this.MAX_OTP_ATTEMPTS - (transaction.metadata?.otpAttempts || 0) - 1;
        throw new Error(
          `Invalid OTP. Attempts remaining: ${remainingAttempts}`
        );
      }

      // Success - update transaction
      transaction.status = "completed";
      transaction.completedAt = new Date();
      transaction.metadata = {
        ...transaction.metadata,
        finalizedAt: new Date().toISOString(),
        paystackStatus: "success",
      };

      await manager.getRepository(Transaction).save(transaction);

      // Clear pending balance
      await this.clearPendingBalance(
        transaction.entityId,
        transaction.entityType,
        transaction.amount
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: "Withdrawal completed successfully",
        reference,
        amount: transaction.amount,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Resend withdrawal OTP
   */
  static async resendWithdrawalOTP(reference: string) {
    const transaction = await AppDataSource.manager
      .getRepository(Transaction)
      .findOne({
        where: {
          reference,
          transactionType: "wallet_withdrawal",
        },
      });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Check if OTP was recently sent
    const lastOtpSent = transaction.metadata?.lastOtpSent;
    if (lastOtpSent) {
      const timeDiff = Date.now() - new Date(lastOtpSent).getTime();
      if (timeDiff < this.OTP_RESEND_INTERVAL) {
        throw new Error(
          `Please wait ${Math.ceil(
            (this.OTP_RESEND_INTERVAL - timeDiff) / 1000
          )} seconds before requesting another OTP`
        );
      }
    }

    const transferCode = transaction.metadata?.transferCode;
    if (!transferCode) {
      throw new Error("Transfer reference not found");
    }

    const resendResult = await resendTransferOtp(transferCode);

    if (!resendResult.status) {
      throw new Error(resendResult.message || "Failed to resend OTP");
    }

    // Update transaction
    transaction.metadata = {
      ...transaction.metadata,
      lastOtpSent: new Date().toISOString(),
    };
    transaction.status = "pending";
    await AppDataSource.manager.getRepository(Transaction).save(transaction);

    return {
      success: true,
      message: "OTP resent successfully",
      reference,
    };
  }

  /**
   * Get wallet balance
   */
  static async getWalletBalance(entityId: string, entityType: string) {
    const entity = await this.getEntity(
      AppDataSource.manager,
      entityId,
      entityType
    );

    if (!entity) {
      throw new Error(`${entityType} not found`);
    }

    return {
      balance: entity.wallet?.balance || 0,
      pendingBalance: entity.wallet?.pendingBalance || 0,
      availableBalance:
        (entity.wallet?.balance || 0) - (entity.wallet?.pendingBalance || 0),
    };
  }

  /**
   * Handle Paystack webhook for transfers
   */
  static async handleTransferWebhook(data: any) {
    const { reference, status, transfer_code } = data;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const transaction = await manager.getRepository(Transaction).findOne({
        where: {
          reference,
          transactionType: "wallet_withdrawal",
        },
      });

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // Only update if not already completed
      if (transaction.status !== "completed") {
        let transactionStatus: TransactionStatus = transaction.status;

        if (status === "success") {
          transactionStatus = "completed";
          transaction.completedAt = new Date();
          // Clear pending balance
          await this.clearPendingBalance(
            transaction.entityId,
            transaction.entityType,
            transaction.amount
          );
        } else if (status === "failed") {
          transactionStatus = "failed";
          // Revert wallet balance
          await this.revertFailedWithdrawal(
            { id: transaction.entityId },
            transaction.entityType,
            transaction.amount
          );
        }

        transaction.status = transactionStatus;
        transaction.metadata = {
          ...transaction.metadata,
          paystackStatus: status,
          webhookReceivedAt: new Date().toISOString(),
        };

        await manager.getRepository(Transaction).save(transaction);
      }

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Helper Methods
  private static async getEntity(
    manager: EntityManager,
    entityId: string,
    entityType: string
  ) {
    switch (entityType) {
      case "customer":
        return await manager.getRepository(Customer).findOne({
          where: { id: entityId },
        });
      case "vendor":
        return await manager.getRepository(Vendor).findOne({
          where: { id: entityId },
        });
      case "rider":
        return await manager.getRepository(Rider).findOne({
          where: { id: entityId },
        });
      default:
        throw new Error(`Invalid entity type: ${entityType}`);
    }
  }

  private static getEntityName(
    entity: any,
    entityType: string,
    accountName?: string
  ): string {
    if (accountName) return accountName;

    if (entityType === "vendor" && entity.businessName) {
      return entity.businessName;
    }

    if (entity.fullName) return entity.fullName;
    if (entity.firstName && entity.lastName) {
      return `${entity.firstName} ${entity.lastName}`;
    }

    return "Account Holder";
  }

  private static async saveEntity(
    manager: EntityManager,
    entity: any,
    entityType: string
  ) {
    switch (entityType) {
      case "customer":
        await manager.getRepository(Customer).save(entity);
        break;
      case "vendor":
        await manager.getRepository(Vendor).save(entity);
        break;
      case "rider":
        await manager.getRepository(Rider).save(entity);
        break;
    }
  }

  private static async createWithdrawalTransaction(
    manager: EntityManager,
    entity: any,
    entityType: "customer" | "vendor" | "rider",
    amount: number,
    reference: string,
    accountNumber: string,
    bankCode: string,
    description: string,
    balanceBefore: number,
    balanceAfter: number
  ): Promise<Transaction> {
    const transactionData: Partial<Transaction> = {
      entityId: entity.id,
      entityType,
      amount,
      transactionType: "wallet_withdrawal" as TransactionType,
      reference,
      description,
      status: "pending" as TransactionStatus,
      balanceBefore,
      balanceAfter,
      walletId: entity.wallet?.id,
      metadata: {
        accountNumber,
        bankCode,
        createdAt: new Date().toISOString(),
      },
    };

    // Set appropriate entity relation
    switch (entityType) {
      case "customer":
        transactionData.customer = entity;
        break;
      case "vendor":
        transactionData.vendor = entity;
        break;
      case "rider":
        transactionData.rider = entity;
        break;
    }

    const transaction = manager
      .getRepository(Transaction)
      .create(transactionData);
    const savedTransaction = await manager
      .getRepository(Transaction)
      .save(transaction);

    if (!savedTransaction) {
      throw new Error("Could not create transaction record");
    }

    return savedTransaction;
  }

  private static async processPaystackTransfer(params: {
    entityName: string;
    accountNumber: string;
    bankCode: string;
    amount: number;
    reference: string;
    narration: string;
  }) {
    // Create transfer recipient
    const recipientResult = await createTransferRecipient({
      type: "nuban",
      name: params.entityName,
      account_number: params.accountNumber,
      bank_code: params.bankCode,
      currency: "NGN",
    });

    // Initiate transfer
    const transferResult = await initiateTransfer(
      recipientResult.data.recipient_code,
      params.amount,
      params.reference,
      params.narration
    );

    return {
      ...transferResult.data,
      recipient_code: recipientResult.data.recipient_code,
    };
  }

  private static async revertWalletChanges(
    manager: EntityManager,
    entity: any,
    entityType: string,
    amount: number,
    originalBalance: number
  ) {
    entity.wallet = {
      ...entity.wallet,
      balance: originalBalance,
      pendingBalance: Math.max(0, entity.wallet.pendingBalance - amount),
    };
    await this.saveEntity(manager, entity, entityType);
  }

  private static async clearPendingBalance(
    entityId: string,
    entityType: string,
    amount: number
  ) {
    const manager = AppDataSource.manager;
    const entity = await this.getEntity(manager, entityId, entityType);

    if (entity && entity.wallet) {
      entity.wallet.pendingBalance = Math.max(
        0,
        entity.wallet.pendingBalance - amount
      );
      await this.saveEntity(manager, entity, entityType);
    }
  }

  private static async revertFailedWithdrawal(
    entity: any,
    entityType: string,
    amount: number
  ) {
    const manager = AppDataSource.manager;
    const updatedEntity = await this.getEntity(manager, entity.id, entityType);

    if (updatedEntity && updatedEntity.wallet) {
      updatedEntity.wallet = {
        ...updatedEntity.wallet,
        balance: (updatedEntity.wallet.balance || 0) + amount,
        pendingBalance: Math.max(
          0,
          updatedEntity.wallet.pendingBalance - amount
        ),
      };
      await this.saveEntity(manager, updatedEntity, entityType);
    }
  }

  private static async handleMaxOtpAttempts(transaction: Transaction) {
    transaction.status = "failed";
    transaction.metadata = {
      ...transaction.metadata,
      failureReason: "MAX_OTP_ATTEMPTS_EXCEEDED",
    };
    await AppDataSource.manager.getRepository(Transaction).save(transaction);

    // Revert wallet balance
    await this.revertFailedWithdrawal(
      { id: transaction.entityId },
      transaction.entityType,
      transaction.amount
    );
  }

  private static async handleOtpFailure(
    transaction: Transaction,
    errorMessage: string
  ) {
    const otpAttempts = (transaction.metadata?.otpAttempts || 0) + 1;
    const isMaxAttemptsReached = otpAttempts >= this.MAX_OTP_ATTEMPTS;

    transaction.metadata = {
      ...transaction.metadata,
      otpAttempts,
      lastOtpAttempt: new Date().toISOString(),
      lastOtpError: errorMessage,
    };

    if (isMaxAttemptsReached) {
      transaction.status = "failed";
      transaction.metadata.failureReason = "MAX_OTP_ATTEMPTS_EXCEEDED";

      // Revert wallet balance
      await this.revertFailedWithdrawal(
        { id: transaction.entityId },
        transaction.entityType,
        transaction.amount
      );
    } else {
      transaction.status = "pending";
    }

    await AppDataSource.manager.getRepository(Transaction).save(transaction);
  }

  /**
   * Make payment from wallet
   */
  static async makePayment(params: {
    entityId: string;
    entityType: "customer" | "vendor" | "rider";
    amount: number;
    orderId?: string;
    description: string;
    reference?: string;
    metadata?: any;
  }) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const {
        entityId,
        entityType,
        amount,
        orderId,
        description,
        reference: providedReference,
        metadata = {},
      } = params;

      // 1. Get entity and validate
      const entity = await this.getEntity(manager, entityId, entityType);
      if (!entity) {
        throw new Error(`${entityType} not found`);
      }

      if (!entity.wallet) {
        throw new Error(`${entityType} wallet not found`);
      }

      // 2. Check balance
      const currentBalance = entity.wallet.balance || 0;
      if (currentBalance < amount) {
        throw new Error("Insufficient wallet balance");
      }

      // 3. Generate reference if not provided
      const reference =
        providedReference || `PAY_${Date.now()}_${uuidv4().substring(0, 8)}`;
      const newBalance = currentBalance - amount;

      // 4. Create transaction record
      const transactionData: Partial<Transaction> = {
        entityId,
        entityType,
        amount,
        transactionType: "wallet_payment" as TransactionType,
        reference,
        description,
        status: "completed" as TransactionStatus,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        // walletId: entity.wallet?.id,
        orderId,
        completedAt: new Date(),
        metadata: {
          ...metadata,
          createdAt: new Date().toISOString(),
        },
      };

      // Set appropriate entity relation
      switch (entityType) {
        case "customer":
          transactionData.customer = entity as Customer;
          break;
        case "vendor":
          transactionData.vendor = entity as Vendor;
          break;
        case "rider":
          transactionData.rider = entity as Rider;
          break;
      }

      const transaction = manager
        .getRepository(Transaction)
        .create(transactionData);
      await manager.getRepository(Transaction).save(transaction);

      // 5. Update wallet balance
      entity.wallet.balance = newBalance;
      await this.saveEntity(manager, entity, entityType);

      await queryRunner.commitTransaction();

      return {
        success: true,
        reference,
        amount,
        newBalance,
        transactionId: transaction.id,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get wallet transactions
   */
  static async getTransactions(params: {
    entityId: string;
    entityType: "customer" | "vendor" | "rider";
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    transactionType?: TransactionType;
    status?: TransactionStatus;
  }) {
    const {
      entityId,
      entityType,
      page = 1,
      limit = 20,
      startDate,
      endDate,
      transactionType,
      status,
    } = params;
    const skip = (page - 1) * limit;

    const queryBuilder = AppDataSource.manager
      .getRepository(Transaction)
      .createQueryBuilder("transaction")
      .where("transaction.entityId = :entityId", { entityId })
      .andWhere("transaction.entityType = :entityType", { entityType })
      .orderBy("transaction.createdAt", "DESC")
      .skip(skip)
      .take(limit);

    // Apply filters
    if (startDate) {
      queryBuilder.andWhere("transaction.createdAt >= :startDate", {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder.andWhere("transaction.createdAt <= :endDate", { endDate });
    }
    if (transactionType) {
      queryBuilder.andWhere("transaction.transactionType = :transactionType", {
        transactionType,
      });
    }
    if (status) {
      queryBuilder.andWhere("transaction.status = :status", { status });
    }

    const [transactions, total] = await queryBuilder.getManyAndCount();

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
