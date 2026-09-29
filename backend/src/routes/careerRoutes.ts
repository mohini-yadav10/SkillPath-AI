import express from 'express';
import { getCompanies, getRoles, setTargetCareer, getTargetCareer } from '../controllers/careerController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/companies', protect, getCompanies);
router.get('/roles', protect, getRoles);
router.post('/target', protect, setTargetCareer);
router.get('/target', protect, getTargetCareer);

export default router;
