import { Response } from 'express';
import { validationResult } from 'express-validator';
import riderDocumentService from '../../services/rider/riderDocument.service';
import { successResponse, errorResponse, validationErrorResponse } from '../../utils/response';
import { AuthRequest } from '../../types';

export class AdminDocumentController {
  /**
   * Get all pending document submissions
   * GET /api/admin/documents/pending
   */
  async getPendingDocuments(req: AuthRequest, res: Response): Promise<Response> {
    try {
      // Defensive: Verify admin role
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await riderDocumentService.getPendingDocuments({ page, limit });

      return successResponse(res, {
        documents: result.documents,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      console.error('Get pending documents error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }

  /**
   * Get all document submissions (with filters)
   * GET /api/admin/documents
   */
  async getAllDocuments(req: AuthRequest, res: Response): Promise<Response> {
    try {
      // Defensive: Verify admin role
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

      const result = await riderDocumentService.getAllDocuments({ status, page, limit });

      return successResponse(res, {
        documents: result.documents,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      console.error('Get all documents error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }

  /**
   * Get specific rider's documents
   * GET /api/admin/documents/:riderId
   */
  async getRiderDocuments(req: AuthRequest, res: Response): Promise<Response> {
    try {
      // Defensive: Verify admin role
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const { riderId } = req.params;

      const documents = await riderDocumentService.getDocumentByRiderId(riderId);

      if (!documents) {
        return errorResponse(res, 'No documents found for this rider', 404);
      }

      return successResponse(res, documents);
    } catch (error) {
      console.error('Get rider documents error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }

  /**
   * Review rider documents (approve, reject, or request changes)
   * PUT /api/admin/documents/:riderId/review
   */
  async reviewDocuments(req: AuthRequest, res: Response): Promise<Response> {
    try {
      // Defensive: Verify admin role (CRITICAL for security)
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const { riderId } = req.params;
      const { status, adminNotes } = req.body;
      const reviewedBy = req.user!.id;

      if (!['approved', 'rejected', 'changes_requested'].includes(status)) {
        return errorResponse(res, 'Invalid status. Must be: approved, rejected, or changes_requested', 400);
      }

      const result = await riderDocumentService.reviewDocuments(riderId, {
        status,
        adminNotes,
        reviewedBy
      });

      let message = '';
      switch (status) {
        case 'approved':
          message = 'Documents approved successfully. Rider has been notified and can now start accepting deliveries.';
          break;
        case 'rejected':
          message = 'Documents rejected. Rider has been notified.';
          break;
        case 'changes_requested':
          message = 'Changes requested. Rider has been notified to resubmit documents.';
          break;
      }

      return successResponse(res, result, message);
    } catch (error) {
      console.error('Review documents error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  /**
   * Get document statistics
   * GET /api/admin/documents/stats
   */
  async getDocumentStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      // Defensive: Verify admin role
      if (!req.user || req.user.role !== 'admin') {
        return errorResponse(res, 'Unauthorized: Admin access required', 403);
      }

      const [pending, approved, rejected, changesRequested] = await Promise.all([
        riderDocumentService.getPendingDocuments({ page: 1, limit: 1 }),
        riderDocumentService.getAllDocuments({ status: 'approved', page: 1, limit: 1 }),
        riderDocumentService.getAllDocuments({ status: 'rejected', page: 1, limit: 1 }),
        riderDocumentService.getAllDocuments({ status: 'changes_requested', page: 1, limit: 1 })
      ]);

      return successResponse(res, {
        pending: pending.total,
        approved: approved.total,
        rejected: rejected.total,
        changesRequested: changesRequested.total,
        total: pending.total + approved.total + rejected.total + changesRequested.total
      });
    } catch (error) {
      console.error('Get document stats error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }
}

export default new AdminDocumentController();
