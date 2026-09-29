import express from 'express';
import { calculateSkillGap, getLatestAnalysis } from '../controllers/analysisController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/skill-gap', protect, calculateSkillGap);
router.get('/skill-gap/latest', protect, getLatestAnalysis);
router.post('/recalculate', protect, calculateSkillGap); // alias
router.get('/readiness', protect, getLatestAnalysis); // serves both for now

export default router;
