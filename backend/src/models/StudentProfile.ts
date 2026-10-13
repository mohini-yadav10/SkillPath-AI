import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentSkill {
  skillId: mongoose.Types.ObjectId;
  proficiency: number;
  confidenceScore: number;
  source: 'SELF_DECLARED' | 'ASSESSMENT' | 'RESUME' | 'VERIFIED';
}

export interface IStudentProject {
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  verified: boolean;
  impactScore?: number;
}

export interface ICareerTwinData {
  archetype: string;
  marketReadinessIndex: number;
  cognitiveScores: {
    technicalProficiency: number;
    practicalApplication: number;
    interviewReadiness: number;
    consistencyStreak: number;
  };
  learningVelocity: number;
  estimatedWeeksToHire: number;
  aiDiagnosis: string;
  nextBestAction: string;
  lastSynthesizedAt?: Date;
}

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  targetRole?: mongoose.Types.ObjectId;
  targetCompany?: mongoose.Types.ObjectId;
  careerReadinessScore?: number;
  resumeUrl?: string;
  skills: IStudentSkill[];
  projects: IStudentProject[];
  interviewStats?: {
    totalInterviews: number;
    averageScore: number;
    technicalRating: number;
    communicationRating: number;
  };
  careerTwin?: ICareerTwinData;
  
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

const studentProjectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [{ type: String }],
  githubUrl: { type: String },
  liveUrl: { type: String },
  verified: { type: Boolean, default: false },
  impactScore: { type: Number, default: 70 }
}, { _id: true });

const studentProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    targetRole: { type: Schema.Types.ObjectId, ref: 'JobRole' },
    targetCompany: { type: Schema.Types.ObjectId, ref: 'Company' },
    careerReadinessScore: { type: Number, min: 0, max: 100, default: 0 },
    resumeUrl: { type: String },
    skills: [studentSkillSchema],
    projects: [studentProjectSchema],
    interviewStats: {
      totalInterviews: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      technicalRating: { type: Number, default: 0 },
      communicationRating: { type: Number, default: 0 }
    },
    careerTwin: {
      archetype: { type: String, default: 'Aspiring Engineer' },
      marketReadinessIndex: { type: Number, default: 0 },
      cognitiveScores: {
        technicalProficiency: { type: Number, default: 0 },
        practicalApplication: { type: Number, default: 0 },
        interviewReadiness: { type: Number, default: 0 },
        consistencyStreak: { type: Number, default: 0 }
      },
      learningVelocity: { type: Number, default: 10 },
      estimatedWeeksToHire: { type: Number, default: 8 },
      aiDiagnosis: { type: String, default: 'Profile awaiting comprehensive skill gap assessment.' },
      nextBestAction: { type: String, default: 'Complete foundational skill assessments to initialize career twin.' },
      lastSynthesizedAt: { type: Date }
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    learningStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<IStudentProfile>('StudentProfile', studentProfileSchema);
