"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const walletController_1 = __importDefault(require("../../controllers/customer/walletController"));
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('customer'));
router.get('/', walletController_1.default.getWallet);
router.get('/transactions', walletController_1.default.getTransactions);
router.post('/fund', [
    (0, express_validator_1.body)('amount').isFloat({ min: 100 }),
    (0, express_validator_1.body)('method').trim().notEmpty()
], walletController_1.default.fundWallet);
router.post('/withdraw', [
    (0, express_validator_1.body)('amount').isFloat({ min: 100 }),
    (0, express_validator_1.body)('recipient').trim().notEmpty(),
    (0, express_validator_1.body)('account_number').trim().notEmpty(),
    (0, express_validator_1.body)('bank_name').trim().notEmpty()
], walletController_1.default.withdraw);
exports.default = router;
//# sourceMappingURL=walletRoutes.js.map