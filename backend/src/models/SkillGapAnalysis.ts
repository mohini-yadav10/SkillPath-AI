import mongoose, { Document, Schema } from 'mongoose';

export interface ISkillGap extends Document {
  studentId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  readinessScore: number;
  criticalGapsCount: number;
  matchedSkillsCount: number;
  totalRequiredSkills: number;
  gaps: Array<{
    skillId: mongoose.Types.ObjectId;
    skillName: string;
    currentProficiency: number;
    requiredProficiency: number;
    gapSize: number;
    classification: 'MASTERED' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';
    importance: string;
  }>;
}

const skillGapSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    roleId: { type: Schema.Types.ObjectId, ref: 'JobRole', required: true },
    readinessScore: { type: Number, required: true },
    criticalGapsCount: { type: Number, required: true },
    matchedSkillsCount: { type: Number, required: true },
    totalRequiredSkills: { type: Number, required: true },
    gaps: [
      {
        skillId: { type: Schema.Types.ObjectId, ref: 'Skill' },
        skillName: String,
        currentProficiency: Number,
        requiredProficiency: Number,
        gapSize: Number,
        classification: String,
        importance: String,
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<ISkillGap>('SkillGapAnalysis', skillGapSchema);
