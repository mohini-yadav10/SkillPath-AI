import { Request, Response, NextFunction } from 'express';
import StudentProfile from '../models/StudentProfile';
import SkillGapAnalysis from '../models/SkillGapAnalysis';
import LearningPath from '../models/LearningPath';
import { getMLPrediction } from '../services/mlService';
import { ErrorResponse } from '../utils/errorResponse';

export const generatePath = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await StudentProfile.findOne({ userId });

    if (!profile || !profile.targetRole) {
      return next(new ErrorResponse('Please set a target role before generating a learning path.', 400));
    }

    const latestAnalysis = await SkillGapAnalysis.findOne({ studentId: profile._id }).sort({ createdAt: -1 });
    
    if (!latestAnalysis) {
      return next(new ErrorResponse('Please analyze your skill gap first.', 400));
    }

    // Call ML service to prioritize gaps
    const payload = { gaps: latestAnalysis.gaps };
    let recommendations = [];
    
    try {
      const mlRes = await getMLPrediction('/recommend/next-skill', payload);
      recommendations = mlRes ? mlRes.recommendations : [];
    } catch (e) {
      // Fallback if ML service fails entirely
      recommendations = latestAnalysis.gaps.sort((a, b) => b.gapSize - a.gapSize);
    }

    if (recommendations.length === 0) {
      return res.status(200).json({ success: true, message: "No skill gaps found! You are fully ready." });
    }

    const items = [];
    let order = 1;

    for (const rec of recommendations) {
      // For each skill, ask ML for resources or fallback
      let resources = [];
      try {
        const resPayload = { skill_name: rec.skill_name || (rec as any).skillName, current_proficiency: 0 }; // simplified
        const r = await getMLPrediction('/recommend/resources', resPayload);
        resources = r ? r.resources : [];
      } catch (e) {
        resources = [];
      }

      // If no resources from ML, create a placeholder
      if (resources.length === 0) {
        resources.push({
          title: `Master ${rec.skill_name || (rec as any).skillName}`,
          url: `https://example.com/search?q=${rec.skill_name || (rec as any).skillName}`,
          type: "COURSE"
        });
      }

      // Just grab the first recommended resource per skill for the path timeline
      items.push({
        skillId: rec.skill_id || (rec as any).skillId,
        skillName: rec.skill_name || (rec as any).skillName,
        title: resources[0].title,
        type: resources[0].type,
        url: resources[0].url,
        status: 'PENDING' as 'PENDING',
        order: order++
      });
    }

    // Remove old active path
    await LearningPath.deleteMany({ studentId: profile._id });

    const newPath = await LearningPath.create({
      studentId: profile._id,
      targetRoleId: profile.targetRole,
      items,
      progress: 0
    });

    res.status(201).json({ success: true, data: newPath });
  } catch (error) {
    next(error);
  }
};

export const getPath = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await StudentProfile.findOne({ userId });

    if (!profile) {
      return res.status(200).json({ success: true, data: null });
    }

    const path = await LearningPath.findOne({ studentId: profile._id }).sort({ createdAt: -1 });

    // If the path belongs to an old target role, do not return it
    if (path && profile.targetRole && path.targetRoleId.toString() !== profile.targetRole.toString()) {
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({ success: true, data: path });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const itemId = req.params.id;
    const userId = (req as any).user.id;
    
    const profile = await StudentProfile.findOne({ userId });
    const path = await LearningPath.findOne({ studentId: profile?._id });

    if (!path) {
      return next(new ErrorResponse('Learning path not found', 404));
    }

    const item = (path.items as any).id(itemId);
    if (!item) {
      return next(new ErrorResponse('Path item not found', 404));
    }

    item.status = status;
    
    // Recalculate progress
    const completed = path.items.filter(i => i.status === 'COMPLETED').length;
    path.progress = Math.round((completed / path.items.length) * 100);

    await path.save();

    res.status(200).json({ success: true, data: path });
  } catch (error) {
    next(error);
  }
};
