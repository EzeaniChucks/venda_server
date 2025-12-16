import WalletController from "../../controllers/shared/walletController";
import { authenticate } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { Router } from "express";
import { body, param, query } from "express-validator";

const router = Router();

// Apply authentication middleware to all routes
// authenticateUser should handle customers, vendors, and riders
router.use(authenticate);

// Get wallet balance
router.get("/", WalletController.getWallet);

// Get wallet statistics
router.get("/stats", WalletController.getWalletStats);

// Get wallet transactions
router.get(
  "/transactions",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("type")
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
    query("status")
      .optional()
      .isIn(["pending", "completed", "failed", "processing", "cancelled"]),
  ],
  validateRequest,
  WalletController.getTransactions
);

// Get specific transaction
router.get(
  "/transactions/:reference",
  [param("reference").notEmpty().isString()],
  validateRequest,
  WalletController.getTransactionByReference
);

// Withdraw from wallet
router.post(
  "/withdraw",
  [
    body("amount").isFloat({ min: 100 }), // Minimum ₦100
    body("accountNumber").isString().isLength({ min: 10, max: 10 }),
    body("bankCode").isString().notEmpty(),
    body("accountName").optional().isString(),
    body("narration").optional().isString().isLength({ max: 100 }),
  ],
  validateRequest,
  WalletController.withdraw
);

// Verify withdrawal OTP
router.post(
  "/withdraw/verify-otp",
  [
    body("reference").isString().notEmpty(),
    body("otp").isString().isLength({ min: 6, max: 6 }),
  ],
  validateRequest,
  WalletController.verifyWithdrawalOTP
);

// Resend withdrawal OTP
router.post(
  "/withdraw/resend-otp",
  [body("reference").isString().notEmpty()],
  validateRequest,
  WalletController.resendWithdrawalOTP
);

// Make payment from wallet
router.post(
  "/pay",
  [
    body("amount").isFloat({ min: 1 }),
    body("description").isString().notEmpty(),
    body("orderId").optional().isString(),
    body("reference").optional().isString(),
    body("recipientId").optional().isString(),
    body("recipientType").optional().isIn(["customer", "vendor", "rider"]),
  ],
  validateRequest,
  WalletController.makePayment
);

// Transfer to another user
router.post(
  "/transfer",
  [
    body("amount").isFloat({ min: 1 }),
    body("recipientId").isString().notEmpty(),
    body("recipientType").isIn(["customer", "vendor", "rider"]),
    body("description").optional().isString(),
    body("orderId").optional().isString(),
  ],
  validateRequest,
  WalletController.transferToAnotherUser
);

// Get pending withdrawals
router.get(
  "/withdrawals/pending",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
  ],
  validateRequest,
  WalletController.getPendingWithdrawals
);

export default router;
