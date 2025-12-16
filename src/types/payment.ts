// types/payment.types.ts

export type PaymentType = 
  | 'wallet_funding'
  | 'order_payment'
  | 'service_payment'
  | 'subscription'
  | 'donation'
  | 'other';

export type EntityType = 
  | 'customer'
  | 'vendor'
  | 'rider'
//   | 'admin'
//   | 'business';

export interface RegisterFrontendPaymentParams {
  reference: string;
  entityId: string;
  entityType: EntityType;
  amount: number;
  purpose: string;
  type: PaymentType;
  email?: string;
  metadata?: Record<string, any>;
  currency?: string; // e.g., 'NGN'
  expectedAmount?: number; // Optional validation
}

export interface RegisterPaymentResponse {
  success: boolean;
  message: string;
  data: {
    transactionId: string;
    reference: string;
    status: string;
    amount: number;
    entityId: string;
    entityType: EntityType;
    paymentType: PaymentType;
    createdAt: Date;
    metadata: any;
  };
}

// You might also need these interfaces
export interface InitializePaymentParams {
  entityId: string;
  entityType: EntityType;
  amount: number;
  purpose: string;
  email: string;
  type: PaymentType;
  metadata?: Record<string, any>;
  currency?: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data: {
    amount: number;
    reference: string;
    status: string;
    transactionId: string;
    [key: string]: any;
  };
}