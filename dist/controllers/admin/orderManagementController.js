"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderManagementController = void 0;
const orderManagementService_1 = require("../../services/admin/orderManagementService");
const response_1 = require("../../utils/response");
exports.orderManagementController = {
    async getAllOrders(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const result = await orderManagementService_1.orderManagementService.getAllOrders(req.query);
            return (0, response_1.successResponse)(res, {
                orders: result.orders,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / result.limit)
                }
            });
        }
        catch (error) {
            console.error('Get all orders error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    },
    async getOrderById(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const order = await orderManagementService_1.orderManagementService.getOrderById(req.params.id);
            return (0, response_1.successResponse)(res, order);
        }
        catch (error) {
            console.error('Get order error:', error);
            return (0, response_1.errorResponse)(res, error.message, 404);
        }
    },
    async getOrderStats(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const stats = await orderManagementService_1.orderManagementService.getOrderStats();
            return (0, response_1.successResponse)(res, stats);
        }
        catch (error) {
            console.error('Get order stats error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    },
    async getAllTransactions(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const result = await orderManagementService_1.orderManagementService.getAllTransactions(req.query);
            return (0, response_1.successResponse)(res, {
                transactions: result.transactions,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / result.limit)
                }
            });
        }
        catch (error) {
            console.error('Get all transactions error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    },
    async getTransactionById(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const transaction = await orderManagementService_1.orderManagementService.getTransactionById(req.params.id);
            return (0, response_1.successResponse)(res, transaction);
        }
        catch (error) {
            console.error('Get transaction error:', error);
            return (0, response_1.errorResponse)(res, error.message, 404);
        }
    },
    async getTransactionStats(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const stats = await orderManagementService_1.orderManagementService.getTransactionStats();
            return (0, response_1.successResponse)(res, stats);
        }
        catch (error) {
            console.error('Get transaction stats error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
};
//# sourceMappingURL=orderManagementController.js.map