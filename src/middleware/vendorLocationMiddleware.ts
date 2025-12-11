import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { Vendor } from '../entities/Vendor';
import { AuthRequest } from '../types';

/**
 * Middleware to ensure vendor has set their location
 * This is required for operations that need vendor's geographic position (e.g., product creation)
 */
export const requireVendorLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vendorId = (req as AuthRequest).user?.id;
    
    if (!vendorId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const vendorRepo = AppDataSource.getRepository(Vendor);
    const vendor = await vendorRepo.findOne({ where: { id: vendorId } });

    if (!vendor) {
      res.status(404).json({ message: 'Vendor not found' });
      return;
    }

    // Check if vendor has set their location (latitude and longitude are required)
    if (vendor.latitude === undefined || vendor.latitude === null || 
        vendor.longitude === undefined || vendor.longitude === null) {
      res.status(403).json({
        message: 'Location required',
        error: 'Please set your business location before performing this action. Customers need your location to discover your products.',
        requiresLocation: true,
      });
      return;
    }

    // Location is set, proceed
    next();
  } catch (error) {
    console.error('Error checking vendor location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
