"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const cartController_1 = __importDefault(require("../../controllers/customer/cartController"));
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('customer'));
router.get('/', cartController_1.default.getCart);
router.post('/', [
    (0, express_validator_1.body)('productId').isUUID().withMessage('Valid product ID is required'),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], cartController_1.default.addToCart);
router.put('/:id', [(0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')], cartController_1.default.updateCartItem);
router.delete('/:id', cartController_1.default.removeFromCart);
router.delete('/', cartController_1.default.clearCart);
exports.default = router;
//# sourceMappingURL=cartRoutes.js.map