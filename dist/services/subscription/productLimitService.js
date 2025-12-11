"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../config/data-source");
const Product_1 = require("../../entities/Product");
const subscriptionService_1 = __importDefault(require("./subscriptionService"));
class ProductLimitService {
    constructor() {
        this.productRepository = data_source_1.AppDataSource.getRepository(Product_1.Product);
    }
    async checkProductLimit(vendorId) {
        const subscription = await subscriptionService_1.default.getVendorSubscription(vendorId);
        if (!subscription) {
            return {
                canAdd: false,
                currentCount: 0,
                limit: 0,
                message: "No active subscription found. Please subscribe to a plan.",
            };
        }
        const currentCount = await this.productRepository.count({
            where: { vendorId },
        });
        const limit = subscription.itemLimit;
        if (limit === -1) {
            return { canAdd: true, currentCount, limit: -1 };
        }
        const canAdd = currentCount < limit;
        return {
            canAdd,
            currentCount,
            limit,
            message: canAdd
                ? undefined
                : `Product limit reached. Upgrade your subscription to add more products.`,
        };
    }
    async getRemainingQuota(vendorId) {
        const subscription = await subscriptionService_1.default.getVendorSubscription(vendorId);
        if (!subscription) {
            return { remaining: 0, total: 0, percentage: 0 };
        }
        const currentCount = await this.productRepository.count({
            where: { vendorId },
        });
        const limit = subscription.itemLimit;
        if (limit === -1) {
            return { remaining: -1, total: -1, percentage: 0 };
        }
        const remaining = Math.max(0, limit - currentCount);
        const percentage = (currentCount / limit) * 100;
        return { remaining, total: limit, percentage };
    }
    async enforceProductLimit(vendorId) {
        const check = await this.checkProductLimit(vendorId);
        if (!check.canAdd) {
            throw new Error(check.message || "Product limit exceeded");
        }
    }
}
exports.default = new ProductLimitService();
//# sourceMappingURL=productLimitService.js.map