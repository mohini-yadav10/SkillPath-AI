import { Request, Response, NextFunction } from 'express';
import StudentProfile from '../models/StudentProfile';
import { getMLPrediction } from '../services/mlService';
import { ErrorResponse } from '../utils/errorResponse';

export const getPredictions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await StudentProfile.findOne({ userId }).populate('skills.skillId');

    if (!profile) {
      return next(new ErrorResponse('Profile not found', 404));
    }

    // Prepare mastery predictions for all technical skills
    const masteryPredictions = [];
    for (const s of profile.skills) {
      if ((s.skillId as any).category === 'TECHNICAL') {
        const payload = {
          current_proficiency: s.proficiency,
          previous_attempts: 1,
          learning_time_mins: 120,
          consistency_score: 0.8
        };
        const mlRes = await getMLPrediction('/predict/mastery', payload);
        
        if (mlRes) {
          masteryPredictions.push({
            skill: (s.skillId as any).name,
            probability: mlRes.probability,
            model: mlRes.model_used
          });
        }
      }
    }

    res.status(200).json({ success: true, data: { masteryPredictions } });
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gaps } = req.body; // array of gap objects
    
    if (!gaps || gaps.length === 0) {
      return res.status(200).json({ success: true, data: { recommendations: [] } });
    }

    const payload = { gaps };
    const mlRes = await getMLPrediction('/recommend/next-skill', payload);

    if (mlRes) {
      return res.status(200).json({ success: true, data: mlRes });
    }

    // Basic rule-based fallback
    const fallbackRecs = gaps.map((g: any) => ({
      skill_id: g.skillId,
      skill_name: g.skillName,
      priority_score: g.gapSize * 1.5,
      reason: `Rule fallback: ${g.gapSize}% gap in required skill.`
    })).sort((a: any, b: any) => b.priority_score - a.priority_score);

    res.status(200).json({ success: true, data: { recommendations: fallbackRecs } });
  } catch (error) {
    next(error);
  }
};
