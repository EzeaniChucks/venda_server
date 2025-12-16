// services/shared/transaction.service.ts
import { EntityManager, QueryRunner } from "typeorm";
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../../entities/Transaction";
import { Customer } from "../../entities/Customer";
import { Vendor } from "../../entities/Vendor";
import { Rider } from "../../entities/Rider";
import { AppDataSource } from "../../config/data-source";

export class TransactionService {
  /**
   * Create a transaction record
   */
  static async createTransaction(params: {
    entityId: string;
    entityType: "customer" | "vendor" | "rider";
    amount: number;
    transactionType: TransactionType;
    reference: string;
    description: string;
    status: TransactionStatus;
    balanceBefore?: number;
    balanceAfter?: number;
    walletId?: string;
    orderId?: string;
    paymentMethod?: string;
    metadata?: any;
    queryRunner?: QueryRunner;
  }): Promise<Transaction> {
    const manager = params.queryRunner?.manager || AppDataSource.manager;

    const transactionData: Partial<Transaction> = {
      entityId: params.entityId,
      entityType: params.entityType,
      amount: params.amount,
      transactionType: params.transactionType,
      reference: params.reference,
      description: params.description,
      status: params.status,
      balanceBefore: params.balanceBefore,
      balanceAfter: params.balanceAfter,
      walletId: params.walletId,
      orderId: params.orderId,
      paymentMethod: params.paymentMethod,
      metadata: params.metadata,
    };

    // Set appropriate entity relation
    switch (params.entityType) {
      case "customer":
        const customer = await manager.getRepository(Customer).findOne({
          where: { id: params.entityId },
        });
        if (customer) transactionData.customer = customer;
        break;
      case "vendor":
        const vendor = await manager.getRepository(Vendor).findOne({
          where: { id: params.entityId },
        });
        if (vendor) transactionData.vendor = vendor;
        break;
      case "rider":
        const rider = await manager.getRepository(Rider).findOne({
          where: { id: params.entityId },
        });
        if (rider) transactionData.rider = rider;
        break;
    }

    const transaction = manager
      .getRepository(Transaction)
      .create(transactionData);
    return await manager.getRepository(Transaction).save(transaction);
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(
    reference: string,
    updates: Partial<Transaction>,
    queryRunner?: QueryRunner
  ): Promise<Transaction> {
    const manager = queryRunner?.manager || AppDataSource.manager;

    const transaction = await manager.getRepository(Transaction).findOne({
      where: { reference },
    });

    if (!transaction) {
      throw new Error(`Transaction not found: ${reference}`);
    }

    Object.assign(transaction, updates);

    if (updates.status === "completed" && !transaction.completedAt) {
      transaction.completedAt = new Date();
    }

    return await manager.getRepository(Transaction).save(transaction);
  }

  /**
   * Get transaction by reference
   */
  static async getTransactionByReference(
    reference: string
  ): Promise<Transaction | null> {
    return await AppDataSource.manager
      .getRepository(Transaction)
      .findOne({ where: { reference } });
  }

  /**
   * Get transactions for entity
   */
  static async getEntityTransactions(params: {
    entityId: string;
    entityType: "customer" | "vendor" | "rider";
    transactionType?: TransactionType;
    status?: TransactionStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      entityId,
      entityType,
      transactionType,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
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

    if (transactionType) {
      queryBuilder.andWhere("transaction.transactionType = :transactionType", {
        transactionType,
      });
    }
    if (status) {
      queryBuilder.andWhere("transaction.status = :status", { status });
    }
    if (startDate) {
      queryBuilder.andWhere("transaction.createdAt >= :startDate", {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder.andWhere("transaction.createdAt <= :endDate", { endDate });
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
