import { Request, Response } from "express";
import productService from "../../services/shared/productService.service";
import { successResponse, errorResponse } from "../../utils/response";
import { ProductFilters } from "../../types";

export class ProductController {
  async getAllProducts(req: Request, res: Response): Promise<Response> {
    try {
      const filters: ProductFilters = {
        gender: req.query.gender as string,
        category_id: req.query.category_id as string,
        search: req.query.search as string,
        min_price: req.query.min_price
          ? Number(req.query.min_price)
          : undefined,
        max_price: req.query.max_price
          ? Number(req.query.max_price)
          : undefined,
        latitude: req.query.latitude ? Number(req.query.latitude) : undefined,
        longitude: req.query.longitude
          ? Number(req.query.longitude)
          : undefined,
        radius: req.query.radius ? Number(req.query.radius) : 200, // default 200km
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const products = await productService.getAllProducts(filters);
      return successResponse(res, products);
    } catch (error) {
      console.error("Get products error:", (error as Error).message);
      return errorResponse(res, (error as Error).message);
    }
  }

  async getProductById(req: Request, res: Response): Promise<Response> {
    try {
      // console.log(req.params.id);
      const product = await productService.getProductById(req.params.id);
      return successResponse(res, product);
    } catch (error) {
      console.error("Get product error:", (error as Error).message);
      return errorResponse(res, (error as Error).message, 404);
    }
  }

  async getProductsByCategory(req: Request, res: Response): Promise<Response> {
    try {
      const products = await productService.getProductsByCategory(
        req.params.id
      );
      return successResponse(res, products);
    } catch (error) {
      console.error(
        "Get products by category error:",
        (error as Error).message
      );
      return errorResponse(res, (error as Error).message);
    }
  }
}

export default new ProductController();
