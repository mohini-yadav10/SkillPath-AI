import { Request, Response, NextFunction } from 'express';
import StudentProfile from '../models/StudentProfile';
import SkillGapAnalysis from '../models/SkillGapAnalysis';
import LearningPath, { ILearningPathItem } from '../models/LearningPath';
import Skill from '../models/Skill';
import { getMLPrediction } from '../services/mlService';
import { ErrorResponse } from '../utils/errorResponse';
import mongoose from 'mongoose';

// Curated resource templates mapped by skill domains
const getCuratedModules = (skillName: string, gapSize: number, priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
  const normalized = skillName.toLowerCase();
  const modules = [];

  if (normalized.includes('react')) {
    modules.push({
      title: 'Modern React Architecture, Hooks & State Management',
      type: 'COURSE',
      url: 'https://react.dev/learn',
      estimatedHours: 15,
      milestone: 'Frontend Architecture'
    });
    if (gapSize > 20) {
      modules.push({
        title: 'Production React Lab: Interactive Component Design System',
        type: 'PROJECT',
        url: 'https://github.com/topics/react-projects',
        estimatedHours: 25,
        milestone: 'Frontend Architecture'
      });
    }
  } else if (normalized.includes('javascript') || normalized.includes('js')) {
    modules.push({
      title: 'Advanced JavaScript: Event Loop, Prototypes & Asynchronous Flow',
      type: 'COURSE',
      url: 'https://javascript.info',
      estimatedHours: 18,
      milestone: 'Core Foundations'
    });
  } else if (normalized.includes('node') || normalized.includes('express')) {
    modules.push({
      title: 'Scalable Microservices with Node.js & Express',
      type: 'COURSE',
      url: 'https://nodejs.org/docs/latest/api/',
      estimatedHours: 20,
      milestone: 'Backend Systems'
    });
    if (gapSize > 15) {
      modules.push({
        title: 'Backend Project: REST API with Authentication & Rate Limiting',
        type: 'PROJECT',
        url: 'https://expressjs.com',
        estimatedHours: 30,
        milestone: 'Backend Systems'
      });
    }
  } else if (normalized.includes('mongo') || normalized.includes('sql') || normalized.includes('database')) {
    modules.push({
      title: 'Database Schema Design, Indexing & Aggregation Pipelines',
      type: 'COURSE',
      url: 'https://www.mongodb.com/docs/',
      estimatedHours: 14,
      milestone: 'Data Layer'
    });
  } else if (normalized.includes('data structure') || normalized.includes('dsa') || normalized.includes('algorithm')) {
    modules.push({
      title: 'Algorithmic Problem Solving for Engineering Interviews',
      type: 'COURSE',
      url: 'https://leetcode.com/explore/',
      estimatedHours: 35,
      milestone: 'Core Foundations'
    });
    modules.push({
      title: 'DSA Coding Drills: Trees, Graphs & Dynamic Programming',
      type: 'CHALLENGE',
      url: 'https://hackerrank.com',
      estimatedHours: 20,
      milestone: 'Core Foundations'
    });
  } else if (normalized.includes('html') || normalized.includes('css')) {
    modules.push({
      title: 'Modern Responsive Layouts: CSS Grid, Flexbox & A11y Standards',
      type: 'COURSE',
      url: 'https://web.dev/learn/css/',
      estimatedHours: 10,
      milestone: 'Core Foundations'
    });
  } else {
    modules.push({
      title: `Core Principles & Hands-on Mastery: ${skillName}`,
      type: 'COURSE',
      url: `https://duckduckgo.com/?q=${encodeURIComponent(skillName + ' learning path')}`,
      estimatedHours: Math.max(8, Math.round(gapSize * 0.6)),
      milestone: 'Specialized Topic'
    });
  }

  return modules;
};

// Adaptively inject remediation module into an existing Learning Path
export const injectRemediationItem = async (
  studentProfileId: mongoose.Types.ObjectId,
  skillId: mongoose.Types.ObjectId,
  skillName: string,
  assessmentScore: number
) => {
  try {
    const path = await LearningPath.findOne({ studentId: studentProfileId, status: 'ACTIVE' });
    if (!path) return null;

    // Check if an active remediation item for this skill already exists
    const existing = path.items.find(
      i => i.skillId.toString() === skillId.toString() && i.isAdaptiveRemediation && i.status !== 'COMPLETED'
    );
    if (existing) return existing;

    const remediationItem: ILearningPathItem = {
      skillId,
      skillName,
      title: `⚡ Targeted Remediation Lab: ${skillName} (Assessment Score: ${assessmentScore}%)`,
      type: 'REMEDIATION',
      url: `https://duckduckgo.com/?q=${encodeURIComponent(skillName + ' practice exercises tutorial')}`,
      status: 'PENDING',
      order: 0, // Injected at the top
      estimatedHours: 8,
      isAdaptiveRemediation: true,
      priority: 'HIGH',
      milestone: 'Adaptive Reinforcement'
    };

    // Reorder items: shift existing order values
    path.items.forEach(i => {
      i.order += 1;
    });
    path.items.unshift(remediationItem);

    // Recalculate total estimated hours and progress
    path.totalEstimatedHours = (path.totalEstimatedHours || 0) + 8;
    const completed = path.items.filter(i => i.status === 'COMPLETED').length;
    path.progress = Math.round((completed / path.items.length) * 100);

    await path.save();
    return remediationItem;
  } catch (err) {
    console.error('Error in injectRemediationItem:', err);
    return null;
  }
};

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

    // Filter gaps that actually have a gapSize > 0
    const rawGaps = (latestAnalysis.gaps || []).filter(g => g.gapSize > 0);

    if (rawGaps.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No skill gaps found! Your skills currently meet or exceed role targets.' 
      });
    }

    // Fetch Skill documents to inspect prerequisite relationships for topological ordering
    const skillIds = rawGaps.map(g => g.skillId);
    const skillDocs = await Skill.find({ _id: { $in: skillIds } });
    const skillMap = new Map<string, any>();
    skillDocs.forEach(s => skillMap.set(s._id.toString(), s));

    // Sort gaps:
    // 1. Foundational/Prerequisites first (skills that don't depend on other gaps)
    // 2. High priority over Medium/Low
    // 3. Larger gapSize
    const sortedGaps = [...rawGaps].sort((a, b) => {
      const docA = skillMap.get(a.skillId.toString());
      const docB = skillMap.get(b.skillId.toString());

      // If A is a prereq of B, A must come first
      if (docB?.prerequisites?.some((pId: any) => pId.toString() === a.skillId.toString())) {
        return -1;
      }
      if (docA?.prerequisites?.some((pId: any) => pId.toString() === b.skillId.toString())) {
        return 1;
      }

      // Priority ordering
      const pOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      const pA = pOrder[a.priority || 'MEDIUM'] ?? 1;
      const pB = pOrder[b.priority || 'MEDIUM'] ?? 1;
      if (pA !== pB) return pA - pB;

      return b.gapSize - a.gapSize;
    });

    const items: ILearningPathItem[] = [];
    let order = 1;
    let totalEstimatedHours = 0;

    for (const gap of sortedGaps) {
      const modules = getCuratedModules(gap.skillName, gap.gapSize, gap.priority || 'MEDIUM');
      for (const mod of modules) {
        items.push({
          skillId: gap.skillId,
          skillName: gap.skillName,
          title: mod.title,
          type: mod.type,
          url: mod.url,
          status: 'PENDING',
          order: order++,
          estimatedHours: mod.estimatedHours,
          isAdaptiveRemediation: false,
          priority: gap.priority || 'MEDIUM',
          milestone: mod.milestone
        });
        totalEstimatedHours += mod.estimatedHours;
      }
    }

    // Remove old learning path
    await LearningPath.deleteMany({ studentId: profile._id });

    const newPath = await LearningPath.create({
      studentId: profile._id,
      targetRoleId: profile.targetRole,
      items,
      progress: 0,
      totalEstimatedHours,
      status: 'ACTIVE'
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

    const path = await LearningPath.findOne({ studentId: profile._id, status: 'ACTIVE' })
      .sort({ createdAt: -1 });

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
    const path = await LearningPath.findOne({ studentId: profile?._id, status: 'ACTIVE' });

    if (!path) {
      return next(new ErrorResponse('Active learning path not found', 404));
    }

    const item = (path.items as any).id(itemId);
    if (!item) {
      return next(new ErrorResponse('Path item not found', 404));
    }

    item.status = status;
    
    // Recalculate overall progress
    const completed = path.items.filter(i => i.status === 'COMPLETED').length;
    path.progress = Math.round((completed / path.items.length) * 100);

    // If all items completed, mark path completed and reward XP
    if (path.progress === 100 && path.status !== 'COMPLETED') {
      path.status = 'COMPLETED';
      if (profile) {
        profile.xp = (profile.xp || 0) + 200;
        await profile.save();
      }
    }

    await path.save();

    res.status(200).json({ success: true, data: path });
  } catch (error) {
    next(error);
  }
};
