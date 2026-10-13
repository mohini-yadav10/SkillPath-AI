import crypto from 'crypto';
import mongoose from 'mongoose';
import InterviewSource, { IInterviewSource, SourceType, RetrievalStatus, ReusePermissionStatus } from '../models/InterviewSource';
import InterviewQuestion, { IInterviewQuestion, VerificationStatusEnum } from '../models/InterviewQuestion';
import { SkillTaxonomyService } from './skillTaxonomyService';
import { ErrorResponse } from '../utils/errorResponse';

// SSRF Guard to prevent access to internal IPs or cloud metadata endpoints
export const isSafePublicUrl = (urlString: string): boolean => {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    // Block localhost, loopbacks, and link-local addresses
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '0.0.0.0' ||
      host.endsWith('.local')
    ) {
      return false;
    }

    // Block private IPv4 ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
    const ipParts = host.split('.').map(Number);
    if (ipParts.length === 4 && ipParts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
      if (ipParts[0] === 10) return false;
      if (ipParts[0] === 127) return false;
      if (ipParts[0] === 169 && ipParts[1] === 254) return false;
      if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) return false;
      if (ipParts[0] === 192 && ipParts[1] === 168) return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

export const normalizeContentHash = (text: string, company?: string, role?: string): string => {
  const normalized = `${(company || '').trim().toLowerCase()}|${(role || '').trim().toLowerCase()}|${text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()}`;
  return crypto.createHash('sha256').update(normalized).digest('hex');
};

export interface IngestionQuestionCandidate {
  questionText: string;
  type?: 'TECHNICAL' | 'HR' | 'MIXED';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  company?: string;
  jobRole?: string;
  interviewRound?: string;
  category?: string;
  expectedKeywords?: string[];
  sampleAnswer?: string;
  sourceUrl?: string;
  sourceType?: SourceType;
  sourceAttribution?: string;
  permissionStatus?: 'UNKNOWN' | 'ALLOWED' | 'RESTRICTED' | 'PERMISSION_REQUIRED';
}

export interface IngestionReport {
  dryRun: boolean;
  totalCandidateQuestions: number;
  importedCount: number;
  duplicatesDetected: { questionText: string; reason: string }[];
  rejectedRecords: { record: any; reason: string }[];
  recordsRequiringReview: number;
  sourceId?: string;
  sourceUrl?: string;
  itemsPreview: any[];
}

export class QuestionIngestionService {
  /**
   * Register a verified or candidate external source with SSRF protection
   */
  public static async registerSource(data: {
    sourceName: string;
    sourceUrl: string;
    sourceType: SourceType;
    company?: string;
    jobRole?: string;
    retrievalStatus?: RetrievalStatus;
    reusePermissionStatus?: ReusePermissionStatus;
    attributionNotes?: string;
    verificationNotes?: string;
    verifiedBy?: mongoose.Types.ObjectId;
  }): Promise<IInterviewSource> {
    if (!isSafePublicUrl(data.sourceUrl)) {
      throw new ErrorResponse('Invalid or restricted source URL. Private and loopback IP addresses are blocked.', 400);
    }

    // Check if source already registered
    let source = await InterviewSource.findOne({ sourceUrl: data.sourceUrl });
    if (source) {
      source.sourceName = data.sourceName || source.sourceName;
      source.sourceType = data.sourceType || source.sourceType;
      source.company = data.company || source.company;
      source.jobRole = data.jobRole || source.jobRole;
      if (data.retrievalStatus) source.retrievalStatus = data.retrievalStatus;
      if (data.reusePermissionStatus) source.reusePermissionStatus = data.reusePermissionStatus;
      if (data.attributionNotes) source.attributionNotes = data.attributionNotes;
      if (data.verificationNotes) source.verificationNotes = data.verificationNotes;
      source.lastVerifiedAt = new Date();
      if (data.verifiedBy) source.verifiedBy = data.verifiedBy;
      await source.save();
      return source;
    }

    source = await InterviewSource.create({
      sourceName: data.sourceName,
      sourceUrl: data.sourceUrl,
      sourceType: data.sourceType,
      company: data.company,
      jobRole: data.jobRole,
      retrievalStatus: data.retrievalStatus || 'PENDING',
      reusePermissionStatus: data.reusePermissionStatus || 'UNKNOWN',
      retrievedAt: new Date(),
      lastVerifiedAt: new Date(),
      verifiedBy: data.verifiedBy,
      attributionNotes: data.attributionNotes,
      verificationNotes: data.verificationNotes,
      active: true
    });

    return source;
  }

  /**
   * Safe Question Ingestion with Dry-Run mode & Duplicate Detection
   */
  public static async processQuestionBatch(
    candidates: IngestionQuestionCandidate[],
    options: {
      dryRun?: boolean;
      sourceId?: mongoose.Types.ObjectId;
      defaultSourceUrl?: string;
      defaultSourceType?: SourceType;
      defaultAttribution?: string;
      userId?: mongoose.Types.ObjectId;
    } = {}
  ): Promise<IngestionReport> {
    const isDryRun = options.dryRun !== false; // defaults to dry run for safety
    const report: IngestionReport = {
      dryRun: isDryRun,
      totalCandidateQuestions: candidates.length,
      importedCount: 0,
      duplicatesDetected: [],
      rejectedRecords: [],
      recordsRequiringReview: 0,
      sourceId: options.sourceId?.toString(),
      sourceUrl: options.defaultSourceUrl,
      itemsPreview: []
    };

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return report;
    }

    // Limit maximum batch size to prevent server memory saturation
    const MAX_BATCH_SIZE = 150;
    if (candidates.length > MAX_BATCH_SIZE) {
      throw new ErrorResponse(`Batch size exceeds maximum limit of ${MAX_BATCH_SIZE} questions`, 400);
    }

    const seenHashesInBatch = new Set<string>();

    for (const item of candidates) {
      // 1. Validation
      if (!item.questionText || typeof item.questionText !== 'string' || item.questionText.trim().length < 10) {
        report.rejectedRecords.push({
          record: item,
          reason: 'Question text is empty or too short (< 10 chars).'
        });
        continue;
      }

      const cleanText = item.questionText.trim();
      const contentHash = normalizeContentHash(cleanText, item.company, item.jobRole);

      // 2. Intra-batch duplicate detection
      if (seenHashesInBatch.has(contentHash)) {
        report.duplicatesDetected.push({
          questionText: cleanText,
          reason: 'Duplicate question found within the same batch.'
        });
        continue;
      }
      seenHashesInBatch.add(contentHash);

      // 3. Database duplicate detection
      const existingDoc = await InterviewQuestion.findOne({ contentHash });
      if (existingDoc) {
        report.duplicatesDetected.push({
          questionText: cleanText,
          reason: `Already exists in database (ID: ${existingDoc._id}, Company: ${existingDoc.company || 'N/A'}).`
        });
        continue;
      }

      // 4. Canonical skill tagging
      const skillMapping = await SkillTaxonomyService.mapQuestionToSkills(
        cleanText,
        item.expectedKeywords || []
      );

      // 5. Provenance & Attribution determination
      const sourceType = item.sourceType || options.defaultSourceType || 'CANDIDATE_REPORTED';
      const sourceUrl = item.sourceUrl || options.defaultSourceUrl;
      const sourceAttribution = item.sourceAttribution || options.defaultAttribution || (
        sourceType === 'AI_GENERATED'
          ? 'Original SkillPath AI practice material'
          : `Candidate-reported interview question${item.company ? ` for ${item.company}` : ''}`
      );

      const generatedByAI = sourceType === 'AI_GENERATED';
      const contentOrigin = generatedByAI ? 'AI_GENERATED' : 'EXTERNALLY_SOURCED';
      const permissionStatus = item.permissionStatus || (
        sourceType === 'CANDIDATE_REPORTED' ? 'RESTRICTED' : 'ALLOWED'
      );

      // Initial verification status
      const verificationStatus: VerificationStatusEnum = generatedByAI
        ? 'UNVERIFIED'
        : 'SOURCE_REVIEWED';

      const questionData: any = {
        questionText: cleanText,
        type: item.type || 'TECHNICAL',
        questionType: item.type || 'TECHNICAL',
        difficulty: item.difficulty || 'MEDIUM',
        company: item.company,
        companies: item.company ? [item.company] : [],
        jobRole: item.jobRole,
        roles: item.jobRole ? [item.jobRole] : [],
        interviewRound: item.interviewRound || 'TECHNICAL_ROUND_1',
        category: item.category || 'Engineering & Architecture',
        expectedKeywords: item.expectedKeywords || [],
        sampleAnswer: item.sampleAnswer,
        relatedSkill: skillMapping.primarySkillId,
        primarySkill: skillMapping.primarySkillId,
        secondarySkills: skillMapping.secondarySkillIds,
        skillTags: skillMapping.skillTags,
        skillMappingMethod: 'RULE_BASED',
        sourceId: options.sourceId,
        sourceUrl,
        sourceType,
        sourceAttribution,
        verificationStatus,
        permissionStatus,
        generatedByAI,
        contentOrigin,
        contentHash,
        active: !isDryRun && permissionStatus !== 'RESTRICTED',
        createdBy: options.userId
      };

      report.recordsRequiringReview++;
      report.itemsPreview.push({
        questionText: cleanText,
        company: item.company,
        jobRole: item.jobRole,
        difficulty: questionData.difficulty,
        sourceType,
        verificationStatus,
        mappedSkillsCount: skillMapping.skillTags.length
      });

      // 6. Persistence only if not a dry-run
      if (!isDryRun) {
        await InterviewQuestion.create(questionData);
        report.importedCount++;
      }
    }

    return report;
  }
}
