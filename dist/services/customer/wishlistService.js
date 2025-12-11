"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistService = void 0;
const data_source_1 = require("../../config/data-source");
const entities_1 = require("../../entities");
class WishlistService {
    constructor() {
        this.wishlistRepository = data_source_1.AppDataSource.getRepository(entities_1.Wishlist);
        this.productRepository = data_source_1.AppDataSource.getRepository(entities_1.Product);
    }
    async getWishlist(customerId) {
        const wishlistItems = await this.wishlistRepository.find({
            where: { customerId },
            relations: ['product', 'product.category', 'product.vendor', 'product.vendor.vendorProfile'],
            order: { createdAt: 'DESC' }
        });
        return wishlistItems.map(item => ({
            ...item.product,
            wishlist_item_id: item.id,
            created_at: item.createdAt,
            vendor_name: item.product.vendor?.vendorProfile?.businessName || 'Unknown Vendor'
        }));
    }
    async addToWishlist(customerId, productId) {
        const product = await this.productRepository.findOne({
            where: { id: productId, isActive: true }
        });
        if (!product) {
            throw new Error('Product not found');
        }
        const existing = await this.wishlistRepository.findOne({
            where: { customerId, productId }
        });
        if (existing) {
            return { message: 'Already in wishlist' };
        }
        const wishlistItem = this.wishlistRepository.create({
            customerId,
            productId
        });
        return await this.wishlistRepository.save(wishlistItem);
    }
    async removeFromWishlist(customerId, itemId) {
        const item = await this.wishlistRepository.findOne({
            where: { id: itemId, customerId }
        });
        if (!item) {
            throw new Error('Wishlist item not found');
        }
        await this.wishlistRepository.remove(item);
        return { id: itemId };
    }
    async isInWishlist(customerId, productId) {
        const item = await this.wishlistRepository.findOne({
            where: { customerId, productId }
        });
        return { inWishlist: !!item };
    }
}
exports.WishlistService = WishlistService;
exports.default = new WishlistService();
//# sourceMappingURL=wishlistService.js.map