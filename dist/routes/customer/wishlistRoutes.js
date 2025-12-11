"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wishlistController_1 = __importDefault(require("../../controllers/customer/wishlistController"));
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('customer'));
router.get('/', wishlistController_1.default.getWishlist);
router.post('/', wishlistController_1.default.addToWishlist);
router.delete('/:id', wishlistController_1.default.removeFromWishlist);
router.get('/check/:productId', wishlistController_1.default.checkWishlist);
exports.default = router;
//# sourceMappingURL=wishlistRoutes.js.map