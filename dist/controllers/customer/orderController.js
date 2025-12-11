"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const express_validator_1 = require("express-validator");
const orderService_1 = __importDefault(require("../../services/customer/orderService"));
const response_1 = require("../../utils/response");
class OrderController {
    async createOrder(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const order = await orderService_1.default.createOrder(req.user.id, req.body);
            return (0, response_1.successResponse)(res, order, 'Order created successfully', 201);
        }
        catch (error) {
            console.error('Create order error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async getUserOrders(req, res) {
        try {
            const orders = await orderService_1.default.getUserOrders(req.user.id, req.query);
            return (0, response_1.successResponse)(res, orders);
        }
        catch (error) {
            console.error('Get orders error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getOrderById(req, res) {
        try {
            const order = await orderService_1.default.getOrderById(req.params.id, req.user.id);
            return (0, response_1.successResponse)(res, order);
        }
        catch (error) {
            console.error('Get order error:', error);
            return (0, response_1.errorResponse)(res, error.message, 404);
        }
    }
    async cancelOrder(req, res) {
        try {
            const { reason } = req.body;
            const order = await orderService_1.default.cancelOrder(req.params.id, req.user.id, reason);
            return (0, response_1.successResponse)(res, order, 'Order cancelled successfully');
        }
        catch (error) {
            console.error('Cancel order error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.OrderController = OrderController;
exports.default = new OrderController();
//# sourceMappingURL=orderController.js.map