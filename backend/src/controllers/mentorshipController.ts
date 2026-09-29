import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import MentorshipRequest from '../models/MentorshipRequest';
import { ErrorResponse } from '../utils/errorResponse';

// @desc    Get all alumni
// @route   GET /api/mentorship/alumni
// @access  Private
export const getAlumni = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alumni = await User.find({ role: 'ALUMNI' }).select('-passwordHash');
    res.status(200).json({ success: true, data: alumni });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a mentorship request
// @route   POST /api/mentorship/request
// @access  Private (Student)
export const sendRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { alumniId, message } = req.body;

    if (!alumniId || !message) {
      return next(new ErrorResponse('Please provide alumniId and message', 400));
    }

    // Check if already requested
    const existingReq = await MentorshipRequest.findOne({
      studentId: (req as any).user.id,
      alumniId,
      status: 'PENDING'
    });

    if (existingReq) {
      return next(new ErrorResponse('You already have a pending request with this alumni', 400));
    }

    const request = await MentorshipRequest.create({
      studentId: (req as any).user.id,
      alumniId,
      message
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// @desc    Get requests (for student or alumni)
// @route   GET /api/mentorship/requests
// @access  Private
export const getRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let requests;
    if ((req as any).user.role === 'ALUMNI') {
      requests = await MentorshipRequest.find({ alumniId: (req as any).user.id })
        .populate('studentId', 'firstName lastName email')
        .sort('-createdAt');
    } else {
      requests = await MentorshipRequest.find({ studentId: (req as any).user.id })
        .populate('alumniId', 'firstName lastName currentCompany currentJobTitle')
        .sort('-createdAt');
    }
    
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to request (Accept/Reject)
// @route   PUT /api/mentorship/request/:id
// @access  Private (Alumni)
export const respondToRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, responseMessage, meetingLink } = req.body;
    
    if ((req as any).user.role !== 'ALUMNI') {
      return next(new ErrorResponse('Not authorized', 403));
    }

    let request = await MentorshipRequest.findById(req.params.id);
    if (!request) {
      return next(new ErrorResponse('Request not found', 404));
    }

    if (request.alumniId.toString() !== (req as any).user.id) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    request.status = status;
    if (responseMessage) request.responseMessage = responseMessage;
    if (meetingLink) request.meetingLink = meetingLink;

    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};
