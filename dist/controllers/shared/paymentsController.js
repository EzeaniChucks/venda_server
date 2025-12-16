"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payments_service_1 = require("../../services/shared/payments.service");
const wallet_service_1 = require("../../services/shared/wallet.service");
const transaction_service_1 = require("../../services/shared/transaction.service");
class PaymentController {
    static async initializePayment(req, res) {
        try {
            const { amount, purpose = "Wallet Funding", type = "wallet_funding", } = req.body;
            const user = req.user;
            const { id: entityId, role: entityType, email } = user;
            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid amount",
                });
            }
            if (!email) {
                return res.status(400).json({
                    success: false,
                    error: "User email is required",
                });
            }
            const result = await payments_service_1.PaymentService.initializePayment({
                entityId,
                entityType: entityType,
                amount,
                purpose,
                email,
                type,
                metadata: req.body.metadata || {},
            });
            res.json({
                success: true,
                message: "Payment initialized successfully",
                data: result,
            });
        }
        catch (error) {
            console.error("Initialize payment error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to initialize payment",
            });
        }
    }
    static async registerFrontendPayment(req, res) {
        try {
            const { reference, entityId, entityType, amount, purpose, type, email, metadata, currency, expectedAmount, } = req.body;
            if (!reference ||
                !entityId ||
                !entityType ||
                !amount ||
                !purpose ||
                !type) {
                return res.status(400).json({
                    success: false,
                    error: "Missing required fields: reference, entityId, entityType, amount, purpose, type are required",
                });
            }
            const amountNumber = parseFloat(amount);
            if (isNaN(amountNumber) || amountNumber <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Amount must be a positive number",
                });
            }
            const validEntityTypes = [
                "customer",
                "vendor",
                "rider",
            ];
            if (!validEntityTypes.includes(entityType)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid entity type. Must be one of: ${validEntityTypes.join(", ")}`,
                });
            }
            const validPaymentTypes = [
                "wallet_funding",
                "order_payment",
                "service_payment",
                "subscription",
                "donation",
                "other",
            ];
            if (!validPaymentTypes.includes(type)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid payment type. Must be one of: ${validPaymentTypes.join(", ")}`,
                });
            }
            if (req.user && req.user.id !== entityId && req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    error: "Not authorized to register payment for this entity",
                });
            }
            const result = await payments_service_1.PaymentService.registerFrontendPayment(req, {
                reference,
                entityId,
                entityType: entityType,
                amount: amountNumber,
                purpose,
                type: type,
                email,
                metadata,
                currency: currency || "NGN",
                expectedAmount: expectedAmount ? parseFloat(expectedAmount) : undefined,
            });
            res.json({
                success: true,
                message: result.message,
                data: result.data,
            });
        }
        catch (error) {
            console.error("Register frontend payment error:", error);
            if (error.message.includes("already registered") ||
                error.message.includes("data mismatch")) {
                return res.status(409).json({
                    success: false,
                    error: error.message,
                });
            }
            if (error.message.includes("Amount must be")) {
                return res.status(400).json({
                    success: false,
                    error: error.message,
                });
            }
            res.status(500).json({
                success: false,
                error: error.message || "Failed to register payment",
            });
        }
    }
    static async verifyPayment(req, res) {
        try {
            const { reference } = req.params;
            if (!reference) {
                return res.status(400).json({
                    success: false,
                    error: "Reference is required",
                });
            }
            const result = await payments_service_1.PaymentService.verifyPayment(reference);
            res.json({
                success: true,
                message: "Payment verified successfully",
                data: result,
            });
        }
        catch (error) {
            console.error("Verify payment error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to verify payment",
            });
        }
    }
    static async getWalletBalance(req, res) {
        try {
            const user = req.user;
            const { id: entityId, role: entityType } = user;
            const wallet = await wallet_service_1.WalletService.getWalletBalance(entityId, entityType);
            res.json({
                success: true,
                data: wallet,
            });
        }
        catch (error) {
            console.error("Get wallet balance error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get wallet balance",
            });
        }
    }
    static async withdrawFromWallet(req, res) {
        try {
            const { amount, accountNumber, bankCode, accountName } = req.body;
            const user = req.user;
            const { id: entityId, role: entityType } = user;
            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid amount",
                });
            }
            if (!accountNumber || !bankCode) {
                return res.status(400).json({
                    success: false,
                    error: "Account number and bank code are required",
                });
            }
            const result = await wallet_service_1.WalletService.withdrawWallet({
                entityId,
                entityType: entityType,
                amount,
                accountNumber,
                bankCode,
                accountName,
                narration: `Wallet withdrawal - ${accountName || "VENDA User"}`,
            });
            res.json({
                success: true,
                message: result.message,
                data: result,
            });
        }
        catch (error) {
            console.error("Withdraw error:", error);
            res.status(400).json({
                success: false,
                error: error.message || "Failed to process withdrawal",
            });
        }
    }
    static async finalizeWithdrawal(req, res) {
        try {
            const { reference, otp } = req.body;
            const user = req.user;
            if (!reference || !otp) {
                return res.status(400).json({
                    success: false,
                    error: "Reference and OTP are required",
                });
            }
            const result = await wallet_service_1.WalletService.finalizeWithdrawalOTP(reference, otp);
            res.json({
                success: true,
                message: "Withdrawal finalized successfully",
                data: result,
            });
        }
        catch (error) {
            console.error("Finalize withdrawal error:", error);
            res.status(400).json({
                success: false,
                error: error.message || "Failed to finalize withdrawal",
            });
        }
    }
    static async resendWithdrawalOTP(req, res) {
        try {
            const { reference } = req.body;
            if (!reference) {
                return res.status(400).json({
                    success: false,
                    error: "Reference is required",
                });
            }
            const result = await wallet_service_1.WalletService.resendWithdrawalOTP(reference);
            res.json({
                success: true,
                message: "OTP resent successfully",
                data: result,
            });
        }
        catch (error) {
            console.error("Resend OTP error:", error);
            res.status(400).json({
                success: false,
                error: error.message || "Failed to resend OTP",
            });
        }
    }
    static async getPaymentMethods(req, res) {
        try {
            const user = req.user;
            const paymentMethods = await payments_service_1.PaymentService.getPaymentMethods(user.id, user.role);
            res.json({
                success: true,
                data: paymentMethods,
            });
        }
        catch (error) {
            console.error("Get payment methods error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get payment methods",
            });
        }
    }
    static async chargeSavedMethod(req, res) {
        try {
            const { amount, paymentMethodId, purpose = "Wallet Funding" } = req.body;
            const user = req.user;
            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid amount",
                });
            }
            if (!paymentMethodId) {
                return res.status(400).json({
                    success: false,
                    error: "Payment method ID is required",
                });
            }
            const result = await payments_service_1.PaymentService.chargeSavedPaymentMethod({
                entityId: user.id,
                entityType: user.role,
                amount,
                paymentMethodId,
                purpose,
            });
            res.json({
                success: true,
                message: "Payment charged successfully",
                data: result,
            });
        }
        catch (error) {
            console.error("Charge saved method error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to charge payment method",
            });
        }
    }
    static async setDefaultPaymentMethod(req, res) {
        try {
            const { paymentMethodId } = req.body;
            const user = req.user;
            if (!paymentMethodId) {
                return res.status(400).json({
                    success: false,
                    error: "Payment method ID is required",
                });
            }
            const result = await payments_service_1.PaymentService.setDefaultPaymentMethod(user.id, user.role, paymentMethodId);
            res.json({
                success: true,
                message: "Default payment method updated",
                data: result,
            });
        }
        catch (error) {
            console.error("Set default payment method error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to set default payment method",
            });
        }
    }
    static async deletePaymentMethod(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            await payments_service_1.PaymentService.deletePaymentMethod(user.id, user.role, id);
            res.json({
                success: true,
                message: "Payment method deleted successfully",
            });
        }
        catch (error) {
            console.error("Delete payment method error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to delete payment method",
            });
        }
    }
    static async savePaymentMethod(req, res) {
        try {
            const { authorizationCode, cardType, last4, expMonth, expYear, bank, countryCode, brand, isDefault = false, } = req.body;
            const user = req.user;
            const requiredFields = [
                "authorizationCode",
                "cardType",
                "last4",
                "expMonth",
                "expYear",
                "bank",
                "countryCode",
                "brand",
            ];
            for (const field of requiredFields) {
                if (!req.body[field]) {
                    return res.status(400).json({
                        success: false,
                        error: `${field} is required`,
                    });
                }
            }
            const paymentMethod = await payments_service_1.PaymentService.savePaymentMethod({
                ownerId: user.id,
                ownerType: user.role,
                authorizationCode,
                cardType,
                last4,
                expMonth,
                expYear,
                bank,
                countryCode,
                brand,
                isDefault,
            });
            res.json({
                success: true,
                message: "Payment method added successfully",
                data: {
                    id: paymentMethod.id,
                    cardType: paymentMethod.cardType,
                    last4: paymentMethod.last4,
                    isDefault: paymentMethod.isDefault,
                },
            });
        }
        catch (error) {
            console.error("Add payment method error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to add payment method",
            });
        }
    }
    static async getTransactionHistory(req, res) {
        try {
            const user = req.user;
            const { id: entityId, role: entityType } = user;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await transaction_service_1.TransactionService.getEntityTransactions({
                entityId,
                entityType: entityType,
                page,
                limit,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Get transactions error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get transactions",
            });
        }
    }
    static async handlePaystackWebhook(req, res) {
        try {
            const result = await payments_service_1.PaymentService.handleWebhook(req.body, req.headers);
            res.json({
                success: true,
                message: "Webhook processed successfully",
            });
        }
        catch (error) {
            console.error("Webhook error:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to process webhook",
            });
        }
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=paymentsController.js.map