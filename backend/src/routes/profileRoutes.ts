import express from 'express';
import { getProfile, getAllSkills, addSkill } from '../controllers/profileController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getProfile);
router.get('/skills', protect, getAllSkills);
router.post('/skills', protect, addSkill);

export default router;
