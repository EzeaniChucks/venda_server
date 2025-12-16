// routes/payments.route.ts
import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { PaymentController } from "../../controllers/shared/paymentsController";
import { validateRequest } from "../../middleware/validateRequest";
import { body, param, query } from "express-validator";
import { BankController } from "../../controllers/shared/bankController";

const router = Router();

//  bank operations
// Public routes (no authentication required for bank listing)
router.get("/banks", authenticate, BankController.getBanksController);

// Bank account verification
router.post(
  "/verify-bank-account",
  authenticate,
  [
    body("accountNumber")
      .notEmpty()
      .withMessage("Account number is required")
      .isLength({ min: 10, max: 10 })
      .withMessage("Account number must be 10 digits")
      .matches(/^\d+$/)
      .withMessage("Account number must contain only numbers"),
    body("bankCode").notEmpty().withMessage("Bank code is required"),
  ],
  validateRequest,
  BankController.verifyBankAccountController
);

// Register frontend payment
router.post(
  "/register-frontend",
  authenticate,
  [
    body("reference")
      .notEmpty()
      .withMessage("Reference is required")
      .isString()
      .withMessage("Reference must be a string")
      .matches(/^[A-Za-z0-9_-]+$/)
      .withMessage(
        "Reference can only contain letters, numbers, hyphens and underscores"
      ),

    body("entityId")
      .notEmpty()
      .withMessage("Entity ID is required")
      .isString()
      .withMessage("Entity ID must be a string")
      .isLength({ min: 1, max: 100 })
      .withMessage("Entity ID must be between 1 and 100 characters"),

    body("entityType")
      .notEmpty()
      .withMessage("Entity type is required")
      .isString()
      .withMessage("Entity type must be a string")
      .isIn(["customer", "vendor", "rider", "admin", "business"])
      .withMessage(
        "Invalid entity type. Must be one of: customer, vendor, rider, admin, business"
      ),

    body("amount")
      .notEmpty()
      .withMessage("Amount is required")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a positive number")
      .custom((value) => {
        // Convert to number and validate
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
          throw new Error("Amount must be a positive number");
        }
        return true;
      }),

    body("purpose")
      .notEmpty()
      .withMessage("Purpose is required")
      .isString()
      .withMessage("Purpose must be a string")
      .isLength({ min: 1, max: 500 })
      .withMessage("Purpose must be between 1 and 500 characters"),

    body("type")
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

    body("email")
      .optional()
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("currency")
      .optional()
      .isString()
      .withMessage("Currency must be a string")
      .isLength({ min: 3, max: 3 })
      .withMessage("Currency must be 3 characters (e.g., NGN, USD)")
      .toUpperCase(),

    body("expectedAmount")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Expected amount must be a positive number"),

    body("metadata")
      .optional()
      .isObject()
      .withMessage("Metadata must be an object"),
  ],
  validateRequest,
  PaymentController.registerFrontendPayment
);

// Verify payment
router.get(
  "/verify/:reference",
  [
    param("reference")
      .notEmpty()
      .withMessage("Reference is required")
      .isString()
      .withMessage("Reference must be a string"),

    query("entityId")
      .optional()
      .isString()
      .withMessage("Entity ID must be a string"),

    query("entityType")
      .optional()
      .isString()
      .withMessage("Entity type must be a string")
      .custom((value, { req }) => {
        if (req?.query?.entityId && !value) {
          throw new Error("Entity type is required when entityId is provided");
        }
        if (
          value &&
          !["customer", "vendor", "rider", "admin", "business"].includes(value)
        ) {
          throw new Error("Invalid entity type");
        }
        return true;
      }),
  ],
  validateRequest,
  PaymentController.verifyPayment
);

// Initialize payment (if you still need this endpoint)
router.post(
  "/initialize",
  authenticate,
  [
    body("entityId")
      .notEmpty()
      .withMessage("Entity ID is required")
      .isString()
      .withMessage("Entity ID must be a string"),

    body("entityType")
      .notEmpty()
      .withMessage("Entity type is required")
      .isString()
      .withMessage("Entity type must be a string")
      .isIn(["customer", "vendor", "rider", "admin", "business"])
      .withMessage("Invalid entity type"),

    body("amount")
      .notEmpty()
      .withMessage("Amount is required")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a positive number"),

    body("purpose")
      .notEmpty()
      .withMessage("Purpose is required")
      .isString()
      .withMessage("Purpose must be a string"),

    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("type")
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

    body("currency")
      .optional()
      .isString()
      .withMessage("Currency must be a string")
      .default("NGN")
      .toUpperCase(),

    body("metadata")
      .optional()
      .isObject()
      .withMessage("Metadata must be an object"),
  ],
  validateRequest,
  PaymentController.initializePayment
);

// Wallet operations
router.get("/balance", authenticate, PaymentController.getWalletBalance);
router.post("/withdraw", authenticate, PaymentController.withdrawFromWallet);
router.post(
  "/withdraw/finalize",
  authenticate,
  PaymentController.finalizeWithdrawal
);
router.post(
  "/withdraw/resend-otp",
  authenticate,
  PaymentController.resendWithdrawalOTP
);

// Payment methods for all entities
router.get(
  "/payment-methods",
  authenticate,
  PaymentController.getPaymentMethods
);

router.post(
  "/payment-methods",
  authenticate,
  [
    body("authorizationCode").isString().notEmpty(),
    body("cardType").isString().notEmpty(),
    body("last4").isString().isLength({ min: 4, max: 4 }),
    body("expMonth").isString().isLength({ min: 2, max: 2 }),
    body("expYear").isString().isLength({ min: 4, max: 4 }),
    body("bank").isString().notEmpty(),
    body("countryCode").isString().isLength({ min: 2, max: 2 }),
    body("brand").isString().notEmpty(),
    body("isDefault").optional().isBoolean(),
  ],
  validateRequest,
  PaymentController.savePaymentMethod
);

router.post(
  "/payment-methods/default",
  authenticate,
  [body("paymentMethodId").isString().notEmpty()],
  validateRequest,
  PaymentController.setDefaultPaymentMethod
);

router.delete(
  "/payment-methods/:id",
  authenticate,
  PaymentController.deletePaymentMethod
);

// Charge saved payment method (available to all)
router.post(
  "/charge-saved-card",
  authenticate,
  [
    body("amount").isFloat({ min: 100 }),
    body("paymentMethodId").isString().notEmpty(),
    body("purpose").optional().isString(),
  ],
  validateRequest,
  PaymentController.chargeSavedMethod
);

// Transactions
router.get(
  "/transactions",
  authenticate,
  PaymentController.getTransactionHistory
);

// Webhook
router.post("/webhook/paystack", PaymentController.handlePaystackWebhook);

export default router;
