import express from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { body, param } from "express-validator";
import { BankController } from "../../controllers/shared/bankController";
import { authenticate } from "../../middleware/auth";

const router = express.Router();

// Public routes (no authentication required for bank listing)
router.get("/banks", BankController.getBanksController);

// Protected routes (require vendor authentication)
router.use(authenticate);

// Bank account verification
router.post(
  "/verify-bank-account",
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

// Payment routes
// router.post(
//   '/initialize-payment',
//   [
//     body('email')
//       .notEmpty()
//       .withMessage('Email is required')
//       .isEmail()
//       .withMessage('Valid email is required'),
//     body('amount')
//       .notEmpty()
//       .withMessage('Amount is required')
//       .isFloat({ gt: 0 })
//       .withMessage('Amount must be greater than 0'),
//   ],
//   validateRequest,
//   BankController.initializeTransactionController
// );

// router.get(
//   '/verify-payment/:reference',
//   [
//     param('reference')
//       .notEmpty()
//       .withMessage('Transaction reference is required'),
//   ],
//   validateRequest,
//   BankController.verifyTransactionController
// );

// router.post(
//   '/charge-authorization',
//   [
//     body('authorizationCode')
//       .notEmpty()
//       .withMessage('Authorization code is required'),
//     body('email')
//       .notEmpty()
//       .withMessage('Email is required')
//       .isEmail()
//       .withMessage('Valid email is required'),
//     body('amount')
//       .notEmpty()
//       .withMessage('Amount is required')
//       .isFloat({ gt: 0 })
//       .withMessage('Amount must be greater than 0'),
//     body('reference')
//       .notEmpty()
//       .withMessage('Reference is required'),
//   ],
//   validateRequest,
//   BankController.chargeAuthorizationController
// );

// Customer management
// router.post(
//   '/customer',
//   [
//     body('email')
//       .notEmpty()
//       .withMessage('Email is required')
//       .isEmail()
//       .withMessage('Valid email is required'),
//   ],
//   validateRequest,
//   BankController.handleCustomerController
// );

// Reference generation
// router.get('/generate-reference', BankController.generateReferenceController);

export default router;
