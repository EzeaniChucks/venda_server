"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = __importDefault(require("../../controllers/vendor/orderController"));
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)("vendor"));
router.put("/:orderId/items/:itemId/status", orderController_1.default.updateOrderItemStatus);
router.put("/:orderId/items/:itemId/reject", orderController_1.default.rejectOrderItem);
router.post("/:id/reject", orderController_1.default.rejectOrder);
router.get("/rejections", orderController_1.default.getRejections);
router.get("/:orderId", orderController_1.default.getVendorOrder);
router.get("/", orderController_1.default.getVendorOrders);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map