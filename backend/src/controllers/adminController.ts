import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import StudentProfile from '../models/StudentProfile';
import SkillGapAnalysis from '../models/SkillGapAnalysis';

// @desc    Get aggregate university stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getUniversityStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const totalAlumni = await User.countDocuments({ role: 'ALUMNI' });

    // Calculate average readiness
    const profiles = await StudentProfile.find({});
    const totalScore = profiles.reduce((sum, p) => sum + (p.careerReadinessScore || 0), 0);
    const avgReadiness = profiles.length > 0 ? Math.round(totalScore / profiles.length) : 0;

    // Aggregate critical gaps across all students
    const allAnalyses = await SkillGapAnalysis.find({});
    const gapCounts: Record<string, number> = {};

    allAnalyses.forEach(analysis => {
      analysis.gaps.forEach(gap => {
        if (gap.classification === 'CRITICAL' || gap.classification === 'MAJOR') {
          gapCounts[gap.skillName] = (gapCounts[gap.skillName] || 0) + 1;
        }
      });
    });

    const topGaps = Object.entries(gapCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalAlumni,
        avgReadiness,
        topGaps
      }
    });
  } catch (error) {
    next(error);
  }
};
