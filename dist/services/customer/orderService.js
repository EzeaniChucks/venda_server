"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const data_source_1 = require("../../config/data-source");
const entities_1 = require("../../entities");
const OrderCancellation_1 = require("../../entities/OrderCancellation");
class OrderService {
    constructor() {
        this.orderRepository = data_source_1.AppDataSource.getRepository(entities_1.Order);
        this.orderItemRepository = data_source_1.AppDataSource.getRepository(entities_1.OrderItem);
        this.cartRepository = data_source_1.AppDataSource.getRepository(entities_1.Cart);
        this.productRepository = data_source_1.AppDataSource.getRepository(entities_1.Product);
    }
    async createOrder(customerId, orderData) {
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const cartItems = await manager.find(entities_1.Cart, {
                where: { customerId },
                relations: ["product"],
            });
            if (cartItems.length === 0) {
                throw new Error("Cart is empty");
            }
            const totalAmount = cartItems.reduce((sum, item) => {
                const price = item.product.discountPrice || item.product.price;
                return sum + Number(price) * item.quantity;
            }, 0);
            const deliveryFee = totalAmount > 50000 ? 0 : 2000;
            const finalAmount = totalAmount + deliveryFee;
            const orderNumber = "VND" +
                Date.now() +
                Math.random().toString(36).substr(2, 4).toUpperCase();
            const order = manager.create(entities_1.Order, {
                orderNumber,
                customerId,
                totalAmount,
                deliveryFee,
                finalAmount,
                paymentMethod: orderData.payment_method,
                deliveryAddress: orderData.delivery_address,
                deliveryCity: orderData.delivery_city,
                deliveryState: orderData.delivery_state,
                deliveryPostalCode: orderData.delivery_postal_code,
                deliveryPhone: orderData.delivery_phone,
                deliveryNotes: orderData.delivery_notes,
            });
            const savedOrder = await manager.save(order);
            for (const item of cartItems) {
                if (item.product.stockQuantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.product.name}`);
                }
                const price = item.product.discountPrice || item.product.price;
                const totalPrice = Number(price) * Number(item.quantity);
                const orderItem = manager.create(entities_1.OrderItem, {
                    orderId: savedOrder.id,
                    productId: item.productId,
                    vendorId: item.product.vendorId,
                    productName: item.product.name,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    unitPrice: price,
                    totalPrice,
                });
                await manager.save(orderItem);
                item.product.stockQuantity -= item.quantity;
                await manager.save(item.product);
            }
            await manager.remove(cartItems);
            return await this.getOrderByIdWithManager(manager, savedOrder.id, customerId);
        });
    }
    async getUserOrders(customerId, filters = {}) {
        const { status, page = 1, limit = 10 } = filters;
        const queryBuilder = this.orderRepository
            .createQueryBuilder("order")
            .leftJoinAndSelect("order.orderItems", "items")
            .where("order.customerId = :customerId", { customerId });
        if (status) {
            queryBuilder.andWhere("order.orderStatus = :status", { status });
        }
        const orders = await queryBuilder
            .orderBy("order.createdAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return orders;
    }
    async getOrderById(orderId, customerId) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId, customerId },
            relations: [
                "orderItems",
                "orderItems.vendor",
                "orderItems.vendor.vendorProfile",
            ],
        });
        if (!order) {
            throw new Error("Order not found");
        }
        const orderData = {
            ...order,
            items: order.orderItems?.map((item) => ({
                ...item,
                vendor_name: item.vendor?.vendorProfile?.businessName || "Unknown Vendor",
            })) || [],
        };
        return orderData;
    }
    async getOrderByIdWithManager(manager, orderId, customerId) {
        const order = await manager.findOne(entities_1.Order, {
            where: { id: orderId, customerId },
            relations: [
                "orderItems",
                "orderItems.vendor",
                "orderItems.vendor.vendorProfile",
                "customer",
            ],
        });
        if (!order) {
            throw new Error("Order not found");
        }
        const transformedOrder = {
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
            customer: order.customer ? {
                id: order.customer.id,
                fullName: order.customer.fullName,
                email: order.customer.email,
                phone: order.customer.phone,
            } : null,
            items: order.orderItems?.map((item) => ({
                id: item.id,
                orderId: item.orderId,
                productId: item.productId,
                productName: item.productName,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                totalPrice: item.totalPrice,
                vendorId: item.vendorId,
                vendorStatus: item.vendorStatus,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                vendor_name: item.vendor?.vendorProfile?.businessName || item.vendor?.businessName || "Unknown Vendor",
                vendor: {
                    id: item.vendor?.id,
                    businessName: item.vendor?.businessName,
                    phone: item.vendor?.phone,
                    vendorProfile: {
                        businessName: item.vendor?.vendorProfile?.businessName,
                        businessDescription: item.vendor?.vendorProfile?.businessDescription,
                        businessAddress: item.vendor?.vendorProfile?.businessAddress,
                        businessPhone: item.vendor?.vendorProfile?.businessPhone,
                    }
                }
            })) || [],
        };
        return transformedOrder;
    }
    async cancelOrder(orderId, customerId, reason) {
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const order = await manager.findOne(entities_1.Order, {
                where: { id: orderId, customerId },
                relations: ["orderItems"],
            });
            if (!order) {
                throw new Error("Order not found");
            }
            if (!["pending", "confirmed"].includes(order.orderStatus)) {
                throw new Error("Order cannot be cancelled at this stage");
            }
            let refundStatus = "not_applicable";
            let refundAmount;
            if (order.paymentMethod === "wallet" || order.paymentMethod === "card") {
                refundStatus = "pending";
                refundAmount = Number(order.finalAmount);
            }
            if (order.orderItems) {
                for (const item of order.orderItems) {
                    const product = await manager.findOne(entities_1.Product, {
                        where: { id: item.productId },
                    });
                    if (product) {
                        product.stockQuantity += item.quantity;
                        await manager.save(product);
                    }
                }
            }
            const cancellation = manager.create(OrderCancellation_1.OrderCancellation, {
                order: { id: orderId },
                customer: { id: customerId },
                cancelledBy: "customer",
                reason: reason || "Customer requested cancellation",
                refundStatus,
                refundAmount,
            });
            await manager.save(cancellation);
            order.orderStatus = "cancelled";
            order.cancelledAt = new Date();
            order.cancellationReason = reason;
            await manager.save(order);
            return {
                order: await this.getOrderById(orderId, customerId),
                cancellation: {
                    id: cancellation.id,
                    reason: cancellation.reason,
                    refundStatus: cancellation.refundStatus,
                    refundAmount: cancellation.refundAmount,
                    cancelledAt: cancellation.cancelledAt,
                },
            };
        });
    }
}
exports.OrderService = OrderService;
exports.default = new OrderService();
//# sourceMappingURL=orderService.js.map