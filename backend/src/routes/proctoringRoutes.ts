import express from 'express';
import { logProctoringEvent, updateProctoringStatus, getProctoringReviews, reviewProctoredAssessment, handleHeartbeat } from '../controllers/proctoringController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/:id/event', protect, logProctoringEvent);
router.patch('/:id/status', protect, updateProctoringStatus);
router.post('/:id/heartbeat', protect, handleHeartbeat);

// Admin routes
router.get('/admin', protect, authorize('ADMIN'), getProctoringReviews);
router.patch('/admin/:id/review', protect, authorize('ADMIN'), reviewProctoredAssessment);

export default router;
