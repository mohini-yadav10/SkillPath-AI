import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewQuestion extends Document {
  questionText: string;
  type: 'TECHNICAL' | 'HR' | 'MIXED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  relatedSkill?: mongoose.Types.ObjectId;
  roles?: string[];
  companies?: string[];
  expectedKeywords: string[];
}

const interviewQuestionSchema = new Schema(
  {
    questionText: { type: String, required: true },
    type: { type: String, enum: ['TECHNICAL', 'HR', 'MIXED'], required: true },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
    relatedSkill: { type: Schema.Types.ObjectId, ref: 'Skill' },
    roles: [{ type: String }],
    companies: [{ type: String }],
    expectedKeywords: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model<IInterviewQuestion>('InterviewQuestion', interviewQuestionSchema);
