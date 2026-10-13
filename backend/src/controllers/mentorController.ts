import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import StudentDocument, { IDocumentChunk } from '../models/StudentDocument';
import MentorMessage from '../models/MentorMessage';
import StudentProfile from '../models/StudentProfile';
import SkillGapAnalysis from '../models/SkillGapAnalysis';
import LearningPath from '../models/LearningPath';
import { ErrorResponse } from '../utils/errorResponse';

const pdfParse = require('pdf-parse');

// Configure Multer for memory upload
const storage = multer.memoryStorage();
export const uploadDocumentMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or TXT files are supported for AI indexing.'));
    }
  }
});

// Helper to chunk text with overlap
const chunkText = (text: string, chunkSize = 450, overlap = 80): IDocumentChunk[] => {
  const clean = text.replace(/\s+/g, ' ').trim();
  const chunks: IDocumentChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    const chunkContent = clean.slice(start, end).trim();

    // Extract basic keywords (words > 4 chars, filtered)
    const words = chunkContent.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const stopWords = new Set(['about', 'their', 'which', 'there', 'would', 'these', 'could', 'other', 'after', 'first']);
    const keywords = Array.from(new Set(words.filter(w => !stopWords.has(w)))).slice(0, 8);

    chunks.push({
      chunkIndex: index++,
      text: chunkContent,
      keywords
    });

    if (end === clean.length) break;
    start += (chunkSize - overlap);
  }

  return chunks;
};

// @desc    Upload & Index Syllabus or Notes Document
// @route   POST /api/mentor/documents
// @access  Private
export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please select a PDF or text file to upload.', 400));
    }

    const userId = (req as any).user.id;
    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text || '';
    } else {
      extractedText = req.file.buffer.toString('utf-8');
    }

    if (!extractedText.trim()) {
      return next(new ErrorResponse('Unable to extract text from the provided document.', 400));
    }

    const chunks = chunkText(extractedText);
    const fileName = req.file.originalname;
    const isSyllabus = fileName.toLowerCase().includes('syllabus') || fileName.toLowerCase().includes('course');
    const fileType = isSyllabus ? 'SYLLABUS' : 'NOTES';

    const summary = extractedText.slice(0, 280).trim() + (extractedText.length > 280 ? '...' : '');

    const document = await StudentDocument.create({
      userId,
      fileName,
      fileSize: req.file.size,
      fileType,
      summary,
      chunks,
      totalChunks: chunks.length
    });

    res.status(201).json({
      success: true,
      message: `Document "${fileName}" successfully parsed and indexed into ${chunks.length} semantic chunks.`,
      data: {
        id: document._id,
        fileName: document.fileName,
        fileType: document.fileType,
        totalChunks: document.totalChunks,
        summary: document.summary
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Indexed Documents
// @route   GET /api/mentor/documents
// @access  Private
export const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const documents = await StudentDocument.find({ userId })
      .select('-chunks')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Indexed Document
// @route   DELETE /api/mentor/documents/:id
// @access  Private
export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const document = await StudentDocument.findOneAndDelete({ _id: req.params.id, userId });

    if (!document) {
      return next(new ErrorResponse('Document not found', 404));
    }

    res.status(200).json({ success: true, message: 'Document removed from knowledge base.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with AI Career Mentor (RAG Engine)
// @route   POST /api/mentor/chat
// @access  Private
export const chatWithMentor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return next(new ErrorResponse('Message prompt cannot be empty.', 400));
    }

    const userId = (req as any).user.id;

    // 1. Fetch Student Context (Career Twin, Gaps, Target Role)
    const profile = await StudentProfile.findOne({ userId })
      .populate('targetRole targetCompany skills.skillId');

    const latestAnalysis = await SkillGapAnalysis.findOne({ studentId: profile?._id })
      .sort({ createdAt: -1 });

    const activePath = await LearningPath.findOne({ studentId: profile?._id, status: 'ACTIVE' });

    // 2. Fetch Relevant Chunks from Indexed Documents (RAG retrieval)
    const userDocs = await StudentDocument.find({ userId });
    const queryTokens = message.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);

    const relevantChunks: { fileName: string; text: string; score: number }[] = [];

    userDocs.forEach(doc => {
      doc.chunks.forEach(chunk => {
        let matchScore = 0;
        const chunkLower = chunk.text.toLowerCase();

        queryTokens.forEach((token: string) => {
          if (chunkLower.includes(token)) matchScore += 2;
          if (chunk.keywords.includes(token)) matchScore += 3;
        });

        if (matchScore > 0) {
          relevantChunks.push({
            fileName: doc.fileName,
            text: chunk.text,
            score: matchScore
          });
        }
      });
    });

    relevantChunks.sort((a, b) => b.score - a.score);
    const topChunks = relevantChunks.slice(0, 3);

    // 3. Synthesize Context Sources
    const contextSources: string[] = ['Career Twin Data Layer'];
    topChunks.forEach(c => {
      if (!contextSources.includes(c.fileName)) contextSources.push(c.fileName);
    });

    // 4. Generate AI Mentor Response
    const targetRoleTitle = (profile?.targetRole as any)?.title || 'Software Engineer';
    const readiness = profile?.careerReadinessScore || latestAnalysis?.readinessScore || 0;
    const highGaps = latestAnalysis?.gaps?.filter(g => g.priority === 'HIGH') || [];
    const topGapName = highGaps[0]?.skillName || 'core frameworks';

    let answer = '';
    const qLower = message.toLowerCase();

    if (qLower.includes('how') && (qLower.includes('start') || qLower.includes('close') || qLower.includes('improve'))) {
      answer = `To accelerate your readiness for **${targetRoleTitle}** (currently at **${readiness}%**), your highest leverage move is tackling **${topGapName}**.\n\n` +
        `Here is your recommended step-by-step strategy:\n` +
        `1. **Focus on Prerequisites First:** Solidify fundamental patterns before advancing to complex state or architecture.\n` +
        `2. **Build a Practical Project:** Employers evaluate verifiable code. Check out your active roadmap item: *${activePath?.items[0]?.title || 'Practice Real-world Projects'}*.\n` +
        `3. **Validate Mastery:** Once you finish the learning modules, take the adaptive assessment to verify your score.`;
    } else if (qLower.includes('project') || qLower.includes('portfolio') || qLower.includes('build')) {
      answer = `Based on your digital Career Twin profile, building a full-stack portfolio piece addressing your **${topGapName}** gap will have the highest hiring impact.\n\n` +
        `💡 **Recommended Project Idea: Enterprise Task & Collaboration Engine**\n` +
        `- **Stack:** React, Node.js/Express, MongoDB, WebSockets.\n` +
        `- **Key Features:** Real-time updates, JWT role-based auth, paginated database queries.\n` +
        `- **Twin Impact:** Expected to raise Practical Application score by **+15 points** and demonstrate senior engineering initiative.`;
    } else if (topChunks.length > 0) {
      // Document retrieval answered
      const snippet = topChunks[0].text.slice(0, 220);
      answer = `According to your uploaded document (**${topChunks[0].fileName}**):\n\n` +
        `> "${snippet}..."\n\n` +
        `Connecting this to your career goals for **${targetRoleTitle}**: integrating these syllabus concepts with practical code exercises will help close your current **${topGapName}** gap. Would you like a practice quiz drill on this topic?`;
    } else {
      answer = `Great question! Looking at your Career Twin (Market Readiness: **${readiness}%**, Target Role: **${targetRoleTitle}**):\n\n` +
        `You currently have strong foundations, but closing your gaps in **${highGaps.map(g => g.skillName).join(', ') || 'key engineering tools'}** will boost your interview readiness significantly.\n\n` +
        `I recommend working through the interactive learning path or taking an adaptive assessment to pinpoint exact micro-competencies. What specific concept would you like to review?`;
    }

    // 5. Save Messages in History
    await MentorMessage.create({
      userId,
      role: 'USER',
      content: message
    });

    const assistantMsg = await MentorMessage.create({
      userId,
      role: 'ASSISTANT',
      content: answer,
      contextSources
    });

    res.status(200).json({
      success: true,
      data: {
        id: assistantMsg._id,
        role: 'ASSISTANT',
        content: answer,
        contextSources,
        createdAt: assistantMsg.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Chat History
// @route   GET /api/mentor/history
// @access  Private
export const getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const history = await MentorMessage.find({ userId })
      .sort({ createdAt: 1 })
      .limit(50);

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear Chat History
// @route   DELETE /api/mentor/history
// @access  Private
export const clearChatHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    await MentorMessage.deleteMany({ userId });

    res.status(200).json({ success: true, message: 'Chat history cleared.' });
  } catch (error) {
    next(error);
  }
};
