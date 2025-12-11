"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const vendorController_1 = __importDefault(require("../../controllers/vendor/vendorController"));
const orderController_1 = __importDefault(require("../../controllers/vendor/orderController"));
const productController_1 = __importDefault(require("../../controllers/vendor/productController"));
const collaborationController_1 = __importDefault(require("../../controllers/vendor/collaborationController"));
const subscriptionController = __importStar(require("../../controllers/vendor/subscriptionController"));
const locationController = __importStar(require("../../controllers/vendor/locationController"));
const auth_1 = require("../../middleware/auth");
const vendorLocationMiddleware_1 = require("../../middleware/vendorLocationMiddleware");
const productController_2 = __importDefault(require("../../controllers/shared/productController"));
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)("vendor"));
router.get("/dashboard", vendorController_1.default.getDashboardStats);
router.get("/profile", vendorController_1.default.getVendorProfile);
router.put("/profile", vendorController_1.default.updateVendorProfile);
router.get(`/approval-status/:vendorId`, vendorController_1.default.getVendorApprovalStatus);
router.get("/location", locationController.getLocation);
router.put("/location", [
    (0, express_validator_1.body)("latitude")
        .isFloat({ min: -90, max: 90 })
        .withMessage("Valid latitude is required"),
    (0, express_validator_1.body)("longitude")
        .isFloat({ min: -180, max: 180 })
        .withMessage("Valid longitude is required"),
    (0, express_validator_1.body)("address").optional().trim(),
    (0, express_validator_1.body)("city").optional().trim(),
    (0, express_validator_1.body)("state").optional().trim(),
], locationController.setLocation);
router.get("/subscription/plans", subscriptionController.getPlans);
router.get("/subscription/current", subscriptionController.getCurrentSubscription);
router.post("/subscription/subscribe", [(0, express_validator_1.body)("tier").notEmpty()], subscriptionController.subscribe);
router.post("/subscription/verify", [(0, express_validator_1.body)("reference").notEmpty()], subscriptionController.verifySubscription);
router.post("/subscription/upgrade", [(0, express_validator_1.body)("tier").notEmpty()], subscriptionController.upgrade);
router.post("/subscription/cancel", subscriptionController.cancelSubscription);
router.get("/subscription/product-limit", subscriptionController.checkProductLimit);
router.get("/products", vendorController_1.default.getVendorProducts);
router.post("/products", vendorLocationMiddleware_1.requireVendorLocation, [
    (0, express_validator_1.body)("name").trim().notEmpty().withMessage("Product name is required"),
    (0, express_validator_1.body)("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
    (0, express_validator_1.body)("stockQuantity")
        .isInt({ min: 0 })
        .withMessage("Valid stock quantity is required"),
], productController_1.default.createProduct);
router.get("/products/:id", productController_2.default.getProductById);
router.put("/products/:id", productController_1.default.updateProduct);
router.delete("/products/:id", productController_1.default.deleteProduct);
router.patch("/products/:id/toggle-status", productController_1.default.toggleProductStatus);
router.get("/orders", orderController_1.default.getVendorOrders);
router.put("/orders/items/:id", [(0, express_validator_1.body)("status").isIn(["accepted", "rejected", "preparing", "ready"])], orderController_1.default.updateOrderItemStatus);
router.get("/directory", collaborationController_1.default.getVendorDirectory);
router.post("/partnerships", [
    (0, express_validator_1.body)("recipientId")
        .notEmpty()
        .withMessage("Recipient vendor ID is required"),
    (0, express_validator_1.body)("partnershipType").isIn([
        "collaboration",
        "supplier",
        "distributor",
        "joint_venture",
        "other",
    ]),
    (0, express_validator_1.body)("message").trim().notEmpty().withMessage("Message is required"),
], collaborationController_1.default.sendPartnershipRequest);
router.get("/partnerships", collaborationController_1.default.getPartnershipRequests);
router.get("/partnerships/my", collaborationController_1.default.getMyPartnerships);
router.put("/partnerships/:id/respond", [(0, express_validator_1.body)("action").isIn(["accept", "decline"])], collaborationController_1.default.respondToPartnership);
router.post("/messages", [
    (0, express_validator_1.body)("receiverId").notEmpty().withMessage("Receiver ID is required"),
    (0, express_validator_1.body)("message").trim().notEmpty().withMessage("Message is required"),
], collaborationController_1.default.sendMessage);
router.get("/messages/conversations", collaborationController_1.default.getConversations);
router.get("/messages/conversations/:otherVendorId", collaborationController_1.default.getConversation);
router.get("/messages/unread-count", collaborationController_1.default.getUnreadCount);
router.get("/network/stats", collaborationController_1.default.getNetworkStats);
router.post("/collaborations", [
    (0, express_validator_1.body)("partnerVendorId")
        .notEmpty()
        .withMessage("Partner vendor ID is required"),
    (0, express_validator_1.body)("title").trim().notEmpty().withMessage("Title is required"),
    (0, express_validator_1.body)("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required"),
], collaborationController_1.default.proposeCollaboration);
router.get("/collaborations", collaborationController_1.default.getMyCollaborations);
router.get("/collaborations/:id", collaborationController_1.default.getCollaborationById);
router.get("/collaborations/:id/products", collaborationController_1.default.getCollaborationProducts);
router.put("/collaborations/:id/respond", [(0, express_validator_1.body)("action").isIn(["accept", "reject"])], collaborationController_1.default.respondToCollaboration);
router.put("/collaborations/:id/status", [
    (0, express_validator_1.body)("status").isIn([
        "proposed",
        "accepted",
        "active",
        "completed",
        "rejected",
    ]),
], collaborationController_1.default.updateCollaborationStatus);
exports.default = router;
//# sourceMappingURL=vendorRoutes.js.map