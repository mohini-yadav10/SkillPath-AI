import express from 'express';
import { getPredictions, getRecommendations } from '../controllers/mlController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/predictions', protect, getPredictions);
router.post('/recommendations', protect, getRecommendations);

export default router;
