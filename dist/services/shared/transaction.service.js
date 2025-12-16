"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const Transaction_1 = require("../../entities/Transaction");
const Customer_1 = require("../../entities/Customer");
const Vendor_1 = require("../../entities/Vendor");
const Rider_1 = require("../../entities/Rider");
const data_source_1 = require("../../config/data-source");
class TransactionService {
    static async createTransaction(params) {
        const manager = params.queryRunner?.manager || data_source_1.AppDataSource.manager;
        const transactionData = {
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
        switch (params.entityType) {
            case "customer":
                const customer = await manager.getRepository(Customer_1.Customer).findOne({
                    where: { id: params.entityId },
                });
                if (customer)
                    transactionData.customer = customer;
                break;
            case "vendor":
                const vendor = await manager.getRepository(Vendor_1.Vendor).findOne({
                    where: { id: params.entityId },
                });
                if (vendor)
                    transactionData.vendor = vendor;
                break;
            case "rider":
                const rider = await manager.getRepository(Rider_1.Rider).findOne({
                    where: { id: params.entityId },
                });
                if (rider)
                    transactionData.rider = rider;
                break;
        }
        const transaction = manager
            .getRepository(Transaction_1.Transaction)
            .create(transactionData);
        return await manager.getRepository(Transaction_1.Transaction).save(transaction);
    }
    static async updateTransactionStatus(reference, updates, queryRunner) {
        const manager = queryRunner?.manager || data_source_1.AppDataSource.manager;
        const transaction = await manager.getRepository(Transaction_1.Transaction).findOne({
            where: { reference },
        });
        if (!transaction) {
            throw new Error(`Transaction not found: ${reference}`);
        }
        Object.assign(transaction, updates);
        if (updates.status === "completed" && !transaction.completedAt) {
            transaction.completedAt = new Date();
        }
        return await manager.getRepository(Transaction_1.Transaction).save(transaction);
    }
    static async getTransactionByReference(reference) {
        return await data_source_1.AppDataSource.manager
            .getRepository(Transaction_1.Transaction)
            .findOne({ where: { reference } });
    }
    static async getEntityTransactions(params) {
        const { entityId, entityType, transactionType, status, startDate, endDate, page = 1, limit = 20, } = params;
        const skip = (page - 1) * limit;
        const queryBuilder = data_source_1.AppDataSource.manager
            .getRepository(Transaction_1.Transaction)
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
exports.TransactionService = TransactionService;
//# sourceMappingURL=transaction.service.js.map