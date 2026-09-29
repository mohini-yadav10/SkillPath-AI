import mongoose, { Document, Schema } from 'mongoose';

export interface IRoleSkillRequirement extends Document {
  roleId: mongoose.Types.ObjectId;
  skillId: mongoose.Types.ObjectId;
  importance: 'CRITICAL' | 'IMPORTANT' | 'MEDIUM' | 'OPTIONAL';
  minimumProficiency: number;
  weight: number;
}

const roleSkillRequirementSchema = new Schema(
  {
    roleId: { type: Schema.Types.ObjectId, ref: 'JobRole', required: true },
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
    importance: { type: String, enum: ['CRITICAL', 'IMPORTANT', 'MEDIUM', 'OPTIONAL'], required: true },
    minimumProficiency: { type: Number, required: true, min: 0, max: 100 },
    weight: { type: Number, required: true, default: 1 }
  },
  { timestamps: true }
);

export default mongoose.model<IRoleSkillRequirement>('RoleSkillRequirement', roleSkillRequirementSchema);
