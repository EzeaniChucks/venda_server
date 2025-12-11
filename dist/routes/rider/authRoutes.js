"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authController_1 = __importDefault(require("../../controllers/rider/authController"));
const auth_1 = require("../../middleware/auth");
const authController_2 = __importDefault(require("../../controllers/shared/authController"));
const router = express_1.default.Router();
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('fullName').notEmpty().withMessage('Full name is required'),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
    (0, express_validator_1.body)('vehicleType').optional().notEmpty().withMessage('Vehicle type is required if provided'),
    (0, express_validator_1.body)('vehicleNumber').optional().notEmpty().withMessage('Vehicle number is required if provided')
], authController_1.default.register);
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
], authController_1.default.login);
router.get('/profile', auth_1.authenticate, authController_2.default.getProfile);
router.put('/profile', auth_1.authenticate, authController_2.default.updateProfile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map