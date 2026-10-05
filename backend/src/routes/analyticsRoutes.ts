import express from 'express';
import { getAnalyticsOverview } from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/overview', getAnalyticsOverview);

export default router;
