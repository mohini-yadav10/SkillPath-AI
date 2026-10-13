import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import express from 'express';
import interviewRoutes from '../routes/interviewRoutes';
import User from '../models/User';
import StudentProfile from '../models/StudentProfile';
import JobRole from '../models/JobRole';
import Skill from '../models/Skill';
import RoleSkillRequirement from '../models/RoleSkillRequirement';
import SkillGapAnalysis from '../models/SkillGapAnalysis';
import InterviewQuestion from '../models/InterviewQuestion';
import InterviewAttempt from '../models/InterviewAttempt';
import LearningPath from '../models/LearningPath';

let mongoServer: MongoMemoryServer;
const app = express();

let globalUserId: mongoose.Types.ObjectId;
let studentProfileId: mongoose.Types.ObjectId;
let targetRoleId: mongoose.Types.ObjectId;
let weakSkillId: mongoose.Types.ObjectId;
let strongSkillId: mongoose.Types.ObjectId;
let prereqSkillId: mongoose.Types.ObjectId;

let mockAuthActive = true;

vi.mock('../middleware/auth', () => ({
  protect: (req: any, res: any, next: any) => {
    if (!mockAuthActive) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    req.user = { id: globalUserId };
    next();
  },
  authorize: () => (_req: any, _res: any, next: any) => next()
}));

app.use(express.json());
app.use('/api/interview', interviewRoutes);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // 1. Create student user
  const user = await User.create({
    firstName: 'PhaseE',
    lastName: 'Candidate',
    email: 'phaseE@interview.ai',
    passwordHash: 'hash',
    role: 'STUDENT'
  });
  globalUserId = user._id as mongoose.Types.ObjectId;

  // 2. Create Target Role
  const role = await JobRole.create({
    title: 'Senior Frontend Architect',
    description: 'Expertise in modern frontend architectures'
  });
  targetRoleId = role._id as mongoose.Types.ObjectId;

  // 3. Create Skills
  const htmlSkill = await Skill.create({
    name: 'HTML/CSS Basics',
    category: 'TECHNICAL',
    level: 'FOUNDATIONAL',
    domain: 'Frontend',
    prerequisites: []
  });
  prereqSkillId = htmlSkill._id as mongoose.Types.ObjectId;

  const reactSkill = await Skill.create({
    name: 'React Internals',
    category: 'TECHNICAL',
    level: 'ADVANCED',
    domain: 'Frontend',
    prerequisites: [prereqSkillId]
  });
  weakSkillId = reactSkill._id as mongoose.Types.ObjectId;

  const tsSkill = await Skill.create({
    name: 'TypeScript',
    category: 'TECHNICAL',
    level: 'INTERMEDIATE',
    domain: 'Frontend',
    prerequisites: []
  });
  strongSkillId = tsSkill._id as mongoose.Types.ObjectId;

  // 4. Role Skill Requirements
  await RoleSkillRequirement.create([
    {
      roleId: targetRoleId,
      skillId: weakSkillId,
      minimumProficiency: 85,
      importance: 'CRITICAL',
      weight: 3
    },
    {
      roleId: targetRoleId,
      skillId: strongSkillId,
      minimumProficiency: 70,
      importance: 'IMPORTANT',
      weight: 2
    }
  ]);

  // 5. Create StudentProfile
  const profile = await StudentProfile.create({
    userId: globalUserId,
    targetRole: targetRoleId,
    careerReadinessScore: 50,
    skills: [
      { skillId: weakSkillId, proficiency: 40, confidenceScore: 60, source: 'SELF_DECLARED' },
      { skillId: strongSkillId, proficiency: 85, confidenceScore: 90, source: 'ASSESSMENT' }
    ],
    interviewStats: {
      totalInterviews: 1,
      averageScore: 70,
      technicalRating: 70,
      communicationRating: 70
    }
  });
  studentProfileId = profile._id as mongoose.Types.ObjectId;

  // 6. Create initial SkillGapAnalysis
  await SkillGapAnalysis.create({
    studentId: studentProfileId,
    roleId: targetRoleId,
    readinessScore: 50,
    criticalGapsCount: 1,
    matchedSkillsCount: 1,
    totalRequiredSkills: 2,
    summaryDiagnosis: 'Initial gap analysis detected weakness in React Internals.',
    gaps: [
      {
        skillId: weakSkillId,
        skillName: 'React Internals',
        currentProficiency: 40,
        requiredProficiency: 85,
        gapSize: 45,
        classification: 'CRITICAL',
        importance: 'CRITICAL',
        priority: 'HIGH',
        recommendation: 'Deep dive into virtual DOM and reconciliation.',
        estimatedHoursToClose: 25,
        isPrerequisiteMet: true
      }
    ]
  });

  // 7. Seed Verified Public Interview Questions
  await InterviewQuestion.create([
    {
      questionText: 'Explain the React virtual DOM reconciliation algorithm and how diffing keys work.',
      type: 'TECHNICAL',
      difficulty: 'MEDIUM',
      relatedSkill: weakSkillId,
      roles: ['Senior Frontend Architect'],
      companies: ['Meta', 'Google'],
      expectedKeywords: ['fiber', 'reconciliation', 'keys', 'diffing', 'vdom', 'rerender'],
      source: 'VERIFIED_PUBLIC',
      category: 'Frontend Engineering'
    },
    {
      questionText: 'Implement a debounce function in TypeScript with unit test constraints.',
      type: 'TECHNICAL',
      difficulty: 'HARD',
      relatedSkill: strongSkillId,
      roles: ['Senior Frontend Architect'],
      expectedKeywords: ['timeout', 'closure', 'cleartimeout', 'apply', 'timer'],
      source: 'VERIFIED_PUBLIC',
      category: 'Coding & Algorithms',
      codeTestCase: {
        input: 'debounce(fn, 100)',
        expectedOutput: 'closure'
      }
    },
    {
      questionText: 'Describe how you mentor junior developers through code reviews.',
      type: 'HR',
      difficulty: 'EASY',
      roles: ['Senior Frontend Architect'],
      expectedKeywords: ['empathy', 'feedback', 'guidance', 'constructive', 'standards'],
      source: 'VERIFIED_PUBLIC',
      category: 'Behavioral & Leadership'
    }
  ]);

  // 8. Create an active LearningPath with prerequisite ordering
  await LearningPath.create({
    studentId: studentProfileId,
    targetRoleId,
    items: [
      {
        skillId: prereqSkillId,
        skillName: 'HTML/CSS Basics',
        title: 'Foundational HTML & Semantic Markup',
        type: 'COURSE',
        url: 'https://example.com/html',
        status: 'PENDING',
        order: 1,
        estimatedHours: 10
      },
      {
        skillId: strongSkillId,
        skillName: 'TypeScript',
        title: 'Advanced TypeScript Generics',
        type: 'PRACTICE',
        url: 'https://example.com/ts',
        status: 'IN_PROGRESS',
        order: 2,
        estimatedHours: 12
      }
    ],
    progress: 25,
    status: 'ACTIVE'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Phase E: Adaptive AI Interviewer & Assessment Engine', () => {
  let createdAttemptId: string;

  it('1. setupInterview: selects questions based on target role, weak skill gap, and sets selectionReason', async () => {
    const res = await request(app)
      .post('/api/interview/setup')
      .send({
        type: 'TECHNICAL',
        difficulty: 'MEDIUM',
        questionCount: 3
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    const attempt = res.body.data;
    createdAttemptId = attempt._id;
    expect(attempt.status).toBe('IN_PROGRESS');
    expect(attempt.questions.length).toBeGreaterThanOrEqual(1);

    // Verify first question matches weak skill and includes selectionReason & source
    const q1 = attempt.questions[0];
    expect(q1.questionText).toBeDefined();
    expect(q1.source).toBe('VERIFIED_PUBLIC');
    expect(q1.selectionReason).toContain('React Internals');
    expect(q1.expectedKeywords.length).toBeGreaterThan(0);
  });

  it('2. submitAnswer: evaluates answer with rubric keywords and coding test cases', async () => {
    // Provide an articulate answer that covers some keywords but misses fiber & vdom
    const studentAnswer =
      'In React, the reconciliation process uses keys to optimize diffing across state updates. When components rerender, React compares previous and new trees to minimize real DOM mutations.';

    const res = await request(app)
      .post(`/api/interview/${createdAttemptId}/answer`)
      .send({
        questionIndex: 0,
        studentAnswer,
        timeSpentSeconds: 45
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const evaluation = res.body.evaluation;
    expect(evaluation).toBeDefined();
    expect(evaluation.technical).toBeGreaterThan(0);
    expect(evaluation.communication).toBeGreaterThanOrEqual(60);
    expect(evaluation.matchedKeywords).toContain('reconciliation');
    expect(evaluation.matchedKeywords).toContain('keys');
    expect(evaluation.missedKeywords).toContain('fiber');
    expect(evaluation.detailedAnalysis).toBeDefined();

    // Verify attempt question has persisted values
    const updatedAttempt = res.body.data;
    const q0 = updatedAttempt.questions[0];
    expect(q0.studentAnswer).toBe(studentAnswer);
    expect(q0.techScore).toBe(evaluation.technical);
    expect(q0.commScore).toBe(evaluation.communication);
  });

  it('3. submitAnswer: dynamically generates adaptive follow-up when technical weakness is detected', async () => {
    // Submit a weak answer on question 0 (< 60% tech score)
    const weakAnswer = 'It renders stuff faster by checking changes.';

    const res = await request(app)
      .post(`/api/interview/${createdAttemptId}/answer`)
      .send({
        questionIndex: 0,
        studentAnswer: weakAnswer,
        timeSpentSeconds: 30
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.followUpGenerated).toBe(true);
    expect(res.body.followUpQuestion).toBeDefined();

    const followUp = res.body.followUpQuestion;
    expect(followUp.isFollowUp).toBe(true);
    expect(followUp.source).toBe('AI_GENERATED');
    expect(followUp.parentQuestionIndex).toBe(0);
    expect(followUp.selectionReason).toContain('Adaptive follow-up');
    expect(followUp.questionText).toContain('Adaptive Follow-Up');

    // Confirm persisted in database
    const attemptInDb = await InterviewAttempt.findById(createdAttemptId);
    expect(attemptInDb?.questions.some(q => q.isFollowUp)).toBe(true);
  });

  it('4. completeInterview: calculates rubric scores, updates Career Twin, and injects remediation with prerequisite ordering', async () => {
    const res = await request(app)
      .post(`/api/interview/${createdAttemptId}/complete`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const completed = res.body.data;
    expect(completed.status).toBe('COMPLETED');
    expect(completed.scores.overall).toBeGreaterThanOrEqual(0);
    expect(completed.weaknesses.length).toBeGreaterThan(0);

    // Verify Career Twin Telemetry impact was computed and persisted
    expect(completed.careerTwinImpact).toBeDefined();
    expect(completed.careerTwinImpact.archetype).toBeDefined();

    // Verify StudentProfile interview stats updated
    const profile = await StudentProfile.findById(studentProfileId);
    expect(profile?.interviewStats?.totalInterviews).toBe(2);
    expect(profile?.careerTwin).toBeDefined();
    expect(profile?.careerTwin?.cognitiveScores?.interviewReadiness).toBeDefined();

    // Verify LearningPath received injected remediation item with prerequisite ordering
    const path = await LearningPath.findOne({ studentId: studentProfileId, status: 'ACTIVE' });
    expect(path).toBeDefined();

    const remediationItem = path?.items.find(i => i.isAdaptiveRemediation);
    expect(remediationItem).toBeDefined();
    expect(remediationItem?.skillName).toBe('React Internals');
    expect(remediationItem?.recommendationReason).toContain('virtual interview performance');

    // Requirement 7 check: prerequisite ordering preserved!
    // React Internals depends on HTML/CSS Basics (index of HTML/CSS Basics must be before React Internals)
    const prereqIndex = path?.items.findIndex(i => i.skillName === 'HTML/CSS Basics');
    const remediationIndex = path?.items.findIndex(i => i.isAdaptiveRemediation);
    expect(prereqIndex).toBeGreaterThanOrEqual(0);
    expect(remediationIndex).toBeGreaterThan(prereqIndex!);

    // Sequential order numbering
    path?.items.forEach((item, idx) => {
      expect(item.order).toBe(idx + 1);
    });
  });

  it('5. Deduplication: completing another interview does not create duplicate remediation items', async () => {
    // Trigger injectRemediationItem again for the same skill
    const initialPath = await LearningPath.findOne({ studentId: studentProfileId, status: 'ACTIVE' });
    const initialRemediationCount = initialPath?.items.filter(i => i.isAdaptiveRemediation).length;

    // Call complete again on the completed attempt
    await request(app).post(`/api/interview/${createdAttemptId}/complete`).send({});

    const updatedPath = await LearningPath.findOne({ studentId: studentProfileId, status: 'ACTIVE' });
    const updatedRemediationCount = updatedPath?.items.filter(i => i.isAdaptiveRemediation).length;

    expect(updatedRemediationCount).toBe(initialRemediationCount);
  });

  it('6. Authorization and Error Handling', async () => {
    // Invalid Attempt ID -> 404
    const fakeId = new mongoose.Types.ObjectId();
    const notFoundRes = await request(app).get(`/api/interview/${fakeId}`);
    expect(notFoundRes.status).toBe(404);

    // Submitting answer to completed interview -> 400
    const answerOnCompleted = await request(app)
      .post(`/api/interview/${createdAttemptId}/answer`)
      .send({ questionIndex: 0, studentAnswer: 'late answer' });
    expect(answerOnCompleted.status).toBe(400);

    // Invalid question index -> 400
    const newAttemptRes = await request(app)
      .post('/api/interview/setup')
      .send({ type: 'TECHNICAL', difficulty: 'EASY', questionCount: 2 });
    const newId = newAttemptRes.body.data._id;

    const invalidIndexRes = await request(app)
      .post(`/api/interview/${newId}/answer`)
      .send({ questionIndex: 99, studentAnswer: 'out of bounds' });
    expect(invalidIndexRes.status).toBe(400);

    // Unauthenticated access -> 401
    mockAuthActive = false;
    const unauthRes = await request(app).get('/api/interview/history');
    expect(unauthRes.status).toBe(401);
    mockAuthActive = true;
  });
});
