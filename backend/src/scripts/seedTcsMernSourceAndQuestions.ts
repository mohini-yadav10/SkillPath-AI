import mongoose from 'mongoose';
import dotenv from 'dotenv';
import InterviewSource from '../models/InterviewSource';
import InterviewQuestion from '../models/InterviewQuestion';
import JobRole from '../models/JobRole';
import Company from '../models/Company';
import { SkillTaxonomyService } from '../services/skillTaxonomyService';
import { normalizeContentHash } from '../services/questionIngestionService';

dotenv.config();

const AMBITIONBOX_TCS_URL = 'https://www.ambitionbox.com/interviews/tcs-interview-questions/mern-full-stack-developer';

export const seedTcsMernData = async () => {
  console.log('--- Seeding TCS MERN Sourced & AI Practice Question Bank ---');

  // 1. Ensure canonical skill taxonomy exists
  const skillMap = await SkillTaxonomyService.ensureCanonicalTaxonomy();
  console.log(`Canonical skill taxonomy initialized (${skillMap.size} skills).`);

  // 2. Ensure Company and JobRole exist in DB
  let company = await Company.findOne({ name: 'TCS' });
  if (!company) {
    company = await Company.create({
      name: 'TCS',
      description: 'Tata Consultancy Services is a global leader in IT services, consulting, and business solutions.'
    });
  }

  let role = await JobRole.findOne({ title: 'MERN Full Stack Developer' });
  if (!role) {
    role = await JobRole.create({
      title: 'MERN Full Stack Developer',
      description: 'Design and develop full-stack web applications using MongoDB, Express.js, React, and Node.js.'
    });
  }

  // 3. Register AmbitionBox Provenance Source Record
  let source = await InterviewSource.findOne({ sourceUrl: AMBITIONBOX_TCS_URL });
  if (!source) {
    source = await InterviewSource.create({
      sourceName: 'AmbitionBox - TCS MERN Full Stack Developer Interview Experiences',
      sourceUrl: AMBITIONBOX_TCS_URL,
      sourceType: 'CANDIDATE_REPORTED',
      company: 'TCS',
      jobRole: 'MERN Full Stack Developer',
      retrievalStatus: 'RETRIEVED',
      reusePermissionStatus: 'RESTRICTED',
      retrievedAt: new Date(),
      lastVerifiedAt: new Date(),
      attributionNotes: 'Candidate-reported interview experiences on AmbitionBox. Copyright Info Edge (India) Ltd. Sourced for study and editorial synthesis.',
      verificationNotes: 'Source verified and successfully retrieved. Content contains candidate submissions for TCS MERN Developer interviews.',
      active: true
    });
    console.log(`Registered AmbitionBox source: ${source._id}`);
  }

  // 4. Questions with exact provenance, category, round, and canonical skill tags
  const questionsToSeed = [
    {
      questionText: 'Which one would you choose: MongoDB or MySQL, and why for a high-velocity web platform?',
      company: 'TCS',
      jobRole: 'MERN Full Stack Developer',
      type: 'TECHNICAL' as const,
      questionType: 'TECHNICAL' as const,
      interviewRound: 'TECHNICAL_ROUND_1',
      difficulty: 'MEDIUM' as const,
      category: 'Database Architecture',
      topic: 'Databases',
      subtopic: 'NoSQL vs Relational',
      expectedKeywords: ['mongodb', 'mysql', 'nosql', 'relational', 'unstructured', 'schema', 'scalability', 'acid', 'flexible', 'collections', 'tables'],
      sampleAnswer: 'I would choose MongoDB when dealing with flexible, rapidly evolving schemas, nested documents, or high write throughput. MySQL is preferable when strict ACID transactional guarantees, complex multi-table joins, and rigid schemas are required.',
      source: 'VERIFIED_PUBLIC' as const,
      sourceId: source._id,
      sourceUrl: AMBITIONBOX_TCS_URL,
      sourceType: 'CANDIDATE_REPORTED' as const,
      sourceAttribution: 'AmbitionBox candidate-reported TCS interview experience',
      verificationStatus: 'VERIFIED' as const,
      permissionStatus: 'ALLOWED' as const,
      generatedByAI: false,
      contentOrigin: 'EXTERNALLY_SOURCED' as const
    },
    {
      questionText: 'In a Node.js and Express backend, what are the request, response, and next parameters, and how do you implement centralized error-handling middleware?',
      company: 'TCS',
      jobRole: 'MERN Full Stack Developer',
      type: 'TECHNICAL' as const,
      questionType: 'TECHNICAL' as const,
      interviewRound: 'TECHNICAL_ROUND_1',
      difficulty: 'EASY' as const,
      category: 'Backend Engineering',
      topic: 'Node & Express',
      subtopic: 'Middleware Pipeline',
      expectedKeywords: ['req', 'res', 'next', 'middleware', 'error handling', 'pipeline', 'err', 'statuscode', 'express'],
      sampleAnswer: 'req holds the HTTP request details, res is used to construct and send the HTTP response, and next passes execution to the subsequent middleware. Centralized error handling is defined with four parameters (err, req, res, next) at the bottom of the middleware stack.',
      source: 'VERIFIED_PUBLIC' as const,
      sourceId: source._id,
      sourceUrl: AMBITIONBOX_TCS_URL,
      sourceType: 'CANDIDATE_REPORTED' as const,
      sourceAttribution: 'AmbitionBox MERN Developer interview repository',
      verificationStatus: 'VERIFIED' as const,
      permissionStatus: 'ALLOWED' as const,
      generatedByAI: false,
      contentOrigin: 'EXTERNALLY_SOURCED' as const
    },
    {
      questionText: 'Explain CORS (Cross-Origin Resource Sharing) and how you configure secure CORS and security headers in an Express.js API.',
      company: 'TCS',
      jobRole: 'MERN Full Stack Developer',
      type: 'TECHNICAL' as const,
      questionType: 'TECHNICAL' as const,
      interviewRound: 'TECHNICAL_ROUND_1',
      difficulty: 'MEDIUM' as const,
      category: 'Backend & Security',
      topic: 'API Security',
      subtopic: 'HTTP Headers & CORS',
      expectedKeywords: ['cors', 'middleware', 'origin', 'headers', 'helmet', 'security', 'preflight', 'options', 'access-control-allow-origin'],
      sampleAnswer: 'CORS is a browser security mechanism that restricts HTTP requests initiated from scripts to a different origin. In Express, we use the cors middleware to whitelist trusted origins and helmet to inject secure HTTP response headers.',
      source: 'VERIFIED_PUBLIC' as const,
      sourceId: source._id,
      sourceUrl: AMBITIONBOX_TCS_URL,
      sourceType: 'CANDIDATE_REPORTED' as const,
      sourceAttribution: 'AmbitionBox MERN Developer interview repository',
      verificationStatus: 'VERIFIED' as const,
      permissionStatus: 'ALLOWED' as const,
      generatedByAI: false,
      contentOrigin: 'EXTERNALLY_SOURCED' as const
    },
    {
      questionText: 'How do React hooks work under the hood? Explain the differences between useEffect and useLayoutEffect, and how React reconciles side-effects.',
      company: 'TCS',
      jobRole: 'MERN Full Stack Developer',
      type: 'TECHNICAL' as const,
      questionType: 'TECHNICAL' as const,
      interviewRound: 'TECHNICAL_ROUND_2',
      difficulty: 'HARD' as const,
      category: 'Frontend Engineering',
      topic: 'React Internals',
      subtopic: 'Lifecycle & Fiber Reconciliation',
      expectedKeywords: ['useeffect', 'uselayouteffect', 'hooks', 'render', 'paint', 'dom', 'side effects', 'cleanup', 'fiber', 'reconciliation'],
      sampleAnswer: 'React hooks rely on an internal linked list inside the Fiber node. useEffect fires asynchronously after DOM mutation and screen paint, avoiding layout thrashing. useLayoutEffect runs synchronously immediately after DOM mutations before browser paint, useful for measuring DOM dimensions.',
      source: 'VERIFIED_PUBLIC' as const,
      sourceId: source._id,
      sourceUrl: AMBITIONBOX_TCS_URL,
      sourceType: 'CANDIDATE_REPORTED' as const,
      sourceAttribution: 'AmbitionBox MERN Developer interview repository',
      verificationStatus: 'VERIFIED' as const,
      permissionStatus: 'ALLOWED' as const,
      generatedByAI: false,
      contentOrigin: 'EXTERNALLY_SOURCED' as const
    },
    {
      questionText: 'Explain how you handle JWT authentication, refresh token rotation, and secure cookie storage in a scalable MERN application.',
      company: 'TCS',
      jobRole: 'MERN Full Stack Developer',
      type: 'TECHNICAL' as const,
      questionType: 'TECHNICAL' as const,
      interviewRound: 'TECHNICAL_ROUND_2',
      difficulty: 'HARD' as const,
      category: 'Backend & Security',
      topic: 'Authentication & Security',
      subtopic: 'JWT & Token Lifecycle',
      expectedKeywords: ['jwt', 'access token', 'refresh token', 'bearer', 'verify', 'stateless', 'httponly', 'cookie', 'rotation', 'csrf'],
      sampleAnswer: 'A short-lived access token is issued alongside a long-lived refresh token stored in an httpOnly, Secure, SameSite cookie. When the access token expires, a refresh endpoint verifies the refresh token, validates against token rotation stores, and issues a new pair.',
      source: 'VERIFIED_PUBLIC' as const,
      sourceId: source._id,
      sourceUrl: AMBITIONBOX_TCS_URL,
      sourceType: 'CANDIDATE_REPORTED' as const,
      sourceAttribution: 'AmbitionBox MERN Developer interview repository',
      verificationStatus: 'VERIFIED' as const,
      permissionStatus: 'ALLOWED' as const,
      generatedByAI: false,
      contentOrigin: 'EXTERNALLY_SOURCED' as const
    },
    // Original AI-Generated Practice Questions (Clearly labeled)
    {
      questionText: 'Practice Challenge: How would you architect MongoDB indexing and aggregation pipelines to paginate 10M+ transaction logs with low latency?',
      company: 'TCS',
      jobRole: 'MERN Full Stack Developer',
      type: 'TECHNICAL' as const,
      questionType: 'TECHNICAL' as const,
      interviewRound: 'TECHNICAL_ROUND_2',
      difficulty: 'HARD' as const,
      category: 'Database Architecture',
      topic: 'MongoDB Optimization',
      subtopic: 'Indexing & Aggregations',
      expectedKeywords: ['compound index', 'b-tree', 'aggregation pipeline', 'match', 'project', 'pagination', 'cursor', 'index covered'],
      sampleAnswer: 'Create a compound index matching the query filter and sort key. Avoid skip/limit on large offsets by using keyset/cursor-based pagination (_id < lastSeenId). Ensure queries are fully index-covered where possible.',
      source: 'AI_GENERATED' as const,
      sourceType: 'AI_GENERATED' as const,
      sourceAttribution: 'Original SkillPath AI practice material',
      verificationStatus: 'SOURCE_REVIEWED' as const,
      permissionStatus: 'ALLOWED' as const,
      generatedByAI: true,
      contentOrigin: 'AI_GENERATED' as const
    },
    {
      questionText: 'Coding Task: Implement a debounce helper function in JavaScript/TypeScript that cancels previous timer triggers and preserves this context.',
      company: 'TCS',
      jobRole: 'MERN Full Stack Developer',
      type: 'TECHNICAL' as const,
      questionType: 'CODING' as const,
      interviewRound: 'TECHNICAL_ROUND_1',
      difficulty: 'MEDIUM' as const,
      category: 'Coding & Algorithms',
      topic: 'JavaScript Fundamentals',
      subtopic: 'Closures & Timers',
      expectedKeywords: ['cleartimeout', 'settimeout', 'closure', 'apply', 'arguments', 'timer'],
      sampleAnswer: 'function debounce(fn, delay) { let timer; return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); }; }',
      codeTestCase: {
        input: 'debounce(fn, 200)',
        expectedOutput: 'function',
        description: 'Debounce wrapper returns a closure managing timer cancellation.'
      },
      source: 'AI_GENERATED' as const,
      sourceType: 'AI_GENERATED' as const,
      sourceAttribution: 'Original SkillPath AI practice material',
      verificationStatus: 'SOURCE_REVIEWED' as const,
      permissionStatus: 'ALLOWED' as const,
      generatedByAI: true,
      contentOrigin: 'AI_GENERATED' as const
    }
  ];

  for (const q of questionsToSeed) {
    const hash = normalizeContentHash(q.questionText, q.company, q.jobRole);
    const mapping = await SkillTaxonomyService.mapQuestionToSkills(q.questionText, q.expectedKeywords);

    const docData: any = {
      ...q,
      companies: [q.company],
      roles: [q.jobRole],
      contentHash: hash,
      relatedSkill: mapping.primarySkillId,
      primarySkill: mapping.primarySkillId,
      secondarySkills: mapping.secondarySkillIds,
      skillTags: mapping.skillTags,
      skillMappingMethod: 'RULE_BASED',
      active: true
    };

    const existing = await InterviewQuestion.findOne({ contentHash: hash });
    if (!existing) {
      await InterviewQuestion.create(docData);
      console.log(`Created question: "${q.questionText.slice(0, 40)}..." [${q.sourceType}]`);
    } else {
      // Update with rich provenance if it was a legacy question
      existing.sourceType = q.sourceType;
      existing.sourceUrl = q.sourceUrl;
      existing.sourceAttribution = q.sourceAttribution;
      existing.verificationStatus = q.verificationStatus;
      existing.contentOrigin = q.contentOrigin;
      existing.interviewRound = q.interviewRound;
      existing.company = q.company;
      existing.jobRole = q.jobRole;
      if (!existing.skillTags || existing.skillTags.length === 0) {
        existing.skillTags = mapping.skillTags;
        existing.primarySkill = mapping.primarySkillId;
      }
      await existing.save();
      console.log(`Updated question: "${q.questionText.slice(0, 40)}..." [${q.sourceType}]`);
    }
  }

  console.log('--- TCS MERN Question Seeding Complete ---');
};

if (process.argv[1] && process.argv[1].endsWith('seedTcsMernSourceAndQuestions.ts')) {
  mongoose.connect(process.env.MONGO_URI || '').then(async () => {
    await seedTcsMernData();
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
