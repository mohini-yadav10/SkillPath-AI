import { Request, Response, NextFunction } from 'express';
import Company from '../models/Company';
import JobRole from '../models/JobRole';
import StudentProfile from '../models/StudentProfile';
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

    res.status(200).json({ 
      success: true, 
      data: {
        targetCompany: profile.targetCompany,
        targetRole: profile.targetRole
      }
    });
  } catch (error) {
    next(error);
  }
};
