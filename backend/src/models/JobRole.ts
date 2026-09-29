import mongoose, { Document, Schema } from 'mongoose';

export interface IJobRole extends Document {
  title: string;
  description?: string;
  companyId?: mongoose.Types.ObjectId;
}

const jobRoleSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  },
  { timestamps: true }
);

export default mongoose.model<IJobRole>('JobRole', jobRoleSchema);
