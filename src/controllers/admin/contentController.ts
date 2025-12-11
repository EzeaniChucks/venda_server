import { Response } from 'express';
import { AuthRequest } from '../../types';
import { contentService } from '../../services/admin/contentService';
import { successResponse, errorResponse } from '../../utils/response';

export const contentController = {
  async createNews(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const news = await contentService.createNews(req.body);
      return successResponse(res, news, 'News article created successfully', 201);
    } catch (error) {
      console.error('Create news error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  },

  async getAllNews(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await contentService.getAllNews(req.query);
      return successResponse(res, {
        news: result.news,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      console.error('Get news error:', error);
      return errorResponse(res, (error as Error).message);
    }
  },

  async getNewsById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const news = await contentService.getNewsById(req.params.id);
      return successResponse(res, news);
    } catch (error) {
      console.error('Get news error:', error);
      return errorResponse(res, (error as Error).message, 404);
    }
  },

  async updateNews(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const news = await contentService.updateNews(req.params.id, req.body);
      return successResponse(res, news, 'News article updated successfully');
    } catch (error) {
      console.error('Update news error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  },

  async deleteNews(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const result = await contentService.deleteNews(req.params.id);
      return successResponse(res, result, result.message);
    } catch (error) {
      console.error('Delete news error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  },

  async createModel(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const model = await contentService.createModel(req.body);
      return successResponse(res, model, 'Model created successfully', 201);
    } catch (error) {
      console.error('Create model error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  },

  async getAllModels(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await contentService.getAllModels(req.query);
      return successResponse(res, {
        models: result.models,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      console.error('Get models error:', error);
      return errorResponse(res, (error as Error).message);
    }
  },

  async getModelById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const model = await contentService.getModelById(req.params.id);
      return successResponse(res, model);
    } catch (error) {
      console.error('Get model error:', error);
      return errorResponse(res, (error as Error).message, 404);
    }
  },

  async updateModel(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const model = await contentService.updateModel(req.params.id, req.body);
      return successResponse(res, model, 'Model updated successfully');
    } catch (error) {
      console.error('Update model error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  },

  async deleteModel(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const result = await contentService.deleteModel(req.params.id);
      return successResponse(res, result, result.message);
    } catch (error) {
      console.error('Delete model error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }
};
