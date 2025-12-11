"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const entities_1 = require("../../entities");
const data_source_1 = require("../../config/data-source");
const orderTracking_socket_1 = require("../../sockets/orderTracking.socket");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebase_service_account_1 = require("../../config/firebase-service-account");
const Notification_1 = require("../../entities/Notification");
const typeorm_1 = require("typeorm");
const error_1 = require("../../utils/error");
const notificationRepo = data_source_1.AppDataSource.getRepository(Notification_1.Notification);
const vendorRepository = data_source_1.AppDataSource.getRepository(entities_1.Vendor);
const customerRepository = data_source_1.AppDataSource.getRepository(entities_1.Customer);
const riderRepository = data_source_1.AppDataSource.getRepository(entities_1.Rider);
const firebaseApps = new Map();
Object.entries(firebase_service_account_1.FIREBASE_APPS).forEach(([entity, platforms]) => {
    Object.entries(platforms).forEach(([platform, config]) => {
        const appName = `${entity}_${platform}`;
        if (firebase_admin_1.default.apps.some((app) => app?.name === appName))
            return;
        try {
            const app = firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert({
                    projectId: config.projectId,
                    clientEmail: config.clientEmail,
                    privateKey: config.privateKey,
                }),
            }, appName);
            firebaseApps.set(appName, app);
        }
        catch (error) {
            console.error(`Failed to initialize ${appName}:`, error);
        }
    });
});
class NotificationService {
    static async createAndSendNotification({ entityId, entityType, title, message, type, data, actionUrl, }) {
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
            try {
                const socket = (0, orderTracking_socket_1.getOrderTrackingSocket)();
                socket.emitNotification(entityId, entityType, savedNotification);
            }
            catch (error) {
                console.log("Socket not available, continuing with Firebase notification");
            }
            await this.sendFirebaseNotification(savedNotification);
            return savedNotification;
        }
        catch (error) {
            console.error("Create notification error:", error);
            throw error;
        }
    }
    static async sendFirebaseNotification(notification) {
        let fcmToken = null;
        let deviceOs = null;
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
            deviceOs = "ANDROID";
        }
        const entityUpper = notification.entityType.toUpperCase();
        const appName = `${entityUpper}_${deviceOs}`;
        const app = firebaseApps.get(appName) || firebase_admin_1.default.app();
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
                priority: "high",
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
        }
        catch (error) {
            console.error("Error sending Firebase notification:", error);
            if (error.code === "messaging/invalid-registration-token" ||
                error.code === "messaging/registration-token-not-registered") {
                await this.removeInvalidFCMToken(notification.entityId, notification.entityType);
            }
        }
    }
    static getChannelId(type) {
        const channels = {
            order_update: "order_updates",
            payment: "payment_updates",
            promotion: "promotions",
            account: "account_updates",
            general: "general",
        };
        return channels[type] || "general";
    }
    static getApnsTopic(entity, platform) {
        if (platform !== "IOS")
            return "";
        const bundleIds = {
            VENDOR: "com.yourapp.vendor",
            CUSTOMER: "com.yourapp.customer",
            RIDER: "com.yourapp.rider",
        };
        return bundleIds[entity] || "";
    }
    static async removeInvalidFCMToken(entityId, entityType) {
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
    static async getNotifications(entityId, entityType, options = {}) {
        const { unreadOnly = false, page = 1, limit = 20, type } = options;
        const where = { entityId, entityType };
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
    static async markAsRead(notificationId, entityId) {
        const notification = await notificationRepo.findOne({
            where: { id: notificationId, entityId },
        });
        if (!notification) {
            throw new error_1.AppError("Notification not found", 404);
        }
        notification.read = true;
        return await notificationRepo.save(notification);
    }
    static async markAllAsRead(entityId, entityType) {
        await notificationRepo.update({ entityId, entityType, read: false }, { read: true });
        return { success: true };
    }
    static async getUnreadCount(entityId, entityType) {
        const count = await notificationRepo.count({
            where: { entityId, entityType, read: false },
        });
        return count;
    }
    static async deleteNotification(notificationId, entityId) {
        const result = await notificationRepo.delete({
            id: notificationId,
            entityId,
        });
        if (result.affected === 0) {
            throw new error_1.AppError("Notification not found or access denied", 404);
        }
    }
    static async registerFCMToken(entityId, entityType, fcmToken, deviceOs) {
        if (!fcmToken || fcmToken.length < 10) {
            throw new error_1.AppError("Invalid FCM token", 404);
        }
        const updateData = { fcmToken, fcmTokenUpdatedAt: new Date() };
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
                throw new error_1.AppError("Invalid entity type");
        }
    }
    static async removeFCMToken(entityId, entityType) {
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
    static async sendBulkNotifications(entityIds, entityType, title, message, type = "general", data) {
        const batchSize = 100;
        for (let i = 0; i < entityIds.length; i += batchSize) {
            const batch = entityIds.slice(i, i + batchSize);
            const promises = batch.map((entityId) => this.createAndSendNotification({
                entityId,
                entityType,
                title,
                message,
                type,
                data,
            }));
            await Promise.all(promises);
        }
    }
    static async broadcastToAll(entityType, title, message, type = "general", data) {
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
                throw new error_1.AppError("Invalid entity type");
        }
        const users = await repository.find({
            where: { fcmToken: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) },
            select: ["id"],
        });
        const userIds = users.map((user) => user.id);
        await this.sendBulkNotifications(userIds, entityType, title, message, type, data);
    }
    static async sendToRegion(entityType, region, title, message, type = "general", data) {
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
                throw new error_1.AppError("Invalid entity type");
        }
        const users = await repository.find({
            where: { fcmToken: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) },
            select: ["id"],
        });
        const userIds = users.map((user) => user.id);
        await this.sendBulkNotifications(userIds, entityType, title, message, type, data);
    }
    static async createOrderUpdateNotification(entityId, entityType, orderId, status, actor) {
        const { title, body } = this.getOrderStatusMessage(orderId, status, actor);
        return this.createAndSendNotification({
            entityId,
            entityType,
            title,
            message: body,
            type: "order_update",
            data: {
                orderId,
                status,
                actor,
                timestamp: new Date().toISOString(),
            },
            actionUrl: `/orders/${orderId}`,
        });
    }
    static async createPaymentNotification(entityId, entityType, amount, type, reference) {
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
            type: "payment",
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
    static async createPromotionNotification(entityId, entityType, title, message, promotionId) {
        return this.createAndSendNotification({
            entityId,
            entityType,
            title,
            message,
            type: "promotion",
            data: { promotionId },
            actionUrl: promotionId ? `/promotions/${promotionId}` : "/promotions",
        });
    }
    static async createAccountNotification(entityId, entityType, title, message, actionUrl) {
        return this.createAndSendNotification({
            entityId,
            entityType,
            title,
            message,
            type: "account",
            actionUrl,
        });
    }
    static async createProductApprovalNotification(vendorId, productId, productName, isApproved, reason) {
        const title = isApproved ? "✅ Product Approved" : "❌ Product Rejected";
        const message = isApproved
            ? `"${productName}" has been approved and is now live on the marketplace!`
            : `"${productName}" was rejected. ${reason || "Please review and resubmit."}`;
        return this.createAndSendNotification({
            entityId: vendorId,
            entityType: "vendor",
            title,
            message,
            type: "account",
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
    static async createLowStockNotification(vendorId, productId, productName, currentStock) {
        const title = "⚠️ Low Stock Alert";
        const message = `"${productName}" is running low. Current stock: ${currentStock}. Consider restocking soon.`;
        return this.createAndSendNotification({
            entityId: vendorId,
            entityType: "vendor",
            title,
            message,
            type: "account",
            data: {
                productId,
                productName,
                currentStock,
                timestamp: new Date().toISOString(),
            },
            actionUrl: `/products/${productId}`,
        });
    }
    static async createVendorVerificationNotification(vendorId, businessName, isVerified, verificationType) {
        const title = isVerified
            ? "✅ Verification Complete"
            : "❌ Verification Failed";
        const messages = {
            business: `Your business "${businessName}" has been ${isVerified ? "verified" : "rejected for verification"}.`,
            identity: `Your identity verification has been ${isVerified ? "completed" : "rejected"}.`,
            bank: `Your bank account verification has been ${isVerified ? "completed" : "rejected"}.`,
        };
        return this.createAndSendNotification({
            entityId: vendorId,
            entityType: "vendor",
            title,
            message: messages[verificationType],
            type: "account",
            data: {
                businessName,
                isVerified,
                verificationType,
                timestamp: new Date().toISOString(),
            },
            actionUrl: isVerified ? "/vendor/dashboard" : "/vendor/verification",
        });
    }
    static async createSubscriptionNotification(vendorId, subscriptionTier, action, expiryDate) {
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
            type: "account",
            data: {
                subscriptionTier,
                action,
                expiryDate,
                timestamp: new Date().toISOString(),
            },
            actionUrl: "/vendor/subscription",
        });
    }
    static getOrderStatusMessage(orderId, status, actor) {
        const shortOrderId = orderId.substring(0, 8).toUpperCase();
        const messages = {
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
                body: `Order #${shortOrderId} was cancelled${actor ? ` by ${actor}` : ""}.`,
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
        return (messages[status] || {
            title: "📦 Order Update",
            body: `Your order #${shortOrderId} status has been updated.`,
        });
    }
    static async cleanupOldNotifications(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        await notificationRepo
            .createQueryBuilder()
            .delete()
            .where("created_at < :cutoffDate", { cutoffDate })
            .andWhere("read = true")
            .execute();
    }
    static async getStatistics(entityId, entityType, period = "month") {
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
                    createdAt: (0, typeorm_1.MoreThanOrEqual)(date),
                },
            }),
            notificationRepo.count({
                where: {
                    entityId,
                    entityType,
                    read: false,
                    createdAt: (0, typeorm_1.MoreThanOrEqual)(date),
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
            byType: byType.reduce((acc, item) => {
                acc[item.type] = parseInt(item.count);
                return acc;
            }, {}),
        };
    }
    static async sendTestNotification(entityId, entityType) {
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
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map