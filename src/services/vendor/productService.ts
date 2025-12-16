import { extractPublicId, isCloudinaryUrl } from "../../utils/cloudinary";
import { AppDataSource } from "../../config/data-source";
import { Product } from "../../entities/Product";
import { Vendor } from "../../entities/Vendor";
import productLimitService from "../subscription/productLimitService";
import { deleteImage } from "../../config/cloudinary";

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

    // console.log(data);

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
      select: ["id", "images", "imagePublicIds", "isActive"], // Select needed fields
    });

    if (!product) {
      throw new Error(
        "Product not found or you do not have permission to delete it"
      );
    }

    // First, delete images from Cloudinary
    await this.deleteProductImages(product);

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

  /**
   * Deletes product images from Cloudinary
   */
  private async deleteProductImages(product: Product): Promise<void> {
    try {
      // Method 1: Use imagePublicIds if available
      if (product.imagePublicIds && product.imagePublicIds.length > 0) {
        await this.deleteImagesByPublicIds(product.imagePublicIds);
        return;
      }

      // Method 2: Extract public IDs from image URLs
      if (product.images && product.images.length > 0) {
        const cloudinaryUrls = product.images.filter((url) =>
          isCloudinaryUrl(url)
        );

        if (cloudinaryUrls.length > 0) {
          await this.deleteImagesByUrls(cloudinaryUrls);
        }
      }
    } catch (error) {
      // Log the error but don't fail the product deletion
      console.error("Error deleting product images from Cloudinary:", error);
      // You might want to send this to an error tracking service
    }
  }
  /**
   * Deletes images using public IDs
   */
  private async deleteImagesByPublicIds(publicIds: string[]): Promise<void> {
    const deletePromises = publicIds
      .filter((publicId) => publicId && publicId.trim() !== "")
      .map(async (publicId) => {
        try {
          await deleteImage(publicId);
          console.log(`Successfully deleted image with publicId: ${publicId}`);
        } catch (error) {
          console.error(
            `Failed to delete image with publicId: ${publicId}`,
            error
          );
          // Continue with other deletions even if one fails
        }
      });

    await Promise.all(deletePromises);
  }

  /**
   * Deletes images by extracting public IDs from URLs
   */
  private async deleteImagesByUrls(imageUrls: string[]): Promise<void> {
    const deletePromises = imageUrls.map(async (url) => {
      try {
        const publicId = extractPublicId(url);
        if (publicId) {
          await deleteImage(publicId);
          console.log(`Successfully deleted image: ${url}`);
        } else {
          console.warn(`Could not extract public ID from URL: ${url}`);
        }
      } catch (error) {
        console.error(`Failed to delete image: ${url}`, error);
        // Continue with other deletions even if one fails
      }
    });

    await Promise.all(deletePromises);
  }
}

export default new VendorProductService();
