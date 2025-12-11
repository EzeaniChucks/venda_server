"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API_URL = "https://api.paystack.co";
class BankService {
    constructor() {
        this.headers = {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
        };
    }
    async initializeTransaction(email, amount, metadata) {
        try {
            const response = await axios_1.default.post(`${PAYSTACK_API_URL}/transaction/initialize`, {
                email,
                amount: amount * 100,
                metadata: {
                    ...metadata,
                    custom_fields: [
                        {
                            display_name: "Subscription",
                            variable_name: "subscription",
                            value: "vendor_subscription",
                        },
                    ],
                },
                channels: [
                    "card",
                    "bank",
                    "ussd",
                    "qr",
                    "mobile_money",
                    "bank_transfer",
                ],
            }, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error("Paystack initialization error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Failed to initialize payment");
        }
    }
    async verifyTransaction(reference) {
        try {
            const response = await axios_1.default.get(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error("Paystack verification error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Failed to verify payment");
        }
    }
    async chargeAuthorization(authorizationCode, email, amount, reference, metadata) {
        try {
            const response = await axios_1.default.post(`${PAYSTACK_API_URL}/transaction/charge_authorization`, {
                authorization_code: authorizationCode,
                email,
                amount: amount * 100,
                reference,
                metadata,
            }, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error("Paystack charge error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Failed to charge card");
        }
    }
    async createCustomer(email, firstName, lastName) {
        try {
            const response = await axios_1.default.post(`${PAYSTACK_API_URL}/customer`, {
                email,
                first_name: firstName,
                last_name: lastName,
            }, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error("Paystack customer creation error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Failed to create customer");
        }
    }
    async fetchCustomer(emailOrCode) {
        try {
            const response = await axios_1.default.get(`${PAYSTACK_API_URL}/customer/${emailOrCode}`, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error("Paystack fetch customer error:", error.response?.data || error.message);
            return null;
        }
    }
    generateReference() {
        return `SUB_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 9)
            .toUpperCase()}`;
    }
    async getBanks() {
        try {
            const response = await axios_1.default.get(`${PAYSTACK_API_URL}/bank`, {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            });
            if (response.data.status) {
                return response.data.data.map((bank) => ({
                    id: bank.id,
                    name: bank.name,
                    code: bank.code,
                }));
            }
            return [];
        }
        catch (error) {
            console.error("Error fetching banks:", error);
            return [];
        }
    }
    async verifyBankAccount(accountNumber, bankCode) {
        try {
            const response = await axios_1.default.get(`${PAYSTACK_API_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            });
            if (response.data.status) {
                return {
                    status: true,
                    message: "Account verified successfully",
                    data: response.data.data,
                };
            }
            return {
                status: false,
                message: response.data.message || "Verification failed",
            };
        }
        catch (error) {
            console.error("Error verifying account:", error);
            return {
                status: false,
                message: error.response?.data?.message ||
                    "Verification failed. Please check details and try again.",
            };
        }
    }
}
exports.default = new BankService();
//# sourceMappingURL=bankservice.service.js.map