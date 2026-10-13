import mongoose, { Document, Schema } from 'mongoose';

export interface IDocumentChunk {
  chunkIndex: number;
  text: string;
  keywords: string[];
}

export interface IStudentDocument extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileSize: number;
  fileType: 'SYLLABUS' | 'NOTES' | 'ASSIGNMENT' | 'GENERAL';
  summary: string;
  chunks: IDocumentChunk[];
  totalChunks: number;
  createdAt: Date;
  updatedAt: Date;
}

const documentChunkSchema = new Schema({
  chunkIndex: { type: Number, required: true },
  text: { type: String, required: true },
  keywords: [{ type: String }]
}, { _id: false });

const studentDocumentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { 
      type: String, 
      enum: ['SYLLABUS', 'NOTES', 'ASSIGNMENT', 'GENERAL'], 
      default: 'GENERAL' 
    },
    summary: { type: String, default: '' },
    chunks: [documentChunkSchema],
    totalChunks: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<IStudentDocument>('StudentDocument', studentDocumentSchema);
