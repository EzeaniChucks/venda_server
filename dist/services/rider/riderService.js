"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiderService = void 0;
const data_source_1 = require("../../config/data-source");
const entities_1 = require("../../entities");
class RiderService {
    constructor() {
        this.orderRepository = data_source_1.AppDataSource.getRepository(entities_1.Order);
        this.riderRepository = data_source_1.AppDataSource.getRepository(entities_1.Rider);
        this.riderDocumentRepository = data_source_1.AppDataSource.getRepository(entities_1.RiderDocument);
    }
    async getAvailableDeliveries() {
        const orders = await this.orderRepository.find({
            where: {
                orderStatus: "dispatched",
                riderId: null
            },
            relations: ['customer'],
            order: { createdAt: 'DESC' }
        });
        return orders;
    }
    async getRiderDeliveries(riderId, filters = {}) {
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
    async acceptDelivery(riderId, orderId) {
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const order = await manager.findOne(entities_1.Order, {
                where: {
                    id: orderId,
                    orderStatus: "dispatched",
                    riderId: null
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
    async updateDeliveryStatus(riderId, orderId, status) {
        const validStatuses = ['out_for_delivery', 'delivered'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid delivery status');
        }
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            const order = await manager.findOne(entities_1.Order, {
                where: { id: orderId, riderId }
            });
            if (!order) {
                throw new Error('Delivery not found or unauthorized');
            }
            order.orderStatus = status;
            if (status === 'delivered') {
                order.deliveredAt = new Date();
                if (order.paymentMethod === 'cash') {
                    order.paymentStatus = 'paid';
                }
                const riderDoc = await manager.findOne(entities_1.RiderDocument, { where: { riderId } });
                if (riderDoc) {
                    riderDoc.totalDeliveries += 1;
                    await manager.save(riderDoc);
                }
            }
            return await manager.save(order);
        });
    }
    async updateLocation(riderId, latitude, longitude) {
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
    async updateAvailability(riderId, isAvailable) {
        const rider = await this.riderRepository.findOne({
            where: { id: riderId }
        });
        if (!rider) {
            throw new Error('Rider not found');
        }
        rider.isAvailable = isAvailable;
        return await this.riderRepository.save(rider);
    }
    async getEarnings(riderId) {
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
exports.RiderService = RiderService;
exports.default = new RiderService();
//# sourceMappingURL=riderService.js.map