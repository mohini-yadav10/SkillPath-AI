import mongoose, { Document, Schema } from 'mongoose';

export interface IAssessmentAttempt extends Document {
  studentId: mongoose.Types.ObjectId;
  skillId: mongoose.Types.ObjectId;
  questions: Array<{
    questionId: mongoose.Types.ObjectId;
    selectedOptionIndex?: number;
    isCorrect?: boolean;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    timeTakenSeconds?: number;
  }>;
  isCompleted: boolean;
  score: number;
  accuracy: number;
  totalTimeTaken: number;
  startedAt: Date;
  completedAt?: Date;
  isProctored?: boolean;
  proctoring?: {
    status: 'SETUP' | 'ACTIVE' | 'AWAITING_REVIEW' | 'REVIEWED';
    events: Array<{
      eventType: string;
      severity: 'LOW_REVIEW' | 'MEDIUM_REVIEW' | 'HIGH_REVIEW' | 'CLEAR';
      confidence: number;
      timestamp: Date;
      description: string;
    }>;
    reviewStatus?: 'APPROVED' | 'REJECTED' | 'REQUEST_RETEST' | 'PENDING';
    reviewerNotes?: string;
    lastHeartbeat?: Date;
  };
}

const assessmentAttemptSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
    questions: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
        selectedOptionIndex: { type: Number },
        isCorrect: { type: Boolean },
        difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
        timeTakenSeconds: { type: Number }
      }
    ],
    isCompleted: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    totalTimeTaken: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    isProctored: { type: Boolean, default: false },
    proctoring: {
      status: { type: String, enum: ['SETUP', 'ACTIVE', 'AWAITING_REVIEW', 'REVIEWED'], default: 'SETUP' },
      events: [{
        eventType: { type: String },
        severity: { type: String, enum: ['LOW_REVIEW', 'MEDIUM_REVIEW', 'HIGH_REVIEW', 'CLEAR'] },
        confidence: { type: Number },
        timestamp: { type: Date, default: Date.now },
        description: { type: String }
      }],
      reviewStatus: { type: String, enum: ['APPROVED', 'REJECTED', 'REQUEST_RETEST', 'PENDING'], default: 'PENDING' },
      reviewerNotes: { type: String },
      lastHeartbeat: { type: Date }
    }
  },
  { timestamps: true }
);

export default mongoose.model<IAssessmentAttempt>('AssessmentAttempt', assessmentAttemptSchema);
