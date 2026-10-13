import mongoose, { Document, Schema } from 'mongoose';
import { SourceTypeEnum, VerificationStatusEnum } from './InterviewQuestion';

export type SessionModeEnum =
  | 'COMPANY_PRACTICE'
  | 'SKILL_GAP_PRACTICE'
  | 'ADAPTIVE_MOCK'
  | 'TOPIC_PRACTICE';

export interface IInterviewAttempt extends Document {
  studentId: mongoose.Types.ObjectId;
  targetRoleId?: mongoose.Types.ObjectId;
  company?: string;
  jobRole?: string;
  sessionMode: SessionModeEnum;
  type: 'TECHNICAL' | 'HR' | 'MIXED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'IN_PROGRESS' | 'COMPLETED';
  questions: {
    questionId?: mongoose.Types.ObjectId;
    questionText: string;
    relatedSkill?: mongoose.Types.ObjectId;
    skillTags?: mongoose.Types.ObjectId[];
    expectedKeywords: string[];
    source?: 'VERIFIED_PUBLIC' | 'AI_GENERATED';
    sourceType?: SourceTypeEnum;
    sourceUrl?: string;
    sourceAttribution?: string;
    verificationStatus?: VerificationStatusEnum;
    category?: string;
    topic?: string;
    interviewRound?: string;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    selectionReason?: string;
    isFollowUp?: boolean;
    parentQuestionIndex?: number;
    evaluationMethod?: 'DETERMINISTIC_RUBRIC' | 'CODE_TEST_EVALUATION' | 'AI_ASSISTED' | 'MANUAL_REVIEW';
    evaluationConfidence?: number;
    codeTestCase?: {
      input: string;
      expectedOutput: string;
      description?: string;
    };
    rubricCriteria?: string[];
    studentAnswer?: string;
    timeSpentSeconds?: number;
    techScore?: number;
    commScore?: number;
    relScore?: number;
    feedback?: string;
    rubricBreakdown?: {
      technical: number;
      communication: number;
      relevance: number;
      matchedKeywords: string[];
      missedKeywords: string[];
      detailedAnalysis?: string;
    };
    codeEvaluation?: {
      testPassed?: boolean;
      output?: string;
      codeStyleNotes?: string;
    };
  }[];
  scores?: {
    technical: number;
    relevance: number;
    communication: number;
    overall: number;
  };
  overallScore?: number;
  strengths?: string[];
  weaknesses?: {
    skillId?: mongoose.Types.ObjectId;
    skillName: string;
    feedback: string;
  }[];
  careerTwinImpact?: {
    previousReadiness?: number;
    updatedReadiness?: number;
    archetype?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const interviewAttemptSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetRoleId: { type: Schema.Types.ObjectId, ref: 'JobRole' },
    company: { type: String, trim: true },
    jobRole: { type: String, trim: true },
    sessionMode: {
      type: String,
      enum: ['COMPANY_PRACTICE', 'SKILL_GAP_PRACTICE', 'ADAPTIVE_MOCK', 'TOPIC_PRACTICE'],
      default: 'ADAPTIVE_MOCK'
    },
    type: { type: String, enum: ['TECHNICAL', 'HR', 'MIXED'], required: true },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
    status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED'], default: 'IN_PROGRESS' },
    questions: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'InterviewQuestion' },
        questionText: { type: String, required: true },
        relatedSkill: { type: Schema.Types.ObjectId, ref: 'Skill' },
        skillTags: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
        expectedKeywords: [{ type: String }],
        source: {
          type: String,
          enum: ['VERIFIED_PUBLIC', 'AI_GENERATED'],
          default: 'VERIFIED_PUBLIC'
        },
        sourceType: {
          type: String,
          enum: [
            'OFFICIAL_COMPANY',
            'CANDIDATE_REPORTED',
            'PUBLIC_JOB_DESCRIPTION',
            'LICENSED_DATASET',
            'ADMIN_AUTHORED',
            'AI_GENERATED'
          ]
        },
        sourceUrl: { type: String },
        sourceAttribution: { type: String },
        verificationStatus: {
          type: String,
          enum: ['UNVERIFIED', 'SOURCE_REVIEWED', 'VERIFIED', 'NEEDS_REVIEW', 'RETIRED']
        },
        category: { type: String, default: 'General' },
        topic: { type: String },
        interviewRound: { type: String },
        difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'] },
        selectionReason: { type: String },
        isFollowUp: { type: Boolean, default: false },
        parentQuestionIndex: { type: Number },
        evaluationMethod: {
          type: String,
          enum: ['DETERMINISTIC_RUBRIC', 'CODE_TEST_EVALUATION', 'AI_ASSISTED', 'MANUAL_REVIEW'],
          default: 'DETERMINISTIC_RUBRIC'
        },
        evaluationConfidence: { type: Number, default: 85 },
        codeTestCase: {
          input: { type: String },
          expectedOutput: { type: String },
          description: { type: String }
        },
        rubricCriteria: [{ type: String }],
        studentAnswer: { type: String },
        timeSpentSeconds: { type: Number },
        techScore: { type: Number },
        commScore: { type: Number },
        relScore: { type: Number },
        feedback: { type: String },
        rubricBreakdown: {
          technical: { type: Number },
          communication: { type: Number },
          relevance: { type: Number },
          matchedKeywords: [{ type: String }],
          missedKeywords: [{ type: String }],
          detailedAnalysis: { type: String }
        },
        codeEvaluation: {
          testPassed: { type: Boolean },
          output: { type: String },
          codeStyleNotes: { type: String }
        }
      }
    ],
    scores: {
      technical: Number,
      relevance: Number,
      communication: Number,
      overall: Number
    },
    strengths: [String],
    weaknesses: [
      {
        skillId: { type: Schema.Types.ObjectId, ref: 'Skill' },
        skillName: String,
        feedback: String
      }
    ],
    careerTwinImpact: {
      previousReadiness: Number,
      updatedReadiness: Number,
      archetype: String
    }
  },
  { timestamps: true }
);

interviewAttemptSchema.index({ studentId: 1, createdAt: -1 });
interviewAttemptSchema.index({ company: 1, jobRole: 1 });
interviewAttemptSchema.index({ status: 1 });

export default mongoose.model<IInterviewAttempt>('InterviewAttempt', interviewAttemptSchema);
