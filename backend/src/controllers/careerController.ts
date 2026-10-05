import { Request, Response, NextFunction } from 'express';
import Company from '../models/Company';
import JobRole from '../models/JobRole';
import StudentProfile from '../models/StudentProfile';
import mongoose from 'mongoose';
import { ErrorResponse } from '../utils/errorResponse';

export const getCompanies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companies = await Company.find();
    res.status(200).json({ success: true, data: companies });
  } catch (error) {
    next(error);
  }
};

export const getRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await JobRole.find().populate('companyId', 'name');
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
};

export const setTargetCareer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, roleId } = req.body;
    const userId = (req as any).user.id;

    let profile = await StudentProfile.findOne({ userId });

    if (!profile) {
      profile = await StudentProfile.create({
        userId,
        targetCompany: companyId,
        targetRole: roleId,
        skills: []
      });
    } else {
      profile.targetCompany = companyId;
      profile.targetRole = roleId;
      await profile.save();
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const getTargetCareer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const profile = await StudentProfile.findOne({ userId })
      .populate('targetCompany')
      .populate('targetRole');

    if (!profile) {
      return res.status(200).json({ success: true, data: null });
    }

    let requiredSkills = [];
    if (profile.targetRole) {
      // Need to import RoleSkillRequirement at the top if not already, wait, it's not imported!
      // Let me just send the IDs or I can add the import.
      const reqs = await mongoose.model('RoleSkillRequirement').find({ roleId: (profile.targetRole as any)._id }).populate('skillId');
      requiredSkills = reqs.map(r => r.skillId);
    }

    res.status(200).json({ 
      success: true, 
      data: {
        roleId: profile.targetRole ? (profile.targetRole as any)._id : null,
        roleName: profile.targetRole ? (profile.targetRole as any).title : null,
        companyId: profile.targetCompany ? (profile.targetCompany as any)._id : null,
        companyName: profile.targetCompany ? (profile.targetCompany as any).name : null,
        requiredSkills
      }
    });
  } catch (error) {
    next(error);
  }
};
