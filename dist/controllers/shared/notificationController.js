"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const notification_service_1 = require("../../services/shared/notification.service");
const response_1 = require("../../utils/response");
const express_validator_1 = require("express-validator");
class NotificationController {
    async getNotifications(req, res) {
        try {
            const user = req.user;
            const { unreadOnly, page = "1", limit = "20", type } = req.query;
            const result = await notification_service_1.NotificationService.getNotifications(user.id, user.role, {
                unreadOnly: unreadOnly === "true",
                page: parseInt(page),
                limit: parseInt(limit),
                type: type,
            });
            return (0, response_1.successResponse)(res, result, "Notifications fetched successfully");
        }
        catch (error) {
            console.error("Get notifications error:", error);
            return (0, response_1.errorResponse)(res, error.message, 500);
        }
    }
    async getUnreadCount(req, res) {
        try {
            const user = req.user;
            const count = await notification_service_1.NotificationService.getUnreadCount(user.id, user.role);
            return (0, response_1.successResponse)(res, { count }, "Unread count fetched successfully");
        }
        catch (error) {
            console.error("Get unread count error:", error);
            return (0, response_1.errorResponse)(res, error.message, 500);
        }
    }
    async markAsRead(req, res) {
        try {
            const user = req.user;
            const { notificationId } = req.params;
            const notification = await notification_service_1.NotificationService.markAsRead(notificationId, user.id);
            return (0, response_1.successResponse)(res, { notification }, "Notification marked as read");
        }
        catch (error) {
            console.error("Mark as read error:", error);
            return (0, response_1.errorResponse)(res, error.message, 500);
        }
    }
    async markAllAsRead(req, res) {
        try {
            const user = req.user;
            await notification_service_1.NotificationService.markAllAsRead(user.id, user.role);
            return (0, response_1.successResponse)(res, {}, "All notifications marked as read");
        }
        catch (error) {
            console.error("Mark all as read error:", error);
            return (0, response_1.errorResponse)(res, error.message, 500);
        }
    }
    async sendTestNotification(req, res) {
        try {
            const user = req.user;
            await notification_service_1.NotificationService.sendTestNotification(user.id, user.role);
            return (0, response_1.successResponse)(res, {}, "Test notification sent");
        }
        catch (error) {
            console.error("Mark all as read error:", error);
            return (0, response_1.errorResponse)(res, error.message, 500);
        }
    }
    async deleteNotification(req, res) {
        try {
            const user = req.user;
            const { notificationId } = req.params;
            await notification_service_1.NotificationService.deleteNotification(notificationId, user.id);
            return (0, response_1.successResponse)(res, {}, "Notification deleted successfully");
        }
        catch (error) {
            console.error("Delete notification error:", error);
            return (0, response_1.errorResponse)(res, error.message, 500);
        }
    }
    async registerPushToken(req, res) {
        try {
            console.log(req.body);
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const user = req.user;
            const { fcmToken } = req.body;
            await notification_service_1.NotificationService.registerFCMToken(user.id, user.role, fcmToken);
            return (0, response_1.successResponse)(res, {}, "Push token registered successfully");
        }
        catch (error) {
            console.error("Register push token error:", error);
            return (0, response_1.errorResponse)(res, error.message, 500);
        }
    }
    async removePushToken(req, res) {
        try {
            const user = req.user;
            await notification_service_1.NotificationService.removeFCMToken(user.id, user.role);
            return (0, response_1.successResponse)(res, {}, "Push token removed successfully");
        }
        catch (error) {
            console.error("Remove push token error:", error);
            return (0, response_1.errorResponse)(res, error.message, 500);
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
//# sourceMappingURL=notificationController.js.map