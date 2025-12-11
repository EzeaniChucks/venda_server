import express from 'express';
import { body } from 'express-validator';
import riderController from '../../controllers/rider/riderController';
import deliveryRejectionController from '../../controllers/rider/deliveryRejectionController';
import * as locationController from '../../controllers/rider/locationController';
import { authenticate, authorize } from '../../middleware/auth';
import { requireVerifiedDocuments } from '../../middleware/riderVerification';

const router = express.Router();

router.use(authenticate);
router.use(authorize('rider'));

// Delivery-related endpoints require verified documents
router.get('/deliveries/available', requireVerifiedDocuments, riderController.getAvailableDeliveries);
router.get('/deliveries', requireVerifiedDocuments, riderController.getRiderDeliveries);
router.post('/deliveries/accept',
  requireVerifiedDocuments,
  [body('order_id').isUUID()],
  riderController.acceptDelivery
);
router.put('/deliveries/:id/status',
  requireVerifiedDocuments,
  [body('status').isIn(['out_for_delivery', 'delivered'])],
  riderController.updateDeliveryStatus
);

// Delivery rejection endpoints
router.post('/deliveries/:id/reject',
  requireVerifiedDocuments,
  [body('reason').notEmpty().withMessage('Rejection reason is required')],
  deliveryRejectionController.rejectDelivery
);
router.get('/deliveries/rejections', requireVerifiedDocuments, deliveryRejectionController.getRejections);
router.get('/deliveries/available-riders', requireVerifiedDocuments, deliveryRejectionController.getAvailableRiders);

// Location endpoints - auto-updating during active deliveries
router.get('/location', locationController.getLocation);
router.put('/location',
  requireVerifiedDocuments,
  [
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
    body('accuracy').optional().isFloat({ min: 0 }),
    body('speed').optional().isFloat({ min: 0 }),
    body('heading').optional().isFloat({ min: 0, max: 360 })
  ],
  locationController.updateLocation
);
router.put('/availability',
  requireVerifiedDocuments,
  [body('is_available').isBoolean()],
  riderController.updateAvailability
);
router.get('/earnings', requireVerifiedDocuments, riderController.getEarnings);

export default router;
