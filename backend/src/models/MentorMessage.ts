import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorMessage extends Document {
  userId: mongoose.Types.ObjectId;
  role: 'USER' | 'ASSISTANT';
  content: string;
  contextSources?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const mentorMessageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['USER', 'ASSISTANT'], required: true },
    content: { type: String, required: true },
    contextSources: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model<IMentorMessage>('MentorMessage', mentorMessageSchema);
