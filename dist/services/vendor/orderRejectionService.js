"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorOrderRejectionService = void 0;
const data_source_1 = require("../../config/data-source");
const Order_1 = require("../../entities/Order");
const OrderItem_1 = require("../../entities/OrderItem");
const Product_1 = require("../../entities/Product");
const OrderRejection_1 = require("../../entities/OrderRejection");
class VendorOrderRejectionService {
    async rejectOrderItem(orderItemId, vendorId, reason) {
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const orderItem = await manager.findOne(OrderItem_1.OrderItem, {
                where: { id: orderItemId, vendorId },
                relations: ["order", "product"],
            });
            if (!orderItem) {
                throw new Error("Order item not found or unauthorized");
            }
            if (orderItem.vendorStatus === "rejected") {
                throw new Error("Order item already rejected");
            }
            const product = await manager.findOne(Product_1.Product, {
                where: { id: orderItem.productId },
            });
            if (product) {
                product.stockQuantity += orderItem.quantity;
                await manager.save(product);
            }
            const rejection = manager.create(OrderRejection_1.OrderRejection, {
                order: { id: orderItem.orderId },
                orderItem: { id: orderItemId },
                vendor: { id: vendorId },
                rejectionType: "order",
                reason,
            });
            await manager.save(rejection);
            orderItem.vendorStatus = "rejected";
            await manager.save(orderItem);
            const allOrderItems = await manager.find(OrderItem_1.OrderItem, {
                where: { orderId: orderItem.orderId },
            });
            const allRejected = allOrderItems.every((item) => item.vendorStatus === "rejected");
            if (allRejected) {
                const order = await manager.findOne(Order_1.Order, {
                    where: { id: orderItem.orderId },
                });
                if (order) {
                    order.orderStatus = "cancelled";
                    order.cancelledAt = new Date();
                    order.cancellationReason = "All items rejected by vendors";
                    await manager.save(order);
                }
            }
            return {
                success: true,
                message: "Order item rejected successfully",
                rejection: {
                    id: rejection.id,
                    orderItemId: rejection.orderItemId,
                    reason: rejection.reason,
                    rejectedAt: rejection.rejectedAt,
                },
                orderItem: {
                    id: orderItem.id,
                    vendorStatus: orderItem.vendorStatus,
                    productName: orderItem.productName,
                    quantity: orderItem.quantity,
                },
            };
        });
    }
    async rejectOrder(orderId, vendorId, reason) {
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const order = await manager.findOne(Order_1.Order, {
                where: { id: orderId },
                relations: ["orderItems"],
            });
            if (!order) {
                throw new Error("Order not found");
            }
            const vendorItems = order.orderItems?.filter((item) => item.vendorId === vendorId) || [];
            if (vendorItems.length === 0) {
                throw new Error("No items found for this vendor in the order");
            }
            const rejections = [];
            for (const item of vendorItems) {
                if (item.vendorStatus === "rejected") {
                    continue;
                }
                const product = await manager.findOne(Product_1.Product, {
                    where: { id: item.productId },
                });
                if (product) {
                    product.stockQuantity += item.quantity;
                    await manager.save(product);
                }
                const rejection = manager.create(OrderRejection_1.OrderRejection, {
                    order: { id: orderId },
                    orderItem: { id: item.id },
                    vendor: { id: vendorId },
                    rejectionType: "order",
                    reason,
                });
                await manager.save(rejection);
                rejections.push(rejection);
                item.vendorStatus = "rejected";
                await manager.save(item);
            }
            const allOrderItems = order.orderItems || [];
            const allRejected = allOrderItems.every((item) => item.vendorStatus === "rejected");
            if (allRejected) {
                order.orderStatus = "cancelled";
                order.cancelledAt = new Date();
                order.cancellationReason = "All items rejected by vendors";
                await manager.save(order);
            }
            return {
                success: true,
                message: `Rejected ${vendorItems.length} item(s) successfully`,
                rejections: rejections.map((r) => ({
                    id: r.id,
                    reason: r.reason,
                    rejectedAt: r.rejectedAt,
                })),
                orderStatus: allRejected ? "cancelled" : order.orderStatus,
            };
        });
    }
    async getVendorRejections(vendorId, limit = 50) {
        const rejectionRepo = data_source_1.AppDataSource.getRepository(OrderRejection_1.OrderRejection);
        const rejections = await rejectionRepo.find({
            where: { vendorId },
            relations: ["order", "orderItem"],
            order: { rejectedAt: "DESC" },
            take: limit,
        });
        return rejections.map((rejection) => ({
            id: rejection.id,
            orderId: rejection.orderId,
            orderItemId: rejection.orderItemId,
            reason: rejection.reason,
            rejectedAt: rejection.rejectedAt,
            orderNumber: rejection.order?.orderNumber,
            productName: rejection.orderItem?.productName,
        }));
    }
}
exports.VendorOrderRejectionService = VendorOrderRejectionService;
exports.default = new VendorOrderRejectionService();
//# sourceMappingURL=orderRejectionService.js.map