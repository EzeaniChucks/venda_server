import { Response } from "express";
import vendorService from "../../services/vendor/vendorService";
import { successResponse, errorResponse } from "../../utils/response";
import { AuthRequest } from "../../types";

export class VendorController {
  async getVendorApprovalStatus(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const approvalStatus = await vendorService.getVendorApprovalStatus(
        vendorId
      );
      return successResponse(res, { isApproved: approvalStatus });
    } catch (error) {
      console.error(
        "Get vendor approval status error:",
        (error as Error).message
      );
      return errorResponse(res, (error as Error).message);
    }
  }
  async getVendorProducts(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const products = await vendorService.getVendorProducts(
        req.user!.id,
        req.query
      );
      return successResponse(res, products);
    } catch (error) {
      console.error("Get vendor products error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async getDashboardStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const stats = await vendorService.getDashboardStats(req.user!.id);
      return successResponse(res, stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async getVendorProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const profile = await vendorService.getVendorProfile(req.user!.id);
      return successResponse(res, profile);
    } catch (error) {
      console.error("Get vendor profile error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async updateVendorProfile(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const profile = await vendorService.updateVendorProfile(
        req.user!.id,
        req.body
      );
      return successResponse(res, profile, "Profile updated successfully");
    } catch (error) {
      console.error("Update vendor profile error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }
}

export default new VendorController();
