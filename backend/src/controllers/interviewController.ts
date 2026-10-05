import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import InterviewAttempt from '../models/InterviewAttempt';
import InterviewQuestion from '../models/InterviewQuestion';
import StudentProfile from '../models/StudentProfile';
import SkillGapAnalysis from '../models/SkillGapAnalysis';
import Skill from '../models/Skill';
import JobRole from '../models/JobRole';
import RoleSkillRequirement from '../models/RoleSkillRequirement';
import LearningPath from '../models/LearningPath';
import LearningResource from '../models/LearningResource';
import { ErrorResponse } from '../utils/errorResponse';

// @desc    Setup a new interview
// @route   POST /api/interview/setup
// @access  Private
export const setupInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, difficulty, questionCount = 5, company, role } = req.body;
    const userId = (req as any).user.id;

    // Get student profile to find target role if not provided
    const profile = await StudentProfile.findOne({ userId });
    
    // Attempt to focus on weak skills
    let weakSkillIds: any[] = [];
    const analysis = await SkillGapAnalysis.findOne({ studentId: userId }).sort('-createdAt');
    if (analysis) {
      weakSkillIds = analysis.gaps
        .filter(g => g.classification === 'CRITICAL' || g.classification === 'MAJOR')
        .map(g => g.skillId);
    }

    const targetCompany = company || profile?.targetCompany;
    
    // Resolve target role to string and get required skills if needed
    let targetRoleName = role;
    let targetSkillIds: mongoose.Types.ObjectId[] = [];
    
    if (profile?.targetRole) {
      const foundRole = await JobRole.findById(profile.targetRole);
      if (foundRole) {
        if (!targetRoleName) targetRoleName = foundRole.title;
        const requirements = await RoleSkillRequirement.find({ roleId: profile.targetRole });
        targetSkillIds = requirements.map(r => r.skillId as mongoose.Types.ObjectId);
      }
    }

    // Build the base query pipeline enforcing relevance
    let matchQuery: any = {};
    if (type !== 'MIXED') matchQuery.type = type;
    if (difficulty !== 'MIXED') matchQuery.difficulty = difficulty;
    
    // Enforce role relevance OR skill relevance
    if (targetRoleName || targetSkillIds.length > 0) {
      matchQuery.$or = [];
      if (targetRoleName) matchQuery.$or.push({ roles: targetRoleName });
      if (targetSkillIds.length > 0) matchQuery.$or.push({ relatedSkill: { $in: targetSkillIds } });
    }

    let questions = [];
    
    // Pass 1: Strict matching including company, role/skill, and weak skills
    if (targetCompany && weakSkillIds.length > 0) {
      questions = await InterviewQuestion.aggregate([
        { $match: { ...matchQuery, companies: targetCompany, relatedSkill: { $in: weakSkillIds } } },
        { $sample: { size: questionCount } }
      ]);
    }

    // Pass 2: Role/Skill + Weak Skills
    if (questions.length < questionCount && weakSkillIds.length > 0) {
      const remaining = questionCount - questions.length;
      const existingIds = questions.map(q => q._id);
      const pass2 = await InterviewQuestion.aggregate([
        { $match: { ...matchQuery, relatedSkill: { $in: weakSkillIds }, _id: { $nin: existingIds } } },
        { $sample: { size: remaining } }
      ]);
      questions = [...questions, ...pass2];
    }

    // Pass 3: Company + Role/Skill
    if (questions.length < questionCount && targetCompany) {
      const remaining = questionCount - questions.length;
      const existingIds = questions.map(q => q._id);
      const pass3 = await InterviewQuestion.aggregate([
        { $match: { ...matchQuery, companies: targetCompany, _id: { $nin: existingIds } } },
        { $sample: { size: remaining } }
      ]);
      questions = [...questions, ...pass3];
    }

    // Pass 4: Any matching Role/Skill
    if (questions.length < questionCount) {
      const remaining = questionCount - questions.length;
      const existingIds = questions.map(q => q._id);
      const pass4 = await InterviewQuestion.aggregate([
        { $match: { ...matchQuery, _id: { $nin: existingIds } } },
        { $sample: { size: remaining } }
      ]);
      questions = [...questions, ...pass4];
    }

    // Pass 5: Completely random if still empty (as a last resort safety net)
    if (questions.length === 0) {
      questions = await InterviewQuestion.aggregate([{ $sample: { size: questionCount } }]);
    }

    // Format for attempt
    const formattedQuestions = questions.map(q => ({
      questionId: q._id,
      questionText: q.questionText,
      relatedSkill: q.relatedSkill,
      expectedKeywords: q.expectedKeywords,
    }));

    const attempt = await InterviewAttempt.create({
      studentId: userId,
      targetRoleId: profile?.targetRole,
      type,
      difficulty,
      status: 'IN_PROGRESS',
      questions: formattedQuestions
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit single answer
// @route   POST /api/interview/:id/answer
// @access  Private
export const submitAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { questionIndex, studentAnswer, timeSpentSeconds } = req.body;
    const attempt = await InterviewAttempt.findOne({ _id: req.params.id, studentId: (req as any).user.id });

    if (!attempt) return next(new ErrorResponse('Attempt not found', 404));
    if (attempt.status === 'COMPLETED') return next(new ErrorResponse('Interview already completed', 400));

    if (attempt.questions[questionIndex]) {
      attempt.questions[questionIndex].studentAnswer = studentAnswer;
      attempt.questions[questionIndex].timeSpentSeconds = timeSpentSeconds;
      await attempt.save();
    }

    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete and evaluate interview
// @route   POST /api/interview/:id/complete
// @access  Private
export const completeInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attempt = await InterviewAttempt.findOne({ _id: req.params.id, studentId: (req as any).user.id }).populate('questions.relatedSkill');
    if (!attempt) return next(new ErrorResponse('Attempt not found', 404));

    let totalTech = 0, totalComm = 0, totalRel = 0;
    let strengths: string[] = [];
    let weaknesses: any[] = [];
    let weakSkillIdsToUpdate: any[] = [];

    // Evaluate each question
    attempt.questions.forEach((q, i) => {
      const answer = (q.studentAnswer || '').toLowerCase();
      
      // Communication score (length and structure heuristic)
      const words = answer.split(' ').length;
      let commScore = Math.min(100, Math.max(0, (words / 50) * 100));
      if (words < 10) commScore = 20; // Too short
      
      // Technical & Relevance score (keyword matching)
      let techScore = 0;
      let matchedKeywords = 0;
      
      if (q.expectedKeywords && q.expectedKeywords.length > 0) {
        q.expectedKeywords.forEach(kw => {
          if (answer.includes(kw.toLowerCase())) matchedKeywords++;
        });
        techScore = Math.min(100, (matchedKeywords / q.expectedKeywords.length) * 100);
      } else {
        techScore = commScore; // fallback if no keywords
      }

      let relScore = (techScore * 0.7) + (commScore * 0.3);

      q.techScore = Math.round(techScore);
      q.commScore = Math.round(commScore);
      q.relScore = Math.round(relScore);

      totalTech += techScore;
      totalComm += commScore;
      totalRel += relScore;

      // Identify strengths and weaknesses
      const skillName = (q.relatedSkill as any)?.name || 'General';
      if (techScore < 50) {
        q.feedback = `You missed key concepts regarding ${skillName}. Review: ${q.expectedKeywords.join(', ')}`;
        if (q.relatedSkill) {
          weaknesses.push({ skillId: (q.relatedSkill as any)._id, skillName, feedback: q.feedback });
          weakSkillIdsToUpdate.push((q.relatedSkill as any)._id);
        }
      } else if (techScore >= 80) {
        q.feedback = `Excellent answer demonstrating solid understanding of ${skillName}.`;
        if (!strengths.includes(skillName)) strengths.push(skillName);
      }
    });

    const numQ = attempt.questions.length || 1;
    attempt.scores = {
      technical: Math.round(totalTech / numQ),
      communication: Math.round(totalComm / numQ),
      relevance: Math.round(totalRel / numQ),
      overall: Math.round(((totalTech + totalComm + totalRel) / 3) / numQ)
    };

    attempt.strengths = strengths;
    attempt.weaknesses = weaknesses;
    attempt.status = 'COMPLETED';
    await attempt.save();

    // INTEGRATION: Update Student Profile and Learning Path based on weak interview skills
    if (weakSkillIdsToUpdate.length > 0) {
      const profile = await StudentProfile.findOne({ userId: (req as any).user.id });
      if (profile) {
        // Decrease proficiency slightly for failed skills to trigger gap update
        let profileUpdated = false;
        weakSkillIdsToUpdate.forEach(wsId => {
          const skillIndex = profile.skills.findIndex(s => s.skillId.toString() === wsId.toString());
          if (skillIndex !== -1) {
            profile.skills[skillIndex].proficiency = Math.max(0, profile.skills[skillIndex].proficiency - 5);
            profileUpdated = true;
          }
        });
        if (profileUpdated) await profile.save();
      }

      // Add a recommended resource to Learning Path
      const learningPath = await LearningPath.findOne({ studentId: (req as any).user.id });
      if (learningPath) {
        // Fetch a general resource (mock integration)
        const resource = await LearningResource.findOne({ relatedSkills: { $in: weakSkillIdsToUpdate } });
        if (resource) {
          const alreadyExists = learningPath.items.some((c: any) => c.resourceId && c.resourceId.toString() === resource._id.toString());
          if (!alreadyExists) {
            learningPath.items.push({
              skillId: weakSkillIdsToUpdate[0], // simple mapping
              skillName: resource.title, // proxy
              resourceId: resource._id,
              title: resource.title,
              type: resource.type,
              url: resource.url,
              status: 'PENDING',
              order: learningPath.items.length + 1
            } as any);
            await learningPath.save();
          }
        }
      }
    }

    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attempts for user
// @route   GET /api/interview/history
// @access  Private
export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attempts = await InterviewAttempt.find({ studentId: (req as any).user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: attempts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific attempt result
// @route   GET /api/interview/:id
// @access  Private
export const getAttemptResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attempt = await InterviewAttempt.findOne({ _id: req.params.id, studentId: (req as any).user.id })
      .populate('questions.relatedSkill', 'name category')
      .populate('targetRoleId', 'title');
    if (!attempt) return next(new ErrorResponse('Attempt not found', 404));
    
    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
};
