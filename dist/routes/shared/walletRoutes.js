"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const walletController_1 = __importDefault(require("../../controllers/shared/walletController"));
const auth_1 = require("../../middleware/auth");
const validateRequest_1 = require("../../middleware/validateRequest");
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", walletController_1.default.getWallet);
router.get("/stats", walletController_1.default.getWalletStats);
router.get("/transactions", [
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }),
    (0, express_validator_1.query)("limit").optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)("startDate").optional().isISO8601(),
    (0, express_validator_1.query)("endDate").optional().isISO8601(),
    (0, express_validator_1.query)("type")
        .optional()
        .isIn([
        "wallet_funding",
        "wallet_withdrawal",
        "wallet_payment",
        "order_payment",
        "refund",
        "commission",
        "transfer",
    ]),
    (0, express_validator_1.query)("status")
        .optional()
        .isIn(["pending", "completed", "failed", "processing", "cancelled"]),
], validateRequest_1.validateRequest, walletController_1.default.getTransactions);
router.get("/transactions/:reference", [(0, express_validator_1.param)("reference").notEmpty().isString()], validateRequest_1.validateRequest, walletController_1.default.getTransactionByReference);
router.post("/withdraw", [
    (0, express_validator_1.body)("amount").isFloat({ min: 100 }),
    (0, express_validator_1.body)("accountNumber").isString().isLength({ min: 10, max: 10 }),
    (0, express_validator_1.body)("bankCode").isString().notEmpty(),
    (0, express_validator_1.body)("accountName").optional().isString(),
    (0, express_validator_1.body)("narration").optional().isString().isLength({ max: 100 }),
], validateRequest_1.validateRequest, walletController_1.default.withdraw);
router.post("/withdraw/verify-otp", [
    (0, express_validator_1.body)("reference").isString().notEmpty(),
    (0, express_validator_1.body)("otp").isString().isLength({ min: 6, max: 6 }),
], validateRequest_1.validateRequest, walletController_1.default.verifyWithdrawalOTP);
router.post("/withdraw/resend-otp", [(0, express_validator_1.body)("reference").isString().notEmpty()], validateRequest_1.validateRequest, walletController_1.default.resendWithdrawalOTP);
router.post("/pay", [
    (0, express_validator_1.body)("amount").isFloat({ min: 1 }),
    (0, express_validator_1.body)("description").isString().notEmpty(),
    (0, express_validator_1.body)("orderId").optional().isString(),
    (0, express_validator_1.body)("reference").optional().isString(),
    (0, express_validator_1.body)("recipientId").optional().isString(),
    (0, express_validator_1.body)("recipientType").optional().isIn(["customer", "vendor", "rider"]),
], validateRequest_1.validateRequest, walletController_1.default.makePayment);
router.post("/transfer", [
    (0, express_validator_1.body)("amount").isFloat({ min: 1 }),
    (0, express_validator_1.body)("recipientId").isString().notEmpty(),
    (0, express_validator_1.body)("recipientType").isIn(["customer", "vendor", "rider"]),
    (0, express_validator_1.body)("description").optional().isString(),
    (0, express_validator_1.body)("orderId").optional().isString(),
], validateRequest_1.validateRequest, walletController_1.default.transferToAnotherUser);
router.get("/withdrawals/pending", [
    (0, express_validator_1.query)("page").optional().isInt({ min: 1 }),
    (0, express_validator_1.query)("limit").optional().isInt({ min: 1, max: 50 }),
], validateRequest_1.validateRequest, walletController_1.default.getPendingWithdrawals);
exports.default = router;
//# sourceMappingURL=walletRoutes.js.map