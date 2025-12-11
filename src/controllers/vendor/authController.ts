import { Response } from "express";
import { validationResult } from "express-validator";
import authService from "../../services/shared/authService.service";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "../../utils/response";
import { AuthRequest } from "../../types";

export class VendorAuthController {
  async register(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      // Force role to vendor
      const vendorData = { ...req.body, role: "vendor" as const };
      const { user, token } = await authService.register(vendorData);

      const userWithoutPassword = { ...user, password: undefined };

      return successResponse(
        res,
        { user: userWithoutPassword, token },
        "Vendor registration successful",
        201
      );
    } catch (error) {
      console.error("Vendor registration error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async login(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);

      // Verify this is actually a vendor
      if (user.role !== "vendor") {
        return errorResponse(
          res,
          "Invalid credentials. Please use the correct login endpoint for your account type.",
          401
        );
      }

      const userWithoutPassword = { ...user, password: undefined };

      return successResponse(
        res,
        { user: userWithoutPassword, token },
        "Vendor login successful"
      );
    } catch (error) {
      console.error("Vendor login error:", error);
      return errorResponse(res, (error as Error).message, 401);
    }
  }

  async refreshToken(req: AuthRequest, res: Response): Promise<Response> {
    try {
      // The authenticate middleware already verified the token is valid
      const user = req.user;

      if (!user) {
        return errorResponse(res, "User not found", 401);
      }

      // Verify this is actually a vendor
      if (user.role !== "vendor") {
        return errorResponse(
          res,
          "Invalid token. Vendor access required.",
          401
        );
      }

      // Get the token from the Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return errorResponse(
          res,
          "Authorization header missing or invalid",
          401
        );
      }

      const oldToken = authHeader.replace("Bearer ", "");

      // ✅ CRITICAL: Use the service method which validates against database
      const { user: updatedUser, token: newToken } =
        await authService.refreshToken(oldToken, user.role);

      const userWithoutPassword = { ...updatedUser, password: undefined };

      return successResponse(
        res,
        {
          user: userWithoutPassword,
          token: newToken,
          expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
        },
        "Token refreshed successfully"
      );
    } catch (error) {
      console.error("Token refresh error:", error);

      // Return appropriate error messages
      if (
        (error as Error).message.includes("Invalid or expired") ||
        (error as Error).message.includes("User not found") ||
        (error as Error).message.includes("deactivated")
      ) {
        return errorResponse(res, (error as Error).message, 401);
      }

      return errorResponse(res, "Token refresh failed", 500);
    }
  }
}

export default new VendorAuthController();
