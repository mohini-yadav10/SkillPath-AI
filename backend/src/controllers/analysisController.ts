import { Request, Response, NextFunction } from 'express';
import StudentProfile from '../models/StudentProfile';
import RoleSkillRequirement from '../models/RoleSkillRequirement';
import SkillGapAnalysis from '../models/SkillGapAnalysis';
import { ErrorResponse } from '../utils/errorResponse';

export const calculateSkillGap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await StudentProfile.findOne({ userId }).populate('skills.skillId');

    if (!profile || !profile.targetRole) {
      return next(new ErrorResponse('Profile or Target Role not found. Please set a target career.', 400));
    }

    // Fetch role requirements
    const requirements = await RoleSkillRequirement.find({ roleId: profile.targetRole }).populate('skillId');

    const gaps = [];
    let matchedSkillsCount = 0;
    let criticalGapsCount = 0;
    let totalScoreNumerator = 0;
    let totalScoreDenominator = 0;

    for (const reqSkill of requirements) {
      const skillName = (reqSkill.skillId as any).name;
      const studentSkill = profile.skills.find(s => s.skillId._id.toString() === reqSkill.skillId._id.toString());
      
      const currentProficiency = studentSkill ? studentSkill.proficiency : 0;
      const requiredProficiency = reqSkill.minimumProficiency;
      const gapSize = Math.max(0, requiredProficiency - currentProficiency);
      
      let classification: 'MASTERED' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL' = 'MASTERED';
      if (gapSize > 50) classification = 'CRITICAL';
      else if (gapSize > 30) classification = 'MAJOR';
      else if (gapSize > 15) classification = 'MODERATE';
      else if (gapSize > 0) classification = 'MINOR';

      if (gapSize === 0) matchedSkillsCount++;
      if (classification === 'CRITICAL' && reqSkill.importance === 'CRITICAL') criticalGapsCount++;

      // Weighting for readiness score
      let weight = 1;
      if (reqSkill.importance === 'CRITICAL') weight = 3;
      else if (reqSkill.importance === 'IMPORTANT') weight = 2;
      else if (reqSkill.importance === 'OPTIONAL') weight = 0.5;

      totalScoreNumerator += (Math.min(currentProficiency, requiredProficiency) / requiredProficiency) * weight;
      totalScoreDenominator += weight;

      gaps.push({
        skillId: reqSkill.skillId._id,
        skillName,
        currentProficiency,
        requiredProficiency,
        gapSize,
        classification,
        importance: reqSkill.importance
      });
    }

    let readinessScore = 0;
    if (totalScoreDenominator > 0) {
      readinessScore = Math.round((totalScoreNumerator / totalScoreDenominator) * 100);
    }

    // Save Analysis
    const analysis = await SkillGapAnalysis.create({
      studentId: profile._id,
      roleId: profile.targetRole,
      readinessScore,
      criticalGapsCount,
      matchedSkillsCount,
      totalRequiredSkills: requirements.length,
      gaps
    });

    profile.careerReadinessScore = readinessScore;
    await profile.save();

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

export const getLatestAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await StudentProfile.findOne({ userId }).populate('targetCompany');

    if (!profile) {
      return res.status(200).json({ success: true, data: null });
    }

    const analysis = await SkillGapAnalysis.findOne({ studentId: profile._id })
      .populate('roleId')
      .sort({ createdAt: -1 }); // Get the latest one

    let analysisObj = analysis ? analysis.toObject() : null;
    if (analysisObj) {
      analysisObj.targetCompany = profile.targetCompany;
    }

    res.status(200).json({ success: true, data: analysisObj });
  } catch (error) {
    next(error);
  }
};
