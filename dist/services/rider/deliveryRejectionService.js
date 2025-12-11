"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryRejectionService = void 0;
const data_source_1 = require("../../config/data-source");
const Order_1 = require("../../entities/Order");
const OrderRejection_1 = require("../../entities/OrderRejection");
const Rider_1 = require("../../entities/Rider");
class DeliveryRejectionService {
    async rejectDelivery(orderId, riderId, reason, reassignToRiderId) {
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const order = await manager.findOne(Order_1.Order, {
                where: { id: orderId, riderId },
            });
            if (!order) {
                throw new Error("Delivery assignment not found");
            }
            if (!["pending", "out_for_delivery"].includes(order.orderStatus)) {
                throw new Error("Delivery cannot be rejected at this stage");
            }
            const rejection = manager.create(OrderRejection_1.OrderRejection, {
                order: { id: orderId },
                rider: { id: riderId },
                rejectionType: "delivery",
                reason,
                reassignedTo: reassignToRiderId,
                reassignedAt: reassignToRiderId ? new Date() : undefined,
            });
            await manager.save(rejection);
            if (reassignToRiderId) {
                const newRider = await manager.findOne(Rider_1.Rider, {
                    where: { id: reassignToRiderId },
                });
                if (!newRider) {
                    throw new Error("Reassignment rider not found");
                }
                order.riderId = reassignToRiderId;
                order.orderStatus = "pending";
                await manager.save(order);
                return {
                    success: true,
                    message: "Delivery rejected and reassigned successfully",
                    rejection: {
                        id: rejection.id,
                        reason: rejection.reason,
                        rejectedAt: rejection.rejectedAt,
                    },
                    reassignment: {
                        newRiderId: reassignToRiderId,
                        newRiderName: newRider.fullName,
                        newRiderPhone: newRider.phone,
                    },
                };
            }
            else {
                order.riderId = null;
                order.orderStatus = "confirmed";
                await manager.save(order);
                return {
                    success: true,
                    message: "Delivery rejected. Order is now available for reassignment.",
                    rejection: {
                        id: rejection.id,
                        reason: rejection.reason,
                        rejectedAt: rejection.rejectedAt,
                    },
                    orderStatus: "confirmed",
                };
            }
        });
    }
    async getRiderRejections(riderId, limit = 50) {
        const rejectionRepo = data_source_1.AppDataSource.getRepository(OrderRejection_1.OrderRejection);
        const rejections = await rejectionRepo.find({
            where: { riderId, rejectionType: "delivery" },
            relations: ["order"],
            order: { rejectedAt: "DESC" },
            take: limit,
        });
        return rejections.map((rejection) => ({
            id: rejection.id,
            orderId: rejection.orderId,
            reason: rejection.reason,
            rejectedAt: rejection.rejectedAt,
            reassignedTo: rejection.reassignedTo,
            reassignedAt: rejection.reassignedAt,
            orderNumber: rejection.order?.orderNumber,
            orderStatus: rejection.order?.orderStatus,
        }));
    }
    async getAvailableRiders() {
        const riderRepo = data_source_1.AppDataSource.getRepository(Rider_1.Rider);
        const riders = await riderRepo
            .createQueryBuilder("rider")
            .where("rider.is_active = :active", { active: true })
            .andWhere("rider.is_approved = :approved", { approved: true })
            .select([
            "rider.id",
            "rider.fullName",
            "rider.phone",
            "rider.vehicleType",
            "rider.rating",
        ])
            .orderBy("rider.rating", "DESC")
            .limit(20)
            .getMany();
        return riders;
    }
}
exports.DeliveryRejectionService = DeliveryRejectionService;
exports.default = new DeliveryRejectionService();
//# sourceMappingURL=deliveryRejectionService.js.map