"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const vendorFeatureController_1 = require("../../controllers/admin/vendorFeatureController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken, auth_1.requireAdmin);
router.post('/vendor-of-month', [
    (0, express_validator_1.body)('vendorId').notEmpty().isUUID().withMessage('Valid vendor ID is required'),
    (0, express_validator_1.body)('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
    (0, express_validator_1.body)('year').isInt({ min: 2000 }).withMessage('Valid year is required'),
    (0, express_validator_1.body)('recognition_reason').optional().isString(),
    (0, express_validator_1.body)('totalSales').isNumeric().withMessage('Total sales is required'),
    (0, express_validator_1.body)('totalOrders').isInt().withMessage('Total orders is required'),
    (0, express_validator_1.body)('rating').optional().isFloat({ min: 0, max: 5 }),
    (0, express_validator_1.body)('certificateUrl').optional().isString(),
    (0, express_validator_1.body)('adCreditAmount').optional().isNumeric()
], vendorFeatureController_1.vendorFeatureController.createVendorOfTheMonth);
router.get('/vendor-of-month', vendorFeatureController_1.vendorFeatureController.getAllVendorsOfMonth);
router.get('/vendor-of-month/:id', vendorFeatureController_1.vendorFeatureController.getVendorOfTheMonthById);
router.put('/vendor-of-month/:id', [
    (0, express_validator_1.body)('recognition_reason').optional().isString(),
    (0, express_validator_1.body)('totalSales').optional().isNumeric(),
    (0, express_validator_1.body)('totalOrders').optional().isInt(),
    (0, express_validator_1.body)('rating').optional().isFloat({ min: 0, max: 5 }),
    (0, express_validator_1.body)('certificateUrl').optional().isString(),
    (0, express_validator_1.body)('adCreditAmount').optional().isNumeric(),
    (0, express_validator_1.body)('featuredOnHomepage').optional().isBoolean()
], vendorFeatureController_1.vendorFeatureController.updateVendorOfTheMonth);
router.delete('/vendor-of-month/:id', vendorFeatureController_1.vendorFeatureController.deleteVendorOfTheMonth);
router.post('/collaborations', [
    (0, express_validator_1.body)('vendor1Id').notEmpty().isUUID().withMessage('Vendor 1 ID is required'),
    (0, express_validator_1.body)('vendor2Id').notEmpty().isUUID().withMessage('Vendor 2 ID is required'),
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('productIds').optional().isArray(),
    (0, express_validator_1.body)('bannerImage').optional().isString(),
    (0, express_validator_1.body)('startDate').optional().isISO8601(),
    (0, express_validator_1.body)('endDate').optional().isISO8601()
], vendorFeatureController_1.vendorFeatureController.createCollaboration);
router.get('/collaborations', vendorFeatureController_1.vendorFeatureController.getAllCollaborations);
router.get('/collaborations/:id', vendorFeatureController_1.vendorFeatureController.getCollaborationById);
router.put('/collaborations/:id', [
    (0, express_validator_1.body)('title').optional().notEmpty(),
    (0, express_validator_1.body)('description').optional().notEmpty(),
    (0, express_validator_1.body)('status').optional().isIn(['proposed', 'accepted', 'active', 'completed', 'rejected']),
    (0, express_validator_1.body)('productIds').optional().isArray(),
    (0, express_validator_1.body)('bannerImage').optional().isString(),
    (0, express_validator_1.body)('startDate').optional().isISO8601(),
    (0, express_validator_1.body)('endDate').optional().isISO8601(),
    (0, express_validator_1.body)('isFeatured').optional().isBoolean()
], vendorFeatureController_1.vendorFeatureController.updateCollaboration);
router.delete('/collaborations/:id', vendorFeatureController_1.vendorFeatureController.deleteCollaboration);
router.post('/influencer-picks', [
    (0, express_validator_1.body)('influencerName').notEmpty().withMessage('Influencer name is required'),
    (0, express_validator_1.body)('productId').notEmpty().isUUID().withMessage('Product ID is required'),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('imageUrl').optional().isString()
], vendorFeatureController_1.vendorFeatureController.createInfluencerPick);
router.get('/influencer-picks', vendorFeatureController_1.vendorFeatureController.getAllInfluencerPicks);
router.get('/influencer-picks/:id', vendorFeatureController_1.vendorFeatureController.getInfluencerPickById);
router.put('/influencer-picks/:id', [
    (0, express_validator_1.body)('influencerName').optional().notEmpty(),
    (0, express_validator_1.body)('productId').optional().isUUID(),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('imageUrl').optional().isString(),
    (0, express_validator_1.body)('isFeatured').optional().isBoolean()
], vendorFeatureController_1.vendorFeatureController.updateInfluencerPick);
router.delete('/influencer-picks/:id', vendorFeatureController_1.vendorFeatureController.deleteInfluencerPick);
exports.default = router;
//# sourceMappingURL=vendorFeatureRoutes.js.map