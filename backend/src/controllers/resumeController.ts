import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
const pdfParse = require('pdf-parse');
import StudentProfile from '../models/StudentProfile';
import Skill from '../models/Skill';
import { ErrorResponse } from '../utils/errorResponse';

// Setup multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  }
});

export const analyzeResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a PDF resume', 400));
    }

    const userId = (req as any).user.id;
    const profile = await StudentProfile.findOne({ userId });

    if (!profile) {
      return next(new ErrorResponse('Profile not found', 404));
    }

    // Parse PDF text
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text.toLowerCase();

    // Fetch all master skills
    const allSkills = await Skill.find();
    
    const extractedSkillIds: string[] = [];
    const extractedSkills = [];

    // Basic extraction by keyword matching
    for (const skill of allSkills) {
      // Create a regex for the skill name, escaping special characters
      const regex = new RegExp(`\\b${skill.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      
      if (regex.test(resumeText)) {
        extractedSkillIds.push(skill._id.toString());
        extractedSkills.push({
          skillId: skill._id,
          name: skill.name,
          category: skill.category
        });
      }
    }

    // Update profile with unverified skills
    let addedCount = 0;
    for (const extSkill of extractedSkills) {
      const existing = profile.skills.find(s => s.skillId.toString() === extSkill.skillId.toString());
      if (!existing) {
        profile.skills.push({
          skillId: extSkill.skillId,
          proficiency: 30, // Base default for unverified resume match
          confidenceScore: 50, // 50% confidence since it's just regex matching
          source: 'RESUME'
        });
        addedCount++;
      } else if (existing.source === 'SELF_DECLARED') {
        // Upgrade confidence slightly if resume backs it up, but don't override verified assessment
        existing.confidenceScore = Math.max(existing.confidenceScore, 60);
      }
    }

    if (addedCount > 0) {
      await profile.save();
    }

    res.status(200).json({
      success: true,
      data: {
        message: `Extracted ${extractedSkills.length} skills. Added ${addedCount} new unverified skills to profile.`,
        extractedSkills
      }
    });
  } catch (error) {
    next(error);
  }
};
