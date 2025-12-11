import { Response } from "express";
import { validationResult } from "express-validator";
import authService from "../../services/shared/authService.service";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "../../utils/response";
import { AuthRequest } from "../../types";

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const { user, token } = await authService.register(req.body);

      const userWithoutPassword = { ...user, password: undefined };

      return successResponse(
        res,
        { user: userWithoutPassword, token },
        "Registration successful",
        201
      );
    } catch (error) {
      console.error("Registration error:", error);
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

      const userWithoutPassword = { ...user, password: undefined };

      return successResponse(
        res,
        { user: userWithoutPassword, token },
        "Login successful"
      );
    } catch (error) {
      console.error("Login error:", error);
      return errorResponse(res, (error as Error).message, 401);
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const user = await authService.getById(req.user!.id, req.user!.role);
      if (!user) {
        return errorResponse(res, "User not found", 404);
      }
      const userWithoutPassword = { ...user, password: undefined };
      return successResponse(res, {
        ...userWithoutPassword,
        role: req.user!.role,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return errorResponse(res, (error as Error).message);
    }
  }

  // In AuthController.updateProfile
  async updateProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const {
        fullName,
        businessName,
        phone,
        profileImage,
        state,
        city,
        address,
        businessDescription,
        businessAddress,
        businessPhone,
        bankAccountName,
        bankAccountNumber,
        bankName,
      } = req.body;

      const user = await authService.updateProfile(
        req.user!.id,
        req.user!.role,
        {
          fullName,
          businessName,
          phone,
          profileImage,
          state,
          city,
          address,
          businessDescription,
          businessAddress,
          businessPhone,
          bankAccountName,
          bankAccountNumber,
          bankName,
        }
      );

      const userWithoutPassword = { ...user, password: undefined };
      return successResponse(
        res,
        { ...userWithoutPassword, role: req.user!.role },
        "Profile updated successfully"
      );
    } catch (error) {
      console.error("Update profile error:", error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }
}

export default new AuthController();
