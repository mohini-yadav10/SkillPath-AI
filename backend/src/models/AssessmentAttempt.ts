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
    completedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<IAssessmentAttempt>('AssessmentAttempt', assessmentAttemptSchema);
