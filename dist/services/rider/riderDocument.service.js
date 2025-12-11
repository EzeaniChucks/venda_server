"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiderDocumentService = void 0;
const data_source_1 = require("../../config/data-source");
const entities_1 = require("../../entities");
const documentUpload_service_1 = require("../shared/documentUpload.service");
const notification_service_1 = require("../shared/notification.service");
class RiderDocumentService {
    constructor() {
        this.riderDocumentRepository = data_source_1.AppDataSource.getRepository(entities_1.RiderDocument);
        this.riderRepository = data_source_1.AppDataSource.getRepository(entities_1.Rider);
        this.adminRepository = data_source_1.AppDataSource.getRepository(entities_1.Admin);
    }
    async submitDocuments(data) {
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const riderDocRepo = manager.getRepository(entities_1.RiderDocument);
            const riderRepo = manager.getRepository(entities_1.Rider);
            const rider = await riderRepo.findOne({ where: { id: data.riderId } });
            if (!rider) {
                throw new Error('Rider not found');
            }
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
            }
            else {
                riderDoc.status = 'pending';
                riderDoc.submittedAt = new Date();
                riderDoc.reviewedAt = undefined;
                riderDoc.reviewedBy = undefined;
                riderDoc.adminNotes = undefined;
                riderDoc.submissionCount = (riderDoc.submissionCount || 0) + 1;
            }
            if (data.driversLicense) {
                const uploadResult = await documentUpload_service_1.DocumentUploadService.replaceDocument(riderDoc.driversLicenseCloudinaryId, data.driversLicense.file, 'rider_documents/drivers_licenses', `license_${data.riderId}_${Date.now()}`);
                riderDoc.driversLicenseUrl = uploadResult.secureUrl;
                riderDoc.driversLicenseCloudinaryId = uploadResult.publicId;
                riderDoc.driversLicenseNumber = data.driversLicense.number;
                riderDoc.driversLicenseExpiry = new Date(data.driversLicense.expiryDate);
            }
            if (data.vehicle) {
                const uploadResult = await documentUpload_service_1.DocumentUploadService.replaceDocument(riderDoc.vehiclePhotoCloudinaryId, data.vehicle.photo, 'rider_documents/vehicles', `vehicle_${data.riderId}_${Date.now()}`);
                riderDoc.vehiclePhotoUrl = uploadResult.secureUrl;
                riderDoc.vehiclePhotoCloudinaryId = uploadResult.publicId;
                riderDoc.vehicleType = data.vehicle.type;
                riderDoc.vehicleRegistration = data.vehicle.registration;
            }
            if (data.nationalId) {
                const uploadResult = await documentUpload_service_1.DocumentUploadService.replaceDocument(riderDoc.nationalIdCloudinaryId, data.nationalId.file, 'rider_documents/national_ids', `national_id_${data.riderId}_${Date.now()}`);
                riderDoc.nationalIdUrl = uploadResult.secureUrl;
                riderDoc.nationalIdCloudinaryId = uploadResult.publicId;
                riderDoc.nationalIdNumber = data.nationalId.number;
            }
            await riderDocRepo.save(riderDoc);
            rider.documentVerificationStatus = 'pending';
            await riderRepo.save(rider);
            await this.notifyAdminsOfNewSubmission(rider, isResubmission);
            return riderDoc;
        });
    }
    async getRiderDocuments(riderId) {
        return await this.riderDocumentRepository.findOne({
            where: { riderId },
            relations: ['rider', 'reviewer']
        });
    }
    async getPendingDocuments(filters = {}) {
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
    async getDocumentByRiderId(riderId) {
        return await this.riderDocumentRepository.findOne({
            where: { riderId },
            relations: ['rider', 'reviewer']
        });
    }
    async reviewDocuments(riderId, review) {
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const riderDocRepo = manager.getRepository(entities_1.RiderDocument);
            const riderRepo = manager.getRepository(entities_1.Rider);
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
            riderDoc.status = review.status;
            riderDoc.adminNotes = review.adminNotes;
            riderDoc.reviewedBy = review.reviewedBy;
            riderDoc.reviewedAt = new Date();
            await riderDocRepo.save(riderDoc);
            const rider = await riderRepo.findOne({ where: { id: riderId } });
            if (rider) {
                rider.documentVerificationStatus = review.status;
                if (review.status === 'approved') {
                    rider.isVerified = true;
                    rider.isApproved = true;
                }
                await riderRepo.save(rider);
            }
            await this.notifyRiderOfReview(riderDoc, review);
            return riderDoc;
        });
    }
    async getAllDocuments(filters = {}) {
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
    async notifyAdminsOfNewSubmission(rider, isResubmission) {
        try {
            const admins = await this.adminRepository.find({
                where: { isActive: true }
            });
            const message = isResubmission
                ? `Rider ${rider.fullName} has resubmitted their verification documents for review.`
                : `New rider ${rider.fullName} has submitted their verification documents for review.`;
            for (const admin of admins) {
                if (admin.email) {
                    console.log(`📧 Email notification to admin ${admin.email}: ${message}`);
                }
                if (admin.phone) {
                    const smsMessage = `VENDA: ${rider.fullName} ${isResubmission ? 'resubmitted' : 'submitted'} verification documents. Review at admin portal.`;
                    console.log(`📱 SMS notification to admin ${admin.phone}: ${smsMessage}`);
                }
            }
        }
        catch (error) {
            console.error('Error notifying admins:', error);
        }
    }
    async notifyRiderOfReview(riderDoc, review) {
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
            await notification_service_1.NotificationService.createAndSendNotification({
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
            if (rider.email) {
                console.log(`📧 Email notification to rider ${rider.email}: ${title} - ${message}`);
            }
            if (rider.phone) {
                const smsMessage = `VENDA: ${message.substring(0, 140)}`;
                console.log(`📱 SMS notification to rider ${rider.phone}: ${smsMessage}`);
            }
        }
        catch (error) {
            console.error('Error notifying rider:', error);
        }
    }
}
exports.RiderDocumentService = RiderDocumentService;
exports.default = new RiderDocumentService();
//# sourceMappingURL=riderDocument.service.js.map