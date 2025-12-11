"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiderDocumentController = void 0;
const express_validator_1 = require("express-validator");
const riderDocument_service_1 = __importDefault(require("../../services/rider/riderDocument.service"));
const response_1 = require("../../utils/response");
class RiderDocumentController {
    async submitDocuments(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const riderId = req.user.id;
            const files = req.files;
            const { driversLicenseNumber, driversLicenseExpiry, vehicleType, vehicleRegistration, nationalIdNumber } = req.body;
            if (!files?.driversLicense?.[0]) {
                return (0, response_1.errorResponse)(res, "Driver's license image is required", 400);
            }
            if (!files?.vehiclePhoto?.[0]) {
                return (0, response_1.errorResponse)(res, 'Vehicle photo is required', 400);
            }
            if (!files?.nationalId?.[0]) {
                return (0, response_1.errorResponse)(res, 'National ID image is required', 400);
            }
            if (!driversLicenseNumber || !driversLicenseExpiry) {
                return (0, response_1.errorResponse)(res, "Driver's license number and expiry date are required", 400);
            }
            if (!vehicleType || !vehicleRegistration) {
                return (0, response_1.errorResponse)(res, 'Vehicle type and registration are required', 400);
            }
            if (!nationalIdNumber) {
                return (0, response_1.errorResponse)(res, 'National ID number is required', 400);
            }
            const result = await riderDocument_service_1.default.submitDocuments({
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
            return (0, response_1.successResponse)(res, result, 'Documents submitted successfully. Your submission is under review.', 201);
        }
        catch (error) {
            console.error('Submit documents error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async getDocumentStatus(req, res) {
        try {
            const riderId = req.user.id;
            const documents = await riderDocument_service_1.default.getRiderDocuments(riderId);
            if (!documents) {
                return (0, response_1.successResponse)(res, {
                    status: 'not_submitted',
                    message: 'No documents submitted yet'
                });
            }
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
            return (0, response_1.successResponse)(res, response);
        }
        catch (error) {
            console.error('Get document status error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getDocuments(req, res) {
        try {
            const riderId = req.user.id;
            const documents = await riderDocument_service_1.default.getRiderDocuments(riderId);
            if (!documents) {
                return (0, response_1.successResponse)(res, null, 'No documents found');
            }
            return (0, response_1.successResponse)(res, documents);
        }
        catch (error) {
            console.error('Get documents error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
}
exports.RiderDocumentController = RiderDocumentController;
exports.default = new RiderDocumentController();
//# sourceMappingURL=riderDocumentController.js.map