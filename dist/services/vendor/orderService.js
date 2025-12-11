"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorOrderService = void 0;
const response_1 = require("../../utils/response");
const data_source_1 = require("../../config/data-source");
const entities_1 = require("../../entities");
const orderTracking_socket_1 = require("../../sockets/orderTracking.socket");
const OrderRejection_1 = require("../../entities/OrderRejection");
class VendorOrderService {
    constructor() {
        this.orderRepository = data_source_1.AppDataSource.getRepository(entities_1.Order);
        this.orderItemRepository = data_source_1.AppDataSource.getRepository(entities_1.OrderItem);
    }
    async getVendorOrders(vendorId, filters = {}) {
        const { status, page = 1, limit = 20, filterBy = "item", dateFrom, dateTo, search, } = filters;
        const queryBuilder = this.orderRepository
            .createQueryBuilder("order")
            .leftJoinAndSelect("order.orderItems", "orderItems")
            .leftJoinAndSelect("order.customer", "customer")
            .leftJoinAndSelect("orderItems.vendor", "vendor")
            .leftJoinAndSelect("vendor.vendorProfile", "vendorProfile")
            .where("orderItems.vendorId = :vendorId", { vendorId });
        if (status && status !== "all") {
            if (filterBy === "order") {
                queryBuilder.andWhere("order.orderStatus = :status", { status });
            }
            else {
                queryBuilder.andWhere("orderItems.vendorStatus = :status", { status });
            }
        }
        if (dateFrom) {
            queryBuilder.andWhere("order.createdAt >= :dateFrom", {
                dateFrom: new Date(dateFrom),
            });
        }
        if (dateTo) {
            queryBuilder.andWhere("order.createdAt <= :dateTo", {
                dateTo: new Date(dateTo),
            });
        }
        if (search) {
            queryBuilder.andWhere("(order.orderNumber ILIKE :search OR customer.fullName ILIKE :search)", { search: `%${search}%` });
        }
        const total = await queryBuilder.getCount();
        const orders = await queryBuilder
            .orderBy("order.createdAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        const transformedOrders = orders.map((order) => {
            const vendorItems = order.orderItems
                ?.filter((item) => item.vendorId === vendorId)
                .map((item) => ({
                id: item.id,
                productId: item.productId,
                productName: item.productName,
                unitPrice: parseFloat(String(item.unitPrice)),
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                totalPrice: parseFloat(String(item.totalPrice)),
                vendorStatus: item.vendorStatus,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                vendor: item.vendor
                    ? {
                        id: item.vendor.id,
                        businessName: item.vendor.businessName,
                        phone: item.vendor.phone,
                        vendorProfile: {
                            businessName: item.vendor.vendorProfile?.businessName,
                            businessAddress: item.vendor.vendorProfile?.businessAddress,
                        },
                    }
                    : null,
            })) || [];
            const vendorOrderTotal = vendorItems.reduce((sum, item) => sum + item.totalPrice, 0);
            const vendorOrderStatus = this.getVendorOrderStatus(vendorItems);
            return {
                id: order.id,
                orderNumber: order.orderNumber,
                customerId: order.customerId,
                totalAmount: parseFloat(String(order.totalAmount)),
                deliveryFee: parseFloat(String(order.deliveryFee || 0)),
                discountAmount: parseFloat(String(order.discountAmount || 0)),
                finalAmount: parseFloat(String(order.finalAmount)),
                orderStatus: order.orderStatus,
                vendorOrderStatus,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                deliveryAddress: order.deliveryAddress,
                deliveryCity: order.deliveryCity,
                deliveryState: order.deliveryState,
                deliveryPostalCode: order.deliveryPostalCode,
                deliveryPhone: order.deliveryPhone,
                deliveryNotes: order.deliveryNotes,
                estimatedDeliveryDate: order.estimatedDeliveryDate,
                deliveredAt: order.deliveredAt,
                cancelledAt: order.cancelledAt,
                cancellationReason: order.cancellationReason,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                customer: order.customer
                    ? {
                        id: order.customer.id,
                        fullName: order.customer.fullName,
                        email: order.customer.email,
                        phone: order.customer.phone,
                    }
                    : null,
                items: vendorItems,
                vendor_order_total: vendorOrderTotal,
                item_count: vendorItems.length,
                status_summary: this.getStatusSummary(vendorItems),
            };
        });
        const result = {
            orders: transformedOrders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        };
        return result;
    }
    getVendorOrderStatus(items) {
        if (!items || items.length === 0)
            return "unknown";
        const statuses = items.map((item) => item.vendorStatus);
        const uniqueStatuses = [...new Set(statuses)];
        if (uniqueStatuses.length === 1) {
            return uniqueStatuses[0];
        }
        if (statuses.includes("rejected"))
            return "partially_rejected";
        if (statuses.includes("ready"))
            return "partially_ready";
        if (statuses.includes("preparing"))
            return "partially_preparing";
        if (statuses.includes("accepted"))
            return "partially_accepted";
        return "mixed";
    }
    getStatusSummary(items) {
        const summary = {
            pending: 0,
            accepted: 0,
            preparing: 0,
            ready: 0,
            rejected: 0,
            total: items?.length,
        };
        items?.forEach((item) => {
            if (summary.hasOwnProperty(item.vendorStatus)) {
                summary[item.vendorStatus]++;
            }
        });
        return summary;
    }
    async getVendorOrderById(res, orderId, vendorId) {
        const order = await this.orderRepository
            .createQueryBuilder("order")
            .leftJoinAndSelect("order.orderItems", "orderItems")
            .leftJoinAndSelect("order.customer", "customer")
            .leftJoinAndSelect("orderItems.vendor", "vendor")
            .leftJoinAndSelect("vendor.vendorProfile", "vendorProfile")
            .where("order.id = :orderId", { orderId })
            .andWhere("orderItems.vendorId = :vendorId", { vendorId })
            .getOne();
        if (!order) {
            return (0, response_1.errorResponse)(res, "Order not found or you do not have access to this order", 404);
        }
        const vendorItems = order?.orderItems?.filter((item) => item.vendorId === vendorId) || [];
        if (!vendorItems || vendorItems.length === 0) {
            return (0, response_1.errorResponse)(res, "You do not have access to this order or no items found for your vendor", 403);
        }
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            customerId: order.customerId,
            totalAmount: order.totalAmount,
            deliveryFee: order.deliveryFee,
            discountAmount: order.discountAmount,
            finalAmount: order.finalAmount,
            orderStatus: order.orderStatus,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            deliveryAddress: order.deliveryAddress,
            deliveryCity: order.deliveryCity,
            deliveryState: order.deliveryState,
            deliveryPostalCode: order.deliveryPostalCode,
            deliveryPhone: order.deliveryPhone,
            deliveryNotes: order.deliveryNotes,
            riderId: order.riderId,
            estimatedDeliveryDate: order.estimatedDeliveryDate,
            deliveredAt: order.deliveredAt,
            cancelledAt: order.cancelledAt,
            cancellationReason: order.cancellationReason,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            customer: {
                id: order.customer.id,
                email: order.customer.email,
                fullName: order.customer.fullName,
                phone: order.customer.phone,
                profileImage: order.customer.profileImage,
            },
            items: vendorItems.map((item) => ({
                id: item.id,
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                vendorStatus: item.vendorStatus,
                size: item.size,
                color: item.color,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                vendorId: item.vendorId,
                vendor_name: item.vendor?.vendorProfile?.businessName ||
                    item.vendor?.businessName ||
                    "Unknown Vendor",
            })),
            vendor_order_total: vendorItems.reduce((sum, item) => sum + parseFloat(String(item.totalPrice)), 0),
            item_count: vendorItems.length,
            vendor_status: this.getAggregateVendorStatus(vendorItems),
        };
    }
    async updateOrderItemStatus({ orderId, itemId, vendorId, status, }) {
        const orderItem = await this.orderItemRepository.findOne({
            where: {
                id: itemId,
                orderId: orderId,
                vendorId: vendorId,
            },
            relations: ["order", "vendor"],
        });
        if (!orderItem) {
            throw new Error("Order item not found or you do not have access to this item");
        }
        orderItem.vendorStatus = status;
        await this.orderItemRepository.save(orderItem);
        const orderTrackingSocket = (0, orderTracking_socket_1.getOrderTrackingSocket)();
        orderTrackingSocket.emitOrderUpdate({
            orderId,
            status,
            customerId: orderItem.order.customerId,
            vendorId: vendorId,
            estimatedDeliveryDate: orderItem.order.estimatedDeliveryDate,
        });
        orderTrackingSocket.emitNotification(orderItem.order.customerId, "customer", {
            title: "Order Status Updated",
            message: `Your order #${orderItem.order.orderNumber} is now ${status}`,
            type: "ORDER_STATUS_UPDATE",
            orderId,
            timestamp: new Date(),
        });
        return orderItem;
    }
    getAggregateVendorStatus(items) {
        const statuses = [...new Set(items.map((item) => item.vendorStatus))];
        return statuses.length === 1 ? statuses[0] : "mixed";
    }
    async rejectOrderItem(orderItemId, vendorId, reason) {
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const orderItem = await manager.findOne(entities_1.OrderItem, {
                where: { id: orderItemId, vendorId },
                relations: ["order"],
            });
            if (!orderItem) {
                throw new Error("Order item not found or unauthorized");
            }
            if (orderItem.vendorStatus === "rejected") {
                throw new Error("Order item already rejected");
            }
            const product = await manager.findOne(entities_1.Product, {
                where: { id: orderItem.productId },
            });
            if (product) {
                product.stockQuantity += orderItem.quantity;
                await manager.save(product);
            }
            const insertResult = await manager
                .createQueryBuilder()
                .insert()
                .into(OrderRejection_1.OrderRejection)
                .values({
                order: { id: orderItem.orderId },
                orderItem: { id: orderItemId },
                vendor: { id: vendorId },
                rejectionType: "order",
                reason,
            })
                .returning("*")
                .execute();
            const rejection = insertResult.raw[0];
            orderItem.vendorStatus = "rejected";
            await manager.save(orderItem);
            const allOrderItems = await manager.find(entities_1.OrderItem, {
                where: { orderId: orderItem.orderId },
            });
            const allRejected = allOrderItems.every((item) => item.vendorStatus === "rejected");
            if (allRejected) {
                const order = await manager.findOne(entities_1.Order, {
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
            const order = await manager.findOne(entities_1.Order, {
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
                const product = await manager.findOne(entities_1.Product, {
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
exports.VendorOrderService = VendorOrderService;
exports.default = new VendorOrderService();
//# sourceMappingURL=orderService.js.map