"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocation = exports.setLocation = void 0;
const locationService_1 = __importDefault(require("../../services/vendor/locationService"));
const setLocation = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { latitude, longitude, address, city, state } = req.body;
        if (latitude === undefined ||
            latitude === null ||
            longitude === undefined ||
            longitude === null) {
            res.status(400).json({ message: "Latitude and longitude are required" });
            return;
        }
        if (latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180) {
            res.status(400).json({ message: "Invalid coordinates" });
            return;
        }
        const vendor = await locationService_1.default.setLocation({
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
    }
    catch (error) {
        console.error("Error setting vendor location:", error);
        res.status(500).json({ message: "Failed to set location" });
    }
};
exports.setLocation = setLocation;
const getLocation = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const vendor = await locationService_1.default.getLocation(vendorId);
        res.status(200).json({
            hasLocation: vendor.latitude !== undefined &&
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
    }
    catch (error) {
        console.error("Error getting vendor location:", error);
        res.status(500).json({ message: "Failed to get location" });
    }
};
exports.getLocation = getLocation;
//# sourceMappingURL=locationController.js.map