import { AppDataSource } from '../../config/data-source';
import { Order, Rider, RiderDocument } from '../../entities';

export class RiderService {
  private orderRepository = AppDataSource.getRepository(Order);
  private riderRepository = AppDataSource.getRepository(Rider);
  private riderDocumentRepository = AppDataSource.getRepository(RiderDocument);

  async getAvailableDeliveries(): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: {
        orderStatus: "dispatched",
        riderId: null as any
      },
      relations: ['customer'],
      order: { createdAt: 'DESC' }
    });

    return orders;
  }

  async getRiderDeliveries(riderId: string, filters: any = {}): Promise<Order[]> {
    const { status, page = 1, limit = 20 } = filters;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.orderItems', 'items')
      .where('order.riderId = :riderId', { riderId });

    if (status) {
      queryBuilder.andWhere('order.orderStatus = :status', { status });
    }

    const orders = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return orders;
  }

  async acceptDelivery(riderId: string, orderId: string): Promise<Order> {
    return await AppDataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: {
          id: orderId,
          orderStatus: "dispatched",
          riderId: null as any
        }
      });

      if (!order) {
        throw new Error('Order not available for assignment');
      }

      order.riderId = riderId;
      order.orderStatus = 'out_for_delivery';

      return await manager.save(order);
    });
  }

  async updateDeliveryStatus(riderId: string, orderId: string, status: string): Promise<Order> {
    const validStatuses = ['out_for_delivery', 'delivered'];

    if (!validStatuses.includes(status)) {
      throw new Error('Invalid delivery status');
    }

    return await AppDataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId, riderId }
      });

      if (!order) {
        throw new Error('Delivery not found or unauthorized');
      }

      order.orderStatus = status as any;

      if (status === 'delivered') {
        order.deliveredAt = new Date();
        if (order.paymentMethod === 'cash') {
          order.paymentStatus = 'paid';
        }

        // Update rider's total deliveries in RiderDocument
        const riderDoc = await manager.findOne(RiderDocument, { where: { riderId } });
        if (riderDoc) {
          riderDoc.totalDeliveries += 1;
          await manager.save(riderDoc);
        }
      }

      return await manager.save(order);
    });
  }

  async updateLocation(riderId: string, latitude: number, longitude: number): Promise<Rider> {
    const rider = await this.riderRepository.findOne({
      where: { id: riderId }
    });

    if (!rider) {
      throw new Error('Rider not found');
    }

    rider.latitude = latitude;
    rider.longitude = longitude;

    return await this.riderRepository.save(rider);
  }

  async updateAvailability(riderId: string, isAvailable: boolean): Promise<Rider> {
    const rider = await this.riderRepository.findOne({
      where: { id: riderId }
    });

    if (!rider) {
      throw new Error('Rider not found');
    }

    rider.isAvailable = isAvailable;

    return await this.riderRepository.save(rider);
  }

  async getEarnings(riderId: string): Promise<any> {
    const stats = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'total_deliveries')
      .addSelect('SUM(order.delivery_fee)', 'total_earnings')
      .addSelect('SUM(CASE WHEN order.order_status = \'delivered\' AND DATE(order.delivered_at) = CURRENT_DATE THEN 1 ELSE 0 END)', 'today_deliveries')
      .addSelect('SUM(CASE WHEN order.order_status = \'delivered\' AND DATE(order.delivered_at) = CURRENT_DATE THEN order.delivery_fee ELSE 0 END)', 'today_earnings')
      .where('order.riderId = :riderId', { riderId })
      .getRawOne();

    return stats;
  }
}

export default new RiderService();
