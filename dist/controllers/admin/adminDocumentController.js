"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDocumentController = void 0;
const express_validator_1 = require("express-validator");
const riderDocument_service_1 = __importDefault(require("../../services/rider/riderDocument.service"));
const response_1 = require("../../utils/response");
class AdminDocumentController {
    async getPendingDocuments(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await riderDocument_service_1.default.getPendingDocuments({ page, limit });
            return (0, response_1.successResponse)(res, {
                documents: result.documents,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            });
        }
        catch (error) {
            console.error('Get pending documents error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getAllDocuments(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const status = req.query.status;
            const result = await riderDocument_service_1.default.getAllDocuments({ status, page, limit });
            return (0, response_1.successResponse)(res, {
                documents: result.documents,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            });
        }
        catch (error) {
            console.error('Get all documents error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getRiderDocuments(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const { riderId } = req.params;
            const documents = await riderDocument_service_1.default.getDocumentByRiderId(riderId);
            if (!documents) {
                return (0, response_1.errorResponse)(res, 'No documents found for this rider', 404);
            }
            return (0, response_1.successResponse)(res, documents);
        }
        catch (error) {
            console.error('Get rider documents error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async reviewDocuments(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const { riderId } = req.params;
            const { status, adminNotes } = req.body;
            const reviewedBy = req.user.id;
            if (!['approved', 'rejected', 'changes_requested'].includes(status)) {
                return (0, response_1.errorResponse)(res, 'Invalid status. Must be: approved, rejected, or changes_requested', 400);
            }
            const result = await riderDocument_service_1.default.reviewDocuments(riderId, {
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
            return (0, response_1.successResponse)(res, result, message);
        }
        catch (error) {
            console.error('Review documents error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async getDocumentStats(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const [pending, approved, rejected, changesRequested] = await Promise.all([
                riderDocument_service_1.default.getPendingDocuments({ page: 1, limit: 1 }),
                riderDocument_service_1.default.getAllDocuments({ status: 'approved', page: 1, limit: 1 }),
                riderDocument_service_1.default.getAllDocuments({ status: 'rejected', page: 1, limit: 1 }),
                riderDocument_service_1.default.getAllDocuments({ status: 'changes_requested', page: 1, limit: 1 })
            ]);
            return (0, response_1.successResponse)(res, {
                pending: pending.total,
                approved: approved.total,
                rejected: rejected.total,
                changesRequested: changesRequested.total,
                total: pending.total + approved.total + rejected.total + changesRequested.total
            });
        }
        catch (error) {
            console.error('Get document stats error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
}
exports.AdminDocumentController = AdminDocumentController;
exports.default = new AdminDocumentController();
//# sourceMappingURL=adminDocumentController.js.map