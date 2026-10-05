import express from 'express';
import { setupInterview, submitAnswer, completeInterview, getHistory, getAttemptResult } from '../controllers/interviewController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/setup', setupInterview);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeInterview);
router.get('/history', getHistory);
router.get('/:id', getAttemptResult);

export default router;
