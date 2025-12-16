import { extractPublicId, isCloudinaryUrl } from "../../utils/cloudinary";
import cloudinary from "../../config/cloudinary";
import { AppDataSource } from "../../config/data-source";
import { Product, VendorProfile, Vendor, OrderItem } from "../../entities";

export class VendorService {
  private productRepository = AppDataSource.getRepository(Product);
  private vendorProfileRepository = AppDataSource.getRepository(VendorProfile);
  private vendorRepository = AppDataSource.getRepository(Vendor);
  private orderItemRepository = AppDataSource.getRepository(OrderItem);

  async getVendorApprovalStatus(vendorId: string) {
    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorId },
    });

    return vendor?.isApproved;
  }

  async getVendorProducts(
    vendorId: string,
    filters: any = {}
  ): Promise<Product[]> {
    const { is_approved, page = 1, limit = 20 } = filters;

    const queryBuilder = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .where("product.vendorId = :vendorId", { vendorId })
      .andWhere("product.isActive = :isActive", { isActive: true });

    if (is_approved !== undefined) {
      queryBuilder.andWhere("product.isApproved = :isApproved", {
        isApproved: is_approved,
      });
    }

    const products = await queryBuilder
      .orderBy("product.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return products;
  }

  orders: {
    pending_orders: number | string | null;
    ready_orders: number | string | null;
    total_orders: number | string | null;
    total_revenue: number | null;
    today_revenue: number | null;
    this_month_revenue: number | null;
  };

  async getDashboardStats(vendorId: string): Promise<any> {
    const productsStats = await this.productRepository
      .createQueryBuilder("product")
      .select("COUNT(*)", "total_products")
      .addSelect(
        "SUM(CASE WHEN product.is_approved = true THEN 1 ELSE 0 END)",
        "approved_products"
      )
      .addSelect(
        "SUM(CASE WHEN product.is_approved = false THEN 1 ELSE 0 END)",
        "pending_approval"
      )
      .where("product.vendorId = :vendorId", { vendorId })
      .andWhere("product.isActive = true")
      .getRawOne();

    // Get today's date and start of month for revenue calculations
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const ordersStats = await this.orderItemRepository
      .createQueryBuilder("item")
      .select("COUNT(DISTINCT item.orderId)", "total_orders")
      .addSelect("SUM(item.totalPrice)", "total_revenue")
      .addSelect(
        "SUM(CASE WHEN item.vendor_status = 'pending' THEN 1 ELSE 0 END)",
        "pending_orders"
      )
      .addSelect(
        "SUM(CASE WHEN item.vendor_status = 'ready' THEN 1 ELSE 0 END)",
        "ready_orders"
      )
      .addSelect(
        "SUM(CASE WHEN item.createdAt >= :startOfToday THEN item.totalPrice ELSE 0 END)",
        "today_revenue"
      )
      .addSelect(
        "SUM(CASE WHEN item.createdAt >= :startOfMonth THEN item.totalPrice ELSE 0 END)",
        "this_month_revenue"
      )
      .where("item.vendorId = :vendorId", { vendorId })
      .setParameters({
        vendorId,
        startOfToday,
        startOfMonth,
      })
      .getRawOne();

    const profile = await this.vendorProfileRepository.findOne({
      where: { vendorId },
    });

    return {
      products: productsStats,
      orders: ordersStats,
      profile: profile || {},
    };
  }

  async getVendorProfile(vendorId: string): Promise<any> {
    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorId },
      relations: ["vendorProfile"],
    });

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    const { password, ...vendorWithoutPassword } = vendor;
    return vendorWithoutPassword;
  }

  async updateVendorProfile(
    vendorId: string,
    profileData: any
  ): Promise<Vendor> {
    const {
      profileImage,
      businessName,
      businessDescription,
      businessAddress,
      businessPhone,
      businessState,
      businessCity,
      bankAccountName,
      bankAccountNumber,
      bankName,
      bankCode,
      longitude,
      latitude,
      address, // Regular address field (from location search)
      state, // Regular state field (from location search)
      city, // Regular city field (from location search)
      phone, // Regular phone field
    } = profileData;

    // Find existing vendor with profile
    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorId },
      relations: ["vendorProfile"],
    });

    if (!vendor) throw new Error("Vendor not found");

    if (!vendor.vendorProfile) {
      throw new Error("Vendor Profile not found");
    }

    // Store old image URL for potential cleanup
    const oldProfileImage = vendor.vendorProfile.profileImage;

    try {
      // Update vendor basic info
      if (businessName !== undefined) vendor.businessName = businessName;
      if (phone !== undefined) vendor.phone = phone;
      if (state !== undefined) vendor.state = state;
      if (city !== undefined) vendor.city = city;
      if (address !== undefined) vendor.address = address;

      // Update longitude and latitude on main Vendor entity
      if (longitude !== undefined) vendor.longitude = longitude;
      if (latitude !== undefined) vendor.latitude = latitude;

      // Also accept business-specific fields (for backward compatibility)
      if (businessPhone !== undefined) vendor.phone = businessPhone;
      if (businessState !== undefined) vendor.state = businessState;
      if (businessCity !== undefined) vendor.city = businessCity;
      if (businessAddress !== undefined) vendor.address = businessAddress;

      // Update vendor profile details
      if (profileImage !== undefined) {
        vendor.vendorProfile.profileImage = profileImage;
      }
      if (businessDescription !== undefined) {
        vendor.vendorProfile.businessDescription = businessDescription;
      }
      if (businessAddress !== undefined) {
        vendor.vendorProfile.businessAddress = businessAddress;
      }
      if (businessPhone !== undefined) {
        vendor.vendorProfile.businessPhone = businessPhone;
      }
      if (bankAccountName !== undefined) {
        vendor.vendorProfile.bankAccountName = bankAccountName;
      }
      if (bankAccountNumber !== undefined) {
        vendor.vendorProfile.bankAccountNumber = bankAccountNumber;
      }
      if (bankName !== undefined) {
        vendor.vendorProfile.bankName = bankName;
      }
      if (bankCode !== undefined) {
        vendor.vendorProfile.bankCode = bankCode;
      }

      // Validate coordinates if provided
      if (longitude !== undefined || latitude !== undefined) {
        this.validateCoordinates(longitude, latitude);
      }

      // Save all changes to database first
      await this.vendorRepository.save(vendor);
      await this.vendorProfileRepository.save(vendor.vendorProfile);

      // Only after successful database update, delete old image
      if (
        oldProfileImage &&
        profileImage &&
        oldProfileImage !== profileImage &&
        isCloudinaryUrl(oldProfileImage)
      ) {
        try {
          const oldPublicId = extractPublicId(oldProfileImage);
          if (oldPublicId) {
            await cloudinary.uploader.destroy(oldPublicId, {
              invalidate: true,
            });
            console.log(`Deleted old image: ${oldPublicId}`);
          }
        } catch (cloudinaryError) {
          console.error(
            "Failed to delete old Cloudinary image:",
            cloudinaryError
          );
        }
      }

      return vendor;
    } catch (error: any) {
      if (oldProfileImage) {
        vendor.vendorProfile.profileImage = oldProfileImage;
        await this.vendorProfileRepository.save(vendor.vendorProfile);
      }

      console.error("Profile update failed:", error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  // Helper method to validate coordinates
  private validateCoordinates(longitude?: number, latitude?: number): void {
    if (longitude !== undefined && latitude !== undefined) {
      // Validate longitude range (-180 to 180)
      if (longitude < -180 || longitude > 180) {
        throw new Error(
          "Invalid longitude value. Must be between -180 and 180."
        );
      }

      // Validate latitude range (-90 to 90)
      if (latitude < -90 || latitude > 90) {
        throw new Error("Invalid latitude value. Must be between -90 and 90.");
      }

      // Optional: Validate for Nigeria specifically (approximate bounds)
      // Nigeria: Longitude: 2.7° E to 14.7° E, Latitude: 4.2° N to 13.9° N
      const isNigeria =
        longitude >= 2.7 &&
        longitude <= 14.7 &&
        latitude >= 4.2 &&
        latitude <= 13.9;

      if (!isNigeria) {
        console.warn("Coordinates are outside Nigeria boundaries");
      }
    } else if (
      (longitude !== undefined && latitude === undefined) ||
      (longitude === undefined && latitude !== undefined)
    ) {
      throw new Error("Both longitude and latitude must be provided together");
    }
  }
}

export default new VendorService();
