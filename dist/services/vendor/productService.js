"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorProductService = void 0;
const data_source_1 = require("../../config/data-source");
const Product_1 = require("../../entities/Product");
const Vendor_1 = require("../../entities/Vendor");
const productLimitService_1 = __importDefault(require("../subscription/productLimitService"));
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
        console.log("geot here 1");
        await productLimitService_1.default.enforceProductLimit(vendorId);
        console.log("geot here 2");
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
        console.log("geot here 3");
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
        });
        if (!product) {
            throw new Error("Product not found or you do not have permission to delete it");
        }
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
}
exports.VendorProductService = VendorProductService;
exports.default = new VendorProductService();
//# sourceMappingURL=productService.js.map