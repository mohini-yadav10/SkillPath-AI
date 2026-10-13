import mongoose, { Document, Schema } from 'mongoose';

export type SourceType =
  | 'OFFICIAL_COMPANY'
  | 'CANDIDATE_REPORTED'
  | 'PUBLIC_JOB_DESCRIPTION'
  | 'LICENSED_DATASET'
  | 'ADMIN_AUTHORED'
  | 'AI_GENERATED';

export type RetrievalStatus =
  | 'PENDING'
  | 'RETRIEVED'
  | 'BLOCKED'
  | 'FAILED'
  | 'MANUAL_ENTRY';

export type ReusePermissionStatus =
  | 'UNKNOWN'
  | 'ALLOWED'
  | 'RESTRICTED'
  | 'PERMISSION_REQUIRED';

export interface IInterviewSource extends Document {
  sourceName: string;
  sourceUrl: string;
  sourceType: SourceType;
  company?: string;
  jobRole?: string;
  retrievalStatus: RetrievalStatus;
  reusePermissionStatus: ReusePermissionStatus;
  retrievedAt?: Date;
  lastVerifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  verificationNotes?: string;
  contentHash?: string;
  attributionNotes?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const interviewSourceSchema = new Schema(
  {
    sourceName: { type: String, required: true, trim: true },
    sourceUrl: {
      type: String,
      required: true,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please provide a valid http or https URL']
    },
    sourceType: {
      type: String,
      enum: [
        'OFFICIAL_COMPANY',
        'CANDIDATE_REPORTED',
        'PUBLIC_JOB_DESCRIPTION',
        'LICENSED_DATASET',
        'ADMIN_AUTHORED',
        'AI_GENERATED'
      ],
      required: true
    },
    company: { type: String, trim: true },
    jobRole: { type: String, trim: true },
    retrievalStatus: {
      type: String,
      enum: ['PENDING', 'RETRIEVED', 'BLOCKED', 'FAILED', 'MANUAL_ENTRY'],
      default: 'PENDING'
    },
    reusePermissionStatus: {
      type: String,
      enum: ['UNKNOWN', 'ALLOWED', 'RESTRICTED', 'PERMISSION_REQUIRED'],
      default: 'UNKNOWN'
    },
    retrievedAt: { type: Date },
    lastVerifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verificationNotes: { type: String },
    contentHash: { type: String },
    attributionNotes: { type: String },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

interviewSourceSchema.index({ sourceUrl: 1 });
interviewSourceSchema.index({ company: 1, jobRole: 1 });
interviewSourceSchema.index({ sourceType: 1, reusePermissionStatus: 1 });
interviewSourceSchema.index({ active: 1 });

export default mongoose.model<IInterviewSource>('InterviewSource', interviewSourceSchema);
