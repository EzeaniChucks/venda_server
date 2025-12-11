import { Response } from "express";
import adminService from "../../services/admin/adminService";
import { successResponse, errorResponse } from "../../utils/response";
import { AuthRequest } from "../../types";

export class AdminController {
  async getUsers(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const users = await adminService.getUsers(req.query);
      return successResponse(res, users);
    } catch (error) {
      console.error("Get users error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async updateUserStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { is_active, role } = req.body;
      const user = await adminService.updateUserStatus(
        req.params.id,
        role,
        is_active
      );
      return successResponse(res, user, "User status updated");
    } catch (error) {
      console.error("Update user status error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async getProductsForApproval(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const products = await adminService.getProductsForApproval(req.query);
      return successResponse(res, products);
    } catch (error) {
      console.error("Get products for approval error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async updateProductApproval(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { is_approved } = req.body;
      const product = await adminService.updateProductApproval(
        req.params.id,
        is_approved
      );
      return successResponse(res, product, "Product approval status updated");
    } catch (error) {
      console.error("Update product approval error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async getAnalytics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const analytics = await adminService.getAnalytics();
      return successResponse(res, analytics);
    } catch (error) {
      console.error("Get analytics error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async approveVendor(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { is_approved } = req.body;
      const vendor = await adminService.approveVendor(
        req.params.id,
        is_approved
      );
      return successResponse(res, vendor, "Vendor approval status updated");
    } catch (error) {
      console.error("Approve vendor error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async approveRider(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { is_approved } = req.body;
      const rider = await adminService.approveRider(req.params.id, is_approved);
      return successResponse(res, rider, "Rider approval status updated");
    } catch (error) {
      console.error("Approve rider error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }
}

export default new AdminController();
