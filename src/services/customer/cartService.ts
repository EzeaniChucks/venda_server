import { AppDataSource } from '../../config/data-source';
import { Cart, Product } from '../../entities';
import { IsNull } from 'typeorm';

export class CartService {
  private cartRepository = AppDataSource.getRepository(Cart);
  private productRepository = AppDataSource.getRepository(Product);

  async getCart(customerId: string): Promise<Cart[]> {
    return await this.cartRepository.find({
      where: { customerId },
      relations: ['product', 'product.category'],
      order: { createdAt: 'DESC' }
    });
  }

  async addToCart(customerId: string, data: {
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
  }): Promise<Cart> {
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
        size: data.size || IsNull(),
        color: data.color || IsNull()
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

  async updateCartItem(customerId: string, cartId: string, quantity: number): Promise<Cart> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartId, customerId }
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    cartItem.quantity = quantity;
    return await this.cartRepository.save(cartItem);
  }

  async removeFromCart(customerId: string, cartId: string): Promise<void> {
    const result = await this.cartRepository.delete({ id: cartId, customerId });

    if (!result.affected) {
      throw new Error('Cart item not found');
    }
  }

  async clearCart(customerId: string): Promise<void> {
    await this.cartRepository.delete({ customerId });
  }
}

export default new CartService();
