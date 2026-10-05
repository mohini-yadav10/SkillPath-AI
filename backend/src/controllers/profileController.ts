import { Request, Response, NextFunction } from 'express';
import StudentProfile from '../models/StudentProfile';
import Skill from '../models/Skill';
import { ErrorResponse } from '../utils/errorResponse';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    let profile = await StudentProfile.findOne({ userId })
      .populate('skills.skillId')
      .populate('targetRole')
      .populate('targetCompany');

    if (!profile) {
      profile = await StudentProfile.create({ userId, skills: [] });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const getAllSkills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skills = await Skill.find();
    res.status(200).json({ success: true, data: skills });
  } catch (error) {
    next(error);
  }
};

export const addSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { skillId, proficiency, confidenceScore, source } = req.body;

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = await StudentProfile.create({ userId, skills: [] });
    }

    // Check if skill exists
    const skillIndex = profile.skills.findIndex(s => s.skillId.toString() === skillId);
    if (skillIndex > -1) {
      profile.skills[skillIndex].proficiency = proficiency;
      profile.skills[skillIndex].confidenceScore = confidenceScore || profile.skills[skillIndex].confidenceScore;
    } else {
      profile.skills.push({ skillId, proficiency, confidenceScore: confidenceScore || 50, source: source || 'SELF_DECLARED' });
    }

    await profile.save();
    
    // repopulate
    profile = await StudentProfile.findById(profile._id).populate('skills.skillId');

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
