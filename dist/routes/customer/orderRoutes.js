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
const orderController_1 = __importDefault(require("../../controllers/customer/orderController"));
const riderLocationController = __importStar(require("../../controllers/rider/locationController"));
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('customer'));
router.post('/', [
    (0, express_validator_1.body)('delivery_address').trim().notEmpty(),
    (0, express_validator_1.body)('delivery_phone').trim().notEmpty(),
    (0, express_validator_1.body)('payment_method').isIn(['wallet', 'card', 'transfer', 'cash'])
], orderController_1.default.createOrder);
router.get('/', orderController_1.default.getUserOrders);
router.get('/:id', orderController_1.default.getOrderById);
router.get('/:id/rider-location', riderLocationController.getRiderLocationForOrder);
router.post('/:id/cancel', orderController_1.default.cancelOrder);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map