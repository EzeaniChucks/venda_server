import { AppDataSource } from '../../config/data-source';
import { Wishlist, Product } from '../../entities';

export class WishlistService {
  private wishlistRepository = AppDataSource.getRepository(Wishlist);
  private productRepository = AppDataSource.getRepository(Product);

  async getWishlist(customerId: string): Promise<any[]> {
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

  async addToWishlist(customerId: string, productId: string): Promise<Wishlist | { message: string }> {
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

  async removeFromWishlist(customerId: string, itemId: string): Promise<{ id: string }> {
    const item = await this.wishlistRepository.findOne({
      where: { id: itemId, customerId }
    });

    if (!item) {
      throw new Error('Wishlist item not found');
    }

    await this.wishlistRepository.remove(item);
    return { id: itemId };
  }

  async isInWishlist(customerId: string, productId: string): Promise<{ inWishlist: boolean }> {
    const item = await this.wishlistRepository.findOne({
      where: { customerId, productId }
    });

    return { inWishlist: !!item };
  }
}

export default new WishlistService();
