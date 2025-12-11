"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const data_source_1 = require("../../config/data-source");
const entities_1 = require("../../entities");
const typeorm_1 = require("typeorm");
class CartService {
    constructor() {
        this.cartRepository = data_source_1.AppDataSource.getRepository(entities_1.Cart);
        this.productRepository = data_source_1.AppDataSource.getRepository(entities_1.Product);
    }
    async getCart(customerId) {
        return await this.cartRepository.find({
            where: { customerId },
            relations: ['product', 'product.category'],
            order: { createdAt: 'DESC' }
        });
    }
    async addToCart(customerId, data) {
        const product = await this.productRepository.findOne({
            where: { id: data.productId }
        });
        if (!product) {
            throw new Error('Product not found');
        }
        if (product.stockQuantity < data.quantity) {
            throw new Error('Insufficient stock');
        }
        const existingCartItem = await this.cartRepository.findOne({
            where: {
                customerId,
                productId: data.productId,
                size: data.size || (0, typeorm_1.IsNull)(),
                color: data.color || (0, typeorm_1.IsNull)()
            }
        });
        if (existingCartItem) {
            existingCartItem.quantity += data.quantity;
            return await this.cartRepository.save(existingCartItem);
        }
        const cartItem = this.cartRepository.create({
            customerId,
            productId: data.productId,
            quantity: data.quantity,
            size: data.size,
            color: data.color
        });
        return await this.cartRepository.save(cartItem);
    }
    async updateCartItem(customerId, cartId, quantity) {
        const cartItem = await this.cartRepository.findOne({
            where: { id: cartId, customerId }
        });
        if (!cartItem) {
            throw new Error('Cart item not found');
        }
        cartItem.quantity = quantity;
        return await this.cartRepository.save(cartItem);
    }
    async removeFromCart(customerId, cartId) {
        const result = await this.cartRepository.delete({ id: cartId, customerId });
        if (!result.affected) {
            throw new Error('Cart item not found');
        }
    }
    async clearCart(customerId) {
        await this.cartRepository.delete({ customerId });
    }
}
exports.CartService = CartService;
exports.default = new CartService();
//# sourceMappingURL=cartService.js.map