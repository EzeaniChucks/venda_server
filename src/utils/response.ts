import { Response } from 'express';
import { ApiResponse } from '../types';

export const successResponse = <T = any>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: any[]
): Response<ApiResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

export const validationErrorResponse = (
  res: Response,
  errors: any[]
): Response<ApiResponse> => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors
  });
};
