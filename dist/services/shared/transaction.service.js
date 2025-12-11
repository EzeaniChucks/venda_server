"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const data_source_1 = require("../../config/data-source");
const Transaction_1 = require("../../entities/Transaction");
class TransactionService {
    static async createTransaction({ entityId, entityType, orderId, amount, type, reference, paymentMethod, status = 'pending', purpose, metadata, queryRunner }) {
        const manager = queryRunner?.manager || data_source_1.AppDataSource.manager;
        const transactionRepo = manager.getRepository(Transaction_1.Transaction);
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
    static async updateTransactionStatus(reference, status, metadata) {
        const transactionRepo = data_source_1.AppDataSource.getRepository(Transaction_1.Transaction);
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
    static async getEntityTransactions(entityId, entityType, page = 1, limit = 20) {
        const transactionRepo = data_source_1.AppDataSource.getRepository(Transaction_1.Transaction);
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
    static async getTransactionByReference(reference) {
        const transactionRepo = data_source_1.AppDataSource.getRepository(Transaction_1.Transaction);
        return await transactionRepo.findOne({ where: { reference } });
    }
}
exports.TransactionService = TransactionService;
//# sourceMappingURL=transaction.service.js.map