import { Response } from "express";
import vendorProductService from "../../services/vendor/productService";
import { successResponse, errorResponse } from "../../utils/response";
import { AuthRequest } from "../../types";

export class VendorProductController {
  async createProduct(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const product = await vendorProductService.createProduct(
        vendorId,
        req.body
      );
      return successResponse(
        res,
        product,
        "Product created successfully. Awaiting approval.",
        201
      );
    } catch (error) {
      console.error("Create product error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async updateProduct(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const { id } = req.params;
      const product = await vendorProductService.updateProduct(
        vendorId,
        id,
        req.body
      );
      return successResponse(res, product, "Product updated successfully");
    } catch (error) {
      console.error("Update product error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async deleteProduct(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const { id } = req.params;
      await vendorProductService.deleteProduct(vendorId, id);
      return successResponse(res, null, "Product deleted successfully");
    } catch (error) {
      console.error("Delete product error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async toggleProductStatus(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const { id } = req.params;
      const product = await vendorProductService.toggleProductStatus(
        vendorId,
        id
      );
      return successResponse(
        res,
        product,
        "Product status updated successfully"
      );
    } catch (error) {
      console.error("Toggle product status error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }
}

export default new VendorProductController();
