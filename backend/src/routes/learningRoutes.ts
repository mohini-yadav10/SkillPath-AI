import express from 'express';
import { generatePath, getPath, updateProgress } from '../controllers/learningController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/generate', protect, generatePath);
router.get('/path', protect, getPath);
router.put('/progress/:id', protect, updateProgress);

export default router;
