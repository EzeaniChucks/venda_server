// services/notificationService.ts
import { Customer, Rider, Vendor } from "../../entities";
import { AppDataSource } from "../../config/data-source";
import { getOrderTrackingSocket } from "../../sockets/orderTracking.socket";
import { Order, OrderStatus } from "../../entities/Order";
import admin from "firebase-admin";
import { FIREBASE_APPS } from "../../config/firebase-service-account";
import { Notification, NotificationType } from "../../entities/Notification";
import { IsNull, MoreThanOrEqual, Not } from "typeorm";
import { AppError } from "../../utils/error";

const notificationRepo = AppDataSource.getRepository(Notification);
const vendorRepository = AppDataSource.getRepository(Vendor);
const customerRepository = AppDataSource.getRepository(Customer);
const riderRepository = AppDataSource.getRepository(Rider);

// Initialize multiple Firebase apps
const firebaseApps = new Map<string, admin.app.App>();

Object.entries(FIREBASE_APPS).forEach(([entity, platforms]) => {
  Object.entries(platforms).forEach(([platform, config]) => {
    const appName = `${entity}_${platform}`;

    if (admin.apps.some((app) => app?.name === appName)) return;

    try {
      const app = admin.initializeApp(
        {
          credential: admin.credential.cert({
            projectId: config.projectId,
            clientEmail: config.clientEmail,
            privateKey: config.privateKey,
          }),
        },
        appName
      );
      firebaseApps.set(appName, app);
    } catch (error) {
      console.error(`Failed to initialize ${appName}:`, error);
    }
  });
});

export class NotificationService {
  /**
   * Create and send a notification (Core method)
   */
  static async createAndSendNotification({
    entityId,
    entityType,
    title,
    message,
    type,
    data,
    actionUrl,
  }: {
    entityId: string;
    entityType: "customer" | "vendor" | "rider";
    title: string;
    message: string;
    type: NotificationType;
    data?: any;
    actionUrl?: string;
  }): Promise<Notification> {
    try {
      const notification = notificationRepo.create({
        entityId,
        entityType,
        title,
        message,
        type,
        data,
        actionUrl,
        read: false,
      });

      const savedNotification = await notificationRepo.save(notification);

      // Send via Socket.io for real-time updates
      try {
        const socket = getOrderTrackingSocket();
        socket.emitNotification(entityId, entityType, savedNotification);
      } catch (error) {
        console.log(
          "Socket not available, continuing with Firebase notification"
        );
      }

      // Send push notification via Firebase
      await this.sendFirebaseNotification(savedNotification);

      return savedNotification;
    } catch (error: any) {
      console.error("Create notification error:", error);
      throw error;
    }
  }

  /**
   * Send Firebase Cloud Messaging notification with multi-app support
   */
  static async sendFirebaseNotification(
    notification: Notification
  ): Promise<void> {
    let fcmToken: string | null = null;
    let deviceOs: "ANDROID" | "IOS" | "WEB" | null = null;

    // Get user's FCM token and device OS based on entity type
    switch (notification.entityType) {
      case "vendor":
        const vendor = await vendorRepository.findOne({
          where: { id: notification.entityId },
          select: ["fcmToken", "deviceOs"],
        });
        fcmToken = vendor?.fcmToken || null;
        deviceOs = vendor?.deviceOs || null;
        break;
      case "customer":
        const customer = await customerRepository.findOne({
          where: { id: notification.entityId },
          select: ["fcmToken", "deviceOs"],
        });
        fcmToken = customer?.fcmToken || null;
        deviceOs = customer?.deviceOs || null;
        break;
      case "rider":
        const rider = await riderRepository.findOne({
          where: { id: notification.entityId },
          select: ["fcmToken", "deviceOs"],
        });
        fcmToken = rider?.fcmToken || null;
        deviceOs = rider?.deviceOs || null;
        break;
    }

    if (!fcmToken) {
      console.log("No FCM token found for user");
      return;
    }

    if (!deviceOs) {
      console.log("No device OS info, using default Firebase app");
      deviceOs = "ANDROID"; // Default fallback
    }

    // Use the appropriate Firebase app based on entity and OS
    const entityUpper = notification.entityType.toUpperCase() as
      | "VENDOR"
      | "CUSTOMER"
      | "RIDER";
    const appName = `${entityUpper}_${deviceOs}`;
    const app = firebaseApps.get(appName) || admin.app();

    const messagePayload = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.message,
      },
      data: {
        notificationId: notification.id,
        type: notification.type,
        actionUrl: notification.actionUrl || "",
        ...notification.data,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        screen: notification.actionUrl?.replace("/", "") || "Home",
        id: notification.data?.orderId || notification.data?.productId || "",
      },
      android: {
        priority: "high" as const,
        notification: {
          channelId: this.getChannelId(notification.type),
          sound: "default",
          icon: "notification_icon",
          color: "#FF5722",
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.message,
            },
            sound: "default",
            badge: 1,
            mutableContent: true,
            category: notification.type,
          },
        },
        headers: {
          "apns-push-type": "alert",
          "apns-priority": "10",
          "apns-topic": this.getApnsTopic(entityUpper, deviceOs),
        },
      },
    };

    try {
      const response = await app.messaging().send(messagePayload);
      console.log("Firebase notification sent successfully:", response);
    } catch (error: any) {
      console.error("Error sending Firebase notification:", error);

      // If token is invalid, remove it from database
      if (
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        await this.removeInvalidFCMToken(
          notification.entityId,
          notification.entityType
        );
      }
    }
  }

  /**
   * Get Android channel ID based on notification type
   */
  private static getChannelId(type: NotificationType): string {
    const channels: Record<NotificationType, string> = {
      order_update: "order_updates",
      payment: "payment_updates",
      promotion: "promotions",
      account: "account_updates",
      general: "general",
    };
    return channels[type] || "general";
  }

  /**
   * Get APNS topic based on entity and platform
   */
  private static getApnsTopic(
    entity: "VENDOR" | "CUSTOMER" | "RIDER",
    platform: "ANDROID" | "IOS" | "WEB"
  ): string {
    if (platform !== "IOS") return "";
    const bundleIds: Record<string, string> = {
      VENDOR: "com.yourapp.vendor",
      CUSTOMER: "com.yourapp.customer",
      RIDER: "com.yourapp.rider",
    };
    return bundleIds[entity] || "";
  }

  /**
   * Remove invalid FCM token
   */
  static async removeInvalidFCMToken(
    entityId: string,
    entityType: string
  ): Promise<void> {
    switch (entityType) {
      case "vendor":
        await vendorRepository.update(entityId, {
          fcmToken: null,
          fcmTokenUpdatedAt: new Date(),
        });
        break;
      case "customer":
        await customerRepository.update(entityId, {
          fcmToken: null,
          fcmTokenUpdatedAt: new Date(),
        });
        break;
      case "rider":
        await riderRepository.update(entityId, {
          fcmToken: null,
          fcmTokenUpdatedAt: new Date(),
        });
        break;
    }
  }

  /**
   * Get notifications for an entity
   */
  static async getNotifications(
    entityId: string,
    entityType: "customer" | "vendor" | "rider",
    options: {
      unreadOnly?: boolean;
      page?: number;
      limit?: number;
      type?: NotificationType;
    } = {}
  ): Promise<{
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { unreadOnly = false, page = 1, limit = 20, type } = options;

    const where: any = { entityId, entityType };

    if (unreadOnly) {
      where.read = false;
    }

    if (type) {
      where.type = type;
    }

    const [notifications, total] = await notificationRepo.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(
    notificationId: string,
    entityId: string
  ): Promise<Notification> {
    const notification = await notificationRepo.findOne({
      where: { id: notificationId, entityId },
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    notification.read = true;
    return await notificationRepo.save(notification);
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(
    entityId: string,
    entityType: "customer" | "vendor" | "rider"
  ): Promise<{ success: boolean }> {
    await notificationRepo.update(
      { entityId, entityType, read: false },
      { read: true }
    );

    return { success: true };
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(
    entityId: string,
    entityType: "customer" | "vendor" | "rider"
  ): Promise<number> {
    const count = await notificationRepo.count({
      where: { entityId, entityType, read: false },
    });

    return count;
  }

  /**
   * Delete notification
   */
  static async deleteNotification(
    notificationId: string,
    entityId: string
  ): Promise<void> {
    const result = await notificationRepo.delete({
      id: notificationId,
      entityId,
    });

    if (result.affected === 0) {
      throw new AppError("Notification not found or access denied", 404);
    }
  }

  /**
   * Register FCM token with device OS
   */
  static async registerFCMToken(
    entityId: string,
    entityType: "customer" | "vendor" | "rider",
    fcmToken: string,
    deviceOs?: "ANDROID" | "IOS" | "WEB"
  ): Promise<void> {
    if (!fcmToken || fcmToken.length < 10) {
      throw new AppError("Invalid FCM token", 404);
    }

    const updateData: any = { fcmToken, fcmTokenUpdatedAt: new Date() };
    if (deviceOs) {
      updateData.deviceOs = deviceOs;
    }

    switch (entityType) {
      case "vendor":
        await vendorRepository.update(entityId, updateData);
        break;
      case "customer":
        await customerRepository.update(entityId, updateData);
        break;
      case "rider":
        await riderRepository.update(entityId, updateData);
        break;
      default:
        throw new AppError("Invalid entity type");
    }
  }

  /**
   * Remove FCM token
   */
  static async removeFCMToken(
    entityId: string,
    entityType: "customer" | "vendor" | "rider"
  ): Promise<void> {
    switch (entityType) {
      case "vendor":
        await vendorRepository.update(entityId, {
          fcmToken: null,
          fcmTokenUpdatedAt: new Date(),
        });
        break;
      case "customer":
        await customerRepository.update(entityId, {
          fcmToken: null,
          fcmTokenUpdatedAt: new Date(),
        });
        break;
      case "rider":
        await riderRepository.update(entityId, {
          fcmToken: null,
          fcmTokenUpdatedAt: new Date(),
        });
        break;
    }
  }

  /**
   * Send notifications to multiple users (broadcast)
   */
  static async sendBulkNotifications(
    entityIds: string[],
    entityType: "customer" | "vendor" | "rider",
    title: string,
    message: string,
    type: NotificationType = "general",
    data?: any
  ): Promise<void> {
    const batchSize = 100;
    for (let i = 0; i < entityIds.length; i += batchSize) {
      const batch = entityIds.slice(i, i + batchSize);
      const promises = batch.map((entityId) =>
        this.createAndSendNotification({
          entityId,
          entityType,
          title,
          message,
          type,
          data,
        })
      );
      await Promise.all(promises);
    }
  }

  /**
   * Send to all users of a type
   */
  static async broadcastToAll(
    entityType: "customer" | "vendor" | "rider",
    title: string,
    message: string,
    type: NotificationType = "general",
    data?: any
  ): Promise<void> {
    let repository;
    switch (entityType) {
      case "vendor":
        repository = vendorRepository;
        break;
      case "customer":
        repository = customerRepository;
        break;
      case "rider":
        repository = riderRepository;
        break;
      default:
        throw new AppError("Invalid entity type");
    }

    const users = await repository.find({
      where: { fcmToken: Not(IsNull()) },
      select: ["id"],
    });
    const userIds = users.map((user: any) => user.id);

    await this.sendBulkNotifications(
      userIds,
      entityType,
      title,
      message,
      type,
      data
    );
  }

  /**
   * Send to users in a specific region
   */
  static async sendToRegion(
    entityType: "customer" | "vendor" | "rider",
    region: string,
    title: string,
    message: string,
    type: NotificationType = "general",
    data?: any
  ): Promise<void> {
    let repository;
    switch (entityType) {
      case "vendor":
        repository = vendorRepository;
        break;
      case "customer":
        repository = customerRepository;
        break;
      case "rider":
        repository = riderRepository;
        break;
      default:
        throw new AppError("Invalid entity type");
    }

    const users = await repository.find({
      where: { fcmToken: Not(IsNull()) },
      select: ["id"],
    });
    const userIds = users.map((user: any) => user.id);

    await this.sendBulkNotifications(
      userIds,
      entityType,
      title,
      message,
      type,
      data
    );
  }

  /**
   * NOTIFICATION TEMPLATES
   * IMPORTANT: Use valid NotificationType values for database storage
   */

  /**
   * Create order update notification
   */
  static async createOrderUpdateNotification(
    entityId: string,
    entityType: "customer" | "vendor" | "rider",
    orderId: string,
    status: OrderStatus,
    actor?: "vendor" | "rider" | "customer" | "admin"
  ): Promise<Notification> {
    const { title, body } = this.getOrderStatusMessage(orderId, status, actor);

    return this.createAndSendNotification({
      entityId,
      entityType,
      title,
      message: body,
      type: "order_update", // Valid type from NotificationType
      data: {
        orderId,
        status,
        actor,
        timestamp: new Date().toISOString(),
      },
      actionUrl: `/orders/${orderId}`,
    });
  }

  /**
   * Create payment notification
   */
  static async createPaymentNotification(
    entityId: string,
    entityType: "customer" | "vendor" | "rider",
    amount: number,
    type: "credit" | "debit" | "withdrawal",
    reference: string
  ): Promise<Notification> {
    const typeMessages = {
      credit: {
        title: "💰 Payment Received",
        body: `₦${amount.toLocaleString()} has been credited to your account.`,
      },
      debit: {
        title: "💳 Payment Made",
        body: `₦${amount.toLocaleString()} has been deducted from your account.`,
      },
      withdrawal: {
        title: "🏧 Withdrawal Successful",
        body: `₦${amount.toLocaleString()} has been processed to your bank account.`,
      },
    };

    return this.createAndSendNotification({
      entityId,
      entityType,
      title: typeMessages[type].title,
      message: `${typeMessages[type].body} Reference: ${reference}`,
      type: "payment", // Valid type from NotificationType
      data: {
        amount,
        type,
        reference,
        currency: "NGN",
        timestamp: new Date().toISOString(),
      },
      actionUrl: "/wallet",
    });
  }

  /**
   * Create promotion notification
   */
  static async createPromotionNotification(
    entityId: string,
    entityType: "customer" | "vendor" | "rider",
    title: string,
    message: string,
    promotionId?: string
  ): Promise<Notification> {
    return this.createAndSendNotification({
      entityId,
      entityType,
      title,
      message,
      type: "promotion", // Valid type from NotificationType
      data: { promotionId },
      actionUrl: promotionId ? `/promotions/${promotionId}` : "/promotions",
    });
  }

  /**
   * Create account notification
   */
  static async createAccountNotification(
    entityId: string,
    entityType: "customer" | "vendor" | "rider",
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<Notification> {
    return this.createAndSendNotification({
      entityId,
      entityType,
      title,
      message,
      type: "account", // Valid type from NotificationType
      actionUrl,
    });
  }

  /**
   * Create product approval notification (uses 'account' type)
   */
  static async createProductApprovalNotification(
    vendorId: string,
    productId: string,
    productName: string,
    isApproved: boolean,
    reason?: string
  ): Promise<Notification> {
    const title = isApproved ? "✅ Product Approved" : "❌ Product Rejected";
    const message = isApproved
      ? `"${productName}" has been approved and is now live on the marketplace!`
      : `"${productName}" was rejected. ${
          reason || "Please review and resubmit."
        }`;

    return this.createAndSendNotification({
      entityId: vendorId,
      entityType: "vendor",
      title,
      message,
      type: "account", // Using 'account' type since product_approval doesn't exist in NotificationType
      data: {
        productId,
        productName,
        isApproved,
        reason,
        timestamp: new Date().toISOString(),
      },
      actionUrl: `/products/${productId}`,
    });
  }

  /**
   * Create low stock notification (uses 'account' type)
   */
  static async createLowStockNotification(
    vendorId: string,
    productId: string,
    productName: string,
    currentStock: number
  ): Promise<Notification> {
    const title = "⚠️ Low Stock Alert";
    const message = `"${productName}" is running low. Current stock: ${currentStock}. Consider restocking soon.`;

    return this.createAndSendNotification({
      entityId: vendorId,
      entityType: "vendor",
      title,
      message,
      type: "account", // Using 'account' type
      data: {
        productId,
        productName,
        currentStock,
        timestamp: new Date().toISOString(),
      },
      actionUrl: `/products/${productId}`,
    });
  }

  /**
   * Create vendor verification notification (uses 'account' type)
   */
  static async createVendorVerificationNotification(
    vendorId: string,
    businessName: string,
    isVerified: boolean,
    verificationType: "business" | "identity" | "bank"
  ): Promise<Notification> {
    const title = isVerified
      ? "✅ Verification Complete"
      : "❌ Verification Failed";
    const messages = {
      business: `Your business "${businessName}" has been ${
        isVerified ? "verified" : "rejected for verification"
      }.`,
      identity: `Your identity verification has been ${
        isVerified ? "completed" : "rejected"
      }.`,
      bank: `Your bank account verification has been ${
        isVerified ? "completed" : "rejected"
      }.`,
    };

    return this.createAndSendNotification({
      entityId: vendorId,
      entityType: "vendor",
      title,
      message: messages[verificationType],
      type: "account", // Using 'account' type
      data: {
        businessName,
        isVerified,
        verificationType,
        timestamp: new Date().toISOString(),
      },
      actionUrl: isVerified ? "/vendor/dashboard" : "/vendor/verification",
    });
  }

  /**
   * Create subscription notification (uses 'account' type)
   */
  static async createSubscriptionNotification(
    vendorId: string,
    subscriptionTier: string,
    action: "activated" | "expired" | "renewed" | "cancelled",
    expiryDate?: Date
  ): Promise<Notification> {
    const titles = {
      activated: "🎉 Subscription Activated",
      expired: "⚠️ Subscription Expired",
      renewed: "🔄 Subscription Renewed",
      cancelled: "❌ Subscription Cancelled",
    };

    const messages = {
      activated: `Your ${subscriptionTier} subscription has been activated!`,
      expired: `Your ${subscriptionTier} subscription has expired. Please renew to continue enjoying premium features.`,
      renewed: `Your ${subscriptionTier} subscription has been renewed successfully.`,
      cancelled: `Your ${subscriptionTier} subscription has been cancelled.`,
    };

    return this.createAndSendNotification({
      entityId: vendorId,
      entityType: "vendor",
      title: titles[action],
      message: expiryDate
        ? `${messages[action]} Expires on: ${expiryDate.toLocaleDateString()}`
        : messages[action],
      type: "account", // Using 'account' type
      data: {
        subscriptionTier,
        action,
        expiryDate,
        timestamp: new Date().toISOString(),
      },
      actionUrl: "/vendor/subscription",
    });
  }

  /**
   * HELPER METHODS
   */

  /**
   * Get order status messages for fashion e-commerce
   */
  private static getOrderStatusMessage(
    orderId: string,
    status: OrderStatus,
    actor?: "vendor" | "rider" | "customer" | "admin"
  ): { title: string; body: string } {
    const shortOrderId = orderId.substring(0, 8).toUpperCase();

    const messages: Record<OrderStatus, { title: string; body: string }> = {
      pending: {
        title: "🛍️ Order Received",
        body: `Your fashion order #${shortOrderId} has been received and is being processed.`,
      },
      confirmed: {
        title: "✅ Order Confirmed",
        body: `Vendor has confirmed your order #${shortOrderId}.`,
      },
      processing: {
        title: "✂️ Order Processing",
        body: `Your fashion items for order #${shortOrderId} are being prepared.`,
      },
      ready_for_pickup: {
        title: "📦 Ready for Pickup",
        body: `Your order #${shortOrderId} is ready at the vendor's store.`,
      },
      dispatched: {
        title: "🚚 Order Dispatched",
        body: `Your fashion order #${shortOrderId} is on its way to you!`,
      },
      out_for_delivery: {
        title: "🏍️ Out for Delivery",
        body: `Rider is delivering your order #${shortOrderId}. Estimated delivery: 30-45 mins.`,
      },
      delivered: {
        title: "🎉 Order Delivered",
        body: `Your fashion order #${shortOrderId} has been delivered. Enjoy your purchase!`,
      },
      cancelled: {
        title: "❌ Order Cancelled",
        body: `Order #${shortOrderId} was cancelled${
          actor ? ` by ${actor}` : ""
        }.`,
      },
      returned: {
        title: "↩️ Order Returned",
        body: `Order #${shortOrderId} has been returned to the vendor.`,
      },
      refunded: {
        title: "💸 Refund Processed",
        body: `Refund for order #${shortOrderId} has been processed to your account.`,
      },
    };

    return (
      messages[status] || {
        title: "📦 Order Update",
        body: `Your order #${shortOrderId} status has been updated.`,
      }
    );
  }

  /**
   * Clean up old notifications (cron job)
   */
  static async cleanupOldNotifications(days: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    await notificationRepo
      .createQueryBuilder()
      .delete()
      .where("created_at < :cutoffDate", { cutoffDate })
      .andWhere("read = true")
      .execute();
  }

  /**
   * Get notification statistics
   */
  static async getStatistics(
    entityId: string,
    entityType: "customer" | "vendor" | "rider",
    period: "day" | "week" | "month" = "month"
  ): Promise<any> {
    const date = new Date();
    switch (period) {
      case "day":
        date.setDate(date.getDate() - 1);
        break;
      case "week":
        date.setDate(date.getDate() - 7);
        break;
      case "month":
        date.setMonth(date.getMonth() - 1);
        break;
    }

    const [total, unread, byType] = await Promise.all([
      notificationRepo.count({
        where: {
          entityId,
          entityType,
          createdAt: MoreThanOrEqual(date),
        },
      }),
      notificationRepo.count({
        where: {
          entityId,
          entityType,
          read: false,
          createdAt: MoreThanOrEqual(date),
        },
      }),
      notificationRepo
        .createQueryBuilder("notification")
        .select("notification.type, COUNT(*) as count")
        .where("notification.entityId = :entityId", { entityId })
        .andWhere("notification.entityType = :entityType", { entityType })
        .andWhere("notification.created_at >= :date", { date })
        .groupBy("notification.type")
        .getRawMany(),
    ]);

    return {
      total,
      unread,
      read: total - unread,
      byType: byType.reduce((acc: Record<string, number>, item: any) => {
        acc[item.type] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  /**
   * Send test notification
   */
  static async sendTestNotification(
    entityId: string,
    entityType: "customer" | "vendor" | "rider"
  ): Promise<Notification> {
    const title = "🔔 Test Notification";
    const message = "This is a test notification from the system.";

    return this.createAndSendNotification({
      entityId,
      entityType,
      title,
      message,
      type: "general",
      data: { test: true, timestamp: new Date().toISOString() },
    });
  }
}
