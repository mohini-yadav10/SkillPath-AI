import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import StudentProfile from '../models/StudentProfile';
import RoleSkillRequirement from '../models/RoleSkillRequirement';
import SkillGapAnalysis, { ISkillGapItem } from '../models/SkillGapAnalysis';
import Skill, { ISkill } from '../models/Skill';
import JobRole from '../models/JobRole';
import InterviewAttempt from '../models/InterviewAttempt';
import { ErrorResponse } from '../utils/errorResponse';

// Helper to generate personalized recommendations based on skill and gap size
const generateRecommendation = (skillName: string, gapSize: number, importance: string): string => {
  const normalized = skillName.toLowerCase();
  if (gapSize <= 0) {
    return `Mastery confirmed for ${skillName}. Maintain proficiency through real-world projects.`;
  }

  if (normalized.includes('react')) {
    return `Practice hooks, custom middleware, component memoization, and build an interactive stateful app (Est. ${Math.max(10, Math.round(gapSize * 0.9))}h).`;
  }
  if (normalized.includes('javascript') || normalized.includes('js')) {
    return `Deep dive into ES6+, Event Loop, Promises/Async-Await, and DOM manipulation drills (Est. ${Math.max(12, Math.round(gapSize * 0.9))}h).`;
  }
  if (normalized.includes('node') || normalized.includes('express')) {
    return `Build RESTful microservices, integrate JWT authentication, and optimize database queries (Est. ${Math.max(10, Math.round(gapSize * 0.8))}h).`;
  }
  if (normalized.includes('sql') || normalized.includes('mongo')) {
    return `Master schema indexing, aggregation pipelines, and ACID transactions via hands-on exercises (Est. ${Math.max(8, Math.round(gapSize * 0.7))}h).`;
  }
  if (normalized.includes('data structure') || normalized.includes('dsa') || normalized.includes('algorithm')) {
    return `Solve 20+ medium problems covering Hash Maps, Two Pointers, Trees, and Dynamic Programming (Est. ${Math.max(15, Math.round(gapSize * 1.1))}h).`;
  }
  if (normalized.includes('html') || normalized.includes('css')) {
    return `Solidify CSS Grid/Flexbox layouts, responsive design patterns, and accessibility standards (Est. ${Math.max(6, Math.round(gapSize * 0.5))}h).`;
  }
  if (normalized.includes('git')) {
    return `Practice branch rebase workflows, cherry-picking, and resolving merge conflicts (Est. ${Math.max(4, Math.round(gapSize * 0.4))}h).`;
  }

  return `Work through guided coursework and targeted hands-on challenges to elevate ${skillName} from current level to ${100 - gapSize}% proficiency.`;
};

// Helper to derive Career Twin data
const synthesizeCareerTwin = (profile: any, readinessScore: number, gaps: any[]) => {
  const totalSkills = profile.skills?.length || 1;
  const avgProficiency = Math.round(
    profile.skills.reduce((sum: number, s: any) => sum + (s.proficiency || 0), 0) / totalSkills
  );

  const criticalGaps = gaps.filter(g => g.priority === 'HIGH');
  const projectCount = profile.projects?.length || 0;
  const interviewRating = profile.interviewStats?.averageScore || Math.min(85, Math.max(45, readinessScore - 8));

  // Determine archetype based on skill strengths
  let archetype = 'Full-Stack Software Apprentice';
  if (readinessScore >= 80) archetype = 'Industry-Ready Full-Stack Specialist';
  else if (readinessScore >= 60) archetype = 'Developing Full-Stack Engineer';
  else if (readinessScore >= 40) archetype = 'Core Foundations Builder';

  const cognitiveScores = {
    technicalProficiency: avgProficiency,
    practicalApplication: Math.min(100, Math.max(20, projectCount * 30 + 35)),
    interviewReadiness: interviewRating,
    consistencyStreak: Math.min(100, Math.max(15, (profile.learningStreak || 1) * 15))
  };

  const estimatedWeeksToHire = Math.max(2, Math.round((100 - readinessScore) / 4.2));
  const topGap = criticalGaps.length > 0 ? criticalGaps[0] : (gaps.length > 0 ? gaps[0] : null);

  const aiDiagnosis = criticalGaps.length > 0
    ? `Your digital Career Twin shows strong foundational potential (${avgProficiency}% avg skill level), but ${criticalGaps.length} high-priority gap(s) (${criticalGaps.map(g => g.skillName).slice(0, 2).join(', ')}) impede interview qualification.`
    : `Your digital Career Twin is in optimal alignment with market requirements. Readiness is high at ${readinessScore}%.`;

  const nextBestAction = topGap
    ? `Prioritize closing the ${topGap.priority} priority gap in ${topGap.skillName} (${topGap.currentProficiency}% -> ${topGap.requiredProficiency}%). This offers the highest expected ROI on readiness (+${Math.round(topGap.gapSize * 0.35)}%).`
    : `Take a mock technical interview to benchmark your communication and coding agility.`;

  return {
    archetype,
    marketReadinessIndex: readinessScore,
    cognitiveScores,
    learningVelocity: Math.max(8, Math.round(avgProficiency * 0.2 + (profile.xp || 50) * 0.05)),
    estimatedWeeksToHire,
    aiDiagnosis,
    nextBestAction,
    lastSynthesizedAt: new Date()
  };
};

export const performSkillGapCalculation = async (profileId: mongoose.Types.ObjectId | string) => {
  const profile = await StudentProfile.findById(profileId).populate('skills.skillId');
  if (!profile || !profile.targetRole) {
    return null;
  }

  // Fetch role requirements with populated skill prerequisites
  const requirements = await RoleSkillRequirement.find({ roleId: profile.targetRole })
    .populate({
      path: 'skillId',
      populate: { path: 'prerequisites' }
    });

  const gaps: ISkillGapItem[] = [];
  let matchedSkillsCount = 0;
  let criticalGapsCount = 0;
  let totalScoreNumerator = 0;
  let totalScoreDenominator = 0;

  for (const reqSkill of requirements) {
    const skillDoc = reqSkill.skillId as any;
    if (!skillDoc) continue;
    const skillName = skillDoc.name;
    const studentSkill = profile.skills.find(
      s => s.skillId && (s.skillId as any)._id.toString() === skillDoc._id.toString()
    );

    const currentProficiency = studentSkill ? studentSkill.proficiency : 0;
    const requiredProficiency = reqSkill.minimumProficiency;
    const gapSize = Math.max(0, requiredProficiency - currentProficiency);

    let classification: 'MASTERED' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL' = 'MASTERED';
    if (gapSize > 40) classification = 'CRITICAL';
    else if (gapSize > 25) classification = 'MAJOR';
    else if (gapSize > 12) classification = 'MODERATE';
    else if (gapSize > 0) classification = 'MINOR';

    // Check prerequisites status
    let isPrerequisiteMet = true;
    if (skillDoc.prerequisites && skillDoc.prerequisites.length > 0) {
      for (const prereq of skillDoc.prerequisites) {
        const prereqSkill = profile.skills.find(
          s => s.skillId && (s.skillId as any)._id.toString() === prereq._id.toString()
        );
        if (!prereqSkill || prereqSkill.proficiency < 50) {
          isPrerequisiteMet = false;
          break;
        }
      }
    }

    // Assign priority
    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    if ((reqSkill.importance === 'CRITICAL' || reqSkill.importance === 'IMPORTANT') && gapSize > 20) {
      priority = 'HIGH';
    } else if (gapSize <= 5 || reqSkill.importance === 'OPTIONAL') {
      priority = 'LOW';
    }

    if (gapSize === 0) matchedSkillsCount++;
    if (classification === 'CRITICAL' && reqSkill.importance === 'CRITICAL') criticalGapsCount++;

    // Weighting for readiness score
    let weight = 1;
    if (reqSkill.importance === 'CRITICAL') weight = 3;
    else if (reqSkill.importance === 'IMPORTANT') weight = 2;
    else if (reqSkill.importance === 'OPTIONAL') weight = 0.5;

    totalScoreNumerator += (Math.min(currentProficiency, requiredProficiency) / requiredProficiency) * weight;
    totalScoreDenominator += weight;

    const recommendation = generateRecommendation(skillName, gapSize, reqSkill.importance);
    const estimatedHoursToClose = Math.max(4, Math.round(gapSize * 0.8));

    gaps.push({
      skillId: skillDoc._id,
      skillName,
      currentProficiency,
      requiredProficiency,
      gapSize,
      classification,
      importance: reqSkill.importance,
      priority,
      recommendation,
      estimatedHoursToClose,
      isPrerequisiteMet
    });
  }

  let readinessScore = 0;
  if (totalScoreDenominator > 0) {
    readinessScore = Math.round((totalScoreNumerator / totalScoreDenominator) * 100);
  }

  // Sort gaps: HIGH priority first, then descending gap size
  gaps.sort((a, b) => {
    const pOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    if (pOrder[a.priority] !== pOrder[b.priority]) {
      return pOrder[a.priority] - pOrder[b.priority];
    }
    return b.gapSize - a.gapSize;
  });

  const summaryDiagnosis = criticalGapsCount > 0
    ? `Identified ${criticalGapsCount} critical role skill gap(s). Focus on HIGH priority skills to unlock full career readiness.`
    : `High role alignment detected (${readinessScore}%). Maintain edge with hands-on practice.`;

  // Save Analysis
  const analysis = await SkillGapAnalysis.create({
    studentId: profile._id,
    roleId: profile.targetRole,
    readinessScore,
    criticalGapsCount,
    matchedSkillsCount,
    totalRequiredSkills: requirements.length,
    summaryDiagnosis,
    gaps
  });

  // Update StudentProfile with readinessScore and synthesize Career Twin
  profile.careerReadinessScore = readinessScore;
  profile.careerTwin = synthesizeCareerTwin(profile, readinessScore, gaps);
  await profile.save();

  return { analysis, profile };
};

export const calculateSkillGap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await StudentProfile.findOne({ userId });

    if (!profile || !profile.targetRole) {
      return next(new ErrorResponse('Profile or Target Role not found. Please set a target career.', 400));
    }

    const result = await performSkillGapCalculation(profile._id);
    if (!result) {
      return next(new ErrorResponse('Could not calculate skill gap', 400));
    }

    res.status(200).json({ success: true, data: result.analysis });
  } catch (error) {
    next(error);
  }
};

export const getLatestAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await StudentProfile.findOne({ userId }).populate('targetCompany targetRole');

    if (!profile) {
      return res.status(200).json({ success: true, data: null });
    }

    const analysis = await SkillGapAnalysis.findOne({ studentId: profile._id })
      .populate('roleId')
      .sort({ createdAt: -1 });

    const analysisObj: any = analysis ? analysis.toObject() : null;
    if (analysisObj) {
      analysisObj.targetCompany = profile.targetCompany;
      analysisObj.careerTwin = profile.careerTwin;
    }

    res.status(200).json({ success: true, data: analysisObj });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Interactive Skill Dependency Graph
// @route   GET /api/analysis/skill-graph
// @access  Private
export const getSkillGraph = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await StudentProfile.findOne({ userId }).populate('skills.skillId targetRole');

    if (!profile || !profile.targetRole) {
      return next(new ErrorResponse('Target Role required for Skill Graph calculation', 400));
    }

    // Fetch requirements for the target role
    const requirements = await RoleSkillRequirement.find({ roleId: profile.targetRole })
      .populate({
        path: 'skillId',
        populate: { path: 'prerequisites' }
      });

    // Map student's known skills
    const studentSkillMap = new Map<string, number>();
    profile.skills.forEach(s => {
      if (s.skillId) {
        studentSkillMap.set((s.skillId as any)._id.toString(), s.proficiency);
      }
    });

    // Build Graph Nodes and Edges
    const nodes: any[] = [];
    const edges: any[] = [];
    const visitedSkillIds = new Set<string>();

    for (const reqSkill of requirements) {
      const skillDoc = reqSkill.skillId as any;
      if (!skillDoc || !skillDoc._id) continue;
      
      const skillIdStr = skillDoc._id.toString();
      visitedSkillIds.add(skillIdStr);

      const currentProficiency = studentSkillMap.get(skillIdStr) || 0;
      const requiredProficiency = reqSkill.minimumProficiency || 70;
      const gapSize = Math.max(0, requiredProficiency - currentProficiency);

      // Check prerequisites
      const prereqs = skillDoc.prerequisites || [];
      let prereqsMet = true;
      for (const p of prereqs) {
        const pIdStr = p._id ? p._id.toString() : p.toString();
        const pProf = studentSkillMap.get(pIdStr) || 0;
        if (pProf < 50) {
          prereqsMet = false;
        }
        // Add edge
        edges.push({
          from: pIdStr,
          to: skillIdStr,
          label: 'requires'
        });
      }

      // Determine visual node status
      let status: 'MASTERED' | 'DEVELOPING' | 'GAP' | 'LOCKED' = 'DEVELOPING';
      if (!prereqsMet) {
        status = 'LOCKED';
      } else if (gapSize === 0 || currentProficiency >= requiredProficiency) {
        status = 'MASTERED';
      } else if (gapSize > 25) {
        status = 'GAP';
      } else {
        status = 'DEVELOPING';
      }

      nodes.push({
        id: skillIdStr,
        name: skillDoc.name,
        category: skillDoc.category || 'TECHNICAL',
        level: skillDoc.level || 'FOUNDATIONAL',
        domain: skillDoc.domain || 'Core',
        currentProficiency,
        requiredProficiency,
        gapSize,
        importance: reqSkill.importance,
        status,
        isPrerequisiteMet: prereqsMet,
        prerequisiteCount: prereqs.length,
        recommendation: generateRecommendation(skillDoc.name, gapSize, reqSkill.importance)
      });
    }

    res.status(200).json({
      success: true,
      data: {
        roleTitle: (profile.targetRole as any).title,
        nodes,
        edges,
        totalNodes: nodes.length,
        masteredCount: nodes.filter(n => n.status === 'MASTERED').length,
        gapCount: nodes.filter(n => n.status === 'GAP').length,
        lockedCount: nodes.filter(n => n.status === 'LOCKED').length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Unified Digital Career Twin
// @route   GET /api/analysis/career-twin
// @access  Private
export const getCareerTwin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await StudentProfile.findOne({ userId })
      .populate('targetRole targetCompany skills.skillId');

    if (!profile) {
      return next(new ErrorResponse('Student profile not found', 404));
    }

    const latestAnalysis = await SkillGapAnalysis.findOne({ studentId: profile._id })
      .sort({ createdAt: -1 });

    const readinessScore = profile.careerReadinessScore || latestAnalysis?.readinessScore || 0;
    const gaps = latestAnalysis?.gaps || [];

    // Synthesize latest Career Twin
    const synthesizedTwin = synthesizeCareerTwin(profile, readinessScore, gaps);
    profile.careerTwin = synthesizedTwin;
    await profile.save();

    res.status(200).json({
      success: true,
      data: {
        profile: {
          id: profile._id,
          targetRole: profile.targetRole,
          targetCompany: profile.targetCompany,
          learningStreak: profile.learningStreak,
          xp: profile.xp,
          level: profile.level
        },
        careerTwin: synthesizedTwin,
        projects: profile.projects || [],
        interviewStats: profile.interviewStats,
        topGaps: gaps.slice(0, 4)
      }
    });
  } catch (error) {
    next(error);
  }
};
