import mongoose, { Document, Schema } from 'mongoose';

export interface ILearningResource extends Document {
  title: string;
  provider: string;
  url: string;
  skillId: mongoose.Types.ObjectId;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  type: 'VIDEO' | 'COURSE' | 'ARTICLE' | 'DOCUMENTATION' | 'PRACTICE';
  durationMinutes?: number;
}

const learningResourceSchema = new Schema(
  {
    title: { type: String, required: true },
    provider: { type: String, required: true },
    url: { type: String, required: true },
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
    difficulty: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], required: true },
    type: { type: String, enum: ['VIDEO', 'COURSE', 'ARTICLE', 'DOCUMENTATION', 'PRACTICE'], required: true },
    durationMinutes: { type: Number }
  },
  { timestamps: true }
);

export default mongoose.model<ILearningResource>('LearningResource', learningResourceSchema);
