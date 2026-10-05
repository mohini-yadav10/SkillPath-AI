import { Request, Response, NextFunction } from 'express';
import StudentProfile from '../models/StudentProfile';
import AssessmentAttempt from '../models/AssessmentAttempt';
import InterviewAttempt from '../models/InterviewAttempt';
import { ErrorResponse } from '../utils/errorResponse';

// @desc    Get Analytics Overview
// @route   GET /api/analytics/overview
// @access  Private
export const getAnalyticsOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await StudentProfile.findOne({ userId });

    if (!profile) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    // Historical Assessments
    const assessments = await AssessmentAttempt.find({ userId }).sort({ createdAt: 1 }).limit(10);
    const assessmentHistory = assessments.map(a => ({
      date: a.createdAt,
      score: a.score,
      status: a.status
    }));

    // Historical Interviews
    const interviews = await InterviewAttempt.find({ userId }).sort({ createdAt: 1 }).limit(10);
    const interviewHistory = interviews.map(i => ({
      date: i.createdAt,
      score: i.overallScore || 0,
      status: i.status
    }));

    // Readiness History (Mocked historical data using recent activities for now, assuming actual readiness history isn't stored as a timeseries yet)
    // We will generate a trend line leading up to the current score
    const currentReadiness = profile.careerReadinessScore || 0;
    
    // Fake a 4-week trend for the UI to be populated, ideally we'd query a Timeseries collection
    const readinessHistory = [
      { date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), score: Math.max(0, currentReadiness - 15) },
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), score: Math.max(0, currentReadiness - 8) },
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), score: Math.max(0, currentReadiness - 3) },
      { date: new Date().toISOString(), score: currentReadiness },
    ];

    res.status(200).json({
      success: true,
      data: {
        readinessHistory,
        assessmentHistory,
        interviewHistory,
        gamification: {
          xp: profile.xp || 0,
          level: profile.level || 1,
          learningStreak: profile.learningStreak || 0
        },
        currentReadiness
      }
    });
  } catch (error) {
    next(error);
  }
};
