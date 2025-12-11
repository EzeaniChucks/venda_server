import { Response } from 'express';
import { validationResult } from 'express-validator';
import orderService from '../../services/customer/orderService';
import { successResponse, errorResponse, validationErrorResponse } from '../../utils/response';
import { AuthRequest } from '../../types';

export class OrderController {
  async createOrder(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const order = await orderService.createOrder(req.user!.id, req.body);
      return successResponse(res, order, 'Order created successfully', 201);
    } catch (error) {
      console.error('Create order error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async getUserOrders(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const orders = await orderService.getUserOrders(req.user!.id, req.query);
      return successResponse(res, orders);
    } catch (error) {
      console.error('Get orders error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async getOrderById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user!.id);
      return successResponse(res, order);
    } catch (error) {
      console.error('Get order error:', error);
      return errorResponse(res, (error as Error).message, 404);
    }
  }

  async cancelOrder(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { reason } = req.body;
      const order = await orderService.cancelOrder(req.params.id, req.user!.id, reason);
      return successResponse(res, order, 'Order cancelled successfully');
    } catch (error) {
      console.error('Cancel order error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }
}

export default new OrderController();
