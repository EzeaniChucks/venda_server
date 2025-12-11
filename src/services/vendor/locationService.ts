import { AppDataSource } from "../../config/data-source";
import { Vendor } from "../../entities";
import { AppError } from "../../utils/error";

const vendorRepo = AppDataSource.getRepository(Vendor);

class LocationService {
  async getLocation(vendorId: string) {
    const vendor = await vendorRepo.findOne({ where: { id: vendorId } });
    if (!vendor) {
      throw new AppError("Vendor not found", 404);
    }
    return vendor;
  }

  async setLocation({
    vendorId,
    latitude,
    longitude,
    address,
    city,
    state,
  }: {
    vendorId: string;
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
  }) {
    const vendor = await vendorRepo.findOne({
      where: { id: vendorId },
      select: ["vendorProfile"],
    });

    if (!vendor) {
      throw new AppError("Vendor not found");
    }

    vendor.latitude = latitude;
    vendor.longitude = longitude;
    if (address) {
      vendor.address = address;
      if (vendor.vendorProfile) vendor.vendorProfile.businessAddress = address;
    }
    if (city) vendor.city = city;
    if (state) vendor.state = state;

    return await vendorRepo.save(vendor);
  }
}

export default new LocationService();
