import express from "express";
import vendorOrderController from "../../controllers/vendor/orderController";
import { authenticate, authorize } from "../../middleware/auth";

const router = express.Router();

router.use(authenticate);
router.use(authorize("vendor"));

// Most specific routes first
router.put(
  "/:orderId/items/:itemId/status",
  vendorOrderController.updateOrderItemStatus
);

// Order rejection endpoints
router.put(
  "/:orderId/items/:itemId/reject",
  vendorOrderController.rejectOrderItem
);
router.post("/:id/reject", vendorOrderController.rejectOrder);

// More generic routes last
router.get("/rejections", vendorOrderController.getRejections);
router.get("/:orderId", vendorOrderController.getVendorOrder);
router.get("/", vendorOrderController.getVendorOrders);

export default router;
