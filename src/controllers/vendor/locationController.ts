import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import LocationService from "../../services/vendor/locationService";

/**
 * Set or update vendor location
 */
export const setLocation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const vendorId = (req as AuthRequest).user?.id;
    if (!vendorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { latitude, longitude, address, city, state } = req.body;

    if (
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null
    ) {
      res.status(400).json({ message: "Latitude and longitude are required" });
      return;
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      res.status(400).json({ message: "Invalid coordinates" });
      return;
    }

    const vendor = await LocationService.setLocation({
      vendorId,
      latitude,
      longitude,
      address,
      city,
      state,
    });

    res.status(200).json({
      message: "Location updated successfully",
      location: {
        latitude: vendor.latitude,
        longitude: vendor.longitude,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
      },
    });
  } catch (error) {
    console.error("Error setting vendor location:", error);
    res.status(500).json({ message: "Failed to set location" });
  }
};

/**
 * Get vendor location
 */
export const getLocation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const vendorId = (req as AuthRequest).user?.id;
    if (!vendorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const vendor = await LocationService.getLocation(vendorId);

    res.status(200).json({
      hasLocation:
        vendor.latitude !== undefined &&
        vendor.latitude !== null &&
        vendor.longitude !== undefined &&
        vendor.longitude !== null,
      location: {
        latitude: vendor.latitude,
        longitude: vendor.longitude,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
      },
    });
  } catch (error) {
    console.error("Error getting vendor location:", error);
    res.status(500).json({ message: "Failed to get location" });
  }
};
