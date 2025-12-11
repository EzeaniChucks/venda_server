"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankController = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const bankservice_service_1 = __importDefault(require("../../services/shared/bankservice.service"));
class BankController {
}
exports.BankController = BankController;
_a = BankController;
BankController.getBanksController = async (req, res) => {
    const banks = await bankservice_service_1.default.getBanks();
    res.status(200).json({
        success: true,
        message: "Banks retrieved successfully",
        data: banks,
    });
};
BankController.verifyBankAccountController = async (req, res) => {
    const { accountNumber, bankCode } = req.body;
    if (!accountNumber || !bankCode) {
        return res.status(400).json({
            success: false,
            message: "Account number and bank code are required",
        });
    }
    if (accountNumber.length !== 10) {
        return res.status(400).json({
            success: false,
            message: "Account number must be 10 digits",
        });
    }
    const verification = await bankservice_service_1.default.verifyBankAccount(accountNumber, bankCode);
    if (!verification.status) {
        return res.status(400).json({
            success: false,
            message: verification.message,
        });
    }
    res.status(200).json({
        success: true,
        message: verification.message,
        data: verification.data,
    });
};
BankController.initializeTransactionController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, amount, metadata } = req.body;
    const vendorId = req.user?.id;
    if (!email || !amount) {
        return res.status(400).json({
            success: false,
            message: "Email and amount are required",
        });
    }
    if (amount <= 0) {
        return res.status(400).json({
            success: false,
            message: "Amount must be greater than 0",
        });
    }
    try {
        const response = await bankservice_service_1.default.initializeTransaction(email, amount, {
            ...metadata,
            vendorId,
        });
        res.status(200).json({
            success: true,
            message: "Transaction initialized successfully",
            data: response,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to initialize transaction",
        });
    }
});
BankController.verifyTransactionController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { reference } = req.params;
    if (!reference) {
        return res.status(400).json({
            success: false,
            message: "Transaction reference is required",
        });
    }
    try {
        const verification = await bankservice_service_1.default.verifyTransaction(reference);
        if (!verification.status) {
            return res.status(400).json({
                success: false,
                message: verification.message || "Transaction verification failed",
            });
        }
        if (verification.data.status !== "success") {
            return res.status(400).json({
                success: false,
                message: `Transaction ${verification.data.status}`,
                data: verification.data,
            });
        }
        res.status(200).json({
            success: true,
            message: "Transaction verified successfully",
            data: verification.data,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to verify transaction",
        });
    }
});
BankController.chargeAuthorizationController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { authorizationCode, email, amount, reference, metadata } = req.body;
    const vendorId = req.user?.id;
    if (!authorizationCode || !email || !amount || !reference) {
        return res.status(400).json({
            success: false,
            message: "Authorization code, email, amount, and reference are required",
        });
    }
    try {
        const response = await bankservice_service_1.default.chargeAuthorization(authorizationCode, email, amount, reference, {
            ...metadata,
            vendorId,
        });
        if (!response.status) {
            return res.status(400).json({
                success: false,
                message: response.message || "Charge failed",
                data: response.data,
            });
        }
        res.status(200).json({
            success: true,
            message: "Charge successful",
            data: response.data,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to charge authorization",
        });
    }
});
BankController.handleCustomerController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, firstName, lastName } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required",
        });
    }
    try {
        const existingCustomer = await bankservice_service_1.default.fetchCustomer(email);
        if (existingCustomer?.status) {
            return res.status(200).json({
                success: true,
                message: "Customer retrieved successfully",
                data: existingCustomer.data,
            });
        }
        const newCustomer = await bankservice_service_1.default.createCustomer(email, firstName, lastName);
        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: newCustomer.data,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to handle customer",
        });
    }
});
BankController.generateReferenceController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const reference = bankservice_service_1.default.generateReference();
    res.status(200).json({
        success: true,
        message: "Reference generated successfully",
        data: { reference },
    });
});
//# sourceMappingURL=bankController.js.map