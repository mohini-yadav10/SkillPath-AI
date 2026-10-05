import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Question from '../models/Question';
import AssessmentAttempt from '../models/AssessmentAttempt';
import StudentProfile from '../models/StudentProfile';
import Skill from '../models/Skill';
import RoleSkillRequirement from '../models/RoleSkillRequirement';
import { ErrorResponse } from '../utils/errorResponse';

const MAX_QUESTIONS_PER_ATTEMPT = 5;

// Fetch available assessments (grouped by skills the user needs or has)
export const getAvailableAssessments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await StudentProfile.findOne({ userId });

    if (!profile) {
      return next(new ErrorResponse('Profile not found', 404));
    }

    // Determine target skills
    let targetSkillIds: mongoose.Types.ObjectId[] = [];
    if (profile.targetRole) {
      const requirements = await RoleSkillRequirement.find({ roleId: profile.targetRole });
      targetSkillIds = requirements.map(r => r.skillId as mongoose.Types.ObjectId);
    }

    // We fetch skills that have questions available
    const skillsWithQuestions = await Question.distinct('skillId');
    
    // Filter to only include skills relevant to the target role (if target is set)
    let relevantSkillIds = skillsWithQuestions;
    if (targetSkillIds.length > 0) {
      relevantSkillIds = skillsWithQuestions.filter(id => 
        targetSkillIds.some(targetId => targetId.toString() === id.toString())
      );
    }

    const availableSkills = await Skill.find({ _id: { $in: relevantSkillIds } });

    res.status(200).json({ success: true, data: availableSkills, hasTarget: !!profile.targetRole });
  } catch (error) {
    next(error);
  }
};

export const startAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { skillId } = req.body;

    const profile = await StudentProfile.findOne({ userId });
    if (!profile) return next(new ErrorResponse('Profile not found', 404));

    // Get a MEDIUM question to start
    const firstQuestion = await Question.findOne({ skillId, difficulty: 'MEDIUM' });
    if (!firstQuestion) {
      return next(new ErrorResponse('No questions available for this skill', 404));
    }

    const attempt = await AssessmentAttempt.create({
      studentId: profile._id,
      skillId,
      questions: [{
        questionId: firstQuestion._id,
        difficulty: 'MEDIUM'
      }]
    });

    res.status(201).json({
      success: true,
      data: {
        attemptId: attempt._id,
        question: {
          _id: firstQuestion._id,
          questionText: firstQuestion.questionText,
          options: firstQuestion.options,
          difficulty: firstQuestion.difficulty,
          topic: firstQuestion.topic,
          timeLimitSeconds: firstQuestion.timeLimitSeconds
        },
        progress: { current: 1, total: MAX_QUESTIONS_PER_ATTEMPT }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const attemptId = req.params.id;
    const { questionId, selectedOptionIndex, timeTakenSeconds } = req.body;

    const profile = await StudentProfile.findOne({ userId });
    const attempt = await AssessmentAttempt.findOne({ _id: attemptId, studentId: profile?._id });

    if (!attempt) return next(new ErrorResponse('Attempt not found', 404));
    if (attempt.isCompleted) return next(new ErrorResponse('Assessment already completed', 400));

    // Find question and evaluate
    const question = await Question.findById(questionId);
    if (!question) return next(new ErrorResponse('Question not found', 404));

    const isCorrect = question.correctOptionIndex === selectedOptionIndex;

    // Update current question entry in attempt
    const qEntry = attempt.questions.find(q => q.questionId.toString() === questionId);
    if (qEntry) {
      qEntry.selectedOptionIndex = selectedOptionIndex;
      qEntry.isCorrect = isCorrect;
      qEntry.timeTakenSeconds = timeTakenSeconds;
    }

    // Adaptive logic for next difficulty
    let nextDifficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM';
    if (isCorrect) {
      if (question.difficulty === 'EASY') nextDifficulty = 'MEDIUM';
      else nextDifficulty = 'HARD';
    } else {
      if (question.difficulty === 'HARD') nextDifficulty = 'MEDIUM';
      else nextDifficulty = 'EASY';
    }

    // Check if test is done
    if (attempt.questions.length >= MAX_QUESTIONS_PER_ATTEMPT) {
      attempt.isCompleted = true;
      attempt.completedAt = new Date();
      
      // Calculate final score
      let correctCount = 0;
      let weightedScore = 0;
      let totalWeight = 0;

      attempt.questions.forEach(q => {
        if (q.isCorrect) correctCount++;
        const weight = q.difficulty === 'HARD' ? 3 : q.difficulty === 'MEDIUM' ? 2 : 1;
        totalWeight += weight;
        if (q.isCorrect) weightedScore += weight;
      });

      attempt.accuracy = Math.round((correctCount / attempt.questions.length) * 100);
      attempt.score = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;
      
      await attempt.save();

      // Update student proficiency
      const skillIndex = profile!.skills.findIndex(s => s.skillId.toString() === attempt.skillId.toString());
      if (skillIndex > -1) {
        profile!.skills[skillIndex].proficiency = attempt.score;
        profile!.skills[skillIndex].source = 'ASSESSMENT';
        profile!.skills[skillIndex].confidenceScore = 90;
      } else {
        profile!.skills.push({
          skillId: attempt.skillId,
          proficiency: attempt.score,
          confidenceScore: 90,
          source: 'ASSESSMENT'
        });
      }
      await profile!.save();

      return res.status(200).json({
        success: true,
        data: { completed: true, attemptId: attempt._id }
      });
    }

    // Fetch next question avoiding duplicates
    const askedQuestionIds = attempt.questions.map(q => q.questionId);
    let nextQuestion = await Question.findOne({
      skillId: attempt.skillId,
      difficulty: nextDifficulty,
      _id: { $nin: askedQuestionIds }
    });

    // Fallback if no question of that difficulty
    if (!nextQuestion) {
      nextQuestion = await Question.findOne({
        skillId: attempt.skillId,
        _id: { $nin: askedQuestionIds }
      });
    }

    if (!nextQuestion) {
      // If bank is exhausted, dynamically create a fallback question to ensure the assessment continues
      nextQuestion = await Question.create({
        skillId: attempt.skillId,
        questionText: `Advanced conceptual question regarding the targeted skill's principles and best practices.`,
        options: [
          'Implementation depends on specific architectural constraints',
          'Always use the default configuration',
          'It is fundamentally impossible',
          'Only applicable in legacy systems'
        ],
        correctOptionIndex: 0,
        difficulty: nextDifficulty,
        explanation: 'In advanced scenarios, architectural constraints dictate the best approach.'
      });
    }

    if (!nextQuestion) {
      // Safety fallback
      attempt.isCompleted = true;
      attempt.completedAt = new Date();
      await attempt.save();
      return res.status(200).json({ success: true, data: { completed: true, attemptId: attempt._id } });
    }

    // Add next question to array safely by casting to any
    (attempt.questions as any).push({
      questionId: nextQuestion._id,
      difficulty: nextQuestion.difficulty
    });
    
    await attempt.save();

    res.status(200).json({
      success: true,
      data: {
        completed: false,
        question: {
          _id: nextQuestion._id,
          questionText: nextQuestion.questionText,
          options: nextQuestion.options,
          difficulty: nextQuestion.difficulty,
          topic: nextQuestion.topic,
          timeLimitSeconds: nextQuestion.timeLimitSeconds
        },
        progress: { current: attempt.questions.length, total: MAX_QUESTIONS_PER_ATTEMPT }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const attemptId = req.params.id;

    const profile = await StudentProfile.findOne({ userId });
    const attempt = await AssessmentAttempt.findOne({ _id: attemptId, studentId: profile?._id })
      .populate('skillId')
      .populate('questions.questionId');

    if (!attempt) return next(new ErrorResponse('Attempt not found', 404));

    // Construct a safe result omitting correct answers if not completed, but since it's a result, we show them
    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await StudentProfile.findOne({ userId });

    const history = await AssessmentAttempt.find({ studentId: profile?._id, isCompleted: true })
      .populate('skillId', 'name category')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};
