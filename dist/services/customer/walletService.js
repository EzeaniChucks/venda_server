"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const data_source_1 = require("../../config/data-source");
const Customer_1 = require("../../entities/Customer");
const WalletTransaction_1 = require("../../entities/WalletTransaction");
class WalletService {
    constructor() {
        this.customerRepository = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
        this.transactionRepository = data_source_1.AppDataSource.getRepository(WalletTransaction_1.WalletTransaction);
    }
    async getWallet(customerId) {
        const customer = await this.customerRepository.findOne({
            where: { id: customerId }
        });
        if (!customer) {
            throw new Error('Customer not found');
        }
        if (!customer.wallet) {
            customer.wallet = { balance: 0, pendingBalance: 0 };
            await this.customerRepository.save(customer);
        }
        return {
            balance: customer.wallet.balance || 0,
            pendingBalance: customer.wallet.pendingBalance || 0,
        };
    }
    async getTransactions(customerId, filters = {}) {
        const { page = 1, limit = 20, type } = filters;
        const queryBuilder = this.transactionRepository
            .createQueryBuilder('transaction')
            .where('transaction.customerId = :customerId', { customerId });
        if (type) {
            queryBuilder.andWhere('transaction.transactionType = :type', { type });
        }
        const transactions = await queryBuilder
            .orderBy('transaction.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return transactions;
    }
    async fundWallet(customerId, amount, metadata = {}) {
        if (amount <= 0) {
            throw new Error('Amount must be greater than zero');
        }
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const customer = await manager.findOne(Customer_1.Customer, { where: { id: customerId } });
            if (!customer) {
                throw new Error('Customer not found');
            }
            const balanceBefore = customer.wallet?.balance || 0;
            const balanceAfter = balanceBefore + amount;
            const reference = 'DEP' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
            const transaction = manager.create(WalletTransaction_1.WalletTransaction, {
                customerId,
                transactionType: 'deposit',
                amount,
                balanceBefore,
                balanceAfter,
                reference,
                description: `Wallet funding - ${metadata.method || 'Bank Transfer'}`,
                status: 'completed',
                metadata
            });
            await manager.save(transaction);
            customer.wallet = {
                balance: balanceAfter,
                pendingBalance: customer.wallet?.pendingBalance || 0,
            };
            await manager.save(customer);
            return transaction;
        });
    }
    async withdraw(customerId, amount, metadata = {}) {
        if (amount <= 0) {
            throw new Error('Amount must be greater than zero');
        }
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const customer = await manager.findOne(Customer_1.Customer, { where: { id: customerId } });
            if (!customer) {
                throw new Error('Customer not found');
            }
            const balanceBefore = customer.wallet?.balance || 0;
            if (balanceBefore < amount) {
                throw new Error('Insufficient balance');
            }
            const balanceAfter = balanceBefore - amount;
            const reference = 'WDR' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
            const transaction = manager.create(WalletTransaction_1.WalletTransaction, {
                customerId,
                transactionType: 'withdrawal',
                amount,
                balanceBefore,
                balanceAfter,
                reference,
                description: `Withdrawal to ${metadata.recipient || 'bank account'}`,
                status: 'completed',
                metadata
            });
            await manager.save(transaction);
            customer.wallet = {
                balance: balanceAfter,
                pendingBalance: customer.wallet?.pendingBalance || 0,
            };
            await manager.save(customer);
            return transaction;
        });
    }
    async payWithWallet(customerId, amount, orderId) {
        if (amount <= 0) {
            throw new Error('Amount must be greater than zero');
        }
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const customer = await manager.findOne(Customer_1.Customer, { where: { id: customerId } });
            if (!customer) {
                throw new Error('Customer not found');
            }
            const balanceBefore = customer.wallet?.balance || 0;
            if (balanceBefore < amount) {
                throw new Error('Insufficient wallet balance');
            }
            const balanceAfter = balanceBefore - amount;
            const reference = 'PAY' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
            const transaction = manager.create(WalletTransaction_1.WalletTransaction, {
                customerId,
                transactionType: 'payment',
                amount,
                balanceBefore,
                balanceAfter,
                reference,
                description: 'Payment for order',
                status: 'completed',
                metadata: { order_id: orderId }
            });
            await manager.save(transaction);
            customer.wallet = {
                balance: balanceAfter,
                pendingBalance: customer.wallet?.pendingBalance || 0,
            };
            await manager.save(customer);
            return transaction;
        });
    }
}
exports.WalletService = WalletService;
exports.default = new WalletService();
//# sourceMappingURL=walletService.js.map