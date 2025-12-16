"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const express_validator_1 = require("express-validator");
const wallet_service_1 = require("../../services/shared/wallet.service");
const transaction_service_1 = require("../../services/shared/transaction.service");
const response_1 = require("../../utils/response");
class WalletController {
    async getWallet(req, res) {
        try {
            if (!req.user) {
                return (0, response_1.errorResponse)(res, "Unauthorized", 401);
            }
            const wallet = await wallet_service_1.WalletService.getWalletBalance(req.user.id, req.user.role);
            return (0, response_1.successResponse)(res, wallet);
        }
        catch (error) {
            console.error("Get wallet error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getTransactions(req, res) {
        try {
            if (!req.user) {
                return (0, response_1.errorResponse)(res, "Unauthorized", 401);
            }
            const { page = "1", limit = "20", startDate, endDate, type, status, } = req.query;
            const transactions = await wallet_service_1.WalletService.getTransactions({
                entityId: req.user.id,
                entityType: req.user.role,
                page: parseInt(page),
                limit: parseInt(limit),
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                transactionType: type,
                status: status,
            });
            return (0, response_1.successResponse)(res, transactions);
        }
        catch (error) {
            console.error("Get transactions error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async withdraw(req, res) {
        try {
            if (!req.user) {
                return (0, response_1.errorResponse)(res, "Unauthorized", 401);
            }
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const { amount, accountNumber, bankCode, accountName, narration = "Wallet withdrawal", } = req.body;
            if (amount <= 0) {
                return (0, response_1.errorResponse)(res, "Amount must be greater than 0", 400);
            }
            if (amount < 100) {
                return (0, response_1.errorResponse)(res, "Minimum withdrawal amount is ₦100", 400);
            }
            const result = await wallet_service_1.WalletService.withdrawWallet({
                entityId: req.user.id,
                entityType: req.user.role,
                amount: parseFloat(amount),
                accountNumber,
                bankCode,
                accountName,
                narration,
            });
            return (0, response_1.successResponse)(res, result, result.requiresOtp
                ? "Withdrawal initiated. OTP sent for confirmation."
                : "Withdrawal initiated successfully");
        }
        catch (error) {
            console.error("Withdraw error:", error);
            if (error.message.includes("Insufficient wallet balance")) {
                return (0, response_1.errorResponse)(res, "Insufficient wallet balance", 400);
            }
            if (error.message.includes("not found")) {
                return (0, response_1.errorResponse)(res, "Wallet not found", 404);
            }
            if (error.message.includes("Only customers can use this feature")) {
                return (0, response_1.errorResponse)(res, error.message, 403);
            }
            return (0, response_1.errorResponse)(res, error.message || "Withdrawal failed", 400);
        }
    }
    async verifyWithdrawalOTP(req, res) {
        try {
            if (!req.user) {
                return (0, response_1.errorResponse)(res, "Unauthorized", 401);
            }
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const { reference, otp } = req.body;
            if (!reference || !otp) {
                return (0, response_1.errorResponse)(res, "Reference and OTP are required", 400);
            }
            const transaction = await transaction_service_1.TransactionService.getTransactionByReference(reference);
            if (!transaction) {
                return (0, response_1.errorResponse)(res, "Transaction not found", 404);
            }
            if (transaction.entityId !== req.user.id ||
                transaction.entityType !== req.user.role) {
                return (0, response_1.errorResponse)(res, "Unauthorized access to transaction", 403);
            }
            const result = await wallet_service_1.WalletService.finalizeWithdrawalOTP(reference, otp);
            return (0, response_1.successResponse)(res, result, "Withdrawal completed successfully");
        }
        catch (error) {
            console.error("Verify OTP error:", error);
            if (error.message.includes("Invalid OTP")) {
                return (0, response_1.errorResponse)(res, error.message, 400);
            }
            if (error.message.includes("Maximum OTP attempts")) {
                return (0, response_1.errorResponse)(res, error.message, 400);
            }
            if (error.message.includes("Transaction not found")) {
                return (0, response_1.errorResponse)(res, "Invalid transaction reference", 404);
            }
            if (error.message.includes("already completed")) {
                return (0, response_1.errorResponse)(res, "This withdrawal has already been completed", 400);
            }
            return (0, response_1.errorResponse)(res, error.message || "OTP verification failed", 400);
        }
    }
    async resendWithdrawalOTP(req, res) {
        try {
            if (!req.user) {
                return (0, response_1.errorResponse)(res, "Unauthorized", 401);
            }
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const { reference } = req.body;
            if (!reference) {
                return (0, response_1.errorResponse)(res, "Transaction reference is required", 400);
            }
            const transaction = await transaction_service_1.TransactionService.getTransactionByReference(reference);
            if (!transaction) {
                return (0, response_1.errorResponse)(res, "Transaction not found", 404);
            }
            if (transaction.entityId !== req.user.id ||
                transaction.entityType !== req.user.role) {
                return (0, response_1.errorResponse)(res, "Unauthorized access to transaction", 403);
            }
            const result = await wallet_service_1.WalletService.resendWithdrawalOTP(reference);
            return (0, response_1.successResponse)(res, result, "OTP resent successfully");
        }
        catch (error) {
            console.error("Resend OTP error:", error);
            if (error.message.includes("Please wait")) {
                return (0, response_1.errorResponse)(res, error.message, 400);
            }
            if (error.message.includes("Transaction not found")) {
                return (0, response_1.errorResponse)(res, "Invalid transaction reference", 404);
            }
            return (0, response_1.errorResponse)(res, error.message || "Failed to resend OTP", 400);
        }
    }
    async makePayment(req, res) {
        try {
            if (!req.user) {
                return (0, response_1.errorResponse)(res, "Unauthorized", 401);
            }
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const { amount, orderId, description, reference, metadata = {}, recipientId, recipientType, } = req.body;
            if (amount <= 0) {
                return (0, response_1.errorResponse)(res, "Amount must be greater than 0", 400);
            }
            if (amount < 1) {
                return (0, response_1.errorResponse)(res, "Minimum payment amount is ₦1", 400);
            }
            const result = await wallet_service_1.WalletService.makePayment({
                entityId: req.user.id,
                entityType: req.user.role,
                amount: parseFloat(amount),
                orderId,
                description,
                reference,
                metadata: {
                    ...metadata,
                    payerId: req.user.id,
                    payerType: req.user.role,
                    recipientId,
                    recipientType,
                },
            });
            return (0, response_1.successResponse)(res, result, "Payment completed successfully");
        }
        catch (error) {
            console.error("Make payment error:", error);
            if (error.message.includes("Insufficient wallet balance")) {
                return (0, response_1.errorResponse)(res, "Insufficient wallet balance", 400);
            }
            if (error.message.includes("not found")) {
                return (0, response_1.errorResponse)(res, "Wallet not found", 404);
            }
            return (0, response_1.errorResponse)(res, error.message || "Payment failed", 400);
        }
    }
    async getTransactionByReference(req, res) {
        try {
            if (!req.user) {
                return (0, response_1.errorResponse)(res, "Unauthorized", 401);
            }
            const { reference } = req.params;
            if (!reference) {
                return (0, response_1.errorResponse)(res, "Transaction reference is required", 400);
            }
            const transaction = await transaction_service_1.TransactionService.getTransactionByReference(reference);
            if (!transaction) {
                return (0, response_1.errorResponse)(res, "Transaction not found", 404);
            }
            if (transaction.entityId !== req.user.id ||
                transaction.entityType !== req.user.role) {
                return (0, response_1.errorResponse)(res, "Unauthorized access to transaction", 403);
            }
            return (0, response_1.successResponse)(res, transaction);
        }
        catch (error) {
            console.error("Get transaction error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getWalletStats(req, res) {
        try {
            if (!req.user) {
                return (0, response_1.errorResponse)(res, "Unauthorized", 401);
            }
            const walletBalance = await wallet_service_1.WalletService.getWalletBalance(req.user.id, req.user.role);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentTransactions = await transaction_service_1.TransactionService.getEntityTransactions({
                entityId: req.user.id,
                entityType: req.user.role,
                startDate: thirtyDaysAgo,
                limit: 100,
            });
            const stats = {
                totalDeposits: recentTransactions.transactions
                    .filter((t) => t.transactionType === "wallet_funding" && t.status === "completed")
                    .reduce((sum, t) => sum + t.amount, 0),
                totalWithdrawals: recentTransactions.transactions
                    .filter((t) => t.transactionType === "wallet_withdrawal" &&
                    t.status === "completed")
                    .reduce((sum, t) => sum + t.amount, 0),
                totalPayments: recentTransactions.transactions
                    .filter((t) => t.transactionType === "wallet_payment" && t.status === "completed")
                    .reduce((sum, t) => sum + t.amount, 0),
                pendingWithdrawals: recentTransactions.transactions
                    .filter((t) => t.transactionType === "wallet_withdrawal" &&
                    ["pending", "processing"].includes(t.status))
                    .reduce((sum, t) => sum + t.amount, 0),
                totalEarnings: recentTransactions.transactions
                    .filter((t) => (t.transactionType === "commission" ||
                    t.transactionType === "transfer") &&
                    t.status === "completed")
                    .reduce((sum, t) => sum + t.amount, 0),
                transactionCount: {
                    deposits: recentTransactions.transactions.filter((t) => t.transactionType === "wallet_funding").length,
                    withdrawals: recentTransactions.transactions.filter((t) => t.transactionType === "wallet_withdrawal").length,
                    payments: recentTransactions.transactions.filter((t) => t.transactionType === "wallet_payment").length,
                    earnings: recentTransactions.transactions.filter((t) => t.transactionType === "commission" ||
                        t.transactionType === "transfer").length,
                },
            };
            return (0, response_1.successResponse)(res, {
                ...walletBalance,
                statistics: stats,
                userType: req.user.role,
            });
        }
        catch (error) {
            console.error("Get wallet stats error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async transferToAnotherUser(req, res) {
        try {
            if (!req.user) {
                return (0, response_1.errorResponse)(res, "Unauthorized", 401);
            }
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const { amount, recipientId, recipientType, description, orderId, metadata = {}, } = req.body;
            if (amount <= 0) {
                return (0, response_1.errorResponse)(res, "Amount must be greater than 0", 400);
            }
            if (amount < 1) {
                return (0, response_1.errorResponse)(res, "Minimum transfer amount is ₦1", 400);
            }
            if (recipientId === req.user.id && recipientType === req.user.role) {
                return (0, response_1.errorResponse)(res, "Cannot transfer to yourself", 400);
            }
            const paymentResult = await wallet_service_1.WalletService.makePayment({
                entityId: req.user.id,
                entityType: req.user.role,
                amount: parseFloat(amount),
                orderId,
                description: `Transfer to ${recipientType}: ${description || "Wallet transfer"}`,
                metadata: {
                    ...metadata,
                    transferType: "outgoing",
                    recipientId,
                    recipientType,
                },
            });
            const recipientTransaction = await transaction_service_1.TransactionService.createTransaction({
                entityId: recipientId,
                entityType: recipientType,
                amount: parseFloat(amount),
                transactionType: "transfer",
                reference: paymentResult.reference + "_RECIPIENT",
                description: `Transfer from ${req.user.role}: ${description || "Wallet transfer"}`,
                status: "completed",
                metadata: {
                    ...metadata,
                    transferType: "incoming",
                    senderId: req.user.id,
                    senderType: req.user.role,
                    originalReference: paymentResult.reference,
                },
            });
            return (0, response_1.successResponse)(res, {
                payment: paymentResult,
                recipientTransaction,
                message: "Transfer completed successfully",
            }, "Transfer completed successfully");
        }
        catch (error) {
            console.error("Transfer error:", error);
            if (error.message.includes("Insufficient wallet balance")) {
                return (0, response_1.errorResponse)(res, "Insufficient wallet balance", 400);
            }
            if (error.message.includes("not found")) {
                return (0, response_1.errorResponse)(res, "Wallet not found", 404);
            }
            return (0, response_1.errorResponse)(res, error.message || "Transfer failed", 400);
        }
    }
    async getPendingWithdrawals(req, res) {
        try {
            if (!req.user) {
                return (0, response_1.errorResponse)(res, "Unauthorized", 401);
            }
            const { page = "1", limit = "20" } = req.query;
            const transactions = await transaction_service_1.TransactionService.getEntityTransactions({
                entityId: req.user.id,
                entityType: req.user.role,
                page: parseInt(page),
                limit: parseInt(limit),
                transactionType: "wallet_withdrawal",
                status: "pending",
            });
            const pendingWithdrawals = transactions.transactions.filter((t) => ["pending", "processing"].includes(t.status));
            return (0, response_1.successResponse)(res, {
                pendingWithdrawals,
                totalPendingAmount: pendingWithdrawals.reduce((sum, t) => sum + t.amount, 0),
                count: pendingWithdrawals.length,
                pagination: transactions.pagination,
            });
        }
        catch (error) {
            console.error("Get pending withdrawals error:", error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
}
exports.WalletController = WalletController;
exports.default = new WalletController();
//# sourceMappingURL=walletController.js.map