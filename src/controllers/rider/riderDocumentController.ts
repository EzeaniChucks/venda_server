import { Response } from 'express';
import { validationResult } from 'express-validator';
import riderDocumentService from '../../services/rider/riderDocument.service';
import { successResponse, errorResponse, validationErrorResponse } from '../../utils/response';
import { AuthRequest } from '../../types';

export class RiderDocumentController {
  /**
   * Submit or resubmit verification documents
   * POST /api/rider/documents/submit
   */
  async submitDocuments(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const riderId = req.user!.id;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { 
        driversLicenseNumber,
        driversLicenseExpiry,
        vehicleType,
        vehicleRegistration,
        nationalIdNumber
      } = req.body;

      // Validate required files
      if (!files?.driversLicense?.[0]) {
        return errorResponse(res, "Driver's license image is required", 400);
      }
      if (!files?.vehiclePhoto?.[0]) {
        return errorResponse(res, 'Vehicle photo is required', 400);
      }
      if (!files?.nationalId?.[0]) {
        return errorResponse(res, 'National ID image is required', 400);
      }

      // Validate required fields
      if (!driversLicenseNumber || !driversLicenseExpiry) {
        return errorResponse(res, "Driver's license number and expiry date are required", 400);
      }
      if (!vehicleType || !vehicleRegistration) {
        return errorResponse(res, 'Vehicle type and registration are required', 400);
      }
      if (!nationalIdNumber) {
        return errorResponse(res, 'National ID number is required', 400);
      }

      const result = await riderDocumentService.submitDocuments({
        riderId,
        driversLicense: {
          file: files.driversLicense[0].buffer,
          number: driversLicenseNumber,
          expiryDate: driversLicenseExpiry
        },
        vehicle: {
          type: vehicleType,
          registration: vehicleRegistration,
          photo: files.vehiclePhoto[0].buffer
        },
        nationalId: {
          file: files.nationalId[0].buffer,
          number: nationalIdNumber
        }
      });

      return successResponse(
        res, 
        result, 
        'Documents submitted successfully. Your submission is under review.',
        201
      );
    } catch (error) {
      console.error('Submit documents error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  /**
   * Get document submission status
   * GET /api/rider/documents/status
   */
  async getDocumentStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const riderId = req.user!.id;
      const documents = await riderDocumentService.getRiderDocuments(riderId);

      if (!documents) {
        return successResponse(res, { 
          status: 'not_submitted',
          message: 'No documents submitted yet' 
        });
      }

      // Return documents without exposing Cloudinary IDs
      const response = {
        status: documents.status,
        submittedAt: documents.submittedAt,
        reviewedAt: documents.reviewedAt,
        adminNotes: documents.adminNotes,
        submissionCount: documents.submissionCount,
        driversLicense: documents.driversLicenseUrl ? {
          url: documents.driversLicenseUrl,
          number: documents.driversLicenseNumber,
          expiry: documents.driversLicenseExpiry
        } : null,
        vehicle: documents.vehiclePhotoUrl ? {
          type: documents.vehicleType,
          registration: documents.vehicleRegistration,
          photoUrl: documents.vehiclePhotoUrl
        } : null,
        nationalId: documents.nationalIdUrl ? {
          url: documents.nationalIdUrl,
          number: documents.nationalIdNumber
        } : null
      };

      return successResponse(res, response);
    } catch (error) {
      console.error('Get document status error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }

  /**
   * Get rider's own documents (full details)
   * GET /api/rider/documents
   */
  async getDocuments(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const riderId = req.user!.id;
      const documents = await riderDocumentService.getRiderDocuments(riderId);

      if (!documents) {
        return successResponse(res, null, 'No documents found');
      }

      return successResponse(res, documents);
    } catch (error) {
      console.error('Get documents error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }
}

export default new RiderDocumentController();
