import express from "express";
import { body } from "express-validator";
import vendorController from "../../controllers/vendor/vendorController";
import vendorOrderController from "../../controllers/vendor/orderController";
import vendorProductController from "../../controllers/vendor/productController";
import collaborationController from "../../controllers/vendor/collaborationController";
import * as subscriptionController from "../../controllers/vendor/subscriptionController";
import * as locationController from "../../controllers/vendor/locationController";
import { authenticate, authorize } from "../../middleware/auth";
import { requireVendorLocation } from "../../middleware/vendorLocationMiddleware";
import productController from "../../controllers/shared/productController";

const router = express.Router();

router.use(authenticate);
router.use(authorize("vendor"));

// Profile & Dashboard
router.get("/dashboard", vendorController.getDashboardStats);
router.get("/profile", vendorController.getVendorProfile);
router.put("/profile", vendorController.updateVendorProfile);

// approval status
router.get(
  `/approval-status/:vendorId`,
  vendorController.getVendorApprovalStatus
);

// Location
router.get("/location", locationController.getLocation);
router.put(
  "/location",
  [
    body("latitude")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Valid latitude is required"),
    body("longitude")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Valid longitude is required"),
    body("address").optional().trim(),
    body("city").optional().trim(),
    body("state").optional().trim(),
  ],
  locationController.setLocation
);

// Subscriptions
router.get("/subscription/plans", subscriptionController.getPlans);
router.get(
  "/subscription/current",
  subscriptionController.getCurrentSubscription
);
router.post(
  "/subscription/subscribe",
  [body("tier").notEmpty()],
  subscriptionController.subscribe
);
router.post(
  "/subscription/verify",
  [body("reference").notEmpty()],
  subscriptionController.verifySubscription
);
router.post(
  "/subscription/upgrade",
  [body("tier").notEmpty()],
  subscriptionController.upgrade
);
router.post("/subscription/cancel", subscriptionController.cancelSubscription);
router.get(
  "/subscription/product-limit",
  subscriptionController.checkProductLimit
);

// Products (location required for creation)
router.get("/products", vendorController.getVendorProducts);
router.post(
  "/products",
  requireVendorLocation,
  [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
    body("stockQuantity")
      .isInt({ min: 0 })
      .withMessage("Valid stock quantity is required"),
  ],
  vendorProductController.createProduct
);
router.get("/products/:id", productController.getProductById);
router.put("/products/:id", vendorProductController.updateProduct);
router.delete("/products/:id", vendorProductController.deleteProduct);
router.patch(
  "/products/:id/toggle-status",
  vendorProductController.toggleProductStatus
);

// Orders
router.get("/orders", vendorOrderController.getVendorOrders);
router.put(
  "/orders/items/:id",
  [body("status").isIn(["accepted", "rejected", "preparing", "ready"])],
  vendorOrderController.updateOrderItemStatus
);

// Vendor Directory
router.get("/directory", collaborationController.getVendorDirectory);

// Partnership Requests
router.post(
  "/partnerships",
  [
    body("recipientId")
      .notEmpty()
      .withMessage("Recipient vendor ID is required"),
    body("partnershipType").isIn([
      "collaboration",
      "supplier",
      "distributor",
      "joint_venture",
      "other",
    ]),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  collaborationController.sendPartnershipRequest
);
router.get("/partnerships", collaborationController.getPartnershipRequests);
router.get("/partnerships/my", collaborationController.getMyPartnerships);
router.put(
  "/partnerships/:id/respond",
  [body("action").isIn(["accept", "decline"])],
  collaborationController.respondToPartnership
);

// Messaging
router.post(
  "/messages",
  [
    body("receiverId").notEmpty().withMessage("Receiver ID is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  collaborationController.sendMessage
);
router.get("/messages/conversations", collaborationController.getConversations);
router.get(
  "/messages/conversations/:otherVendorId",
  collaborationController.getConversation
);
router.get("/messages/unread-count", collaborationController.getUnreadCount);

//network stats
router.get("/network/stats", collaborationController.getNetworkStats);

// Collaborations
router.post(
  "/collaborations",
  [
    body("partnerVendorId")
      .notEmpty()
      .withMessage("Partner vendor ID is required"),
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
  ],
  collaborationController.proposeCollaboration
); // POST /collaborations - Create new collaboration

router.get("/collaborations", collaborationController.getMyCollaborations); // GET /collaborations - List all my collaborations

router.get("/collaborations/:id", collaborationController.getCollaborationById); // GET /collaborations/:id - Get single collaboration
router.get(
  "/collaborations/:id/products",
  collaborationController.getCollaborationProducts
); // GET /collaborations/:id/products
router.put(
  "/collaborations/:id/respond",
  [body("action").isIn(["accept", "reject"])],
  collaborationController.respondToCollaboration
); // PUT /collaborations/:id/respond - Respond to collaboration

router.put(
  "/collaborations/:id/status",
  [
    body("status").isIn([
      "proposed",
      "accepted",
      "active",
      "completed",
      "rejected",
    ]),
  ],
  collaborationController.updateCollaborationStatus
); // PUT /collaborations/:id/status - Update status

export default router;
