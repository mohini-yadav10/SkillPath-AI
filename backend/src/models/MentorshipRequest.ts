import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorshipRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  alumniId: mongoose.Types.ObjectId;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  message: string;
  responseMessage?: string;
  meetingLink?: string;
}

const mentorshipRequestSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    alumniId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'], default: 'PENDING' },
    message: { type: String, required: true },
    responseMessage: { type: String },
    meetingLink: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IMentorshipRequest>('MentorshipRequest', mentorshipRequestSchema);
