import express from 'express';
import {
  setupInterview,
  submitAnswer,
  completeInterview,
  getHistory,
  getAttemptResult,
  getCompaniesAndRoles,
  searchQuestionLibrary,
  registerSource,
  getSources,
  testSourceRetrieval,
  dryRunIngestion,
  importQuestions,
  reviewQuestion
} from '../controllers/interviewController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

// Metadata & Question Library Search
router.get('/meta/companies-roles', getCompaniesAndRoles);
router.get('/library/search', searchQuestionLibrary);

// Source Registry & Ingestion Endpoints (Admin controls)
router.post('/sources', authorize('ADMIN'), registerSource);
router.get('/sources', getSources);
router.post('/sources/test-retrieval', authorize('ADMIN'), testSourceRetrieval);
router.post('/ingest/dry-run', authorize('ADMIN'), dryRunIngestion);
router.post('/ingest/import', authorize('ADMIN'), importQuestions);
router.patch('/library/:id/review', authorize('ADMIN'), reviewQuestion);

// Interview Lifecycle Endpoints
router.post('/setup', setupInterview);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeInterview);
router.get('/history', getHistory);
router.get('/:id', getAttemptResult);

export default router;
