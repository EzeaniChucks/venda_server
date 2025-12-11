import { AppDataSource } from "../../config/data-source";
import { Product } from "../../entities";
import { ProductFilters } from "../../types";
import { ILike } from "typeorm";
import { DistanceCalculator } from "../../utils/distance";

export class ProductService {
  private productRepository = AppDataSource.getRepository(Product);

  async getAllProducts(filters: ProductFilters = {}): Promise<any[]> {
    const {
      gender,
      category_id,
      search,
      min_price,
      max_price,
      latitude,
      longitude,
      radius = 200, // default 200km radius
      page = 1,
      limit = 20,
    } = filters;

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
      queryBuilder.andWhere(
        "(product.name ILIKE :search OR product.description ILIKE :search)",
        { search: `%${search}%` }
      );
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

    // Location-based filtering with SQL-calculated distance
    if (latitude !== undefined && longitude !== undefined) {
      queryBuilder.andWhere("vendor.latitude IS NOT NULL");
      queryBuilder.andWhere("vendor.longitude IS NOT NULL");

      // Calculate distance using Haversine formula in SQL
      const distanceFormula = `
        (6371 * acos(
          cos(radians(:latitude)) * 
          cos(radians(vendor.latitude)) * 
          cos(radians(vendor.longitude) - radians(:longitude)) + 
          sin(radians(:latitude)) * 
          sin(radians(vendor.latitude))
        ))
      `;

      // Filter by radius in SQL
      queryBuilder
        .andWhere(`${distanceFormula} <= :radius`, {
          latitude,
          longitude,
          radius,
        })
        .addSelect(`${distanceFormula}`, "distance")
        .orderBy("distance", "ASC"); // Sort by distance (nearest first)
    } else {
      queryBuilder.orderBy("product.createdAt", "DESC");
    }

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const products = await queryBuilder.getMany();

    // Add formatted distance for location-filtered results
    if (latitude !== undefined && longitude !== undefined) {
      return products.map((product) => {
        const distance =
          product.vendor?.latitude && product.vendor?.longitude
            ? DistanceCalculator.calculateDistance(
                latitude,
                longitude,
                Number(product.vendor.latitude),
                Number(product.vendor.longitude)
              )
            : null;

        return {
          ...product,
          distance,
          distanceFormatted: distance
            ? DistanceCalculator.formatDistance(distance)
            : null,
        };
      });
    }

    return products;
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: {
        id,
        // isActive: true,
        // isApproved: true
      },
      relations: ["category", "vendor"],
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { categoryId, isActive: true, isApproved: true },
      relations: ["category", "vendor"],
      order: { createdAt: "DESC" },
    });
  }
}

export default new ProductService();
