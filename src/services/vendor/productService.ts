import { AppDataSource } from "../../config/data-source";
import { Product } from "../../entities/Product";
import { Vendor } from "../../entities/Vendor";
import productLimitService from "../subscription/productLimitService";

const productRepo = AppDataSource.getRepository(Product);
const vendorRepo = AppDataSource.getRepository(Vendor);

export class VendorProductService {
  async createProduct(
    vendorId: string,
    data: {
      name: string;
      description?: string;
      price: number;
      discountPrice?: number;
      stockQuantity: number;
      images?: string[];
      gender?: "male" | "female" | "unisex";
      ageCategory?: "adult" | "children";
      sizes?: string[];
      colors?: string[];
      categoryId?: string;
      madeInNigeria?: boolean;
      originState?: string;
      originCity?: string;
      stylesTags?: string[];
    }
  ) {
    const vendor = await vendorRepo.findOne({ where: { id: vendorId } });
    if (!vendor) {
      throw new Error("Vendor not found");
    }

    if (!vendor.isApproved) {
      throw new Error(
        "Your vendor account must be approved before creating products"
      );
    }

    // Enforce subscription product limit
    await productLimitService.enforceProductLimit(vendorId);

    const product = productRepo.create({
      ...data,
      vendorId,
      isFeatured: false, // only admin can determine featured products
      isActive: true,
      isApproved: false, // Products need admin approval
      rating: 0,
      totalReviews: 0,
      totalSales: 0,
    });

    return await productRepo.save(product);
  }

  async updateProduct(
    vendorId: string,
    productId: string,
    data: Partial<Product>
  ) {
    const product = await productRepo.findOne({
      where: { id: productId, vendorId },
    });

    if (!product) {
      throw new Error(
        "Product not found or you do not have permission to edit it"
      );
    }

    // Prevent changing critical fields
    delete (data as any).vendorId;
    delete (data as any).id;
    delete (data as any).totalSales;
    delete (data as any).rating;
    delete (data as any).totalReviews;
    delete (data as any).isFeatured;

    // console.log(data)
    
    // If product details are changed significantly, require re-approval
    const significantChanges = ["name", "description", "price", "categoryId"];
    const hasSignificantChanges = Object.keys(data).some((key) =>
      significantChanges.includes(key)
    );

    if (hasSignificantChanges && product.isApproved) {
      data.isApproved = false; // Requires re-approval
    }

    Object.assign(product, data);
    return await productRepo.save(product);
  }

  async deleteProduct(vendorId: string, productId: string) {
    const product = await productRepo.findOne({
      where: { id: productId, vendorId },
    });

    if (!product) {
      throw new Error(
        "Product not found or you do not have permission to delete it"
      );
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await productRepo.save(product);

    return { message: "Product deleted successfully" };
  }

  async toggleProductStatus(vendorId: string, productId: string) {
    const product = await productRepo.findOne({
      where: { id: productId, vendorId },
    });

    if (!product) {
      throw new Error(
        "Product not found or you do not have permission to modify it"
      );
    }

    product.isActive = !product.isActive;
    return await productRepo.save(product);
  }
}

export default new VendorProductService();
