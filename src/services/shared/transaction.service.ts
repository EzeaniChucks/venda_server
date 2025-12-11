import { QueryRunner } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { Transaction, TransactionType, TransactionStatus } from '../../entities/Transaction';

export class TransactionService {
  /**
   * Create a new transaction record
   */
  static async createTransaction({
    entityId,
    entityType,
    orderId,
    amount,
    type,
    reference,
    paymentMethod,
    status = 'pending',
    purpose,
    metadata,
    queryRunner
  }: {
    entityId: string;
    entityType: 'customer' | 'vendor' | 'rider';
    orderId?: string;
    amount: number;
    type: TransactionType;
    reference: string;
    paymentMethod?: string;
    status?: TransactionStatus;
    purpose: string;
    metadata?: any;
    queryRunner?: QueryRunner;
  }): Promise<Transaction> {
    const manager = queryRunner?.manager || AppDataSource.manager;
    const transactionRepo = manager.getRepository(Transaction);

    const transaction = transactionRepo.create({
      entityId,
      entityType,
      orderId,
      amount,
      type,
      reference,
      paymentMethod,
      status,
      purpose,
      metadata
    });

    return await transactionRepo.save(transaction);
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(
    reference: string,
    status: TransactionStatus,
    metadata?: any
  ): Promise<Transaction | null> {
    const transactionRepo = AppDataSource.getRepository(Transaction);
    
    const transaction = await transactionRepo.findOne({ where: { reference } });
    
    if (!transaction) {
      return null;
    }

    transaction.status = status;
    if (metadata) {
      transaction.metadata = { ...transaction.metadata, ...metadata };
    }
    
    if (status === 'completed') {
      transaction.completedAt = new Date();
    }

    return await transactionRepo.save(transaction);
  }

  /**
   * Get transactions for an entity
   */
  static async getEntityTransactions(
    entityId: string,
    entityType: 'customer' | 'vendor' | 'rider',
    page: number = 1,
    limit: number = 20
  ) {
    const transactionRepo = AppDataSource.getRepository(Transaction);

    const [transactions, total] = await transactionRepo.findAndCount({
      where: { entityId, entityType },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get transaction by reference
   */
  static async getTransactionByReference(reference: string): Promise<Transaction | null> {
    const transactionRepo = AppDataSource.getRepository(Transaction);
    return await transactionRepo.findOne({ where: { reference } });
  }
}
