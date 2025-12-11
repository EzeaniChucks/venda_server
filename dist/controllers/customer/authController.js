"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAuthController = void 0;
const express_validator_1 = require("express-validator");
const authService_service_1 = __importDefault(require("../../services/shared/authService.service"));
const response_1 = require("../../utils/response");
class CustomerAuthController {
    async register(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const customerData = { ...req.body, role: "customer" };
            const { user, token } = await authService_service_1.default.register(customerData);
            const userWithoutPassword = { ...user, password: undefined };
            return (0, response_1.successResponse)(res, { user: userWithoutPassword, token }, "Customer registration successful", 201);
        }
        catch (error) {
            console.error("Customer registration error:", error);
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
            if (user.role !== "customer") {
                return (0, response_1.errorResponse)(res, "Invalid credentials. Please use the correct login endpoint for your account type.", 401);
            }
            const userWithoutPassword = { ...user, password: undefined };
            return (0, response_1.successResponse)(res, { user: userWithoutPassword, token }, "Customer login successful");
        }
        catch (error) {
            console.error("Customer login error:", error);
            return (0, response_1.errorResponse)(res, error.message, 401);
        }
    }
}
exports.CustomerAuthController = CustomerAuthController;
exports.default = new CustomerAuthController();
//# sourceMappingURL=authController.js.map