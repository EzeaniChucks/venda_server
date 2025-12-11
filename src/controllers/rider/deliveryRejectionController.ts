import { Response } from "express";
import { AuthRequest } from "../../types";
import deliveryRejectionService from "../../services/rider/deliveryRejectionService";
import { successResponse, errorResponse } from "../../utils/response";

export class DeliveryRejectionController {
  /**
   * POST /api/rider/deliveries/:id/reject
   * Reject a delivery assignment
   */
  async rejectDelivery(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { reason, reassignToRiderId } = req.body;
      const orderId = req.params.id;
      const riderId = req.user!.id;

      if (!reason) {
        return errorResponse(res, "Rejection reason is required", 400);
      }

      const result = await deliveryRejectionService.rejectDelivery(
        orderId,
        riderId,
        reason,
        reassignToRiderId
      );

      return successResponse(res, result, result.message);
    } catch (error) {
      console.error("Reject delivery error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  /**
   * GET /api/rider/deliveries/rejections
   * Get rider's rejection history
   */
  async getRejections(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const riderId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 50;

      const rejections = await deliveryRejectionService.getRiderRejections(
        riderId,
        limit
      );

      return successResponse(
        res,
        rejections,
        "Rejections retrieved successfully"
      );
    } catch (error) {
      console.error("Get rejections error:", error);
      return errorResponse(res, (error as Error).message, 500);
    }
  }

  /**
   * GET /api/rider/deliveries/available-riders
   * Get available riders for reassignment
   */
  async getAvailableRiders(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const riders = await deliveryRejectionService.getAvailableRiders();
      return successResponse(
        res,
        riders,
        "Available riders retrieved successfully"
      );
    } catch (error) {
      console.error("Get available riders error:", error);
      return errorResponse(res, (error as Error).message, 500);
    }
  }
}

export default new DeliveryRejectionController();
