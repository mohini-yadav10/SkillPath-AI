import express from 'express';
import { getAlumni, sendRequest, getRequests, respondToRequest } from '../controllers/mentorshipController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/alumni', getAlumni);
router.post('/request', sendRequest);
router.get('/requests', getRequests);
router.put('/request/:id', respondToRequest);

export default router;
