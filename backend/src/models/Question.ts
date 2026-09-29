import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  skillId: mongoose.Types.ObjectId;
  questionText: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  topic?: string;
  timeLimitSeconds?: number;
}

const questionSchema = new Schema(
  {
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
    questionText: { type: String, required: true },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
    topic: { type: String },
    timeLimitSeconds: { type: Number, default: 60 }
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>('Question', questionSchema);
