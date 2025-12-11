"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiderController = void 0;
const express_validator_1 = require("express-validator");
const riderService_1 = __importDefault(require("../../services/rider/riderService"));
const response_1 = require("../../utils/response");
class RiderController {
    async getAvailableDeliveries(req, res) {
        try {
            const deliveries = await riderService_1.default.getAvailableDeliveries();
            return (0, response_1.successResponse)(res, deliveries);
        }
        catch (error) {
            console.error('Get available deliveries error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getRiderDeliveries(req, res) {
        try {
            const deliveries = await riderService_1.default.getRiderDeliveries(req.user.id, req.query);
            return (0, response_1.successResponse)(res, deliveries);
        }
        catch (error) {
            console.error('Get rider deliveries error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async acceptDelivery(req, res) {
        try {
            const { order_id } = req.body;
            const delivery = await riderService_1.default.acceptDelivery(req.user.id, order_id);
            return (0, response_1.successResponse)(res, delivery, 'Delivery accepted successfully');
        }
        catch (error) {
            console.error('Accept delivery error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async updateDeliveryStatus(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const { status } = req.body;
            const delivery = await riderService_1.default.updateDeliveryStatus(req.user.id, req.params.id, status);
            return (0, response_1.successResponse)(res, delivery, 'Delivery status updated');
        }
        catch (error) {
            console.error('Update delivery status error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async updateLocation(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const { latitude, longitude } = req.body;
            const result = await riderService_1.default.updateLocation(req.user.id, latitude, longitude);
            return (0, response_1.successResponse)(res, result, 'Location updated');
        }
        catch (error) {
            console.error('Update location error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async updateAvailability(req, res) {
        try {
            const { is_available } = req.body;
            const result = await riderService_1.default.updateAvailability(req.user.id, is_available);
            return (0, response_1.successResponse)(res, result, 'Availability updated');
        }
        catch (error) {
            console.error('Update availability error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async getEarnings(req, res) {
        try {
            const earnings = await riderService_1.default.getEarnings(req.user.id);
            return (0, response_1.successResponse)(res, earnings);
        }
        catch (error) {
            console.error('Get earnings error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
}
exports.RiderController = RiderController;
exports.default = new RiderController();
//# sourceMappingURL=riderController.js.map