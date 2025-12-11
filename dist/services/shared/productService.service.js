"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const data_source_1 = require("../../config/data-source");
const entities_1 = require("../../entities");
const distance_1 = require("../../utils/distance");
class ProductService {
    constructor() {
        this.productRepository = data_source_1.AppDataSource.getRepository(entities_1.Product);
    }
    async getAllProducts(filters = {}) {
        const { gender, category_id, search, min_price, max_price, latitude, longitude, radius = 200, page = 1, limit = 20, } = filters;
        const queryBuilder = this.productRepository
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.category", "category")
            .leftJoinAndSelect("product.vendor", "vendor")
            .where("product.isActive = :isActive", { isActive: true })
            .andWhere("product.isApproved = :isApproved", { isApproved: true });
        if (gender) {
            queryBuilder.andWhere("product.gender = :gender", { gender });
        }
        if (category_id) {
            queryBuilder.andWhere("product.categoryId = :categoryId", {
                categoryId: category_id,
            });
        }
        if (search) {
            queryBuilder.andWhere("(product.name ILIKE :search OR product.description ILIKE :search)", { search: `%${search}%` });
        }
        if (min_price !== undefined) {
            queryBuilder.andWhere("product.price >= :minPrice", {
                minPrice: min_price,
            });
        }
        if (max_price !== undefined) {
            queryBuilder.andWhere("product.price <= :maxPrice", {
                maxPrice: max_price,
            });
        }
        if (latitude !== undefined && longitude !== undefined) {
            queryBuilder.andWhere("vendor.latitude IS NOT NULL");
            queryBuilder.andWhere("vendor.longitude IS NOT NULL");
            const distanceFormula = `
        (6371 * acos(
          cos(radians(:latitude)) * 
          cos(radians(vendor.latitude)) * 
          cos(radians(vendor.longitude) - radians(:longitude)) + 
          sin(radians(:latitude)) * 
          sin(radians(vendor.latitude))
        ))
      `;
            queryBuilder
                .andWhere(`${distanceFormula} <= :radius`, {
                latitude,
                longitude,
                radius,
            })
                .addSelect(`${distanceFormula}`, "distance")
                .orderBy("distance", "ASC");
        }
        else {
            queryBuilder.orderBy("product.createdAt", "DESC");
        }
        queryBuilder.skip((page - 1) * limit).take(limit);
        const products = await queryBuilder.getMany();
        if (latitude !== undefined && longitude !== undefined) {
            return products.map((product) => {
                const distance = product.vendor?.latitude && product.vendor?.longitude
                    ? distance_1.DistanceCalculator.calculateDistance(latitude, longitude, Number(product.vendor.latitude), Number(product.vendor.longitude))
                    : null;
                return {
                    ...product,
                    distance,
                    distanceFormatted: distance
                        ? distance_1.DistanceCalculator.formatDistance(distance)
                        : null,
                };
            });
        }
        return products;
    }
    async getProductById(id) {
        const product = await this.productRepository.findOne({
            where: {
                id,
            },
            relations: ["category", "vendor"],
        });
        if (!product) {
            throw new Error("Product not found");
        }
        return product;
    }
    async getProductsByCategory(categoryId) {
        return await this.productRepository.find({
            where: { categoryId, isActive: true, isApproved: true },
            relations: ["category", "vendor"],
            order: { createdAt: "DESC" },
        });
    }
}
exports.ProductService = ProductService;
exports.default = new ProductService();
//# sourceMappingURL=productService.service.js.map