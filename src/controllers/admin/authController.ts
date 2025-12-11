import { Response } from 'express';
import { validationResult } from 'express-validator';
import authService from '../../services/shared/authService.service';
import { successResponse, errorResponse, validationErrorResponse } from '../../utils/response';
import { AuthRequest } from '../../types';

export class AdminAuthController {
  async register(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      // Force role to admin
      const adminData = { ...req.body, role: 'admin' as const };
      const { user, token } = await authService.register(adminData);

      const userWithoutPassword = { ...user, password: undefined };

      return successResponse(res, { user: userWithoutPassword, token }, 'Admin registration successful', 201);
    } catch (error) {
      console.error('Admin registration error:', error);
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

      // Verify this is actually an admin
      if (user.role !== 'admin') {
        return errorResponse(res, 'Invalid credentials. Please use the correct login endpoint for your account type.', 401);
      }

      const userWithoutPassword = { ...user, password: undefined };

      return successResponse(res, { user: userWithoutPassword, token }, 'Admin login successful');
    } catch (error) {
      console.error('Admin login error:', error);
      return errorResponse(res, (error as Error).message, 401);
    }
  }
}

export default new AdminAuthController();
