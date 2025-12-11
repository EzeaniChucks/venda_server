"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const adminService_1 = __importDefault(require("../../services/admin/adminService"));
const response_1 = require("../../utils/response");
class AdminController {
    async getUsers(req, res) {
        try {
            const users = await adminService_1.default.getUsers(req.query);
            return (0, response_1.successResponse)(res, users);
        }
        catch (error) {
            console.error("Get users error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async updateUserStatus(req, res) {
        try {
            const { is_active, role } = req.body;
            const user = await adminService_1.default.updateUserStatus(req.params.id, role, is_active);
            return (0, response_1.successResponse)(res, user, "User status updated");
        }
        catch (error) {
            console.error("Update user status error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async getProductsForApproval(req, res) {
        try {
            const products = await adminService_1.default.getProductsForApproval(req.query);
            return (0, response_1.successResponse)(res, products);
        }
        catch (error) {
            console.error("Get products for approval error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async updateProductApproval(req, res) {
        try {
            const { is_approved } = req.body;
            const product = await adminService_1.default.updateProductApproval(req.params.id, is_approved);
            return (0, response_1.successResponse)(res, product, "Product approval status updated");
        }
        catch (error) {
            console.error("Update product approval error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async getAnalytics(req, res) {
        try {
            const analytics = await adminService_1.default.getAnalytics();
            return (0, response_1.successResponse)(res, analytics);
        }
        catch (error) {
            console.error("Get analytics error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async approveVendor(req, res) {
        try {
            const { is_approved } = req.body;
            const vendor = await adminService_1.default.approveVendor(req.params.id, is_approved);
            return (0, response_1.successResponse)(res, vendor, "Vendor approval status updated");
        }
        catch (error) {
            console.error("Approve vendor error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async approveRider(req, res) {
        try {
            const { is_approved } = req.body;
            const rider = await adminService_1.default.approveRider(req.params.id, is_approved);
            return (0, response_1.successResponse)(res, rider, "Rider approval status updated");
        }
        catch (error) {
            console.error("Approve rider error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.AdminController = AdminController;
exports.default = new AdminController();
//# sourceMappingURL=adminController.js.map