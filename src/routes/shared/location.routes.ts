import { Router } from 'express';
import { AppDataSource } from '../../config/data-source';
import { SavedLocation } from '../../entities/SavedLocation';
import { GeocodingService } from '../../services/shared/geocoding.service';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';

const router = Router();

/**
 * Save a new location
 * POST /api/locations
 */
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id: customerId } = req.user!;
    const { label, type, address, latitude, longitude, deliveryInstructions, isDefault } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const locationRepo = AppDataSource.getRepository(SavedLocation);

    // Geocode if coordinates not provided
    let lat = latitude;
    let lng = longitude;
    let geoData = null;

    if (!lat || !lng) {
      geoData = await GeocodingService.geocodeAddress(address);
      if (geoData) {
        lat = geoData.latitude;
        lng = geoData.longitude;
      }
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await locationRepo.update(
        { customerId, isDefault: true },
        { isDefault: false }
      );
    }

    const location = locationRepo.create({
      customerId,
      label: label || 'My Location',
      type: type || 'other',
      address: geoData?.formattedAddress || address,
      latitude: lat,
      longitude: lng,
      city: geoData?.city,
      state: geoData?.state,
      country: geoData?.country,
      postalCode: geoData?.postalCode,
      deliveryInstructions,
      isDefault: isDefault || false
    });

    const savedLocation = await locationRepo.save(location);

    res.status(201).json(savedLocation);
  } catch (error: any) {
    console.error('Save location error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Check if user has set their location
 * GET /api/locations/status
 */
router.get('/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id: customerId } = req.user!;

    const locationRepo = AppDataSource.getRepository(SavedLocation);
    const defaultLocation = await locationRepo.findOne({
      where: { customerId, isDefault: true }
    });

    const hasLocation = !!defaultLocation;
    
    res.json({
      hasLocation,
      defaultLocation: defaultLocation || null,
      message: hasLocation 
        ? 'Default location is set' 
        : 'No default location found. Please set your location to continue.'
    });
  } catch (error: any) {
    console.error('Location status error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all saved locations
 * GET /api/locations
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id: customerId } = req.user!;

    const locationRepo = AppDataSource.getRepository(SavedLocation);
    const locations = await locationRepo.find({
      where: { customerId },
      order: { isDefault: 'DESC', createdAt: 'DESC' }
    });

    res.json(locations);
  } catch (error: any) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get location by ID
 * GET /api/locations/:id
 */
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id: customerId } = req.user!;
    const { id } = req.params;

    const locationRepo = AppDataSource.getRepository(SavedLocation);
    const location = await locationRepo.findOne({
      where: { id, customerId }
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error: any) {
    console.error('Get location error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update location
 * PUT /api/locations/:id
 */
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id: customerId } = req.user!;
    const { id } = req.params;
    const updateData = req.body;

    const locationRepo = AppDataSource.getRepository(SavedLocation);
    const location = await locationRepo.findOne({
      where: { id, customerId }
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // If setting as default, unset others
    if (updateData.isDefault === true) {
      await locationRepo.update(
        { customerId, isDefault: true },
        { isDefault: false }
      );
    }

    Object.assign(location, updateData);
    const updated = await locationRepo.save(location);

    res.json(updated);
  } catch (error: any) {
    console.error('Update location error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete location
 * DELETE /api/locations/:id
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id: customerId } = req.user!;
    const { id } = req.params;

    const locationRepo = AppDataSource.getRepository(SavedLocation);
    const result = await locationRepo.delete({ id, customerId });

    if (result.affected === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({ message: 'Location deleted successfully' });
  } catch (error: any) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Geocode an address
 * POST /api/locations/geocode
 */
router.post('/geocode', authenticate, async (req: AuthRequest, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const result = await GeocodingService.geocodeAddress(address);

    if (!result) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(result);
  } catch (error: any) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
