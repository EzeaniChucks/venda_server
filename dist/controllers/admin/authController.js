"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthController = void 0;
const express_validator_1 = require("express-validator");
const authService_service_1 = __importDefault(require("../../services/shared/authService.service"));
const response_1 = require("../../utils/response");
class AdminAuthController {
    async register(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const adminData = { ...req.body, role: 'admin' };
            const { user, token } = await authService_service_1.default.register(adminData);
            const userWithoutPassword = { ...user, password: undefined };
            return (0, response_1.successResponse)(res, { user: userWithoutPassword, token }, 'Admin registration successful', 201);
        }
        catch (error) {
            console.error('Admin registration error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async login(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const { email, password } = req.body;
            const { user, token } = await authService_service_1.default.login(email, password);
            if (user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Invalid credentials. Please use the correct login endpoint for your account type.', 401);
            }
            const userWithoutPassword = { ...user, password: undefined };
            return (0, response_1.successResponse)(res, { user: userWithoutPassword, token }, 'Admin login successful');
        }
        catch (error) {
            console.error('Admin login error:', error);
            return (0, response_1.errorResponse)(res, error.message, 401);
        }
    }
}
exports.AdminAuthController = AdminAuthController;
exports.default = new AdminAuthController();
//# sourceMappingURL=authController.js.map