"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../config/data-source");
const entities_1 = require("../../entities");
const error_1 = require("../../utils/error");
const vendorRepo = data_source_1.AppDataSource.getRepository(entities_1.Vendor);
class LocationService {
    async getLocation(vendorId) {
        const vendor = await vendorRepo.findOne({ where: { id: vendorId } });
        if (!vendor) {
            throw new error_1.AppError("Vendor not found", 404);
        }
        return vendor;
    }
    async setLocation({ vendorId, latitude, longitude, address, city, state, }) {
        const vendor = await vendorRepo.findOne({
            where: { id: vendorId },
            select: ["vendorProfile"],
        });
        if (!vendor) {
            throw new error_1.AppError("Vendor not found");
        }
        vendor.latitude = latitude;
        vendor.longitude = longitude;
        if (address) {
            vendor.address = address;
            if (vendor.vendorProfile)
                vendor.vendorProfile.businessAddress = address;
        }
        if (city)
            vendor.city = city;
        if (state)
            vendor.state = state;
        return await vendorRepo.save(vendor);
    }
}
exports.default = new LocationService();
//# sourceMappingURL=locationService.js.map