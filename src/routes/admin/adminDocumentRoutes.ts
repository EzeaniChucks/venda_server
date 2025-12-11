import express from 'express';
import { body } from 'express-validator';
import adminDocumentController from '../../controllers/admin/adminDocumentController';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

// All routes require admin authentication AND admin role
router.use(authenticate);
router.use(authorize('admin'));

/**
 * Get document statistics
 * GET /api/admin/documents/stats
 */
router.get('/stats', adminDocumentController.getDocumentStats);

/**
 * Get all pending document submissions
 * GET /api/admin/documents/pending
 */
router.get('/pending', adminDocumentController.getPendingDocuments);

/**
 * Get all document submissions (with filters)
 * GET /api/admin/documents
 */
router.get('/', adminDocumentController.getAllDocuments);

/**
 * Get specific rider's documents
 * GET /api/admin/documents/:riderId
 */
router.get('/:riderId', adminDocumentController.getRiderDocuments);

/**
 * Review rider documents (approve, reject, or request changes)
 * PUT /api/admin/documents/:riderId/review
 */
router.put('/:riderId/review',
  [
    body('status')
      .isIn(['approved', 'rejected', 'changes_requested'])
      .withMessage('Status must be: approved, rejected, or changes_requested'),
    body('adminNotes')
      .optional()
      .isString()
      .withMessage('Admin notes must be a string')
  ],
  adminDocumentController.reviewDocuments
);

export default router;
