import { Response } from 'express';
import { validationResult } from 'express-validator';
import cartService from '../../services/customer/cartService';
import { successResponse, errorResponse, validationErrorResponse } from '../../utils/response';
import { AuthRequest } from '../../types';

export class CartController {
  async getCart(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const cart = await cartService.getCart(req.user!.id);
      return successResponse(res, cart);
    } catch (error) {
      console.error('Get cart error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async addToCart(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const cartItem = await cartService.addToCart(req.user!.id, req.body);
      return successResponse(res, cartItem, 'Item added to cart', 201);
    } catch (error) {
      console.error('Add to cart error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async updateCartItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const { quantity } = req.body;
      const cartItem = await cartService.updateCartItem(req.user!.id, req.params.id, quantity);
      return successResponse(res, cartItem, 'Cart updated');
    } catch (error) {
      console.error('Update cart error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async removeFromCart(req: AuthRequest, res: Response): Promise<Response> {
    try {
      await cartService.removeFromCart(req.user!.id, req.params.id);
      return successResponse(res, null, 'Item removed from cart');
    } catch (error) {
      console.error('Remove from cart error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async clearCart(req: AuthRequest, res: Response): Promise<Response> {
    try {
      await cartService.clearCart(req.user!.id);
      return successResponse(res, null, 'Cart cleared');
    } catch (error) {
      console.error('Clear cart error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }
}

export default new CartController();
