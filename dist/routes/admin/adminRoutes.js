"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const adminController_1 = __importDefault(require("../../controllers/admin/adminController"));
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('admin'));
router.get('/users', adminController_1.default.getUsers);
router.put('/users/:id/status', [
    (0, express_validator_1.body)('is_active').isBoolean(),
    (0, express_validator_1.body)('role').isIn(['customer', 'vendor', 'rider'])
], adminController_1.default.updateUserStatus);
router.get('/products', adminController_1.default.getProductsForApproval);
router.put('/products/:id/approval', [(0, express_validator_1.body)('is_approved').isBoolean()], adminController_1.default.updateProductApproval);
router.put('/vendors/:id/approval', [(0, express_validator_1.body)('is_approved').isBoolean()], adminController_1.default.approveVendor);
router.put('/riders/:id/approval', [(0, express_validator_1.body)('is_approved').isBoolean()], adminController_1.default.approveRider);
router.get('/analytics', adminController_1.default.getAnalytics);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map