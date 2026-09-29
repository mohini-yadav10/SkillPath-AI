import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import express from 'express';
import assessmentRoutes from '../routes/assessmentRoutes';
import StudentProfile from '../models/StudentProfile';
import User from '../models/User';
import Skill from '../models/Skill';
import Question from '../models/Question';
import jwt from 'jsonwebtoken';

let mongoServer: MongoMemoryServer;
const app = express();

app.use(express.json());

// Mock auth middleware for the test app
const mockAuth = (req: any, res: any, next: any) => {
  req.user = { id: globalUserId };
  next();
};

// Insert mock auth before routes
app.use('/api/assessments', mockAuth, assessmentRoutes);

let globalUserId: mongoose.Types.ObjectId;
let testSkillId: mongoose.Types.ObjectId;
let attemptId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const user = await User.create({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    passwordHash: 'hash',
    role: 'STUDENT'
  });
  globalUserId = user._id as mongoose.Types.ObjectId;

  const skill = await Skill.create({
    name: 'Python',
    category: 'TECHNICAL',
    description: 'Python lang'
  });
  testSkillId = skill._id as mongoose.Types.ObjectId;

  await StudentProfile.create({
    userId: user._id,
    skills: []
  });

  // Seed 3 questions (1 EASY, 1 MEDIUM, 1 HARD)
  await Question.create({
    skillId: testSkillId,
    questionText: 'EASY Q',
    difficulty: 'EASY',
    options: ['A', 'B', 'C'],
    correctOptionIndex: 0,
    explanation: 'A is right'
  });

  await Question.create({
    skillId: testSkillId,
    questionText: 'MEDIUM Q',
    difficulty: 'MEDIUM',
    options: ['A', 'B', 'C'],
    correctOptionIndex: 1,
    explanation: 'B is right'
  });

  await Question.create({
    skillId: testSkillId,
    questionText: 'HARD Q',
    difficulty: 'HARD',
    options: ['A', 'B', 'C'],
    correctOptionIndex: 2,
    explanation: 'C is right'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('E2E Assessment Flow', () => {
  it('should list available assessments', async () => {
    const res = await request(app).get('/api/assessments');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Python');
  });

  it('should start an assessment with a MEDIUM question', async () => {
    const res = await request(app).post('/api/assessments/start').send({ skillId: testSkillId });
    expect(res.status).toBe(201);
    expect(res.body.data.question.difficulty).toBe('MEDIUM');
    expect(res.body.data.question.correctOptionIndex).toBeUndefined(); // shouldn't leak
    attemptId = res.body.data.attemptId;
  });

  it('should submit an answer and advance adaptively (correct -> HARD)', async () => {
    const startRes = await request(app).post('/api/assessments/start').send({ skillId: testSkillId });
    const aId = startRes.body.data.attemptId;
    const qId = startRes.body.data.question._id;

    // Submit correct answer for MEDIUM (which is index 1)
    const res = await request(app).post(`/api/assessments/${aId}/submit`).send({
      questionId: qId,
      selectedOptionIndex: 1,
      timeTakenSeconds: 10
    });

    expect(res.status).toBe(200);
    expect(res.body.data.completed).toBe(false);
    expect(res.body.data.question.difficulty).toBe('HARD');
  });

  it('should submit an answer and advance adaptively (incorrect -> EASY)', async () => {
    const startRes = await request(app).post('/api/assessments/start').send({ skillId: testSkillId });
    const aId = startRes.body.data.attemptId;
    const qId = startRes.body.data.question._id;

    // Submit incorrect answer for MEDIUM
    const res = await request(app).post(`/api/assessments/${aId}/submit`).send({
      questionId: qId,
      selectedOptionIndex: 0,
      timeTakenSeconds: 10
    });

    expect(res.status).toBe(200);
    expect(res.body.data.completed).toBe(false);
    expect(res.body.data.question.difficulty).toBe('EASY');
  });

  it('should fetch the final result safely', async () => {
    const res = await request(app).get(`/api/assessments/${attemptId}/result`);
    expect(res.status).toBe(200);
    expect(res.body.data.skillId.name).toBe('Python');
    expect(res.body.data.questions.length).toBeGreaterThan(0);
    expect(res.body.data.questions[0].questionId.questionText).toBe('MEDIUM Q');
    expect(res.body.data.questions[0].difficulty).toBe('MEDIUM');
  });
});
