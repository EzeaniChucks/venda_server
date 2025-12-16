"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorService = void 0;
const cloudinary_1 = require("../../utils/cloudinary");
const cloudinary_2 = __importDefault(require("../../config/cloudinary"));
const data_source_1 = require("../../config/data-source");
const entities_1 = require("../../entities");
class VendorService {
    constructor() {
        this.productRepository = data_source_1.AppDataSource.getRepository(entities_1.Product);
        this.vendorProfileRepository = data_source_1.AppDataSource.getRepository(entities_1.VendorProfile);
        this.vendorRepository = data_source_1.AppDataSource.getRepository(entities_1.Vendor);
        this.orderItemRepository = data_source_1.AppDataSource.getRepository(entities_1.OrderItem);
    }
    async getVendorApprovalStatus(vendorId) {
        const vendor = await this.vendorRepository.findOne({
            where: { id: vendorId },
        });
        return vendor?.isApproved;
    }
    async getVendorProducts(vendorId, filters = {}) {
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
    async getDashboardStats(vendorId) {
        const productsStats = await this.productRepository
            .createQueryBuilder("product")
            .select("COUNT(*)", "total_products")
            .addSelect("SUM(CASE WHEN product.is_approved = true THEN 1 ELSE 0 END)", "approved_products")
            .addSelect("SUM(CASE WHEN product.is_approved = false THEN 1 ELSE 0 END)", "pending_approval")
            .where("product.vendorId = :vendorId", { vendorId })
            .andWhere("product.isActive = true")
            .getRawOne();
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const ordersStats = await this.orderItemRepository
            .createQueryBuilder("item")
            .select("COUNT(DISTINCT item.orderId)", "total_orders")
            .addSelect("SUM(item.totalPrice)", "total_revenue")
            .addSelect("SUM(CASE WHEN item.vendor_status = 'pending' THEN 1 ELSE 0 END)", "pending_orders")
            .addSelect("SUM(CASE WHEN item.vendor_status = 'ready' THEN 1 ELSE 0 END)", "ready_orders")
            .addSelect("SUM(CASE WHEN item.createdAt >= :startOfToday THEN item.totalPrice ELSE 0 END)", "today_revenue")
            .addSelect("SUM(CASE WHEN item.createdAt >= :startOfMonth THEN item.totalPrice ELSE 0 END)", "this_month_revenue")
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
    async getVendorProfile(vendorId) {
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
    async updateVendorProfile(vendorId, profileData) {
        const { profileImage, businessName, businessDescription, businessAddress, businessPhone, businessState, businessCity, bankAccountName, bankAccountNumber, bankName, bankCode, longitude, latitude, address, state, city, phone, } = profileData;
        const vendor = await this.vendorRepository.findOne({
            where: { id: vendorId },
            relations: ["vendorProfile"],
        });
        if (!vendor)
            throw new Error("Vendor not found");
        if (!vendor.vendorProfile) {
            throw new Error("Vendor Profile not found");
        }
        const oldProfileImage = vendor.vendorProfile.profileImage;
        try {
            if (businessName !== undefined)
                vendor.businessName = businessName;
            if (phone !== undefined)
                vendor.phone = phone;
            if (state !== undefined)
                vendor.state = state;
            if (city !== undefined)
                vendor.city = city;
            if (address !== undefined)
                vendor.address = address;
            if (longitude !== undefined)
                vendor.longitude = longitude;
            if (latitude !== undefined)
                vendor.latitude = latitude;
            if (businessPhone !== undefined)
                vendor.phone = businessPhone;
            if (businessState !== undefined)
                vendor.state = businessState;
            if (businessCity !== undefined)
                vendor.city = businessCity;
            if (businessAddress !== undefined)
                vendor.address = businessAddress;
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
            if (longitude !== undefined || latitude !== undefined) {
                this.validateCoordinates(longitude, latitude);
            }
            await this.vendorRepository.save(vendor);
            await this.vendorProfileRepository.save(vendor.vendorProfile);
            if (oldProfileImage &&
                profileImage &&
                oldProfileImage !== profileImage &&
                (0, cloudinary_1.isCloudinaryUrl)(oldProfileImage)) {
                try {
                    const oldPublicId = (0, cloudinary_1.extractPublicId)(oldProfileImage);
                    if (oldPublicId) {
                        await cloudinary_2.default.uploader.destroy(oldPublicId, {
                            invalidate: true,
                        });
                        console.log(`Deleted old image: ${oldPublicId}`);
                    }
                }
                catch (cloudinaryError) {
                    console.error("Failed to delete old Cloudinary image:", cloudinaryError);
                }
            }
            return vendor;
        }
        catch (error) {
            if (oldProfileImage) {
                vendor.vendorProfile.profileImage = oldProfileImage;
                await this.vendorProfileRepository.save(vendor.vendorProfile);
            }
            console.error("Profile update failed:", error);
            throw new Error(`Failed to update profile: ${error.message}`);
        }
    }
    validateCoordinates(longitude, latitude) {
        if (longitude !== undefined && latitude !== undefined) {
            if (longitude < -180 || longitude > 180) {
                throw new Error("Invalid longitude value. Must be between -180 and 180.");
            }
            if (latitude < -90 || latitude > 90) {
                throw new Error("Invalid latitude value. Must be between -90 and 90.");
            }
            const isNigeria = longitude >= 2.7 &&
                longitude <= 14.7 &&
                latitude >= 4.2 &&
                latitude <= 13.9;
            if (!isNigeria) {
                console.warn("Coordinates are outside Nigeria boundaries");
            }
        }
        else if ((longitude !== undefined && latitude === undefined) ||
            (longitude === undefined && latitude !== undefined)) {
            throw new Error("Both longitude and latitude must be provided together");
        }
    }
}
exports.VendorService = VendorService;
exports.default = new VendorService();
//# sourceMappingURL=vendorService.js.map