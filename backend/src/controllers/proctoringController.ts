import { Request, Response, NextFunction } from 'express';
import AssessmentAttempt from '../models/AssessmentAttempt';
import { ErrorResponse } from '../utils/errorResponse';
import StudentProfile from '../models/StudentProfile';
import LearningPath from '../models/LearningPath';

// @desc    Log a proctoring event
// @route   POST /api/proctoring/:id/event
// @access  Private
export const logProctoringEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventType, severity, confidence, description } = req.body;
    
    const attempt = await AssessmentAttempt.findById(req.params.id);
    if (!attempt) return next(new ErrorResponse('Attempt not found', 404));

    // Ensure proctoring object exists
    if (!attempt.proctoring) {
      attempt.proctoring = { status: 'ACTIVE', events: [], reviewStatus: 'PENDING' };
    }

    attempt.proctoring.events.push({
      eventType,
      severity,
      confidence,
      timestamp: new Date(),
      description
    });

    await attempt.save();
    res.status(200).json({ success: true, data: attempt.proctoring });
  } catch (error) {
    next(error);
  }
};

// @desc    Update proctoring status
// @route   PATCH /api/proctoring/:id/status
// @access  Private
export const updateProctoringStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const attempt = await AssessmentAttempt.findById(req.params.id);
    
    if (!attempt) return next(new ErrorResponse('Attempt not found', 404));
    
    if (!attempt.proctoring) {
      attempt.proctoring = { status: 'SETUP', events: [], reviewStatus: 'PENDING' };
    }
    
    attempt.proctoring.status = status;
    
    // Automatically flag for review if there are HIGH_REVIEW events
    if (status === 'AWAITING_REVIEW') {
      const needsReview = attempt.proctoring.events.some(e => e.severity === 'HIGH_REVIEW' || e.severity === 'MEDIUM_REVIEW');
      if (needsReview) {
        attempt.proctoring.reviewStatus = 'PENDING';
      } else {
        attempt.proctoring.reviewStatus = 'APPROVED'; // Auto approve if clean
      }
    }

    await attempt.save();
    res.status(200).json({ success: true, data: attempt.proctoring });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attempts awaiting review (Admin)
// @route   GET /api/proctoring/admin
// @access  Private (Admin only)
export const getProctoringReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attempts = await AssessmentAttempt.find({ 
      isProctored: true,
    }).populate('studentId').populate('skillId').sort('-createdAt');
    
    res.status(200).json({ success: true, data: attempts });
  } catch (error) {
    next(error);
  }
};

// @desc    Review a proctored assessment (Admin)
// @route   PATCH /api/proctoring/admin/:id/review
// @access  Private (Admin only)
export const reviewProctoredAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewStatus, reviewerNotes } = req.body;
    const attempt = await AssessmentAttempt.findById(req.params.id);
    
    if (!attempt) return next(new ErrorResponse('Attempt not found', 404));
    if (!attempt.proctoring) return next(new ErrorResponse('Not a proctored attempt', 400));

    attempt.proctoring.reviewStatus = reviewStatus;
    attempt.proctoring.reviewerNotes = reviewerNotes;
    attempt.proctoring.status = 'REVIEWED';

    await attempt.save();
    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
};

// @desc    Heartbeat check
// @route   POST /api/proctoring/:id/heartbeat
// @access  Private
export const handleHeartbeat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attempt = await AssessmentAttempt.findById(req.params.id);
    if (!attempt || !attempt.proctoring) return next(new ErrorResponse('Proctoring not active', 400));

    attempt.proctoring.lastHeartbeat = new Date();
    await attempt.save();

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
