"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API_URL = "https://api.paystack.co";
class PaystackBillingService {
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
}
exports.default = new PaystackBillingService();
//# sourceMappingURL=paystackBillingService.js.map