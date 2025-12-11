import { Request } from 'express';

export type UserRole = 'customer' | 'vendor' | 'rider' | 'admin';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface ProductFilters extends PaginationQuery {
  gender?: string;
  category_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers, default 200km
}

export interface OrderFilters extends PaginationQuery {
  status?: string;
}
