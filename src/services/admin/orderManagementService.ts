import { In } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { Order, OrderStatus } from '../../entities/Order';
import { Transaction, TransactionType, TransactionStatus } from '../../entities/Transaction';

const orderRepo = AppDataSource.getRepository(Order);
const transactionRepo = AppDataSource.getRepository(Transaction);

export const orderManagementService = {
  async getAllOrders(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = query.status as OrderStatus;
    const customerId = query.customerId as string;
    const vendorId = query.vendorId as string;
    const riderId = query.riderId as string;

    // When filtering by vendor, use a subquery to get unique order IDs first
    if (vendorId) {
      // Build subquery to get distinct order IDs matching vendor filter
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

      // Include createdAt in select for ordering (Postgres DISTINCT requirement)
      subqueryBuilder.addSelect('order.createdAt');

      // Clone subquery for count to avoid state changes
      const countQuery = subqueryBuilder.clone();
      const total = await countQuery.getCount();

      // Get paginated order IDs with proper ordering
      const orderIds = await subqueryBuilder
        .orderBy('order.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getRawMany();

      const ids = orderIds.map(row => row.order_id);

      // Fetch full order data with relations, maintaining sort order
      const orders = ids.length > 0 
        ? await orderRepo.find({
            where: { id: In(ids) },
            relations: ['customer', 'rider', 'orderItems', 'orderItems.vendor'],
            order: { createdAt: 'DESC' }
          })
        : [];

      return { orders, total, page, limit };
    }

    // Standard query without vendor filter (no duplicates possible)
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

    // Clone for count to avoid state changes
    const total = await queryBuilder.clone().getCount();

    // Apply pagination
    const orders = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    return { orders, total, page, limit };
  },

  async getOrderById(id: string) {
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

  async getAllTransactions(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = query.type as TransactionType;
    const status = query.status as TransactionStatus;
    const userId = query.userId as string;
    const userType = query.userType as 'customer' | 'vendor' | 'rider';

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
      } else if (userType === 'vendor') {
        queryBuilder.andWhere('transaction.vendorId = :userId', { userId });
      } else if (userType === 'rider') {
        queryBuilder.andWhere('transaction.riderId = :userId', { userId });
      }
    }

    const [transactions, total] = await queryBuilder.getManyAndCount();

    return { transactions, total, page, limit };
  },

  async getTransactionById(id: string) {
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
