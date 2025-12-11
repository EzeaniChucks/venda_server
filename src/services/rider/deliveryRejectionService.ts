import { AppDataSource } from "../../config/data-source";
import { Order } from "../../entities/Order";
import { OrderRejection } from "../../entities/OrderRejection";
import { Rider } from "../../entities/Rider";

export class DeliveryRejectionService {
  /**
   * Reject a delivery assignment with reason
   */
  async rejectDelivery(
    orderId: string,
    riderId: string,
    reason: string,
    reassignToRiderId?: string
  ): Promise<any> {
    return await AppDataSource.transaction(async (manager) => {
      // Find order
      const order = await manager.findOne(Order, {
        where: { id: orderId, riderId },
      });

      if (!order) {
        throw new Error("Delivery assignment not found");
      }

      if (!["pending", "out_for_delivery"].includes(order.orderStatus)) {
        throw new Error("Delivery cannot be rejected at this stage");
      }

      // Create rejection record
      const rejection = manager.create(OrderRejection, {
        order: { id: orderId },
        rider: { id: riderId },
        rejectionType: "delivery",
        reason,
        reassignedTo: reassignToRiderId,
        reassignedAt: reassignToRiderId ? new Date() : undefined,
      });

      await manager.save(rejection);

      // Update order status
      if (reassignToRiderId) {
        // Reassign to another rider
        const newRider = await manager.findOne(Rider, {
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
      } else {
        // Unassign rider - order goes back to available pool
        order.riderId = null;
        order.orderStatus = "confirmed"; // Back to confirmed status
        await manager.save(order);

        return {
          success: true,
          message:
            "Delivery rejected. Order is now available for reassignment.",
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

  /**
   * Get rejection history for a rider
   */
  async getRiderRejections(riderId: string, limit: number = 50): Promise<any> {
    const rejectionRepo = AppDataSource.getRepository(OrderRejection);

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

  /**
   * Get available riders for reassignment (riders who are online and available)
   */
  async getAvailableRiders(): Promise<any> {
    const riderRepo = AppDataSource.getRepository(Rider);

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

export default new DeliveryRejectionService();
