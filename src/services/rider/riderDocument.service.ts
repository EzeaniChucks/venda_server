import { AppDataSource } from '../../config/data-source';
import { RiderDocument, Rider, Admin } from '../../entities';
import { DocumentUploadService } from '../shared/documentUpload.service';
import { NotificationService } from '../shared/notification.service';
import { SMSService } from '../shared/sms.service';
import { EmailService } from '../shared/email.service';

export interface DocumentSubmission {
  riderId: string;
  driversLicense?: {
    file: Buffer | string;
    number: string;
    expiryDate: string;
  };
  vehicle?: {
    type: string;
    registration: string;
    photo: Buffer | string;
  };
  nationalId?: {
    file: Buffer | string;
    number: string;
  };
}

export interface DocumentReview {
  status: 'approved' | 'rejected' | 'changes_requested';
  adminNotes?: string;
  reviewedBy: string;
}

export class RiderDocumentService {
  private riderDocumentRepository = AppDataSource.getRepository(RiderDocument);
  private riderRepository = AppDataSource.getRepository(Rider);
  private adminRepository = AppDataSource.getRepository(Admin);

  /**
   * Submit or resubmit rider documents
   */
  async submitDocuments(data: DocumentSubmission): Promise<RiderDocument> {
    return await AppDataSource.transaction(async (manager) => {
      const riderDocRepo = manager.getRepository(RiderDocument);
      const riderRepo = manager.getRepository(Rider);

      // Check if rider exists
      const rider = await riderRepo.findOne({ where: { id: data.riderId } });
      if (!rider) {
        throw new Error('Rider not found');
      }

      // Find existing document record or create new
      let riderDoc = await riderDocRepo.findOne({
        where: { riderId: data.riderId }
      });

      const isResubmission = !!riderDoc;

      if (!riderDoc) {
        riderDoc = riderDocRepo.create({
          riderId: data.riderId,
          status: 'pending',
          submittedAt: new Date(),
          submissionCount: 1
        });
      } else {
        // Reset status for resubmission
        riderDoc.status = 'pending';
        riderDoc.submittedAt = new Date();
        riderDoc.reviewedAt = undefined;
        riderDoc.reviewedBy = undefined;
        riderDoc.adminNotes = undefined;
        riderDoc.submissionCount = (riderDoc.submissionCount || 0) + 1;
      }

      // Upload and update driver's license
      if (data.driversLicense) {
        const uploadResult = await DocumentUploadService.replaceDocument(
          riderDoc.driversLicenseCloudinaryId,
          data.driversLicense.file,
          'rider_documents/drivers_licenses',
          `license_${data.riderId}_${Date.now()}`
        );
        riderDoc.driversLicenseUrl = uploadResult.secureUrl;
        riderDoc.driversLicenseCloudinaryId = uploadResult.publicId;
        riderDoc.driversLicenseNumber = data.driversLicense.number;
        riderDoc.driversLicenseExpiry = new Date(data.driversLicense.expiryDate);
      }

      // Upload and update vehicle photo
      if (data.vehicle) {
        const uploadResult = await DocumentUploadService.replaceDocument(
          riderDoc.vehiclePhotoCloudinaryId,
          data.vehicle.photo,
          'rider_documents/vehicles',
          `vehicle_${data.riderId}_${Date.now()}`
        );
        riderDoc.vehiclePhotoUrl = uploadResult.secureUrl;
        riderDoc.vehiclePhotoCloudinaryId = uploadResult.publicId;
        riderDoc.vehicleType = data.vehicle.type;
        riderDoc.vehicleRegistration = data.vehicle.registration;
      }

      // Upload and update national ID
      if (data.nationalId) {
        const uploadResult = await DocumentUploadService.replaceDocument(
          riderDoc.nationalIdCloudinaryId,
          data.nationalId.file,
          'rider_documents/national_ids',
          `national_id_${data.riderId}_${Date.now()}`
        );
        riderDoc.nationalIdUrl = uploadResult.secureUrl;
        riderDoc.nationalIdCloudinaryId = uploadResult.publicId;
        riderDoc.nationalIdNumber = data.nationalId.number;
      }

      await riderDocRepo.save(riderDoc);

      // Update rider's verification status
      rider.documentVerificationStatus = 'pending';
      await riderRepo.save(rider);

      // Notify admins of new/resubmitted documents
      await this.notifyAdminsOfNewSubmission(rider, isResubmission);

      return riderDoc;
    });
  }

  /**
   * Get rider's document submission
   */
  async getRiderDocuments(riderId: string): Promise<RiderDocument | null> {
    return await this.riderDocumentRepository.findOne({
      where: { riderId },
      relations: ['rider', 'reviewer']
    });
  }

  /**
   * Get all pending document submissions for admin review
   */
  async getPendingDocuments(filters: {
    page?: number;
    limit?: number;
  } = {}): Promise<{ documents: RiderDocument[]; total: number }> {
    const { page = 1, limit = 20 } = filters;

    const [documents, total] = await this.riderDocumentRepository.findAndCount({
      where: { status: 'pending' },
      relations: ['rider'],
      order: { submittedAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return { documents, total };
  }

  /**
   * Get document by rider ID (for admin review)
   */
  async getDocumentByRiderId(riderId: string): Promise<RiderDocument | null> {
    return await this.riderDocumentRepository.findOne({
      where: { riderId },
      relations: ['rider', 'reviewer']
    });
  }

  /**
   * Review rider documents (admin action)
   */
  async reviewDocuments(riderId: string, review: DocumentReview): Promise<RiderDocument> {
    return await AppDataSource.transaction(async (manager) => {
      const riderDocRepo = manager.getRepository(RiderDocument);
      const riderRepo = manager.getRepository(Rider);

      const riderDoc = await riderDocRepo.findOne({
        where: { riderId },
        relations: ['rider']
      });

      if (!riderDoc) {
        throw new Error('Document submission not found');
      }

      if (riderDoc.status !== 'pending') {
        throw new Error('Documents are not in pending status');
      }

      // Update document review
      riderDoc.status = review.status;
      riderDoc.adminNotes = review.adminNotes;
      riderDoc.reviewedBy = review.reviewedBy;
      riderDoc.reviewedAt = new Date();

      await riderDocRepo.save(riderDoc);

      // Update rider's verification status
      const rider = await riderRepo.findOne({ where: { id: riderId } });
      if (rider) {
        rider.documentVerificationStatus = review.status;
        
        // If approved, mark rider as verified
        if (review.status === 'approved') {
          rider.isVerified = true;
          rider.isApproved = true;
        }

        await riderRepo.save(rider);
      }

      // Notify rider of review decision
      await this.notifyRiderOfReview(riderDoc, review);

      return riderDoc;
    });
  }

  /**
   * Get all document submissions (admin)
   */
  async getAllDocuments(filters: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ documents: RiderDocument[]; total: number }> {
    const { status, page = 1, limit = 20 } = filters;

    const queryBuilder = this.riderDocumentRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.rider', 'rider')
      .leftJoinAndSelect('doc.reviewer', 'reviewer')
      .orderBy('doc.submittedAt', 'DESC');

    if (status) {
      queryBuilder.where('doc.status = :status', { status });
    }

    const [documents, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { documents, total };
  }

  /**
   * Send notifications to admins about new document submission
   */
  private async notifyAdminsOfNewSubmission(rider: Rider, isResubmission: boolean): Promise<void> {
    try {
      // Get all active admins
      const admins = await this.adminRepository.find({
        where: { isActive: true }
      });

      const message = isResubmission
        ? `Rider ${rider.fullName} has resubmitted their verification documents for review.`
        : `New rider ${rider.fullName} has submitted their verification documents for review.`;

      // Send notifications to all admins
      for (const admin of admins) {
        // In-app notification (only for rider/customer/vendor entities, admins don't have entity type in notifications)
        // Skip in-app notifications for admins - they'll get email/SMS instead
        
        // Email notification
        if (admin.email) {
          console.log(`📧 Email notification to admin ${admin.email}: ${message}`);
          // TODO: Send actual email when SendGrid is configured
        }

        // SMS notification
        if (admin.phone) {
          const smsMessage = `VENDA: ${rider.fullName} ${isResubmission ? 'resubmitted' : 'submitted'} verification documents. Review at admin portal.`;
          console.log(`📱 SMS notification to admin ${admin.phone}: ${smsMessage}`);
          // TODO: Send actual SMS when Termii is configured
        }
      }
    } catch (error) {
      console.error('Error notifying admins:', error);
      // Don't throw - notification failure shouldn't block document submission
    }
  }

  /**
   * Send notifications to rider about review decision
   */
  private async notifyRiderOfReview(riderDoc: RiderDocument, review: DocumentReview): Promise<void> {
    try {
      if (!riderDoc.rider) {
        return;
      }

      const rider = riderDoc.rider;
      let title = '';
      let message = '';

      switch (review.status) {
        case 'approved':
          title = 'Documents Approved ✅';
          message = 'Congratulations! Your verification documents have been approved. You can now start accepting deliveries.';
          break;
        case 'rejected':
          title = 'Documents Rejected ❌';
          message = `Your verification documents have been rejected. ${review.adminNotes || 'Please contact support for more information.'}`;
          break;
        case 'changes_requested':
          title = 'Changes Requested 📝';
          message = `Please review and resubmit your documents. ${review.adminNotes || 'Some changes are required.'}`;
          break;
      }

      // In-app notification
      await NotificationService.createAndSendNotification({
        entityId: rider.id,
        entityType: 'rider',
        type: 'account',
        title,
        message,
        data: {
          documentStatus: review.status,
          adminNotes: review.adminNotes
        }
      });

      // Email notification
      if (rider.email) {
        console.log(`📧 Email notification to rider ${rider.email}: ${title} - ${message}`);
        // TODO: Send actual email when SendGrid is configured
      }

      // SMS notification
      if (rider.phone) {
        const smsMessage = `VENDA: ${message.substring(0, 140)}`;
        console.log(`📱 SMS notification to rider ${rider.phone}: ${smsMessage}`);
        // TODO: Send actual SMS when Termii is configured
      }
    } catch (error) {
      console.error('Error notifying rider:', error);
      // Don't throw - notification failure shouldn't block review
    }
  }
}

export default new RiderDocumentService();
