"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorCollaborationController = void 0;
const collaborationService_1 = __importDefault(require("../../services/vendor/collaborationService"));
const response_1 = require("../../utils/response");
class VendorCollaborationController {
    async getVendorDirectory(req, res) {
        try {
            const vendorId = req.user?.id;
            console.log(vendorId);
            const result = await collaborationService_1.default.getVendorDirectory(req.query, vendorId);
            return (0, response_1.successResponse)(res, result);
        }
        catch (error) {
            console.error("Get vendor directory error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async sendPartnershipRequest(req, res) {
        try {
            const vendorId = req.user.id;
            const partnership = await collaborationService_1.default.sendPartnershipRequest(vendorId, req.body);
            return (0, response_1.successResponse)(res, partnership, "Partnership request sent successfully", 201);
        }
        catch (error) {
            console.error("Send partnership request error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async getPartnershipRequests(req, res) {
        try {
            const vendorId = req.user.id;
            const type = req.query.type || "received";
            const requests = await collaborationService_1.default.getPartnershipRequests(vendorId, type);
            return (0, response_1.successResponse)(res, requests);
        }
        catch (error) {
            console.error("Get partnership requests error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async respondToPartnership(req, res) {
        try {
            const vendorId = req.user.id;
            const { id } = req.params;
            const { action, declineReason } = req.body;
            const partnership = await collaborationService_1.default.respondToPartnership(vendorId, id, action, declineReason);
            return (0, response_1.successResponse)(res, partnership, `Partnership ${action}ed successfully`);
        }
        catch (error) {
            console.error("Respond to partnership error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async getMyPartnerships(req, res) {
        try {
            const vendorId = req.user.id;
            const partnerships = await collaborationService_1.default.getMyPartnerships(vendorId);
            return (0, response_1.successResponse)(res, partnerships);
        }
        catch (error) {
            console.error("Get my partnerships error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async sendMessage(req, res) {
        try {
            const senderId = req.user.id;
            const message = await collaborationService_1.default.sendMessage(senderId, req.body);
            return (0, response_1.successResponse)(res, message, "Message sent successfully", 201);
        }
        catch (error) {
            console.error("Send message error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async getConversation(req, res) {
        try {
            const vendorId = req.user.id;
            const { otherVendorId } = req.params;
            const messages = await collaborationService_1.default.getConversation(vendorId, otherVendorId);
            return (0, response_1.successResponse)(res, messages);
        }
        catch (error) {
            console.error("Get conversation error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getConversations(req, res) {
        try {
            const vendorId = req.user.id;
            const conversations = await collaborationService_1.default.getConversations(vendorId);
            return (0, response_1.successResponse)(res, conversations);
        }
        catch (error) {
            console.error("Get conversations error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getUnreadCount(req, res) {
        try {
            const vendorId = req.user.id;
            const count = await collaborationService_1.default.getUnreadCount(vendorId);
            return (0, response_1.successResponse)(res, { count });
        }
        catch (error) {
            console.error("Get unread count error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getNetworkStats(req, res) {
        try {
            const vendorId = req.user.id;
            const stats = await collaborationService_1.default.getNetworkStats(vendorId);
            return (0, response_1.successResponse)(res, stats);
        }
        catch (error) {
            console.error("Get network stats error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async proposeCollaboration(req, res) {
        try {
            console.log("propose collaboration request", req.body);
            const vendorId = req.user.id;
            const collaboration = await collaborationService_1.default.proposeCollaboration(vendorId, req.body);
            return (0, response_1.successResponse)(res, collaboration, "Collaboration proposed successfully", 201);
        }
        catch (error) {
            console.error("Propose collaboration error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async respondToCollaboration(req, res) {
        try {
            const vendorId = req.user.id;
            const { id } = req.params;
            const { action } = req.body;
            const collaboration = await collaborationService_1.default.respondToCollaboration(vendorId, id, action);
            return (0, response_1.successResponse)(res, collaboration, `Collaboration ${action}ed successfully`);
        }
        catch (error) {
            console.error("Respond to collaboration error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async getMyCollaborations(req, res) {
        try {
            const vendorId = req.user.id;
            const collaborations = await collaborationService_1.default.getMyCollaborations(vendorId);
            return (0, response_1.successResponse)(res, collaborations);
        }
        catch (error) {
            console.error("Get my collaborations error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getCollaborationById(req, res) {
        try {
            const vendorId = req.user.id;
            const collaborationId = req.params.id;
            const collaboration = await collaborationService_1.default.getCollaborationById(collaborationId, vendorId);
            if (!collaboration) {
                return (0, response_1.errorResponse)(res, "Collaboration not found", 404);
            }
            if (collaboration.vendor1Id !== vendorId &&
                collaboration.vendor2Id !== vendorId) {
                return (0, response_1.errorResponse)(res, "You are not part of this collaboration", 403);
            }
            return (0, response_1.successResponse)(res, collaboration);
        }
        catch (error) {
            console.error("Get collaboration error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getCollaborationProducts(req, res) {
        try {
            const vendorId = req.user.id;
            const collaborationId = req.params.id;
            const products = await collaborationService_1.default.getCollaborationProducts(collaborationId, vendorId);
            return (0, response_1.successResponse)(res, products);
        }
        catch (error) {
            console.error("Get collaboration products error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async updateCollaborationStatus(req, res) {
        try {
            const vendorId = req.user.id;
            const { id } = req.params;
            const { status } = req.body;
            const collaboration = await collaborationService_1.default.updateCollaborationStatus(vendorId, id, status);
            return (0, response_1.successResponse)(res, collaboration, "Collaboration status updated successfully");
        }
        catch (error) {
            console.error("Update collaboration status error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.VendorCollaborationController = VendorCollaborationController;
exports.default = new VendorCollaborationController();
//# sourceMappingURL=collaborationController.js.map