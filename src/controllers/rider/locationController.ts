import { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source';
import { Rider } from '../../entities/Rider';
import { Order } from '../../entities/Order';
import { RiderLocationHistory } from '../../entities/RiderLocationHistory';
import { AuthRequest } from '../../types';
import { getOrderTrackingSocket } from '../../sockets/orderTracking.socket';

/**
 * Update rider location (called by rider app during active deliveries)
 * Validates rider has active orders before accepting updates
 * Emits WebSocket event to notify customers tracking their order
 */
export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const riderId = (req as AuthRequest).user?.id;
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

    const riderRepo = AppDataSource.getRepository(Rider);
    const orderRepo = AppDataSource.getRepository(Order);
    const locationHistoryRepo = AppDataSource.getRepository(RiderLocationHistory);

    // Get rider
    const rider = await riderRepo.findOne({ where: { id: riderId } });
    if (!rider) {
      res.status(404).json({ message: 'Rider not found' });
      return;
    }

    // Check if rider has active orders
    const activeOrders = await orderRepo.find({
      where: {
        riderId,
        orderStatus: 'out_for_delivery' as any
      }
    });

    if (activeOrders.length === 0) {
      res.status(400).json({ 
        message: 'No active deliveries',
        error: 'Location updates are only accepted when you have active orders'
      });
      return;
    }

    // Update rider's current location
    rider.latitude = latitude;
    rider.longitude = longitude;
    await riderRepo.save(rider);

    // Save location to history for each active order
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

      // Emit WebSocket event to customer tracking this order
      try {
        const socket = getOrderTrackingSocket();
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
      } catch (error) {
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
  } catch (error) {
    console.error('Error updating rider location:', error);
    res.status(500).json({ message: 'Failed to update location' });
  }
};

/**
 * Get rider's current location
 */
export const getLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const riderId = (req as AuthRequest).user?.id;
    if (!riderId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const riderRepo = AppDataSource.getRepository(Rider);
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
  } catch (error) {
    console.error('Error getting rider location:', error);
    res.status(500).json({ message: 'Failed to get location' });
  }
};

/**
 * Get rider location for a specific order (for customer tracking)
 */
export const getRiderLocationForOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    
    const orderRepo = AppDataSource.getRepository(Order);
    const riderRepo = AppDataSource.getRepository(Rider);

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
  } catch (error) {
    console.error('Error getting rider location for order:', error);
    res.status(500).json({ message: 'Failed to get rider location' });
  }
};
