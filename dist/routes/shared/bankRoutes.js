"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateRequest_1 = require("../../middleware/validateRequest");
const express_validator_1 = require("express-validator");
const bankController_1 = require("../../controllers/shared/bankController");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
router.get("/banks", bankController_1.BankController.getBanksController);
router.use(auth_1.authenticate);
router.post("/verify-bank-account", [
    (0, express_validator_1.body)("accountNumber")
        .notEmpty()
        .withMessage("Account number is required")
        .isLength({ min: 10, max: 10 })
        .withMessage("Account number must be 10 digits")
        .matches(/^\d+$/)
        .withMessage("Account number must contain only numbers"),
    (0, express_validator_1.body)("bankCode").notEmpty().withMessage("Bank code is required"),
], validateRequest_1.validateRequest, bankController_1.BankController.verifyBankAccountController);
exports.default = router;
//# sourceMappingURL=bankRoutes.js.map