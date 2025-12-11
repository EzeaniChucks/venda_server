"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../../config/data-source");
const SavedLocation_1 = require("../../entities/SavedLocation");
const geocoding_service_1 = require("../../services/shared/geocoding.service");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { id: customerId } = req.user;
        const { label, type, address, latitude, longitude, deliveryInstructions, isDefault } = req.body;
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }
        const locationRepo = data_source_1.AppDataSource.getRepository(SavedLocation_1.SavedLocation);
        let lat = latitude;
        let lng = longitude;
        let geoData = null;
        if (!lat || !lng) {
            geoData = await geocoding_service_1.GeocodingService.geocodeAddress(address);
            if (geoData) {
                lat = geoData.latitude;
                lng = geoData.longitude;
            }
        }
        if (isDefault) {
            await locationRepo.update({ customerId, isDefault: true }, { isDefault: false });
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
    }
    catch (error) {
        console.error('Save location error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/status', auth_1.authenticate, async (req, res) => {
    try {
        const { id: customerId } = req.user;
        const locationRepo = data_source_1.AppDataSource.getRepository(SavedLocation_1.SavedLocation);
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
    }
    catch (error) {
        console.error('Location status error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { id: customerId } = req.user;
        const locationRepo = data_source_1.AppDataSource.getRepository(SavedLocation_1.SavedLocation);
        const locations = await locationRepo.find({
            where: { customerId },
            order: { isDefault: 'DESC', createdAt: 'DESC' }
        });
        res.json(locations);
    }
    catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id: customerId } = req.user;
        const { id } = req.params;
        const locationRepo = data_source_1.AppDataSource.getRepository(SavedLocation_1.SavedLocation);
        const location = await locationRepo.findOne({
            where: { id, customerId }
        });
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json(location);
    }
    catch (error) {
        console.error('Get location error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id: customerId } = req.user;
        const { id } = req.params;
        const updateData = req.body;
        const locationRepo = data_source_1.AppDataSource.getRepository(SavedLocation_1.SavedLocation);
        const location = await locationRepo.findOne({
            where: { id, customerId }
        });
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        if (updateData.isDefault === true) {
            await locationRepo.update({ customerId, isDefault: true }, { isDefault: false });
        }
        Object.assign(location, updateData);
        const updated = await locationRepo.save(location);
        res.json(updated);
    }
    catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id: customerId } = req.user;
        const { id } = req.params;
        const locationRepo = data_source_1.AppDataSource.getRepository(SavedLocation_1.SavedLocation);
        const result = await locationRepo.delete({ id, customerId });
        if (result.affected === 0) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json({ message: 'Location deleted successfully' });
    }
    catch (error) {
        console.error('Delete location error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/geocode', auth_1.authenticate, async (req, res) => {
    try {
        const { address } = req.body;
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }
        const result = await geocoding_service_1.GeocodingService.geocodeAddress(address);
        if (!result) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.json(result);
    }
    catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=location.routes.js.map