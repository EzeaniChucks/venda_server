"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorOrderRejectionController = void 0;
const orderRejectionService_1 = __importDefault(require("../../services/vendor/orderRejectionService"));
const response_1 = require("../../utils/response");
class VendorOrderRejectionController {
    async rejectOrderItem(req, res) {
        try {
            const { reason } = req.body;
            const orderItemId = req.params.id;
            const vendorId = req.user.id;
            if (!reason) {
                return (0, response_1.errorResponse)(res, 'Rejection reason is required', 400);
            }
            const result = await orderRejectionService_1.default.rejectOrderItem(orderItemId, vendorId, reason);
            return (0, response_1.successResponse)(res, result, 'Order item rejected successfully');
        }
        catch (error) {
            console.error('Reject order item error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async rejectOrder(req, res) {
        try {
            const { reason } = req.body;
            const orderId = req.params.id;
            const vendorId = req.user.id;
            if (!reason) {
                return (0, response_1.errorResponse)(res, 'Rejection reason is required', 400);
            }
            const result = await orderRejectionService_1.default.rejectOrder(orderId, vendorId, reason);
            return (0, response_1.successResponse)(res, result, 'Order rejected successfully');
        }
        catch (error) {
            console.error('Reject order error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async getRejections(req, res) {
        try {
            const vendorId = req.user.id;
            const limit = parseInt(req.query.limit) || 50;
            const rejections = await orderRejectionService_1.default.getVendorRejections(vendorId, limit);
            return (0, response_1.successResponse)(res, rejections, 'Rejections retrieved successfully');
        }
        catch (error) {
            console.error('Get rejections error:', error);
            return (0, response_1.errorResponse)(res, error.message, 500);
        }
    }
}
exports.VendorOrderRejectionController = VendorOrderRejectionController;
exports.default = new VendorOrderRejectionController();
//# sourceMappingURL=orderRejectionController.js.map