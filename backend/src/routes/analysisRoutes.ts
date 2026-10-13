import express from 'express';
import { 
  calculateSkillGap, 
  getLatestAnalysis, 
  getSkillGraph, 
  getCareerTwin 
} from '../controllers/analysisController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/skill-gap', protect, calculateSkillGap);
router.get('/skill-gap/latest', protect, getLatestAnalysis);
router.post('/recalculate', protect, calculateSkillGap);
router.get('/readiness', protect, getLatestAnalysis);

// Phase B: Skill Graph & Career Twin
router.get('/skill-graph', protect, getSkillGraph);
router.get('/career-twin', protect, getCareerTwin);

export default router;
