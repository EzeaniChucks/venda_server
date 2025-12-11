// Base types from entity
export type NotificationType = 
  | 'order_update' 
  | 'payment' 
  | 'promotion' 
  | 'account' 
  | 'general';

// Extended types for templates (these don't go in the database)
export type TemplateNotificationType = 
  | NotificationType
  | 'product_approval'
  | 'inventory_alert'
  | 'vendor_verification'
  | 'subscription'
  | 'fashion_trends'
  | 'flash_sale';

// Or use a mapping for templates
export const NotificationTemplateType: Record<string, NotificationType> = {
  PRODUCT_APPROVAL: 'account',
  INVENTORY_ALERT: 'account', 
  VENDOR_VERIFICATION: 'account',
  SUBSCRIPTION: 'account',
  FASHION_TRENDS: 'promotion',
  FLASH_SALE: 'promotion',
};

// Or as an enum if you prefer:
export enum NotificationTypeEnum {
  ORDER_UPDATE = 'order_update',
  PAYMENT = 'payment',
  PROMOTION = 'promotion',
  ACCOUNT = 'account',
  GENERAL = 'general',
  PRODUCT_APPROVAL = 'product_approval',
  INVENTORY_ALERT = 'inventory_alert',
  VENDOR_VERIFICATION = 'vendor_verification',
  SUBSCRIPTION = 'subscription',
  FASHION_TRENDS = 'fashion_trends',
  FLASH_SALE = 'flash_sale',
  CUSTOMER_SUPPORT = 'customer_support',
  REVIEW_REMINDER = 'review_reminder',
  DELIVERY_UPDATE = 'delivery_update',
  SYSTEM_ALERT = 'system_alert'
}

export interface NotificationData {
  // Common fields
  type: NotificationType;
  timestamp: string;
  
  // Order-specific
  orderId?: string;
  orderStatus?: string;
  
  // Product-specific
  productId?: string;
  productName?: string;
  
  // Payment-specific
  amount?: number;
  transactionType?: 'credit' | 'debit' | 'withdrawal';
  reference?: string;
  
  // Promotion-specific
  promotionId?: string;
  discount?: string;
  expiry?: string;
  
  // Navigation
  screen?: string;
  params?: Record<string, any>;
}