"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryRejectionController = void 0;
const deliveryRejectionService_1 = __importDefault(require("../../services/rider/deliveryRejectionService"));
const response_1 = require("../../utils/response");
class DeliveryRejectionController {
    async rejectDelivery(req, res) {
        try {
            const { reason, reassignToRiderId } = req.body;
            const orderId = req.params.id;
            const riderId = req.user.id;
            if (!reason) {
                return (0, response_1.errorResponse)(res, "Rejection reason is required", 400);
            }
            const result = await deliveryRejectionService_1.default.rejectDelivery(orderId, riderId, reason, reassignToRiderId);
            return (0, response_1.successResponse)(res, result, result.message);
        }
        catch (error) {
            console.error("Reject delivery error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async getRejections(req, res) {
        try {
            const riderId = req.user.id;
            const limit = parseInt(req.query.limit) || 50;
            const rejections = await deliveryRejectionService_1.default.getRiderRejections(riderId, limit);
            return (0, response_1.successResponse)(res, rejections, "Rejections retrieved successfully");
        }
        catch (error) {
            console.error("Get rejections error:", error);
            return (0, response_1.errorResponse)(res, error.message, 500);
        }
    }
    async getAvailableRiders(req, res) {
        try {
            const riders = await deliveryRejectionService_1.default.getAvailableRiders();
            return (0, response_1.successResponse)(res, riders, "Available riders retrieved successfully");
        }
        catch (error) {
            console.error("Get available riders error:", error);
            return (0, response_1.errorResponse)(res, error.message, 500);
        }
    }
}
exports.DeliveryRejectionController = DeliveryRejectionController;
exports.default = new DeliveryRejectionController();
//# sourceMappingURL=deliveryRejectionController.js.map