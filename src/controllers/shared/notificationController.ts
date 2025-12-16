// controllers/notificationController.ts
import { Request, Response } from "express";
import { NotificationService } from "../../services/shared/notification.service";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "../../utils/response";
import { validationResult } from "express-validator";
import { authenticate } from "../../middleware/auth";

export class NotificationController {
  // Get notifications
  async getNotifications(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      const { unreadOnly, page = "1", limit = "20", type } = req.query;

      const result = await NotificationService.getNotifications(
        user.id,
        user.role,
        {
          unreadOnly: unreadOnly === "true",
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          type: type as any,
        }
      );

      return successResponse(res, result, "Notifications fetched successfully");
    } catch (error) {
      console.error("Get notifications error:", error);
      return errorResponse(res, (error as Error).message, 500);
    }
  }

  // Get unread count
  async getUnreadCount(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      const count = await NotificationService.getUnreadCount(
        user.id,
        user.role
      );

      return successResponse(
        res,
        { count },
        "Unread count fetched successfully"
      );
    } catch (error) {
      console.error("Get unread count error:", error);
      return errorResponse(res, (error as Error).message, 500);
    }
  }

  // Mark notification as read
  async markAsRead(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      const { notificationId } = req.params;

      const notification = await NotificationService.markAsRead(
        notificationId,
        user.id
      );

      return successResponse(
        res,
        { notification },
        "Notification marked as read"
      );
    } catch (error) {
      console.error("Mark as read error:", error);
      return errorResponse(res, (error as Error).message, 500);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      await NotificationService.markAllAsRead(user.id, user.role);

      return successResponse(res, {}, "All notifications marked as read");
    } catch (error) {
      console.error("Mark all as read error:", error);
      return errorResponse(res, (error as Error).message, 500);
    }
  }

  // Mark all notifications as read
  async sendTestNotification(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      await NotificationService.sendTestNotification(user.id, user.role);

      return successResponse(res, {}, "Test notification sent");
    } catch (error) {
      console.error("Mark all as read error:", error);
      return errorResponse(res, (error as Error).message, 500);
    }
  }

  // Delete notification
  async deleteNotification(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      const { notificationId } = req.params;

      await NotificationService.deleteNotification(notificationId, user.id);

      return successResponse(res, {}, "Notification deleted successfully");
    } catch (error) {
      console.error("Delete notification error:", error);
      return errorResponse(res, (error as Error).message, 500);
    }
  }

  // Register push token
  async registerPushToken(req: Request, res: Response): Promise<Response> {
    try {
      // console.log(req.body)
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const user = (req as any).user;
      const { fcmToken, deviceOs } = req.body;

      await NotificationService.registerFCMToken(
        user.id,
        user.role,
        fcmToken,
        deviceOs
      );

      return successResponse(res, {}, "Push token registered successfully");
    } catch (error) {
      console.error("Register push token error:", error);
      return errorResponse(res, (error as Error).message, 500);
    }
  }

  // Remove push token
  async removePushToken(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;
      await NotificationService.removeFCMToken(user.id, user.role);

      return successResponse(res, {}, "Push token removed successfully");
    } catch (error) {
      console.error("Remove push token error:", error);
      return errorResponse(res, (error as Error).message, 500);
    }
  }
}

export const notificationController = new NotificationController();
