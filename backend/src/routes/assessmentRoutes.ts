import express from 'express';
import { getAvailableAssessments, startAssessment, submitAnswer, getAssessmentResult, getHistory } from '../controllers/assessmentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getAvailableAssessments);
router.post('/start', protect, startAssessment);
router.post('/:id/submit', protect, submitAnswer);
router.get('/:id/result', protect, getAssessmentResult);
router.get('/history', protect, getHistory);

export default router;
