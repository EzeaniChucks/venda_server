import { Response } from 'express';
import wishlistService from '../../services/customer/wishlistService';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthRequest } from '../../types';

export class WishlistController {
  async getWishlist(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const wishlist = await wishlistService.getWishlist(req.user!.id);
      return successResponse(res, wishlist);
    } catch (error) {
      console.error('Get wishlist error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async addToWishlist(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { product_id } = req.body;
      const item = await wishlistService.addToWishlist(req.user!.id, product_id);
      return successResponse(res, item, 'Added to wishlist', 201);
    } catch (error) {
      console.error('Add to wishlist error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async removeFromWishlist(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await wishlistService.removeFromWishlist(req.user!.id, req.params.id);
      return successResponse(res, result, 'Removed from wishlist');
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async checkWishlist(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await wishlistService.isInWishlist(req.user!.id, req.params.productId);
      return successResponse(res, result);
    } catch (error) {
      console.error('Check wishlist error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }
}

export default new WishlistController();
