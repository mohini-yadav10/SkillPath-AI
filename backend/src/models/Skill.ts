import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: 'TECHNICAL' | 'SOFT' | 'FRAMEWORK' | 'DATABASE' | 'DEVOPS';
  level: 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED';
  domain?: string;
  description?: string;
  prerequisites: mongoose.Types.ObjectId[];
}

const skillSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { 
      type: String, 
      enum: ['TECHNICAL', 'SOFT', 'FRAMEWORK', 'DATABASE', 'DEVOPS'], 
      default: 'TECHNICAL' 
    },
    level: {
      type: String,
      enum: ['FOUNDATIONAL', 'INTERMEDIATE', 'ADVANCED'],
      default: 'FOUNDATIONAL'
    },
    domain: { type: String, default: 'General' },
    description: { type: String },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
  },
  { timestamps: true }
);

export default mongoose.model<ISkill>('Skill', skillSchema);
