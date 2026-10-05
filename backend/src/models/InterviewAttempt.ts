import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewAttempt extends Document {
  studentId: mongoose.Types.ObjectId;
  targetRoleId?: mongoose.Types.ObjectId;
  type: 'TECHNICAL' | 'HR' | 'MIXED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'IN_PROGRESS' | 'COMPLETED';
  questions: {
    questionId: mongoose.Types.ObjectId;
    questionText: string;
    relatedSkill?: mongoose.Types.ObjectId;
    expectedKeywords: string[];
    studentAnswer?: string;
    timeSpentSeconds?: number;
    techScore?: number;
    commScore?: number;
    relScore?: number;
    feedback?: string;
  }[];
  scores?: {
    technical: number;
    relevance: number;
    communication: number;
    overall: number;
  };
  strengths?: string[];
  weaknesses?: {
    skillId?: mongoose.Types.ObjectId;
    skillName: string;
    feedback: string;
  }[];
}

const interviewAttemptSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetRoleId: { type: Schema.Types.ObjectId, ref: 'JobRole' },
    type: { type: String, enum: ['TECHNICAL', 'HR', 'MIXED'], required: true },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
    status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED'], default: 'IN_PROGRESS' },
    questions: [{
      questionId: { type: Schema.Types.ObjectId, ref: 'InterviewQuestion' },
      questionText: String,
      relatedSkill: { type: Schema.Types.ObjectId, ref: 'Skill' },
      expectedKeywords: [String],
      studentAnswer: String,
      timeSpentSeconds: Number,
      techScore: Number,
      commScore: Number,
      relScore: Number,
      feedback: String
    }],
    scores: {
      technical: Number,
      relevance: Number,
      communication: Number,
      overall: Number
    },
    strengths: [String],
    weaknesses: [{
      skillId: { type: Schema.Types.ObjectId, ref: 'Skill' },
      skillName: String,
      feedback: String
    }]
  },
  { timestamps: true }
);

export default mongoose.model<IInterviewAttempt>('InterviewAttempt', interviewAttemptSchema);
