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
import Company from '../models/Company';
import InterviewSource from '../models/InterviewSource';
import InterviewQuestion from '../models/InterviewQuestion';
import InterviewAttempt from '../models/InterviewAttempt';
import LearningPath from '../models/LearningPath';
import { isSafePublicUrl, normalizeContentHash, QuestionIngestionService } from '../services/questionIngestionService';
import { SkillTaxonomyService } from '../services/skillTaxonomyService';

let mongoServer: MongoMemoryServer;
const app = express();

let studentUserA: any;
let studentUserB: any;
let adminUser: any;
let activeUser: any;

let studentProfileAId: mongoose.Types.ObjectId;
let targetRoleId: mongoose.Types.ObjectId;
let mongoSkillId: mongoose.Types.ObjectId;
let reactSkillId: mongoose.Types.ObjectId;
let jsSkillId: mongoose.Types.ObjectId;
let htmlPrereqId: mongoose.Types.ObjectId;

vi.mock('../middleware/auth', () => ({
  protect: (req: any, res: any, next: any) => {
    if (!activeUser) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    req.user = activeUser;
    next();
  },
  authorize: (...roles: string[]) => (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges' });
    }
    next();
  }
}));

app.use(express.json());
app.use('/api/interview', interviewRoutes);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // 1. Create Users
  studentUserA = await User.create({
    firstName: 'Student',
    lastName: 'Alpha',
    email: 'alpha@tcs.ai',
    passwordHash: 'hash',
    role: 'STUDENT'
  });

  studentUserB = await User.create({
    firstName: 'Student',
    lastName: 'Beta',
    email: 'beta@tcs.ai',
    passwordHash: 'hash',
    role: 'STUDENT'
  });

  adminUser = await User.create({
    firstName: 'Lead',
    lastName: 'Admin',
    email: 'admin@tcs.ai',
    passwordHash: 'hash',
    role: 'ADMIN'
  });

  activeUser = studentUserA;

  // 2. Initialize Canonical Taxonomy
  const taxonomyMap = await SkillTaxonomyService.ensureCanonicalTaxonomy();
  mongoSkillId = taxonomyMap.get('mongodb')!._id as mongoose.Types.ObjectId;
  reactSkillId = taxonomyMap.get('react')!._id as mongoose.Types.ObjectId;
  jsSkillId = taxonomyMap.get('javascript')!._id as mongoose.Types.ObjectId;
  htmlPrereqId = taxonomyMap.get('html')!._id as mongoose.Types.ObjectId;

  // Setup prerequisite: React depends on HTML
  await Skill.findByIdAndUpdate(reactSkillId, { prerequisites: [htmlPrereqId] });

  // 3. Target Role
  const role = await JobRole.create({
    title: 'MERN Full Stack Developer',
    description: 'TCS Full Stack Developer building scalable cloud applications'
  });
  targetRoleId = role._id as mongoose.Types.ObjectId;

  // 4. Role Skill Requirements
  await RoleSkillRequirement.create([
    {
      roleId: targetRoleId,
      skillId: reactSkillId,
      minimumProficiency: 80,
      importance: 'CRITICAL',
      weight: 3
    },
    {
      roleId: targetRoleId,
      skillId: mongoSkillId,
      minimumProficiency: 75,
      importance: 'CRITICAL',
      weight: 3
    },
    {
      roleId: targetRoleId,
      skillId: jsSkillId,
      minimumProficiency: 70,
      importance: 'IMPORTANT',
      weight: 2
    }
  ]);

  // 4b. Company
  const companyDoc = await Company.create({
    name: 'TCS',
    description: 'Tata Consultancy Services'
  });

  // 5. Create StudentProfile for User A
  const profileA = await StudentProfile.create({
    userId: studentUserA._id,
    targetRole: targetRoleId,
    targetCompany: companyDoc._id,
    careerReadinessScore: 48,
    skills: [
      { skillId: reactSkillId, proficiency: 40, confidenceScore: 60, source: 'SELF_DECLARED' },
      { skillId: mongoSkillId, proficiency: 45, confidenceScore: 60, source: 'SELF_DECLARED' },
      { skillId: jsSkillId, proficiency: 85, confidenceScore: 90, source: 'ASSESSMENT' }
    ],
    interviewStats: {
      totalInterviews: 1,
      averageScore: 68,
      technicalRating: 68,
      communicationRating: 70
    }
  });
  studentProfileAId = profileA._id as mongoose.Types.ObjectId;

  // 6. SkillGapAnalysis for Student A (Weakness in React & MongoDB)
  await SkillGapAnalysis.create({
    studentId: studentProfileAId,
    roleId: targetRoleId,
    readinessScore: 48,
    criticalGapsCount: 2,
    matchedSkillsCount: 1,
    totalRequiredSkills: 3,
    summaryDiagnosis: 'Critical gaps detected in React and MongoDB.',
    gaps: [
      {
        skillId: reactSkillId,
        skillName: 'React',
        currentProficiency: 40,
        requiredProficiency: 80,
        gapSize: 40,
        classification: 'CRITICAL',
        importance: 'CRITICAL',
        priority: 'HIGH',
        recommendation: 'Master React reconciliation and lifecycle hooks.',
        estimatedHoursToClose: 24,
        isPrerequisiteMet: true
      },
      {
        skillId: mongoSkillId,
        skillName: 'MongoDB',
        currentProficiency: 45,
        requiredProficiency: 75,
        gapSize: 30,
        classification: 'MAJOR',
        importance: 'CRITICAL',
        priority: 'HIGH',
        recommendation: 'Practice indexing and aggregation pipelines.',
        estimatedHoursToClose: 20,
        isPrerequisiteMet: true
      }
    ]
  });

  // 7. Seed initial Active LearningPath for Student A
  await LearningPath.create({
    studentId: studentProfileAId,
    targetRoleId,
    items: [
      {
        skillId: htmlPrereqId,
        skillName: 'HTML',
        title: 'Semantic HTML5 Standards',
        type: 'COURSE',
        url: 'https://example.com/html5',
        status: 'PENDING',
        order: 1,
        estimatedHours: 8
      },
      {
        skillId: jsSkillId,
        skillName: 'JavaScript',
        title: 'Modern JS ES6 Architecture',
        type: 'PRACTICE',
        url: 'https://example.com/js',
        status: 'IN_PROGRESS',
        order: 2,
        estimatedHours: 10
      }
    ],
    progress: 20,
    status: 'ACTIVE'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('SKILLPATH AI — Source Provenance, Question Bank, & Adaptive Engine', () => {
  let createdSourceId: string;
  let createdAttemptId: string;

  // ==========================================
  // 1. SOURCE PROVENANCE & SSRF SAFETY TESTS
  // ==========================================
  describe('Source Provenance & Safe Registry', () => {
    it('1.1 SSRF Guard blocks private, loopback, and metadata IPs', () => {
      expect(isSafePublicUrl('http://localhost:5000')).toBe(false);
      expect(isSafePublicUrl('http://127.0.0.1:8080')).toBe(false);
      expect(isSafePublicUrl('http://169.254.169.254/latest/meta-data')).toBe(false);
      expect(isSafePublicUrl('http://10.0.0.1')).toBe(false);
      expect(isSafePublicUrl('http://192.168.1.1')).toBe(false);
      expect(isSafePublicUrl('ftp://example.com')).toBe(false);
      expect(isSafePublicUrl('https://www.ambitionbox.com/interviews/tcs-interview-questions/mern-full-stack-developer')).toBe(true);
    });

    it('1.2 registerSource: allows Admin to register real AmbitionBox source record with provenance', async () => {
      activeUser = adminUser;
      const res = await request(app)
        .post('/api/interview/sources')
        .send({
          sourceName: 'AmbitionBox TCS MERN Developer Interview Questions',
          sourceUrl: 'https://www.ambitionbox.com/interviews/tcs-interview-questions/mern-full-stack-developer',
          sourceType: 'CANDIDATE_REPORTED',
          company: 'TCS',
          jobRole: 'MERN Full Stack Developer',
          retrievalStatus: 'RETRIEVED',
          reusePermissionStatus: 'RESTRICTED',
          attributionNotes: 'Candidate-reported questions on AmbitionBox. Copyright Info Edge (India) Ltd.',
          verificationNotes: 'Source verified and successfully accessed. Candidate experiences recorded for TCS.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBeDefined();
      createdSourceId = res.body.data._id;

      const sourceInDb = await InterviewSource.findById(createdSourceId);
      expect(sourceInDb?.sourceType).toBe('CANDIDATE_REPORTED');
      expect(sourceInDb?.reusePermissionStatus).toBe('RESTRICTED');
      expect(sourceInDb?.retrievalStatus).toBe('RETRIEVED');
    });

    it('1.3 registerSource: rejects non-admin users with 403 Forbidden', async () => {
      activeUser = studentUserA;
      const res = await request(app)
        .post('/api/interview/sources')
        .send({
          sourceName: 'Unauthorized Source',
          sourceUrl: 'https://example.com/questions',
          sourceType: 'PUBLIC_JOB_DESCRIPTION'
        });

      expect(res.status).toBe(403);
    });
  });

  // ==========================================
  // 2. SAFE QUESTION INGESTION & DRY-RUN TESTS
  // ==========================================
  describe('Question Ingestion Pipeline & Dry-Run Mode', () => {
    it('2.1 dryRunIngestion: reports candidates, duplicates, and canonical tags without modifying DB', async () => {
      activeUser = adminUser;
      const initialCount = await InterviewQuestion.countDocuments();

      const candidates = [
        {
          questionText: 'Which one would you choose: MongoDB or MySQL, and why for high-volume transactions?',
          type: 'TECHNICAL',
          difficulty: 'MEDIUM',
          company: 'TCS',
          jobRole: 'MERN Full Stack Developer',
          expectedKeywords: ['mongodb', 'mysql', 'nosql', 'relational', 'acid']
        },
        // Deliberate duplicate within the same batch
        {
          questionText: 'Which one would you choose: MongoDB or MySQL, and why for high-volume transactions?',
          type: 'TECHNICAL',
          difficulty: 'MEDIUM',
          company: 'TCS',
          jobRole: 'MERN Full Stack Developer'
        },
        // Invalid short text
        {
          questionText: 'Short'
        }
      ];

      const res = await request(app)
        .post('/api/interview/ingest/dry-run')
        .send({
          candidates,
          sourceId: createdSourceId,
          defaultSourceUrl: 'https://www.ambitionbox.com/interviews/tcs-interview-questions/mern-full-stack-developer',
          defaultSourceType: 'CANDIDATE_REPORTED'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const report = res.body.data;
      expect(report.dryRun).toBe(true);
      expect(report.totalCandidateQuestions).toBe(3);
      expect(report.importedCount).toBe(0); // Dry-run must NOT write to DB
      expect(report.duplicatesDetected.length).toBe(1);
      expect(report.rejectedRecords.length).toBe(1);
      expect(report.recordsRequiringReview).toBe(1);

      // Verify DB count did not change
      const postCount = await InterviewQuestion.countDocuments();
      expect(postCount).toBe(initialCount);
    });

    it('2.2 importQuestions: live imports authorized question with canonical skill tags and provenance', async () => {
      activeUser = adminUser;
      const candidates = [
        {
          questionText: 'Which one would you choose: MongoDB or MySQL, and why for high-volume transactions?',
          type: 'TECHNICAL',
          difficulty: 'MEDIUM',
          company: 'TCS',
          jobRole: 'MERN Full Stack Developer',
          interviewRound: 'TECHNICAL_ROUND_1',
          expectedKeywords: ['mongodb', 'mysql', 'nosql', 'relational', 'unstructured', 'schema'],
          sampleAnswer: 'MongoDB offers dynamic schemas and horizontal sharding, whereas MySQL guarantees ACID consistency.'
        },
        {
          questionText: 'Explain how React hooks manage state and side effects, and describe the differences between useEffect and useLayoutEffect.',
          type: 'TECHNICAL',
          difficulty: 'HARD',
          company: 'TCS',
          jobRole: 'MERN Full Stack Developer',
          interviewRound: 'TECHNICAL_ROUND_2',
          expectedKeywords: ['useeffect', 'uselayouteffect', 'hooks', 'fiber', 'paint', 'dom']
        },
        // AI Generated practice question (clearly labeled, no fake source citation)
        {
          questionText: 'Original Practice: Implement a custom debounce helper in TypeScript for TCS portal searches.',
          type: 'TECHNICAL',
          difficulty: 'MEDIUM',
          company: 'TCS',
          jobRole: 'MERN Full Stack Developer',
          sourceType: 'AI_GENERATED',
          sourceAttribution: 'Original SkillPath AI practice material',
          expectedKeywords: ['cleartimeout', 'settimeout', 'closure', 'timer']
        }
      ];

      const res = await request(app)
        .post('/api/interview/ingest/import')
        .send({
          candidates,
          sourceId: createdSourceId,
          defaultSourceUrl: 'https://www.ambitionbox.com/interviews/tcs-interview-questions/mern-full-stack-developer',
          defaultSourceType: 'CANDIDATE_REPORTED'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dryRun).toBe(false);
      expect(res.body.data.importedCount).toBe(3);

      // Verify AI generated practice question retains generatedByAI=true and contentOrigin='AI_GENERATED'
      const aiQuestion = await InterviewQuestion.findOne({ questionText: /Original Practice/ });
      expect(aiQuestion?.generatedByAI).toBe(true);
      expect(aiQuestion?.contentOrigin).toBe('AI_GENERATED');
      expect(aiQuestion?.sourceType).toBe('AI_GENERATED');
    });
  });

  // ==========================================
  // 3. QUESTION LIBRARY SEARCH & FILTERING
  // ==========================================
  describe('Question Library Multi-Dimensional Filtering', () => {
    it('3.1 searchQuestionLibrary: filters by company, role, difficulty, and sourceType', async () => {
      activeUser = studentUserA;
      const res = await request(app)
        .get('/api/interview/library/search')
        .query({
          company: 'TCS',
          role: 'MERN Full Stack Developer',
          difficulty: 'MEDIUM'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.questions).toBeDefined();
      expect(res.body.data.questions.length).toBeGreaterThanOrEqual(1);

      const q = res.body.data.questions[0];
      expect(q.company).toBe('TCS');
      expect(q.jobRole).toBe('MERN Full Stack Developer');
      expect(q.difficulty).toBe('MEDIUM');
      expect(q.sourceType).toBeDefined();
    });

    it('3.2 reviewQuestion: allows Admin to review, update verification status and notes', async () => {
      activeUser = adminUser;
      const q = await InterviewQuestion.findOne({ company: 'TCS', sourceType: 'CANDIDATE_REPORTED' });
      expect(q).toBeDefined();

      const res = await request(app)
        .patch(`/api/interview/library/${q!._id}/review`)
        .send({
          verificationStatus: 'VERIFIED',
          verificationNotes: 'Reviewed by senior architect. Accurate candidate-reported TCS benchmark.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe('VERIFIED');
      expect(res.body.data.verificationNotes).toContain('Reviewed by senior architect');
    });
  });

  // ==========================================
  // 4. ADAPTIVE INTERVIEW ENGINE & PROVENANCE SNAPSHOTS
  // ==========================================
  describe('Adaptive Interview Engine & Rubrics', () => {
    it('4.1 setupInterview: COMPANY_PRACTICE mode selects TCS questions with provenance snapshots and selectionReason', async () => {
      activeUser = studentUserA;
      const res = await request(app)
        .post('/api/interview/setup')
        .send({
          sessionMode: 'COMPANY_PRACTICE',
          company: 'TCS',
          role: 'MERN Full Stack Developer',
          type: 'TECHNICAL',
          difficulty: 'MEDIUM',
          questionCount: 3
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const attempt = res.body.data;
      createdAttemptId = attempt._id;
      expect(attempt.sessionMode).toBe('COMPANY_PRACTICE');
      expect(attempt.company).toBe('TCS');
      expect(attempt.jobRole).toBe('MERN Full Stack Developer');
      expect(attempt.questions.length).toBeGreaterThanOrEqual(1);

      // Verify provenance snapshot stored in attempt question
      const q = attempt.questions[0];
      expect(q.selectionReason).toBeDefined();
      expect(q.sourceType).toBeDefined();
      expect(q.evaluationMethod).toBe('DETERMINISTIC_RUBRIC');
    });

    it('4.2 submitAnswer: evaluates answer against rubric and generates adaptive follow-up when weakness detected', async () => {
      activeUser = studentUserA;
      // Weak answer missing core keywords on question 0
      const weakAnswer = 'I like mongo because it is fast.';

      const res = await request(app)
        .post(`/api/interview/${createdAttemptId}/answer`)
        .send({
          questionIndex: 0,
          studentAnswer: weakAnswer,
          timeSpentSeconds: 35
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const evalResult = res.body.evaluation;
      expect(evalResult.technical).toBeLessThan(60);
      expect(evalResult.missedKeywords.length).toBeGreaterThan(0);

      // Verify adaptive follow-up question was generated and persisted
      expect(res.body.followUpGenerated).toBe(true);
      const followUp = res.body.followUpQuestion;
      expect(followUp.isFollowUp).toBe(true);
      expect(followUp.sourceType).toBe('AI_GENERATED');
      expect(followUp.parentQuestionIndex).toBe(0);
      expect(followUp.questionText).toContain('Adaptive Follow-Up');

      const updatedAttempt = await InterviewAttempt.findById(createdAttemptId);
      expect(updatedAttempt?.questions.some(q => q.isFollowUp)).toBe(true);
    });

    it('4.3 completeInterview: updates Career Twin, calibrates proficiencies, and injects remediation with prerequisite ordering', async () => {
      activeUser = studentUserA;
      const res = await request(app)
        .post(`/api/interview/${createdAttemptId}/complete`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const completed = res.body.data;
      expect(completed.status).toBe('COMPLETED');
      expect(completed.scores.overall).toBeDefined();
      expect(completed.careerTwinImpact).toBeDefined();

      // Verify Career Twin on StudentProfile
      const profile = await StudentProfile.findById(studentProfileAId);
      expect(profile?.interviewStats?.totalInterviews).toBe(2);
      expect(profile?.careerTwin).toBeDefined();

      // Verify LearningPath received injected remediation item with prerequisite ordering
      const path = await LearningPath.findOne({ studentId: studentProfileAId, status: 'ACTIVE' });
      expect(path).toBeDefined();

      const remediationItems = path?.items.filter(i => i.isAdaptiveRemediation);
      expect(remediationItems?.length).toBeGreaterThan(0);

      // Prerequisite check: If React was remediated, it must follow HTML
      const htmlIdx = path?.items.findIndex(i => i.skillName === 'HTML');
      const reactRemediationIdx = path?.items.findIndex(i => i.skillName === 'React' && i.isAdaptiveRemediation);
      if (htmlIdx !== -1 && reactRemediationIdx !== -1) {
        expect(reactRemediationIdx).toBeGreaterThan(htmlIdx!);
      }
    });
  });

  // ==========================================
  // 5. SECURITY & OWNERSHIP ENFORCEMENT
  // ==========================================
  describe('Security & Ownership Enforcement', () => {
    it('5.1 Attempt Ownership: Student B cannot submit answers to Student A attempt (404 / Forbidden)', async () => {
      activeUser = studentUserB; // Switch to Student B
      const res = await request(app)
        .post(`/api/interview/${createdAttemptId}/answer`)
        .send({
          questionIndex: 0,
          studentAnswer: 'Infiltrated answer'
        });

      expect(res.status).toBe(404); // Attempt not found under Student B's ownership
    });

    it('5.2 Attempt Ownership: Student B cannot view Student A completed report', async () => {
      activeUser = studentUserB;
      const res = await request(app).get(`/api/interview/${createdAttemptId}`);
      expect(res.status).toBe(404);
    });
  });
});
