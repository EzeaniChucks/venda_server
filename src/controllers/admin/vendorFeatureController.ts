import { Response } from 'express';
import { AuthRequest } from '../../types';
import { vendorFeatureService } from '../../services/admin/vendorFeatureService';
import { successResponse, errorResponse } from '../../utils/response';

export const vendorFeatureController = {
  async createVendorOfTheMonth(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const vendorOfMonth = await vendorFeatureService.createVendorOfTheMonth(req.body);
      return successResponse(res, vendorOfMonth, 'Vendor of the Month created successfully', 201);
    } catch (error) {
      console.error('Create Vendor of the Month error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  },

  async getAllVendorsOfMonth(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await vendorFeatureService.getAllVendorsOfMonth(req.query);
      return successResponse(res, {
        vendors: result.vendors,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      console.error('Get Vendors of the Month error:', error);
      return errorResponse(res, (error as Error).message);
    }
  },

  async getVendorOfTheMonthById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const vendorOfMonth = await vendorFeatureService.getVendorOfMonthById(req.params.id);
      return successResponse(res, vendorOfMonth);
    } catch (error) {
      console.error('Get Vendor of the Month error:', error);
      return errorResponse(res, (error as Error).message, 404);
    }
  },

  async updateVendorOfTheMonth(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const vendorOfMonth = await vendorFeatureService.updateVendorOfMonth(req.params.id, req.body);
      return successResponse(res, vendorOfMonth, 'Vendor of the Month updated successfully');
    } catch (error) {
      console.error('Update Vendor of the Month error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  },

  async deleteVendorOfTheMonth(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const result = await vendorFeatureService.deleteVendorOfMonth(req.params.id);
      return successResponse(res, result, result.message);
    } catch (error) {
      console.error('Delete Vendor of the Month error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  },

  async createCollaboration(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const collaboration = await vendorFeatureService.createCollaboration(req.body);
      return successResponse(res, collaboration, 'Collaboration created successfully', 201);
    } catch (error) {
      console.error('Create collaboration error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  },

  async getAllCollaborations(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await vendorFeatureService.getAllCollaborations(req.query);
      return successResponse(res, {
        collaborations: result.collaborations,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      console.error('Get collaborations error:', error);
      return errorResponse(res, (error as Error).message);
    }
  },

  async getCollaborationById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const collaboration = await vendorFeatureService.getCollaborationById(req.params.id);
      return successResponse(res, collaboration);
    } catch (error) {
      console.error('Get collaboration error:', error);
      return errorResponse(res, (error as Error).message, 404);
    }
  },

  async updateCollaboration(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const collaboration = await vendorFeatureService.updateCollaboration(req.params.id, req.body);
      return successResponse(res, collaboration, 'Collaboration updated successfully');
    } catch (error) {
      console.error('Update collaboration error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  },

  async deleteCollaboration(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const result = await vendorFeatureService.deleteCollaboration(req.params.id);
      return successResponse(res, result, result.message);
    } catch (error) {
      console.error('Delete collaboration error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  },

  async createInfluencerPick(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const influencerPick = await vendorFeatureService.createInfluencerPick(req.body);
      return successResponse(res, influencerPick, 'Influencer pick created successfully', 201);
    } catch (error) {
      console.error('Create influencer pick error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  },

  async getAllInfluencerPicks(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await vendorFeatureService.getAllInfluencerPicks(req.query);
      return successResponse(res, {
        picks: result.picks,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      console.error('Get influencer picks error:', error);
      return errorResponse(res, (error as Error).message);
    }
  },

  async getInfluencerPickById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const influencerPick = await vendorFeatureService.getInfluencerPickById(req.params.id);
      return successResponse(res, influencerPick);
    } catch (error) {
      console.error('Get influencer pick error:', error);
      return errorResponse(res, (error as Error).message, 404);
    }
  },

  async updateInfluencerPick(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const influencerPick = await vendorFeatureService.updateInfluencerPick(req.params.id, req.body);
      return successResponse(res, influencerPick, 'Influencer pick updated successfully');
    } catch (error) {
      console.error('Update influencer pick error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  },

  async deleteInfluencerPick(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const result = await vendorFeatureService.deleteInfluencerPick(req.params.id);
      return successResponse(res, result, result.message);
    } catch (error) {
      console.error('Delete influencer pick error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }
};
