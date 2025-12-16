"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const paymentsController_1 = require("../../controllers/shared/paymentsController");
const validateRequest_1 = require("../../middleware/validateRequest");
const express_validator_1 = require("express-validator");
const bankController_1 = require("../../controllers/shared/bankController");
const router = (0, express_1.Router)();
router.get("/banks", auth_1.authenticate, bankController_1.BankController.getBanksController);
router.post("/verify-bank-account", auth_1.authenticate, [
    (0, express_validator_1.body)("accountNumber")
        .notEmpty()
        .withMessage("Account number is required")
        .isLength({ min: 10, max: 10 })
        .withMessage("Account number must be 10 digits")
        .matches(/^\d+$/)
        .withMessage("Account number must contain only numbers"),
    (0, express_validator_1.body)("bankCode").notEmpty().withMessage("Bank code is required"),
], validateRequest_1.validateRequest, bankController_1.BankController.verifyBankAccountController);
router.post("/register-frontend", auth_1.authenticate, [
    (0, express_validator_1.body)("reference")
        .notEmpty()
        .withMessage("Reference is required")
        .isString()
        .withMessage("Reference must be a string")
        .matches(/^[A-Za-z0-9_-]+$/)
        .withMessage("Reference can only contain letters, numbers, hyphens and underscores"),
    (0, express_validator_1.body)("entityId")
        .notEmpty()
        .withMessage("Entity ID is required")
        .isString()
        .withMessage("Entity ID must be a string")
        .isLength({ min: 1, max: 100 })
        .withMessage("Entity ID must be between 1 and 100 characters"),
    (0, express_validator_1.body)("entityType")
        .notEmpty()
        .withMessage("Entity type is required")
        .isString()
        .withMessage("Entity type must be a string")
        .isIn(["customer", "vendor", "rider", "admin", "business"])
        .withMessage("Invalid entity type. Must be one of: customer, vendor, rider, admin, business"),
    (0, express_validator_1.body)("amount")
        .notEmpty()
        .withMessage("Amount is required")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be a positive number")
        .custom((value) => {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
            throw new Error("Amount must be a positive number");
        }
        return true;
    }),
    (0, express_validator_1.body)("purpose")
        .notEmpty()
        .withMessage("Purpose is required")
        .isString()
        .withMessage("Purpose must be a string")
        .isLength({ min: 1, max: 500 })
        .withMessage("Purpose must be between 1 and 500 characters"),
    (0, express_validator_1.body)("type")
        .notEmpty()
        .withMessage("Payment type is required")
        .isString()
        .withMessage("Payment type must be a string")
        .isIn([
        "wallet_funding",
        "order_payment",
        "service_payment",
        "subscription",
        "donation",
        "other",
    ])
        .withMessage("Invalid payment type"),
    (0, express_validator_1.body)("email")
        .optional()
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),
    (0, express_validator_1.body)("currency")
        .optional()
        .isString()
        .withMessage("Currency must be a string")
        .isLength({ min: 3, max: 3 })
        .withMessage("Currency must be 3 characters (e.g., NGN, USD)")
        .toUpperCase(),
    (0, express_validator_1.body)("expectedAmount")
        .optional()
        .isFloat({ gt: 0 })
        .withMessage("Expected amount must be a positive number"),
    (0, express_validator_1.body)("metadata")
        .optional()
        .isObject()
        .withMessage("Metadata must be an object"),
], validateRequest_1.validateRequest, paymentsController_1.PaymentController.registerFrontendPayment);
router.get("/verify/:reference", [
    (0, express_validator_1.param)("reference")
        .notEmpty()
        .withMessage("Reference is required")
        .isString()
        .withMessage("Reference must be a string"),
    (0, express_validator_1.query)("entityId")
        .optional()
        .isString()
        .withMessage("Entity ID must be a string"),
    (0, express_validator_1.query)("entityType")
        .optional()
        .isString()
        .withMessage("Entity type must be a string")
        .custom((value, { req }) => {
        if (req?.query?.entityId && !value) {
            throw new Error("Entity type is required when entityId is provided");
        }
        if (value &&
            !["customer", "vendor", "rider", "admin", "business"].includes(value)) {
            throw new Error("Invalid entity type");
        }
        return true;
    }),
], validateRequest_1.validateRequest, paymentsController_1.PaymentController.verifyPayment);
router.post("/initialize", auth_1.authenticate, [
    (0, express_validator_1.body)("entityId")
        .notEmpty()
        .withMessage("Entity ID is required")
        .isString()
        .withMessage("Entity ID must be a string"),
    (0, express_validator_1.body)("entityType")
        .notEmpty()
        .withMessage("Entity type is required")
        .isString()
        .withMessage("Entity type must be a string")
        .isIn(["customer", "vendor", "rider", "admin", "business"])
        .withMessage("Invalid entity type"),
    (0, express_validator_1.body)("amount")
        .notEmpty()
        .withMessage("Amount is required")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be a positive number"),
    (0, express_validator_1.body)("purpose")
        .notEmpty()
        .withMessage("Purpose is required")
        .isString()
        .withMessage("Purpose must be a string"),
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),
    (0, express_validator_1.body)("type")
        .notEmpty()
        .withMessage("Payment type is required")
        .isString()
        .withMessage("Payment type must be a string")
        .isIn([
        "wallet_funding",
        "order_payment",
        "service_payment",
        "subscription",
        "donation",
        "other",
    ])
        .withMessage("Invalid payment type"),
    (0, express_validator_1.body)("currency")
        .optional()
        .isString()
        .withMessage("Currency must be a string")
        .default("NGN")
        .toUpperCase(),
    (0, express_validator_1.body)("metadata")
        .optional()
        .isObject()
        .withMessage("Metadata must be an object"),
], validateRequest_1.validateRequest, paymentsController_1.PaymentController.initializePayment);
router.get("/balance", auth_1.authenticate, paymentsController_1.PaymentController.getWalletBalance);
router.post("/withdraw", auth_1.authenticate, paymentsController_1.PaymentController.withdrawFromWallet);
router.post("/withdraw/finalize", auth_1.authenticate, paymentsController_1.PaymentController.finalizeWithdrawal);
router.post("/withdraw/resend-otp", auth_1.authenticate, paymentsController_1.PaymentController.resendWithdrawalOTP);
router.get("/payment-methods", auth_1.authenticate, paymentsController_1.PaymentController.getPaymentMethods);
router.post("/payment-methods", auth_1.authenticate, [
    (0, express_validator_1.body)("authorizationCode").isString().notEmpty(),
    (0, express_validator_1.body)("cardType").isString().notEmpty(),
    (0, express_validator_1.body)("last4").isString().isLength({ min: 4, max: 4 }),
    (0, express_validator_1.body)("expMonth").isString().isLength({ min: 2, max: 2 }),
    (0, express_validator_1.body)("expYear").isString().isLength({ min: 4, max: 4 }),
    (0, express_validator_1.body)("bank").isString().notEmpty(),
    (0, express_validator_1.body)("countryCode").isString().isLength({ min: 2, max: 2 }),
    (0, express_validator_1.body)("brand").isString().notEmpty(),
    (0, express_validator_1.body)("isDefault").optional().isBoolean(),
], validateRequest_1.validateRequest, paymentsController_1.PaymentController.savePaymentMethod);
router.post("/payment-methods/default", auth_1.authenticate, [(0, express_validator_1.body)("paymentMethodId").isString().notEmpty()], validateRequest_1.validateRequest, paymentsController_1.PaymentController.setDefaultPaymentMethod);
router.delete("/payment-methods/:id", auth_1.authenticate, paymentsController_1.PaymentController.deletePaymentMethod);
router.post("/charge-saved-card", auth_1.authenticate, [
    (0, express_validator_1.body)("amount").isFloat({ min: 100 }),
    (0, express_validator_1.body)("paymentMethodId").isString().notEmpty(),
    (0, express_validator_1.body)("purpose").optional().isString(),
], validateRequest_1.validateRequest, paymentsController_1.PaymentController.chargeSavedMethod);
router.get("/transactions", auth_1.authenticate, paymentsController_1.PaymentController.getTransactionHistory);
router.post("/webhook/paystack", paymentsController_1.PaymentController.handlePaystackWebhook);
exports.default = router;
//# sourceMappingURL=paymentsRoutes.js.map