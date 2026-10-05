import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentSkill {
  skillId: mongoose.Types.ObjectId;
  proficiency: number;
  confidenceScore: number;
  source: 'SELF_DECLARED' | 'ASSESSMENT' | 'RESUME' | 'VERIFIED';
}

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  targetRole?: mongoose.Types.ObjectId;
  targetCompany?: mongoose.Types.ObjectId;
  careerReadinessScore?: number;
  resumeUrl?: string;
  skills: IStudentSkill[];
  
  // Gamification fields
  xp: number;
  level: number;
  learningStreak: number;
  lastActivityDate?: Date;
}

const studentSkillSchema = new Schema({
  skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
  proficiency: { type: Number, min: 0, max: 100, default: 0 },
  confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
  source: { type: String, enum: ['SELF_DECLARED', 'ASSESSMENT', 'RESUME', 'VERIFIED'], default: 'SELF_DECLARED' }
}, { _id: false });

const studentProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    targetRole: { type: Schema.Types.ObjectId, ref: 'JobRole' },
    targetCompany: { type: Schema.Types.ObjectId, ref: 'Company' },
    careerReadinessScore: { type: Number, min: 0, max: 100, default: 0 },
    resumeUrl: { type: String },
    skills: [studentSkillSchema],
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    learningStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<IStudentProfile>('StudentProfile', studentProfileSchema);
