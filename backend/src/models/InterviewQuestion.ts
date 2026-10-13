import mongoose, { Document, Schema } from 'mongoose';

export type QuestionTypeEnum = 'TECHNICAL' | 'HR' | 'MIXED' | 'CODING' | 'SYSTEM_DESIGN';
export type DifficultyEnum = 'EASY' | 'MEDIUM' | 'HARD';
export type SourceTypeEnum =
  | 'OFFICIAL_COMPANY'
  | 'CANDIDATE_REPORTED'
  | 'PUBLIC_JOB_DESCRIPTION'
  | 'LICENSED_DATASET'
  | 'ADMIN_AUTHORED'
  | 'AI_GENERATED';
export type VerificationStatusEnum =
  | 'UNVERIFIED'
  | 'SOURCE_REVIEWED'
  | 'VERIFIED'
  | 'NEEDS_REVIEW'
  | 'RETIRED';
export type PermissionStatusEnum =
  | 'UNKNOWN'
  | 'ALLOWED'
  | 'RESTRICTED'
  | 'PERMISSION_REQUIRED';
export type ContentOriginEnum = 'EXTERNALLY_SOURCED' | 'AI_GENERATED' | 'CURATED_INTERNAL';
export type SkillMappingMethodEnum = 'MANUAL' | 'RULE_BASED' | 'AI_SUGGESTED';

export interface IInterviewQuestion extends Document {
  // Identity
  company?: string;
  companies?: string[];
  jobRole?: string;
  roles?: string[];
  roleFamily?: string;
  questionText: string;
  type: 'TECHNICAL' | 'HR' | 'MIXED';
  questionType: QuestionTypeEnum;
  interviewRound?: string;
  category?: string;
  topic?: string;
  subtopic?: string;
  difficulty: DifficultyEnum;
  language?: string;
  active: boolean;

  // Skill Mapping
  relatedSkill?: mongoose.Types.ObjectId;
  skillTags: mongoose.Types.ObjectId[];
  primarySkill?: mongoose.Types.ObjectId;
  secondarySkills: mongoose.Types.ObjectId[];
  expectedCompetencies?: string[];
  prerequisiteSkills: mongoose.Types.ObjectId[];
  skillMappingMethod?: SkillMappingMethodEnum;

  // Answer & Evaluation
  expectedKeywords: string[];
  expectedAnswerOutline?: string;
  keyConcepts?: string[];
  acceptableApproaches?: string[];
  commonMistakes?: string[];
  evaluationCriteria?: string[];
  maximumScore?: number;
  followUpTemplates?: string[];
  estimatedDurationMinutes?: number;
  sampleAnswer?: string;
  selectionReason?: string;
  codeTestCase?: {
    input: string;
    expectedOutput: string;
    description?: string;
  };
  rubricCriteria?: string[];

  // Provenance
  source: 'VERIFIED_PUBLIC' | 'AI_GENERATED';
  sourceId?: mongoose.Types.ObjectId;
  sourceUrl?: string;
  sourceType: SourceTypeEnum;
  sourceAttribution?: string;
  sourceQuestionId?: string;
  retrievalDate?: Date;
  verificationStatus: VerificationStatusEnum;
  verificationNotes?: string;
  permissionStatus: PermissionStatusEnum;
  generatedByAI: boolean;
  contentOrigin: ContentOriginEnum;
  contentHash?: string;

  // Lifecycle
  createdBy?: mongoose.Types.ObjectId;
  reviewedBy?: mongoose.Types.ObjectId;
  lastVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const interviewQuestionSchema = new Schema(
  {
    // Identity
    company: { type: String, trim: true },
    companies: [{ type: String, trim: true }],
    jobRole: { type: String, trim: true },
    roles: [{ type: String, trim: true }],
    roleFamily: { type: String, trim: true, default: 'Software Engineering' },
    questionText: { type: String, required: true, trim: true },
    type: { type: String, enum: ['TECHNICAL', 'HR', 'MIXED'], required: true },
    questionType: {
      type: String,
      enum: ['TECHNICAL', 'HR', 'MIXED', 'CODING', 'SYSTEM_DESIGN'],
      default: 'TECHNICAL'
    },
    interviewRound: {
      type: String,
      enum: ['TECHNICAL_ROUND_1', 'TECHNICAL_ROUND_2', 'HR_ROUND', 'MANAGERIAL_ROUND', 'SYSTEM_DESIGN'],
      default: 'TECHNICAL_ROUND_1'
    },
    category: { type: String, default: 'General' },
    topic: { type: String },
    subtopic: { type: String },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
    language: { type: String, default: 'General' },
    active: { type: Boolean, default: true },

    // Skill Mapping
    relatedSkill: { type: Schema.Types.ObjectId, ref: 'Skill' },
    skillTags: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    primarySkill: { type: Schema.Types.ObjectId, ref: 'Skill' },
    secondarySkills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    expectedCompetencies: [{ type: String }],
    prerequisiteSkills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    skillMappingMethod: {
      type: String,
      enum: ['MANUAL', 'RULE_BASED', 'AI_SUGGESTED'],
      default: 'RULE_BASED'
    },

    // Answer & Evaluation
    expectedKeywords: [{ type: String }],
    expectedAnswerOutline: { type: String },
    keyConcepts: [{ type: String }],
    acceptableApproaches: [{ type: String }],
    commonMistakes: [{ type: String }],
    evaluationCriteria: [{ type: String }],
    maximumScore: { type: Number, default: 100 },
    followUpTemplates: [{ type: String }],
    estimatedDurationMinutes: { type: Number, default: 3 },
    selectionReason: { type: String },
    sampleAnswer: { type: String },
    codeTestCase: {
      input: { type: String },
      expectedOutput: { type: String },
      description: { type: String }
    },
    rubricCriteria: [{ type: String }],

    // Provenance
    source: {
      type: String,
      enum: ['VERIFIED_PUBLIC', 'AI_GENERATED'],
      default: 'VERIFIED_PUBLIC'
    },
    sourceId: { type: Schema.Types.ObjectId, ref: 'InterviewSource' },
    sourceUrl: { type: String, trim: true },
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
      default: 'CANDIDATE_REPORTED'
    },
    sourceAttribution: { type: String },
    sourceQuestionId: { type: String },
    retrievalDate: { type: Date },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'SOURCE_REVIEWED', 'VERIFIED', 'NEEDS_REVIEW', 'RETIRED'],
      default: 'SOURCE_REVIEWED'
    },
    verificationNotes: { type: String },
    permissionStatus: {
      type: String,
      enum: ['UNKNOWN', 'ALLOWED', 'RESTRICTED', 'PERMISSION_REQUIRED'],
      default: 'ALLOWED'
    },
    generatedByAI: { type: Boolean, default: false },
    contentOrigin: {
      type: String,
      enum: ['EXTERNALLY_SOURCED', 'AI_GENERATED', 'CURATED_INTERNAL'],
      default: 'EXTERNALLY_SOURCED'
    },
    contentHash: { type: String },

    // Lifecycle
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastVerifiedAt: { type: Date }
  },
  { timestamps: true }
);

interviewQuestionSchema.index({ company: 1, jobRole: 1 });
interviewQuestionSchema.index({ skillTags: 1 });
interviewQuestionSchema.index({ difficulty: 1 });
interviewQuestionSchema.index({ verificationStatus: 1 });
interviewQuestionSchema.index({ active: 1 });
interviewQuestionSchema.index({ contentHash: 1 });
interviewQuestionSchema.index({ sourceType: 1, permissionStatus: 1 });

export default mongoose.model<IInterviewQuestion>('InterviewQuestion', interviewQuestionSchema);
