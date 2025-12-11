import { Response } from 'express';
import { AuthRequest } from '../../types';
import { categoryService } from '../../services/admin/categoryService';
import { successResponse, errorResponse } from '../../utils/response';

export const categoryController = {
  async createCategory(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const category = await categoryService.createCategory(req.body);
      return successResponse(res, category, 'Category created successfully', 201);
    } catch (error) {
      console.error('Create category error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  },

  async getAllCategories(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await categoryService.getAllCategories(req.query);
      return successResponse(res, {
        categories: result.categories,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      console.error('Get categories error:', error);
      return errorResponse(res, (error as Error).message);
    }
  },

  async getCategoryById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      return successResponse(res, category);
    } catch (error) {
      console.error('Get category error:', error);
      return errorResponse(res, (error as Error).message, 404);
    }
  },

  async updateCategory(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const category = await categoryService.updateCategory(req.params.id, req.body);
      return successResponse(res, category, 'Category updated successfully');
    } catch (error) {
      console.error('Update category error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  },

  async deleteCategory(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const result = await categoryService.deleteCategory(req.params.id);
      return successResponse(res, result, result.message);
    } catch (error) {
      console.error('Delete category error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }
};
