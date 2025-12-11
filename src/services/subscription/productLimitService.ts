import { AppDataSource } from "../../config/data-source";
import { Product } from "../../entities/Product";
import { VendorSubscription } from "../../entities/VendorSubscription";
import subscriptionService from "./subscriptionService";

class ProductLimitService {
  private productRepository = AppDataSource.getRepository(Product);

  async checkProductLimit(
    vendorId: string
  ): Promise<{
    canAdd: boolean;
    currentCount: number;
    limit: number;
    message?: string;
  }> {
    const subscription = await subscriptionService.getVendorSubscription(
      vendorId
    );

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

    // Elite tier has unlimited products
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

  async getRemainingQuota(
    vendorId: string
  ): Promise<{ remaining: number; total: number; percentage: number }> {
    const subscription = await subscriptionService.getVendorSubscription(
      vendorId
    );

    if (!subscription) {
      return { remaining: 0, total: 0, percentage: 0 };
    }

    const currentCount = await this.productRepository.count({
      where: { vendorId },
    });
    const limit = subscription.itemLimit;

    
    // console.log("item remaining qoata:", currentCount, "limit:", limit)

    // Elite tier has unlimited products
    if (limit === -1) {
      return { remaining: -1, total: -1, percentage: 0 };
    }

    const remaining = Math.max(0, limit - currentCount);
    const percentage = (currentCount / limit) * 100;

    return { remaining, total: limit, percentage };
  }

  async enforceProductLimit(vendorId: string): Promise<void> {
    const check = await this.checkProductLimit(vendorId);

    if (!check.canAdd) {
      throw new Error(check.message || "Product limit exceeded");
    }
  }
}

export default new ProductLimitService();
