import express from 'express';
import {
  uploadDocument,
  uploadDocumentMiddleware,
  getDocuments,
  deleteDocument,
  chatWithMentor,
  getChatHistory,
  clearChatHistory
} from '../controllers/mentorController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Document Indexing (RAG)
router.post('/documents', protect, uploadDocumentMiddleware.single('document'), uploadDocument);
router.get('/documents', protect, getDocuments);
router.delete('/documents/:id', protect, deleteDocument);

// AI Career Mentor Chat
router.post('/chat', protect, chatWithMentor);
router.get('/history', protect, getChatHistory);
router.delete('/history', protect, clearChatHistory);

export default router;
