"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorController = void 0;
const vendorService_1 = __importDefault(require("../../services/vendor/vendorService"));
const response_1 = require("../../utils/response");
class VendorController {
    async getVendorApprovalStatus(req, res) {
        try {
            const vendorId = req.user.id;
            const approvalStatus = await vendorService_1.default.getVendorApprovalStatus(vendorId);
            return (0, response_1.successResponse)(res, { isApproved: approvalStatus });
        }
        catch (error) {
            console.error("Get vendor approval status error:", error.message);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getVendorProducts(req, res) {
        try {
            const products = await vendorService_1.default.getVendorProducts(req.user.id, req.query);
            return (0, response_1.successResponse)(res, products);
        }
        catch (error) {
            console.error("Get vendor products error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getDashboardStats(req, res) {
        try {
            const stats = await vendorService_1.default.getDashboardStats(req.user.id);
            return (0, response_1.successResponse)(res, stats);
        }
        catch (error) {
            console.error("Get dashboard stats error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getVendorProfile(req, res) {
        try {
            const profile = await vendorService_1.default.getVendorProfile(req.user.id);
            return (0, response_1.successResponse)(res, profile);
        }
        catch (error) {
            console.error("Get vendor profile error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async updateVendorProfile(req, res) {
        try {
            const profile = await vendorService_1.default.updateVendorProfile(req.user.id, req.body);
            return (0, response_1.successResponse)(res, profile, "Profile updated successfully");
        }
        catch (error) {
            console.error("Update vendor profile error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.VendorController = VendorController;
exports.default = new VendorController();
//# sourceMappingURL=vendorController.js.map