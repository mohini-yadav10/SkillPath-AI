import express from 'express';
import { upload, analyzeResume } from '../controllers/resumeController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/upload', protect, upload.single('resume'), analyzeResume);

export default router;
