import mongoose, { Document, Schema } from 'mongoose';

export interface ISkillGapItem {
  skillId: mongoose.Types.ObjectId;
  skillName: string;
  currentProficiency: number;
  requiredProficiency: number;
  gapSize: number;
  classification: 'MASTERED' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';
  importance: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation?: string;
  estimatedHoursToClose?: number;
  isPrerequisiteMet?: boolean;
}

export interface ISkillGap extends Document {
  studentId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  readinessScore: number;
  criticalGapsCount: number;
  matchedSkillsCount: number;
  totalRequiredSkills: number;
  summaryDiagnosis?: string;
  gaps: ISkillGapItem[];
  createdAt: Date;
  updatedAt: Date;
}

const skillGapSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    roleId: { type: Schema.Types.ObjectId, ref: 'JobRole', required: true },
    readinessScore: { type: Number, required: true },
    criticalGapsCount: { type: Number, required: true },
    matchedSkillsCount: { type: Number, required: true },
    totalRequiredSkills: { type: Number, required: true },
    summaryDiagnosis: { type: String },
    gaps: [
      {
        skillId: { type: Schema.Types.ObjectId, ref: 'Skill' },
        skillName: String,
        currentProficiency: Number,
        requiredProficiency: Number,
        gapSize: Number,
        classification: {
          type: String,
          enum: ['MASTERED', 'MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']
        },
        importance: String,
        priority: {
          type: String,
          enum: ['HIGH', 'MEDIUM', 'LOW'],
          default: 'MEDIUM'
        },
        recommendation: String,
        estimatedHoursToClose: Number,
        isPrerequisiteMet: { type: Boolean, default: true }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<ISkillGap>('SkillGapAnalysis', skillGapSchema);
