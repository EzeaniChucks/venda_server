import express from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import riderDocumentController from '../../controllers/rider/riderDocumentController';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

// Configure multer for file uploads (memory storage for Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Accept only images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

/**
 * Submit or resubmit verification documents
 * POST /api/rider/documents/submit
 */
router.post('/submit',
  upload.fields([
    { name: 'driversLicense', maxCount: 1 },
    { name: 'vehiclePhoto', maxCount: 1 },
    { name: 'nationalId', maxCount: 1 }
  ]),
  [
    body('driversLicenseNumber').notEmpty().withMessage("Driver's license number is required"),
    body('driversLicenseExpiry').isDate().withMessage('Valid expiry date is required'),
    body('vehicleType').isIn(['bike', 'bicycle', 'car', 'motorcycle']).withMessage('Invalid vehicle type'),
    body('vehicleRegistration').notEmpty().withMessage('Vehicle registration is required'),
    body('nationalIdNumber').notEmpty().withMessage('National ID number is required')
  ],
  riderDocumentController.submitDocuments
);

/**
 * Get document submission status
 * GET /api/rider/documents/status
 */
router.get('/status', riderDocumentController.getDocumentStatus);

/**
 * Get rider's own documents (full details)
 * GET /api/rider/documents
 */
router.get('/', riderDocumentController.getDocuments);

export default router;
