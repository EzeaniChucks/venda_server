import { Response, Request } from "express";
import vendorOrderService from "../../services/vendor/orderService";
import { successResponse, errorResponse } from "../../utils/response";
import { AuthRequest } from "../../types";

export class VendorOrderController {
  async getVendorOrders(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const orders = await vendorOrderService.getVendorOrders(
        req.user!.id,
        req.query
      );
      return successResponse(res, orders);
    } catch (error) {
      console.error("Get vendor orders error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  // Get single vendor order detail
  async getVendorOrder(req: Request, res: Response): Promise<void> {
    try {
      const vendorId = (req as any).user.id;
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
        return;
      }

      const order = await vendorOrderService.getVendorOrderById(
        res,
        orderId,
        vendorId
      );

      successResponse(res, order);
    } catch (error: any) {
      console.error("Get vendor order error:", error);

      if (error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: error.message || "Failed to fetch order details",
        });
      }
    }
  }

  // Update order item status
  async updateOrderItemStatus(req: Request, res: Response): Promise<void> {
    try {
      const vendorId = (req as any).user.id;
      const { orderId, itemId } = req.params;
      const { status } = req.body;

      if (!orderId || !itemId || !status) {
        res.status(400).json({
          success: false,
          message: "Order ID, Item ID, and status are required",
        });
        return;
      }

      const validStatuses = [
        "pending",
        "accepted",
        "preparing",
        "ready",
        "rejected",
      ];
      if (!validStatuses.includes(status)) {
        errorResponse(
          res,
          "Invalid status. Must be one of: " + validStatuses.join(", "),
          400
        );
        return;
      }

      await vendorOrderService.updateOrderItemStatus({
        orderId,
        itemId,
        vendorId,
        status,
      });

      const updatedItem = await vendorOrderService.getVendorOrderById(
        res,
        orderId,
        vendorId
      );

      successResponse(res, updatedItem, "Order status updated successfully");
    } catch (error: any) {
      console.error("Update order status error:", error);

      if (
        error.message.includes("not found") ||
        error.message.includes("access")
      ) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: error.message || "Failed to update order status",
        });
      }
    }
  }

  /**
   * PUT /api/vendor/orders/:orderId/items/:id/reject
   * Reject a specific order item
   */
  async rejectOrderItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { reason } = req.body;
      const orderItemId = req.params.id;
      const vendorId = req.user!.id;

      if (!reason) {
        return errorResponse(res, "Rejection reason is required", 400);
      }

      const result = await vendorOrderService.rejectOrderItem(
        orderItemId,
        vendorId,
        reason
      );

      return successResponse(res, result, "Order item rejected successfully");
    } catch (error) {
      console.error("Reject order item error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  /**
   * POST /api/vendor/orders/:id/reject
   * Reject entire order (all vendor's items)
   */
  async rejectOrder(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { reason } = req.body;
      const orderId = req.params.id;
      const vendorId = req.user!.id;

      if (!reason) {
        return errorResponse(res, "Rejection reason is required", 400);
      }

      const result = await vendorOrderService.rejectOrder(
        orderId,
        vendorId,
        reason
      );

      return successResponse(res, result, "Order rejected successfully");
    } catch (error) {
      console.error("Reject order error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  /**
   * GET /api/vendor/orders/rejections
   * Get vendor's rejection history
   */
  async getRejections(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 50;

      const rejections = await vendorOrderService.getVendorRejections(
        vendorId,
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
}

export default new VendorOrderController();
