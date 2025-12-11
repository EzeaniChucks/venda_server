"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const riderController_1 = __importDefault(require("../../controllers/rider/riderController"));
const deliveryRejectionController_1 = __importDefault(require("../../controllers/rider/deliveryRejectionController"));
const locationController = __importStar(require("../../controllers/rider/locationController"));
const auth_1 = require("../../middleware/auth");
const riderVerification_1 = require("../../middleware/riderVerification");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('rider'));
router.get('/deliveries/available', riderVerification_1.requireVerifiedDocuments, riderController_1.default.getAvailableDeliveries);
router.get('/deliveries', riderVerification_1.requireVerifiedDocuments, riderController_1.default.getRiderDeliveries);
router.post('/deliveries/accept', riderVerification_1.requireVerifiedDocuments, [(0, express_validator_1.body)('order_id').isUUID()], riderController_1.default.acceptDelivery);
router.put('/deliveries/:id/status', riderVerification_1.requireVerifiedDocuments, [(0, express_validator_1.body)('status').isIn(['out_for_delivery', 'delivered'])], riderController_1.default.updateDeliveryStatus);
router.post('/deliveries/:id/reject', riderVerification_1.requireVerifiedDocuments, [(0, express_validator_1.body)('reason').notEmpty().withMessage('Rejection reason is required')], deliveryRejectionController_1.default.rejectDelivery);
router.get('/deliveries/rejections', riderVerification_1.requireVerifiedDocuments, deliveryRejectionController_1.default.getRejections);
router.get('/deliveries/available-riders', riderVerification_1.requireVerifiedDocuments, deliveryRejectionController_1.default.getAvailableRiders);
router.get('/location', locationController.getLocation);
router.put('/location', riderVerification_1.requireVerifiedDocuments, [
    (0, express_validator_1.body)('latitude').isFloat({ min: -90, max: 90 }),
    (0, express_validator_1.body)('longitude').isFloat({ min: -180, max: 180 }),
    (0, express_validator_1.body)('accuracy').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('speed').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('heading').optional().isFloat({ min: 0, max: 360 })
], locationController.updateLocation);
router.put('/availability', riderVerification_1.requireVerifiedDocuments, [(0, express_validator_1.body)('is_available').isBoolean()], riderController_1.default.updateAvailability);
router.get('/earnings', riderVerification_1.requireVerifiedDocuments, riderController_1.default.getEarnings);
exports.default = router;
//# sourceMappingURL=riderRoutes.js.map