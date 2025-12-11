// routes/notificationRoutes.ts
import express from "express";
import { notificationController } from "../../controllers/shared/notificationController";
import { authenticate } from "../../middleware/auth";
import { body } from "express-validator";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get notifications
router.get("/", notificationController.getNotifications);

// Get unread count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark notification as read
router.patch("/:notificationId/read", notificationController.markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", notificationController.markAllAsRead);

// Delete notification
router.delete("/:notificationId", notificationController.deleteNotification);

// Register push token
router.post(
  "/fcm-token",
  [body("fcmToken").notEmpty().withMessage("FCM token is required")],
  notificationController.registerPushToken
);

// Remove push token
router.delete("/fcm-token", notificationController.removePushToken);

// send test notification
router.post("/test", notificationController.sendTestNotification);

export default router;
