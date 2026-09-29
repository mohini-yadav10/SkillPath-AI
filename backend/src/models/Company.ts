import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  description?: string;
  logoUrl?: string;
}

const companySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    logoUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ICompany>('Company', companySchema);
