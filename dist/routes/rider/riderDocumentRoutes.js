"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const express_validator_1 = require("express-validator");
const riderDocumentController_1 = __importDefault(require("../../controllers/rider/riderDocumentController"));
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only image and PDF files are allowed'));
        }
    }
});
router.use(auth_1.authenticate);
router.post('/submit', upload.fields([
    { name: 'driversLicense', maxCount: 1 },
    { name: 'vehiclePhoto', maxCount: 1 },
    { name: 'nationalId', maxCount: 1 }
]), [
    (0, express_validator_1.body)('driversLicenseNumber').notEmpty().withMessage("Driver's license number is required"),
    (0, express_validator_1.body)('driversLicenseExpiry').isDate().withMessage('Valid expiry date is required'),
    (0, express_validator_1.body)('vehicleType').isIn(['bike', 'bicycle', 'car', 'motorcycle']).withMessage('Invalid vehicle type'),
    (0, express_validator_1.body)('vehicleRegistration').notEmpty().withMessage('Vehicle registration is required'),
    (0, express_validator_1.body)('nationalIdNumber').notEmpty().withMessage('National ID number is required')
], riderDocumentController_1.default.submitDocuments);
router.get('/status', riderDocumentController_1.default.getDocumentStatus);
router.get('/', riderDocumentController_1.default.getDocuments);
exports.default = router;
//# sourceMappingURL=riderDocumentRoutes.js.map