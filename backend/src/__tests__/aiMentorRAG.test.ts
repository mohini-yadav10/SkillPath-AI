import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import express from 'express';
import mentorRoutes from '../routes/mentorRoutes';
import StudentProfile from '../models/StudentProfile';
import User from '../models/User';
import Skill from '../models/Skill';
import JobRole from '../models/JobRole';
import StudentDocument from '../models/StudentDocument';
import MentorMessage from '../models/MentorMessage';

let mongoServer: MongoMemoryServer;
const app = express();

let globalUserId: mongoose.Types.ObjectId;

vi.mock('../middleware/auth', () => ({
  protect: (req: any, _res: any, next: any) => {
    req.user = { id: globalUserId };
    next();
  },
  authorize: () => (_req: any, _res: any, next: any) => next()
}));

app.use(express.json());
app.use('/api/mentor', mentorRoutes);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const user = await User.create({
    firstName: 'Mentor',
    lastName: 'Tester',
    email: 'mentor@test.com',
    passwordHash: 'hash',
    role: 'STUDENT'
  });
  globalUserId = user._id as mongoose.Types.ObjectId;

  const role = await JobRole.create({
    title: 'Cloud Architect',
    description: 'Cloud systems and distributed architecture'
  });

  const skill = await Skill.create({
    name: 'Kubernetes',
    category: 'DEVOPS',
    level: 'ADVANCED'
  });

  await StudentProfile.create({
    userId: globalUserId,
    targetRole: role._id,
    careerReadinessScore: 70,
    skills: [{ skillId: skill._id, proficiency: 45, confidenceScore: 50, source: 'SELF_DECLARED' }]
  });

  // Seed sample indexed syllabus document
  await StudentDocument.create({
    userId: globalUserId,
    fileName: 'Cloud_Syllabus.txt',
    fileSize: 1024,
    fileType: 'SYLLABUS',
    summary: 'Cloud syllabus overview covering Kubernetes and Docker microservices.',
    chunks: [
      {
        chunkIndex: 0,
        text: 'Module 3 covers Kubernetes pod networking, service meshes, and Helm deployments in production.',
        keywords: ['kubernetes', 'networking', 'service', 'helm', 'deployment']
      }
    ],
    totalChunks: 1
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Phase D: AI Learning Assistant (RAG) & Mentor Flow', () => {
  it('should list indexed knowledge documents', async () => {
    const res = await request(app).get('/api/mentor/documents');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].fileName).toBe('Cloud_Syllabus.txt');
  });

  it('should chat with AI Mentor retrieving document citations and Career Twin data', async () => {
    const res = await request(app)
      .post('/api/mentor/chat')
      .send({ message: 'Explain Kubernetes pod networking from my syllabus.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('ASSISTANT');
    expect(res.body.data.content).toBeDefined();
    expect(res.body.data.contextSources).toContain('Cloud_Syllabus.txt');
  });

  it('should retrieve conversation history and clear it safely', async () => {
    const historyRes = await request(app).get('/api/mentor/history');
    expect(historyRes.status).toBe(200);
    expect(historyRes.body.data.length).toBeGreaterThanOrEqual(2); // 1 User + 1 Assistant

    const clearRes = await request(app).delete('/api/mentor/history');
    expect(clearRes.status).toBe(200);

    const checkRes = await request(app).get('/api/mentor/history');
    expect(checkRes.body.data.length).toBe(0);
  });
});
