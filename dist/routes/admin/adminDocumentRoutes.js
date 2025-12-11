"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const adminDocumentController_1 = __importDefault(require("../../controllers/admin/adminDocumentController"));
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('admin'));
router.get('/stats', adminDocumentController_1.default.getDocumentStats);
router.get('/pending', adminDocumentController_1.default.getPendingDocuments);
router.get('/', adminDocumentController_1.default.getAllDocuments);
router.get('/:riderId', adminDocumentController_1.default.getRiderDocuments);
router.put('/:riderId/review', [
    (0, express_validator_1.body)('status')
        .isIn(['approved', 'rejected', 'changes_requested'])
        .withMessage('Status must be: approved, rejected, or changes_requested'),
    (0, express_validator_1.body)('adminNotes')
        .optional()
        .isString()
        .withMessage('Admin notes must be a string')
], adminDocumentController_1.default.reviewDocuments);
exports.default = router;
//# sourceMappingURL=adminDocumentRoutes.js.map