"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireVerifiedDocuments = void 0;
const data_source_1 = require("../config/data-source");
const entities_1 = require("../entities");
const response_1 = require("../utils/response");
const requireVerifiedDocuments = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'rider') {
            return (0, response_1.errorResponse)(res, 'Unauthorized: Rider access required', 403);
        }
        const riderRepository = data_source_1.AppDataSource.getRepository(entities_1.Rider);
        const rider = await riderRepository.findOne({
            where: { id: req.user.id }
        });
        if (!rider) {
            return (0, response_1.errorResponse)(res, 'Rider not found', 404);
        }
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
            return (0, response_1.errorResponse)(res, message, 403);
        }
        next();
    }
    catch (error) {
        console.error('Rider verification check error:', error);
        return (0, response_1.errorResponse)(res, 'Error checking verification status', 500);
    }
};
exports.requireVerifiedDocuments = requireVerifiedDocuments;
//# sourceMappingURL=riderVerification.js.map