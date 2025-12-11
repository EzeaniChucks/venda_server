"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../../controllers/shared/notificationController");
const auth_1 = require("../../middleware/auth");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.get("/", notificationController_1.notificationController.getNotifications);
router.get("/unread-count", notificationController_1.notificationController.getUnreadCount);
router.patch("/:notificationId/read", notificationController_1.notificationController.markAsRead);
router.patch("/mark-all-read", notificationController_1.notificationController.markAllAsRead);
router.delete("/:notificationId", notificationController_1.notificationController.deleteNotification);
router.post("/fcm-token", [(0, express_validator_1.body)("fcmToken").notEmpty().withMessage("FCM token is required")], notificationController_1.notificationController.registerPushToken);
router.delete("/fcm-token", notificationController_1.notificationController.removePushToken);
router.post("/test", notificationController_1.notificationController.sendTestNotification);
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map