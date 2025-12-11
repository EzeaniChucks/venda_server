"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubaccount = exports.createSubaccount = exports.resolveAccountNumber = exports.listBanks = exports.finalizeTransfer = exports.verifyTransfer = exports.resendTransferOtp = exports.initiateTransfer = exports.createTransferRecipient = exports.chargeAuthorization = exports.verifyPayment = exports.initializePayment = void 0;
const axios_1 = __importDefault(require("axios"));
const paystack = axios_1.default.create({
    baseURL: 'https://api.paystack.co',
    headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
    },
});
const initializePayment = async (params) => {
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
exports.initializePayment = initializePayment;
const verifyPayment = async (reference) => {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    return response.data;
};
exports.verifyPayment = verifyPayment;
const chargeAuthorization = async (params) => {
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
exports.chargeAuthorization = chargeAuthorization;
const createTransferRecipient = async (accountData) => {
    const response = await paystack.post('/transferrecipient', accountData);
    return response.data;
};
exports.createTransferRecipient = createTransferRecipient;
const initiateTransfer = async (recipientCode, amount, reference, reason) => {
    const response = await paystack.post('/transfer', {
        source: 'balance',
        reason: reason || 'Withdrawal request',
        amount: amount * 100,
        recipient: recipientCode,
        reference,
    });
    return response.data;
};
exports.initiateTransfer = initiateTransfer;
const resendTransferOtp = async (transferCode) => {
    const response = await paystack.post('/transfer/resend_otp', {
        transfer_code: transferCode,
        reason: 'transfer',
    });
    return response.data;
};
exports.resendTransferOtp = resendTransferOtp;
const verifyTransfer = async (reference) => {
    const response = await paystack.get(`/transfer/verify/${encodeURIComponent(reference)}`);
    return response.data;
};
exports.verifyTransfer = verifyTransfer;
const finalizeTransfer = async (transferCode, otp) => {
    const response = await paystack.post('/transfer/finalize_transfer', {
        transfer_code: transferCode,
        otp: otp,
    });
    return response.data;
};
exports.finalizeTransfer = finalizeTransfer;
const listBanks = async (country = 'nigeria') => {
    const response = await paystack.get('/bank', {
        params: { country },
    });
    return response.data;
};
exports.listBanks = listBanks;
const resolveAccountNumber = async (accountNumber, bankCode) => {
    const response = await paystack.get('/bank/resolve', {
        params: { account_number: accountNumber, bank_code: bankCode },
    });
    return response.data;
};
exports.resolveAccountNumber = resolveAccountNumber;
const createSubaccount = async (businessName, settlementBank, accountNumber, percentageCharge, primaryContactEmail) => {
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
exports.createSubaccount = createSubaccount;
const updateSubaccount = async (subaccountCode, active) => {
    const response = await paystack.put(`/subaccount/${subaccountCode}`, {
        active,
    });
    return response.data;
};
exports.updateSubaccount = updateSubaccount;
exports.default = paystack;
//# sourceMappingURL=paystack.js.map