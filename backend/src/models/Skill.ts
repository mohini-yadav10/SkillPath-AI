import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: 'TECHNICAL' | 'SOFT';
  description?: string;
}

const skillSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, enum: ['TECHNICAL', 'SOFT'], default: 'TECHNICAL' },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISkill>('Skill', skillSchema);
