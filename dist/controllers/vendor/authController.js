"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorAuthController = void 0;
const express_validator_1 = require("express-validator");
const authService_service_1 = __importDefault(require("../../services/shared/authService.service"));
const response_1 = require("../../utils/response");
class VendorAuthController {
    async register(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const vendorData = { ...req.body, role: "vendor" };
            const { user, token } = await authService_service_1.default.register(vendorData);
            const userWithoutPassword = { ...user, password: undefined };
            return (0, response_1.successResponse)(res, { user: userWithoutPassword, token }, "Vendor registration successful", 201);
        }
        catch (error) {
            console.error("Vendor registration error:", error);
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
            if (user.role !== "vendor") {
                return (0, response_1.errorResponse)(res, "Invalid credentials. Please use the correct login endpoint for your account type.", 401);
            }
            const userWithoutPassword = { ...user, password: undefined };
            return (0, response_1.successResponse)(res, { user: userWithoutPassword, token }, "Vendor login successful");
        }
        catch (error) {
            console.error("Vendor login error:", error);
            return (0, response_1.errorResponse)(res, error.message, 401);
        }
    }
    async refreshToken(req, res) {
        try {
            const user = req.user;
            if (!user) {
                return (0, response_1.errorResponse)(res, "User not found", 401);
            }
            if (user.role !== "vendor") {
                return (0, response_1.errorResponse)(res, "Invalid token. Vendor access required.", 401);
            }
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return (0, response_1.errorResponse)(res, "Authorization header missing or invalid", 401);
            }
            const oldToken = authHeader.replace("Bearer ", "");
            const { user: updatedUser, token: newToken } = await authService_service_1.default.refreshToken(oldToken, user.role);
            const userWithoutPassword = { ...updatedUser, password: undefined };
            return (0, response_1.successResponse)(res, {
                user: userWithoutPassword,
                token: newToken,
                expiresIn: 30 * 24 * 60 * 60,
            }, "Token refreshed successfully");
        }
        catch (error) {
            console.error("Token refresh error:", error);
            if (error.message.includes("Invalid or expired") ||
                error.message.includes("User not found") ||
                error.message.includes("deactivated")) {
                return (0, response_1.errorResponse)(res, error.message, 401);
            }
            return (0, response_1.errorResponse)(res, "Token refresh failed", 500);
        }
    }
}
exports.VendorAuthController = VendorAuthController;
exports.default = new VendorAuthController();
//# sourceMappingURL=authController.js.map