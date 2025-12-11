"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const express_validator_1 = require("express-validator");
const walletService_1 = __importDefault(require("../../services/customer/walletService"));
const response_1 = require("../../utils/response");
class WalletController {
    async getWallet(req, res) {
        try {
            const wallet = await walletService_1.default.getWallet(req.user.id);
            return (0, response_1.successResponse)(res, wallet);
        }
        catch (error) {
            console.error('Get wallet error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getTransactions(req, res) {
        try {
            const transactions = await walletService_1.default.getTransactions(req.user.id, req.query);
            return (0, response_1.successResponse)(res, transactions);
        }
        catch (error) {
            console.error('Get transactions error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async fundWallet(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const { amount, method } = req.body;
            const transaction = await walletService_1.default.fundWallet(req.user.id, amount, { method });
            return (0, response_1.successResponse)(res, transaction, 'Wallet funded successfully', 201);
        }
        catch (error) {
            console.error('Fund wallet error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async withdraw(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const { amount, recipient, account_number, bank_name } = req.body;
            const transaction = await walletService_1.default.withdraw(req.user.id, amount, { recipient, account_number, bank_name });
            return (0, response_1.successResponse)(res, transaction, 'Withdrawal successful', 201);
        }
        catch (error) {
            console.error('Withdraw error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.WalletController = WalletController;
exports.default = new WalletController();
//# sourceMappingURL=walletController.js.map