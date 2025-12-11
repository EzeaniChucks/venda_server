import { Response } from 'express';
import { validationResult } from 'express-validator';
import riderService from '../../services/rider/riderService';
import { successResponse, errorResponse, validationErrorResponse } from '../../utils/response';
import { AuthRequest } from '../../types';

export class RiderController {
  async getAvailableDeliveries(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const deliveries = await riderService.getAvailableDeliveries();
      return successResponse(res, deliveries);
    } catch (error) {
      console.error('Get available deliveries error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async getRiderDeliveries(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const deliveries = await riderService.getRiderDeliveries(req.user!.id, req.query);
      return successResponse(res, deliveries);
    } catch (error) {
      console.error('Get rider deliveries error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }

  async acceptDelivery(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { order_id } = req.body;
      const delivery = await riderService.acceptDelivery(req.user!.id, order_id);
      return successResponse(res, delivery, 'Delivery accepted successfully');
    } catch (error) {
      console.error('Accept delivery error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async updateDeliveryStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const { status } = req.body;
      const delivery = await riderService.updateDeliveryStatus(req.user!.id, req.params.id, status);
      return successResponse(res, delivery, 'Delivery status updated');
    } catch (error) {
      console.error('Update delivery status error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async updateLocation(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }

      const { latitude, longitude } = req.body;
      const result = await riderService.updateLocation(req.user!.id, latitude, longitude);
      return successResponse(res, result, 'Location updated');
    } catch (error) {
      console.error('Update location error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async updateAvailability(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { is_available } = req.body;
      const result = await riderService.updateAvailability(req.user!.id, is_available);
      return successResponse(res, result, 'Availability updated');
    } catch (error) {
      console.error('Update availability error:', error);
      return errorResponse(res, (error as Error).message, 400);
    }
  }

  async getEarnings(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const earnings = await riderService.getEarnings(req.user!.id);
      return successResponse(res, earnings);
    } catch (error) {
      console.error('Get earnings error:', error);
      return errorResponse(res, (error as Error).message);
    }
  }
}

export default new RiderController();
