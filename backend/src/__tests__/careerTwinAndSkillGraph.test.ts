import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import express from 'express';
import analysisRoutes from '../routes/analysisRoutes';
import learningRoutes from '../routes/learningRoutes';
import StudentProfile from '../models/StudentProfile';
import User from '../models/User';
import Skill from '../models/Skill';
import JobRole from '../models/JobRole';
import RoleSkillRequirement from '../models/RoleSkillRequirement';
import { injectRemediationItem } from '../controllers/learningController';
import LearningPath from '../models/LearningPath';

let mongoServer: MongoMemoryServer;
const app = express();

let globalUserId: mongoose.Types.ObjectId;
let targetRoleId: mongoose.Types.ObjectId;

vi.mock('../middleware/auth', () => ({
  protect: (req: any, _res: any, next: any) => {
    req.user = { id: globalUserId };
    next();
  },
  authorize: () => (_req: any, _res: any, next: any) => next()
}));

app.use(express.json());
app.use('/api/analysis', analysisRoutes);
app.use('/api/learning', learningRoutes);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const user = await User.create({
    firstName: 'Graph',
    lastName: 'Tester',
    email: 'graph@test.com',
    passwordHash: 'hash',
    role: 'STUDENT'
  });
  globalUserId = user._id as mongoose.Types.ObjectId;

  const role = await JobRole.create({
    title: 'Frontend Engineer',
    description: 'Build modern responsive web applications'
  });
  targetRoleId = role._id as mongoose.Types.ObjectId;

  // Create Skill 1 (HTML) & Skill 2 (JS with HTML prereq)
  const htmlSkill = await Skill.create({
    name: 'HTML5',
    category: 'TECHNICAL',
    level: 'FOUNDATIONAL',
    domain: 'Frontend',
    prerequisites: []
  });

  const jsSkill = await Skill.create({
    name: 'JavaScript',
    category: 'TECHNICAL',
    level: 'FOUNDATIONAL',
    domain: 'Frontend',
    prerequisites: [htmlSkill._id]
  });

  await RoleSkillRequirement.create({
    roleId: targetRoleId,
    skillId: htmlSkill._id,
    importance: 'CRITICAL',
    minimumProficiency: 85
  });

  await RoleSkillRequirement.create({
    roleId: targetRoleId,
    skillId: jsSkill._id,
    importance: 'CRITICAL',
    minimumProficiency: 80
  });

  await StudentProfile.create({
    userId: globalUserId,
    targetRole: targetRoleId,
    careerReadinessScore: 65,
    skills: [
      {
        skillId: htmlSkill._id,
        proficiency: 90,
        confidenceScore: 90,
        source: 'VERIFIED'
      },
      {
        skillId: jsSkill._id,
        proficiency: 50,
        confidenceScore: 55,
        source: 'SELF_DECLARED'
      }
    ],
    projects: [
      {
        title: 'Portfolio Site',
        description: 'Personal web portfolio',
        techStack: ['HTML5', 'CSS'],
        verified: true,
        impactScore: 75
      }
    ],
    learningStreak: 3
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Career Twin & Skill Graph Flow', () => {
  it('should calculate skill gap with priority and AI recommendations', async () => {
    const res = await request(app).post('/api/analysis/skill-gap');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.readinessScore).toBeGreaterThan(0);
    expect(res.body.data.gaps.length).toBe(2);

    const jsGap = res.body.data.gaps.find((g: any) => g.skillName === 'JavaScript');
    expect(jsGap).toBeDefined();
    expect(jsGap.priority).toBe('HIGH');
    expect(jsGap.recommendation).toBeDefined();
    expect(jsGap.isPrerequisiteMet).toBe(true); // HTML is 90%
  });

  it('should generate interactive skill graph nodes and edges', async () => {
    const res = await request(app).get('/api/analysis/skill-graph');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nodes.length).toBe(2);
    expect(res.body.data.edges.length).toBe(1);
    expect(res.body.data.edges[0].label).toBe('requires');

    const htmlNode = res.body.data.nodes.find((n: any) => n.name === 'HTML5');
    const jsNode = res.body.data.nodes.find((n: any) => n.name === 'JavaScript');
    expect(htmlNode.status).toBe('MASTERED');
    expect(jsNode.status).toBe('GAP'); // 50% vs 80%
  });

  it('should synthesize and return unified Career Twin data', async () => {
    const res = await request(app).get('/api/analysis/career-twin');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.careerTwin).toBeDefined();
    expect(res.body.data.careerTwin.archetype).toBeDefined();
    expect(res.body.data.careerTwin.cognitiveScores.technicalProficiency).toBeGreaterThan(0);
    expect(res.body.data.careerTwin.aiDiagnosis).toBeDefined();
    expect(res.body.data.careerTwin.nextBestAction).toBeDefined();
  });

  it('should generate an adaptive learning roadmap from skill gaps', async () => {
    const res = await request(app).post('/api/learning/generate');
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.items[0].skillName).toBe('JavaScript');
    expect(res.body.data.items[0].status).toBe('PENDING');
  });

  it('should adaptively inject remediation module into roadmap on low score', async () => {
    const profile = await StudentProfile.findOne({ userId: globalUserId });
    const jsSkill = await Skill.findOne({ name: 'JavaScript' });

    const remediation = await injectRemediationItem(
      profile!._id as mongoose.Types.ObjectId,
      jsSkill!._id as mongoose.Types.ObjectId,
      'JavaScript',
      45
    );

    expect(remediation).toBeDefined();
    expect(remediation?.isAdaptiveRemediation).toBe(true);
    expect(remediation?.title).toContain('Targeted Remediation Lab: JavaScript');

    // Verify it is now in the active LearningPath at the front
    const updatedPath = await LearningPath.findOne({ studentId: profile!._id, status: 'ACTIVE' });
    expect(updatedPath?.items[0].isAdaptiveRemediation).toBe(true);
  });
});
