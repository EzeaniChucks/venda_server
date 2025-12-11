import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { AppDataSource } from '../config/data-source';
import { Rider } from '../entities';
import { errorResponse } from '../utils/response';

/**
 * Middleware to ensure rider has approved document verification
 * before accessing delivery-related endpoints
 */
export const requireVerifiedDocuments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    if (!req.user || req.user.role !== 'rider') {
      return errorResponse(res, 'Unauthorized: Rider access required', 403);
    }

    const riderRepository = AppDataSource.getRepository(Rider);
    const rider = await riderRepository.findOne({
      where: { id: req.user.id }
    });

    if (!rider) {
      return errorResponse(res, 'Rider not found', 404);
    }

    // Check document verification status
    if (rider.documentVerificationStatus !== 'approved') {
      let message = '';
      
      switch (rider.documentVerificationStatus) {
        case 'not_submitted':
          message = 'Please submit your verification documents before accessing deliveries. Visit /api/rider/documents/submit';
          break;
        case 'pending':
          message = 'Your verification documents are under review. Please wait for admin approval.';
          break;
        case 'rejected':
          message = 'Your verification documents were rejected. Please contact support or resubmit corrected documents.';
          break;
        case 'changes_requested':
          message = 'Changes were requested on your verification documents. Please resubmit with the requested changes.';
          break;
        default:
          message = 'Document verification required to access deliveries.';
      }

      return errorResponse(res, message, 403);
    }

    // Rider is verified, proceed
    next();
  } catch (error) {
    console.error('Rider verification check error:', error);
    return errorResponse(res, 'Error checking verification status', 500);
  }
};
