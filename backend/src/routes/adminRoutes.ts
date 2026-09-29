import express from 'express';
import { getUniversityStats } from '../controllers/adminController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/stats', getUniversityStats);

export default router;
