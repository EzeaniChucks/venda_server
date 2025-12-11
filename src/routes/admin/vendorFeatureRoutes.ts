import { Router } from 'express';
import { body } from 'express-validator';
import { vendorFeatureController } from '../../controllers/admin/vendorFeatureController';
import { authenticateToken, requireAdmin } from '../../middleware/auth';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.post('/vendor-of-month',
  [
    body('vendorId').notEmpty().isUUID().withMessage('Valid vendor ID is required'),
    body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
    body('year').isInt({ min: 2000 }).withMessage('Valid year is required'),
    body('recognition_reason').optional().isString(),
    body('totalSales').isNumeric().withMessage('Total sales is required'),
    body('totalOrders').isInt().withMessage('Total orders is required'),
    body('rating').optional().isFloat({ min: 0, max: 5 }),
    body('certificateUrl').optional().isString(),
    body('adCreditAmount').optional().isNumeric()
  ],
  vendorFeatureController.createVendorOfTheMonth
);

router.get('/vendor-of-month', vendorFeatureController.getAllVendorsOfMonth);

router.get('/vendor-of-month/:id', vendorFeatureController.getVendorOfTheMonthById);

router.put('/vendor-of-month/:id',
  [
    body('recognition_reason').optional().isString(),
    body('totalSales').optional().isNumeric(),
    body('totalOrders').optional().isInt(),
    body('rating').optional().isFloat({ min: 0, max: 5 }),
    body('certificateUrl').optional().isString(),
    body('adCreditAmount').optional().isNumeric(),
    body('featuredOnHomepage').optional().isBoolean()
  ],
  vendorFeatureController.updateVendorOfTheMonth
);

router.delete('/vendor-of-month/:id', vendorFeatureController.deleteVendorOfTheMonth);

router.post('/collaborations',
  [
    body('vendor1Id').notEmpty().isUUID().withMessage('Vendor 1 ID is required'),
    body('vendor2Id').notEmpty().isUUID().withMessage('Vendor 2 ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('productIds').optional().isArray(),
    body('bannerImage').optional().isString(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601()
  ],
  vendorFeatureController.createCollaboration
);

router.get('/collaborations', vendorFeatureController.getAllCollaborations);

router.get('/collaborations/:id', vendorFeatureController.getCollaborationById);

router.put('/collaborations/:id',
  [
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('status').optional().isIn(['proposed', 'accepted', 'active', 'completed', 'rejected']),
    body('productIds').optional().isArray(),
    body('bannerImage').optional().isString(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('isFeatured').optional().isBoolean()
  ],
  vendorFeatureController.updateCollaboration
);

router.delete('/collaborations/:id', vendorFeatureController.deleteCollaboration);

router.post('/influencer-picks',
  [
    body('influencerName').notEmpty().withMessage('Influencer name is required'),
    body('productId').notEmpty().isUUID().withMessage('Product ID is required'),
    body('description').optional().isString(),
    body('imageUrl').optional().isString()
  ],
  vendorFeatureController.createInfluencerPick
);

router.get('/influencer-picks', vendorFeatureController.getAllInfluencerPicks);

router.get('/influencer-picks/:id', vendorFeatureController.getInfluencerPickById);

router.put('/influencer-picks/:id',
  [
    body('influencerName').optional().notEmpty(),
    body('productId').optional().isUUID(),
    body('description').optional().isString(),
    body('imageUrl').optional().isString(),
    body('isFeatured').optional().isBoolean()
  ],
  vendorFeatureController.updateInfluencerPick
);

router.delete('/influencer-picks/:id', vendorFeatureController.deleteInfluencerPick);

export default router;
