"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorProductService = void 0;
const cloudinary_1 = require("../../utils/cloudinary");
const data_source_1 = require("../../config/data-source");
const Product_1 = require("../../entities/Product");
const Vendor_1 = require("../../entities/Vendor");
const productLimitService_1 = __importDefault(require("../subscription/productLimitService"));
const cloudinary_2 = require("../../config/cloudinary");
const productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
const vendorRepo = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
class VendorProductService {
    async createProduct(vendorId, data) {
        const vendor = await vendorRepo.findOne({ where: { id: vendorId } });
        if (!vendor) {
            throw new Error("Vendor not found");
        }
        if (!vendor.isApproved) {
            throw new Error("Your vendor account must be approved before creating products");
        }
        await productLimitService_1.default.enforceProductLimit(vendorId);
        const product = productRepo.create({
            ...data,
            vendorId,
            isFeatured: false,
            isActive: true,
            isApproved: false,
            rating: 0,
            totalReviews: 0,
            totalSales: 0,
        });
        return await productRepo.save(product);
    }
    async updateProduct(vendorId, productId, data) {
        const product = await productRepo.findOne({
            where: { id: productId, vendorId },
        });
        if (!product) {
            throw new Error("Product not found or you do not have permission to edit it");
        }
        delete data.vendorId;
        delete data.id;
        delete data.totalSales;
        delete data.rating;
        delete data.totalReviews;
        delete data.isFeatured;
        const significantChanges = ["name", "description", "price", "categoryId"];
        const hasSignificantChanges = Object.keys(data).some((key) => significantChanges.includes(key));
        if (hasSignificantChanges && product.isApproved) {
            data.isApproved = false;
        }
        Object.assign(product, data);
        return await productRepo.save(product);
    }
    async deleteProduct(vendorId, productId) {
        const product = await productRepo.findOne({
            where: { id: productId, vendorId },
            select: ["id", "images", "imagePublicIds", "isActive"],
        });
        if (!product) {
            throw new Error("Product not found or you do not have permission to delete it");
        }
        await this.deleteProductImages(product);
        product.isActive = false;
        await productRepo.save(product);
        return { message: "Product deleted successfully" };
    }
    async toggleProductStatus(vendorId, productId) {
        const product = await productRepo.findOne({
            where: { id: productId, vendorId },
        });
        if (!product) {
            throw new Error("Product not found or you do not have permission to modify it");
        }
        product.isActive = !product.isActive;
        return await productRepo.save(product);
    }
    async deleteProductImages(product) {
        try {
            if (product.imagePublicIds && product.imagePublicIds.length > 0) {
                await this.deleteImagesByPublicIds(product.imagePublicIds);
                return;
            }
            if (product.images && product.images.length > 0) {
                const cloudinaryUrls = product.images.filter((url) => (0, cloudinary_1.isCloudinaryUrl)(url));
                if (cloudinaryUrls.length > 0) {
                    await this.deleteImagesByUrls(cloudinaryUrls);
                }
            }
        }
        catch (error) {
            console.error("Error deleting product images from Cloudinary:", error);
        }
    }
    async deleteImagesByPublicIds(publicIds) {
        const deletePromises = publicIds
            .filter((publicId) => publicId && publicId.trim() !== "")
            .map(async (publicId) => {
            try {
                await (0, cloudinary_2.deleteImage)(publicId);
                console.log(`Successfully deleted image with publicId: ${publicId}`);
            }
            catch (error) {
                console.error(`Failed to delete image with publicId: ${publicId}`, error);
            }
        });
        await Promise.all(deletePromises);
    }
    async deleteImagesByUrls(imageUrls) {
        const deletePromises = imageUrls.map(async (url) => {
            try {
                const publicId = (0, cloudinary_1.extractPublicId)(url);
                if (publicId) {
                    await (0, cloudinary_2.deleteImage)(publicId);
                    console.log(`Successfully deleted image: ${url}`);
                }
                else {
                    console.warn(`Could not extract public ID from URL: ${url}`);
                }
            }
            catch (error) {
                console.error(`Failed to delete image: ${url}`, error);
            }
        });
        await Promise.all(deletePromises);
    }
}
exports.VendorProductService = VendorProductService;
exports.default = new VendorProductService();
//# sourceMappingURL=productService.js.map