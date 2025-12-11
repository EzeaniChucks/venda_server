import axios from 'axios';

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export type EntityType = 'customer' | 'vendor' | 'rider';

export interface InitializePaymentParams {
  email: string;
  amount: number;
  reference: string;
  entityType: EntityType;
  entityId: string;
  purpose: string;
  callbackUrl?: string;
}

export interface ChargeAuthorizationParams {
  email: string;
  amount: number;
  authorizationCode: string;
  reference: string;
  entityType: EntityType;
  entityId: string;
  purpose: string;
  paymentMethodId?: string;
}

export interface TransferRecipientData {
  type: 'nuban';
  name: string;
  account_number: string;
  bank_code: string;
  currency: 'NGN';
}

export const initializePayment = async (params: InitializePaymentParams) => {
  const { email, amount, reference, entityType, entityId, purpose, callbackUrl } = params;
  
  const response = await paystack.post('/transaction/initialize', {
    email,
    amount: amount * 100,
    reference,
    metadata: {
      entityType,
      entityId,
      purpose,
    },
    callback_url: callbackUrl || `${process.env.APP_URL || 'http://localhost:3000'}/api/payments/verify`,
    channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
  });
  
  return response.data;
};

export const verifyPayment = async (reference: string) => {
  const response = await paystack.get(`/transaction/verify/${reference}`);
  return response.data;
};

export const chargeAuthorization = async (params: ChargeAuthorizationParams) => {
  const { email, amount, authorizationCode, reference, entityType, entityId, purpose, paymentMethodId } = params;
  
  const response = await paystack.post('/transaction/charge_authorization', {
    email,
    amount: amount * 100,
    authorization_code: authorizationCode,
    reference,
    metadata: {
      entityType,
      entityId,
      purpose,
      paymentMethodId,
    },
  });

  return response.data;
};

export const createTransferRecipient = async (accountData: TransferRecipientData) => {
  const response = await paystack.post('/transferrecipient', accountData);
  return response.data;
};

export const initiateTransfer = async (
  recipientCode: string,
  amount: number,
  reference: string,
  reason?: string
) => {
  const response = await paystack.post('/transfer', {
    source: 'balance',
    reason: reason || 'Withdrawal request',
    amount: amount * 100,
    recipient: recipientCode,
    reference,
  });
  return response.data;
};

export const resendTransferOtp = async (transferCode: string) => {
  const response = await paystack.post('/transfer/resend_otp', {
    transfer_code: transferCode,
    reason: 'transfer',
  });
  return response.data;
};

export const verifyTransfer = async (reference: string) => {
  const response = await paystack.get(`/transfer/verify/${encodeURIComponent(reference)}`);
  return response.data;
};

export const finalizeTransfer = async (transferCode: string, otp: string) => {
  const response = await paystack.post('/transfer/finalize_transfer', {
    transfer_code: transferCode,
    otp: otp,
  });
  return response.data;
};

export const listBanks = async (country = 'nigeria') => {
  const response = await paystack.get('/bank', {
    params: { country },
  });
  return response.data;
};

export const resolveAccountNumber = async (
  accountNumber: string,
  bankCode: string
) => {
  const response = await paystack.get('/bank/resolve', {
    params: { account_number: accountNumber, bank_code: bankCode },
  });
  return response.data;
};

export const createSubaccount = async (
  businessName: string,
  settlementBank: string,
  accountNumber: string,
  percentageCharge: number,
  primaryContactEmail: string
) => {
  const response = await paystack.post('/subaccount', {
    business_name: businessName,
    settlement_bank: settlementBank,
    account_number: accountNumber,
    percentage_charge: percentageCharge,
    primary_contact_email: primaryContactEmail,
    settlement_schedule: 'weekly',
  });
  return response.data;
};

export const updateSubaccount = async (
  subaccountCode: string,
  active: boolean
) => {
  const response = await paystack.put(`/subaccount/${subaccountCode}`, {
    active,
  });
  return response.data;
};

export default paystack;
