"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorOrderController = void 0;
const orderService_1 = __importDefault(require("../../services/vendor/orderService"));
const response_1 = require("../../utils/response");
class VendorOrderController {
    async getVendorOrders(req, res) {
        try {
            const orders = await orderService_1.default.getVendorOrders(req.user.id, req.query);
            return (0, response_1.successResponse)(res, orders);
        }
        catch (error) {
            console.error("Get vendor orders error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getVendorOrder(req, res) {
        try {
            const vendorId = req.user.id;
            const { orderId } = req.params;
            if (!orderId) {
                res.status(400).json({
                    success: false,
                    message: "Order ID is required",
                });
                return;
            }
            const order = await orderService_1.default.getVendorOrderById(res, orderId, vendorId);
            (0, response_1.successResponse)(res, order);
        }
        catch (error) {
            console.error("Get vendor order error:", error);
            if (error.message.includes("not found")) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to fetch order details",
                });
            }
        }
    }
    async updateOrderItemStatus(req, res) {
        try {
            const vendorId = req.user.id;
            const { orderId, itemId } = req.params;
            const { status } = req.body;
            if (!orderId || !itemId || !status) {
                res.status(400).json({
                    success: false,
                    message: "Order ID, Item ID, and status are required",
                });
                return;
            }
            const validStatuses = [
                "pending",
                "accepted",
                "preparing",
                "ready",
                "rejected",
            ];
            if (!validStatuses.includes(status)) {
                (0, response_1.errorResponse)(res, "Invalid status. Must be one of: " + validStatuses.join(", "), 400);
                return;
            }
            await orderService_1.default.updateOrderItemStatus({
                orderId,
                itemId,
                vendorId,
                status,
            });
            const updatedItem = await orderService_1.default.getVendorOrderById(res, orderId, vendorId);
            (0, response_1.successResponse)(res, updatedItem, "Order status updated successfully");
        }
        catch (error) {
            console.error("Update order status error:", error);
            if (error.message.includes("not found") ||
                error.message.includes("access")) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to update order status",
                });
            }
        }
    }
    async rejectOrderItem(req, res) {
        try {
            const { reason } = req.body;
            const orderItemId = req.params.id;
            const vendorId = req.user.id;
            if (!reason) {
                return (0, response_1.errorResponse)(res, "Rejection reason is required", 400);
            }
            const result = await orderService_1.default.rejectOrderItem(orderItemId, vendorId, reason);
            return (0, response_1.successResponse)(res, result, "Order item rejected successfully");
        }
        catch (error) {
            console.error("Reject order item error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async rejectOrder(req, res) {
        try {
            const { reason } = req.body;
            const orderId = req.params.id;
            const vendorId = req.user.id;
            if (!reason) {
                return (0, response_1.errorResponse)(res, "Rejection reason is required", 400);
            }
            const result = await orderService_1.default.rejectOrder(orderId, vendorId, reason);
            return (0, response_1.successResponse)(res, result, "Order rejected successfully");
        }
        catch (error) {
            console.error("Reject order error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async getRejections(req, res) {
        try {
            const vendorId = req.user.id;
            const limit = parseInt(req.query.limit) || 50;
            const rejections = await orderService_1.default.getVendorRejections(vendorId, limit);
            return (0, response_1.successResponse)(res, rejections, "Rejections retrieved successfully");
        }
        catch (error) {
            console.error("Get rejections error:", error);
            return (0, response_1.errorResponse)(res, error.message, 500);
        }
    }
}
exports.VendorOrderController = VendorOrderController;
exports.default = new VendorOrderController();
//# sourceMappingURL=orderController.js.map