"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireVendorLocation = void 0;
const data_source_1 = require("../config/data-source");
const Vendor_1 = require("../entities/Vendor");
const requireVendorLocation = async (req, res, next) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const vendorRepo = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
        const vendor = await vendorRepo.findOne({ where: { id: vendorId } });
        if (!vendor) {
            res.status(404).json({ message: 'Vendor not found' });
            return;
        }
        if (vendor.latitude === undefined || vendor.latitude === null ||
            vendor.longitude === undefined || vendor.longitude === null) {
            res.status(403).json({
                message: 'Location required',
                error: 'Please set your business location before performing this action. Customers need your location to discover your products.',
                requiresLocation: true,
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Error checking vendor location:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.requireVendorLocation = requireVendorLocation;
//# sourceMappingURL=vendorLocationMiddleware.js.map