"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderManagementService = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../../config/data-source");
const Order_1 = require("../../entities/Order");
const Transaction_1 = require("../../entities/Transaction");
const orderRepo = data_source_1.AppDataSource.getRepository(Order_1.Order);
const transactionRepo = data_source_1.AppDataSource.getRepository(Transaction_1.Transaction);
exports.orderManagementService = {
    async getAllOrders(query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = query.status;
        const customerId = query.customerId;
        const vendorId = query.vendorId;
        const riderId = query.riderId;
        if (vendorId) {
            let subqueryBuilder = orderRepo.createQueryBuilder('order')
                .select('DISTINCT order.id')
                .innerJoin('order.orderItems', 'orderItems')
                .where('orderItems.vendorId = :vendorId', { vendorId });
            if (status) {
                subqueryBuilder.andWhere('order.orderStatus = :status', { status });
            }
            if (customerId) {
                subqueryBuilder.andWhere('order.customerId = :customerId', { customerId });
            }
            if (riderId) {
                subqueryBuilder.andWhere('order.riderId = :riderId', { riderId });
            }
            subqueryBuilder.addSelect('order.createdAt');
            const countQuery = subqueryBuilder.clone();
            const total = await countQuery.getCount();
            const orderIds = await subqueryBuilder
                .orderBy('order.createdAt', 'DESC')
                .skip(skip)
                .take(limit)
                .getRawMany();
            const ids = orderIds.map(row => row.order_id);
            const orders = ids.length > 0
                ? await orderRepo.find({
                    where: { id: (0, typeorm_1.In)(ids) },
                    relations: ['customer', 'rider', 'orderItems', 'orderItems.vendor'],
                    order: { createdAt: 'DESC' }
                })
                : [];
            return { orders, total, page, limit };
        }
        let queryBuilder = orderRepo.createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.rider', 'rider')
            .leftJoinAndSelect('order.orderItems', 'orderItems')
            .leftJoinAndSelect('orderItems.vendor', 'vendor')
            .orderBy('order.createdAt', 'DESC');
        if (status) {
            queryBuilder.where('order.orderStatus = :status', { status });
        }
        if (customerId) {
            queryBuilder.andWhere('order.customerId = :customerId', { customerId });
        }
        if (riderId) {
            queryBuilder.andWhere('order.riderId = :riderId', { riderId });
        }
        const total = await queryBuilder.clone().getCount();
        const orders = await queryBuilder
            .skip(skip)
            .take(limit)
            .getMany();
        return { orders, total, page, limit };
    },
    async getOrderById(id) {
        const order = await orderRepo.findOne({
            where: { id },
            relations: ['customer', 'rider', 'orderItems', 'orderItems.vendor']
        });
        if (!order) {
            throw new Error('Order not found');
        }
        return order;
    },
    async getOrderStats() {
        const totalOrders = await orderRepo.count();
        const pendingOrders = await orderRepo.count({ where: { orderStatus: 'pending' } });
        const processingOrders = await orderRepo.count({ where: { orderStatus: 'processing' } });
        const deliveredOrders = await orderRepo.count({ where: { orderStatus: 'delivered' } });
        const cancelledOrders = await orderRepo.count({ where: { orderStatus: 'cancelled' } });
        const totalRevenueResult = await orderRepo
            .createQueryBuilder('order')
            .select('SUM(order.finalAmount)', 'total')
            .where('order.paymentStatus = :status', { status: 'paid' })
            .getRawOne();
        const totalRevenue = parseFloat(totalRevenueResult?.total || '0');
        return {
            totalOrders,
            pendingOrders,
            processingOrders,
            deliveredOrders,
            cancelledOrders,
            totalRevenue
        };
    },
    async getAllTransactions(query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;
        const skip = (page - 1) * limit;
        const type = query.type;
        const status = query.status;
        const userId = query.userId;
        const userType = query.userType;
        const queryBuilder = transactionRepo.createQueryBuilder('transaction')
            .skip(skip)
            .take(limit)
            .orderBy('transaction.createdAt', 'DESC');
        if (type) {
            queryBuilder.where('transaction.type = :type', { type });
        }
        if (status) {
            queryBuilder.andWhere('transaction.status = :status', { status });
        }
        if (userId && userType) {
            if (userType === 'customer') {
                queryBuilder.andWhere('transaction.customerId = :userId', { userId });
            }
            else if (userType === 'vendor') {
                queryBuilder.andWhere('transaction.vendorId = :userId', { userId });
            }
            else if (userType === 'rider') {
                queryBuilder.andWhere('transaction.riderId = :userId', { userId });
            }
        }
        const [transactions, total] = await queryBuilder.getManyAndCount();
        return { transactions, total, page, limit };
    },
    async getTransactionById(id) {
        const transaction = await transactionRepo.findOne({
            where: { id },
            relations: ['customer', 'vendor', 'rider', 'order']
        });
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        return transaction;
    },
    async getTransactionStats() {
        const totalTransactions = await transactionRepo.count();
        const successfulTransactions = await transactionRepo.count({ where: { status: 'completed' } });
        const pendingTransactions = await transactionRepo.count({ where: { status: 'pending' } });
        const failedTransactions = await transactionRepo.count({ where: { status: 'failed' } });
        const totalVolumeResult = await transactionRepo
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .where('transaction.status = :status', { status: 'completed' })
            .getRawOne();
        const totalVolume = parseFloat(totalVolumeResult?.total || '0');
        return {
            totalTransactions,
            successfulTransactions,
            pendingTransactions,
            failedTransactions,
            totalVolume
        };
    }
};
//# sourceMappingURL=orderManagementService.js.map