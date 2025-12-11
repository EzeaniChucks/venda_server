import { Response } from "express";
import collaborationService from "../../services/vendor/collaborationService";
import { successResponse, errorResponse } from "../../utils/response";
import { AuthRequest } from "../../types";

export class VendorCollaborationController {
  // Vendor Directory
  async getVendorDirectory(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const vendorId = req.user?.id;
      console.log(vendorId);
      const result = await collaborationService.getVendorDirectory(
        req.query,
        vendorId
      );
      return successResponse(res, result);
    } catch (error) {
      console.error("Get vendor directory error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  // Partnership Requests
  async sendPartnershipRequest(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const partnership = await collaborationService.sendPartnershipRequest(
        vendorId,
        req.body
      );
      return successResponse(
        res,
        partnership,
        "Partnership request sent successfully",
        201
      );
    } catch (error) {
      console.error("Send partnership request error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async getPartnershipRequests(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const type = (req.query.type as "sent" | "received") || "received";
      const requests = await collaborationService.getPartnershipRequests(
        vendorId,
        type
      );
      return successResponse(res, requests);
    } catch (error) {
      console.error("Get partnership requests error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async respondToPartnership(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const { id } = req.params;
      const { action, declineReason } = req.body;

      const partnership = await collaborationService.respondToPartnership(
        vendorId,
        id,
        action,
        declineReason
      );

      return successResponse(
        res,
        partnership,
        `Partnership ${action}ed successfully`
      );
    } catch (error) {
      console.error("Respond to partnership error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async getMyPartnerships(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const partnerships = await collaborationService.getMyPartnerships(
        vendorId
      );
      return successResponse(res, partnerships);
    } catch (error) {
      console.error("Get my partnerships error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  // Messaging
  async sendMessage(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const senderId = req.user!.id;
      const message = await collaborationService.sendMessage(
        senderId,
        req.body
      );
      return successResponse(res, message, "Message sent successfully", 201);
    } catch (error) {
      console.error("Send message error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async getConversation(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const { otherVendorId } = req.params;
      const messages = await collaborationService.getConversation(
        vendorId,
        otherVendorId
      );
      return successResponse(res, messages);
    } catch (error) {
      console.error("Get conversation error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async getConversations(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const conversations = await collaborationService.getConversations(
        vendorId
      );
      return successResponse(res, conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const count = await collaborationService.getUnreadCount(vendorId);
      return successResponse(res, { count });
    } catch (error) {
      console.error("Get unread count error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  // vendor networking stats
  // Add this to your collaborationController.ts
  async getNetworkStats(req: AuthRequest, res: Response) {
    try {
      const vendorId = req.user!.id;
      const stats = await collaborationService.getNetworkStats(vendorId);
      return successResponse(res, stats);
    } catch (error) {
      console.error("Get network stats error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }
  // Collaborations
  async proposeCollaboration(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      console.log("propose collaboration request", req.body);

      const vendorId = req.user!.id;
      const collaboration = await collaborationService.proposeCollaboration(
        vendorId,
        req.body
      );
      return successResponse(
        res,
        collaboration,
        "Collaboration proposed successfully",
        201
      );
    } catch (error) {
      console.error("Propose collaboration error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async respondToCollaboration(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const { id } = req.params;
      const { action } = req.body;

      const collaboration = await collaborationService.respondToCollaboration(
        vendorId,
        id,
        action
      );
      return successResponse(
        res,
        collaboration,
        `Collaboration ${action}ed successfully`
      );
    } catch (error) {
      console.error("Respond to collaboration error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async getMyCollaborations(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const collaborations = await collaborationService.getMyCollaborations(
        vendorId
      );
      return successResponse(res, collaborations);
    } catch (error) {
      console.error("Get my collaborations error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  // collaborationController.ts
  async getCollaborationById(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const collaborationId = req.params.id;

      const collaboration = await collaborationService.getCollaborationById(
        collaborationId,
        vendorId
      );

      if (!collaboration) {
        return errorResponse(res, "Collaboration not found", 404);
      }

      // Security check: Ensure vendor is part of this collaboration
      if (
        collaboration.vendor1Id !== vendorId &&
        collaboration.vendor2Id !== vendorId
      ) {
        return errorResponse(
          res,
          "You are not part of this collaboration",
          403
        );
      }

      return successResponse(res, collaboration);
    } catch (error) {
      console.error("Get collaboration error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  // If you create the service method, update controller:
  async getCollaborationProducts(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const collaborationId = req.params.id;

      const products = await collaborationService.getCollaborationProducts(
        collaborationId,
        vendorId
      );

      return successResponse(res, products);
    } catch (error) {
      console.error("Get collaboration products error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async updateCollaborationStatus(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const vendorId = req.user!.id;
      const { id } = req.params;
      const { status } = req.body;

      const collaboration =
        await collaborationService.updateCollaborationStatus(
          vendorId,
          id,
          status
        );
      return successResponse(
        res,
        collaboration,
        "Collaboration status updated successfully"
      );
    } catch (error) {
      console.error("Update collaboration status error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }
}

export default new VendorCollaborationController();
