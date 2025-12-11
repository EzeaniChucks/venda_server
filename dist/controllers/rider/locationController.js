"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRiderLocationForOrder = exports.getLocation = exports.updateLocation = void 0;
const data_source_1 = require("../../config/data-source");
const Rider_1 = require("../../entities/Rider");
const Order_1 = require("../../entities/Order");
const RiderLocationHistory_1 = require("../../entities/RiderLocationHistory");
const orderTracking_socket_1 = require("../../sockets/orderTracking.socket");
const updateLocation = async (req, res) => {
    try {
        const riderId = req.user?.id;
        if (!riderId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { latitude, longitude, accuracy, speed, heading } = req.body;
        if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
            res.status(400).json({ message: 'Latitude and longitude are required' });
            return;
        }
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            res.status(400).json({ message: 'Invalid coordinates' });
            return;
        }
        const riderRepo = data_source_1.AppDataSource.getRepository(Rider_1.Rider);
        const orderRepo = data_source_1.AppDataSource.getRepository(Order_1.Order);
        const locationHistoryRepo = data_source_1.AppDataSource.getRepository(RiderLocationHistory_1.RiderLocationHistory);
        const rider = await riderRepo.findOne({ where: { id: riderId } });
        if (!rider) {
            res.status(404).json({ message: 'Rider not found' });
            return;
        }
        const activeOrders = await orderRepo.find({
            where: {
                riderId,
                orderStatus: 'out_for_delivery'
            }
        });
        if (activeOrders.length === 0) {
            res.status(400).json({
                message: 'No active deliveries',
                error: 'Location updates are only accepted when you have active orders'
            });
            return;
        }
        rider.latitude = latitude;
        rider.longitude = longitude;
        await riderRepo.save(rider);
        for (const order of activeOrders) {
            const locationHistory = locationHistoryRepo.create({
                riderId,
                orderId: order.id,
                latitude,
                longitude,
                accuracy: accuracy || null,
                speed: speed || null,
                heading: heading || null,
            });
            await locationHistoryRepo.save(locationHistory);
            try {
                const socket = (0, orderTracking_socket_1.getOrderTrackingSocket)();
                const io = socket.getIO();
                io.to(`order:${order.id}`).emit('order:riderLocation', {
                    orderId: order.id,
                    riderId,
                    location: {
                        latitude,
                        longitude,
                        accuracy,
                        speed,
                        heading,
                        timestamp: new Date().toISOString()
                    }
                });
            }
            catch (error) {
                console.warn('WebSocket not available:', error);
            }
        }
        res.status(200).json({
            message: 'Location updated successfully',
            activeOrders: activeOrders.length,
            location: {
                latitude,
                longitude,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Error updating rider location:', error);
        res.status(500).json({ message: 'Failed to update location' });
    }
};
exports.updateLocation = updateLocation;
const getLocation = async (req, res) => {
    try {
        const riderId = req.user?.id;
        if (!riderId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const riderRepo = data_source_1.AppDataSource.getRepository(Rider_1.Rider);
        const rider = await riderRepo.findOne({ where: { id: riderId } });
        if (!rider) {
            res.status(404).json({ message: 'Rider not found' });
            return;
        }
        res.status(200).json({
            hasLocation: rider.latitude !== undefined && rider.latitude !== null &&
                rider.longitude !== undefined && rider.longitude !== null,
            location: {
                latitude: rider.latitude,
                longitude: rider.longitude
            }
        });
    }
    catch (error) {
        console.error('Error getting rider location:', error);
        res.status(500).json({ message: 'Failed to get location' });
    }
};
exports.getLocation = getLocation;
const getRiderLocationForOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const orderRepo = data_source_1.AppDataSource.getRepository(Order_1.Order);
        const riderRepo = data_source_1.AppDataSource.getRepository(Rider_1.Rider);
        const order = await orderRepo.findOne({
            where: { id: orderId },
            relations: ['rider']
        });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        if (!order.riderId) {
            res.status(400).json({ message: 'No rider assigned to this order' });
            return;
        }
        const rider = await riderRepo.findOne({ where: { id: order.riderId } });
        if (!rider) {
            res.status(404).json({ message: 'Rider not found' });
            return;
        }
        res.status(200).json({
            orderId,
            rider: {
                id: rider.id,
                fullName: rider.fullName,
                phone: rider.phone
            },
            location: {
                latitude: rider.latitude,
                longitude: rider.longitude,
                lastUpdated: rider.updatedAt
            },
            isActive: order.orderStatus === 'out_for_delivery'
        });
    }
    catch (error) {
        console.error('Error getting rider location for order:', error);
        res.status(500).json({ message: 'Failed to get rider location' });
    }
};
exports.getRiderLocationForOrder = getRiderLocationForOrder;
//# sourceMappingURL=locationController.js.map