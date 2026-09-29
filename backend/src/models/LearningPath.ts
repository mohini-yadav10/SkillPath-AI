import mongoose, { Document, Schema } from 'mongoose';

export interface ILearningPathItem {
  _id?: mongoose.Types.ObjectId;
  skillId: mongoose.Types.ObjectId;
  skillName: string;
  resourceId?: mongoose.Types.ObjectId; // Optional: could be auto-generated placeholder
  title: string;
  type: string;
  url: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  order: number;
}

export interface ILearningPath extends Document {
  studentId: mongoose.Types.ObjectId;
  targetRoleId: mongoose.Types.ObjectId;
  items: ILearningPathItem[];
  progress: number;
}

const learningPathItemSchema = new Schema({
  skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
  skillName: { type: String, required: true },
  resourceId: { type: Schema.Types.ObjectId, ref: 'LearningResource' },
  title: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], default: 'PENDING' },
  order: { type: Number, required: true }
});

const learningPathSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    targetRoleId: { type: Schema.Types.ObjectId, ref: 'JobRole', required: true },
    items: [learningPathItemSchema],
    progress: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<ILearningPath>('LearningPath', learningPathSchema);
