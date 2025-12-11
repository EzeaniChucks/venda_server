import { Response } from 'express';
import { AuthRequest } from '../../types';
import { orderManagementService } from '../../services/admin/orderManagementService';
import { successResponse, errorResponse } from '../../utils/response';

export const orderManagementController = {
  async getAllOrders(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const result = await orderManagementService.getAllOrders(req.query);
      return successResponse(res, {
        orders: result.orders,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      return errorResponse(res, (error as Error).message);
    }
  },

  async getOrderById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const order = await orderManagementService.getOrderById(req.params.id);
      return successResponse(res, order);
    } catch (error) {
      console.error('Get order error:', error);
      return errorResponse(res, (error as Error).message, 404);
    }
  },

  async getOrderStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const stats = await orderManagementService.getOrderStats();
      return successResponse(res, stats);
    } catch (error) {
      console.error('Get order stats error:', error);
      return errorResponse(res, (error as Error).message);
    }
  },

  async getAllTransactions(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const result = await orderManagementService.getAllTransactions(req.query);
      return successResponse(res, {
        transactions: result.transactions,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      console.error('Get all transactions error:', error);
      return errorResponse(res, (error as Error).message);
    }
  },

  async getTransactionById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const transaction = await orderManagementService.getTransactionById(req.params.id);
      return successResponse(res, transaction);
    } catch (error) {
      console.error('Get transaction error:', error);
      return errorResponse(res, (error as Error).message, 404);
    }
  },

  async getTransactionStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const stats = await orderManagementService.getTransactionStats();
      return successResponse(res, stats);
    } catch (error) {
      console.error('Get transaction stats error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }
};
