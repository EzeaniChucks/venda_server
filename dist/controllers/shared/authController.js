"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const authService_service_1 = __importDefault(require("../../services/shared/authService.service"));
const response_1 = require("../../utils/response");
class AuthController {
    async register(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const { user, token } = await authService_service_1.default.register(req.body);
            const userWithoutPassword = { ...user, password: undefined };
            return (0, response_1.successResponse)(res, { user: userWithoutPassword, token }, "Registration successful", 201);
        }
        catch (error) {
            console.error("Registration error:", error);
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
            const userWithoutPassword = { ...user, password: undefined };
            return (0, response_1.successResponse)(res, { user: userWithoutPassword, token }, "Login successful");
        }
        catch (error) {
            console.error("Login error:", error);
            return (0, response_1.errorResponse)(res, error.message, 401);
        }
    }
    async getProfile(req, res) {
        try {
            const user = await authService_service_1.default.getById(req.user.id, req.user.role);
            if (!user) {
                return (0, response_1.errorResponse)(res, "User not found", 404);
            }
            const userWithoutPassword = { ...user, password: undefined };
            return (0, response_1.successResponse)(res, {
                ...userWithoutPassword,
                role: req.user.role,
            });
        }
        catch (error) {
            console.error("Get profile error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async updateProfile(req, res) {
        try {
            const { fullName, businessName, phone, profileImage, state, city, address, businessDescription, businessAddress, businessPhone, bankAccountName, bankAccountNumber, bankName, } = req.body;
            const user = await authService_service_1.default.updateProfile(req.user.id, req.user.role, {
                fullName,
                businessName,
                phone,
                profileImage,
                state,
                city,
                address,
                businessDescription,
                businessAddress,
                businessPhone,
                bankAccountName,
                bankAccountNumber,
                bankName,
            });
            const userWithoutPassword = { ...user, password: undefined };
            return (0, response_1.successResponse)(res, { ...userWithoutPassword, role: req.user.role }, "Profile updated successfully");
        }
        catch (error) {
            console.error("Update profile error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController();
//# sourceMappingURL=authController.js.map