import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/authRoutes';
import careerRoutes from './routes/careerRoutes';
import profileRoutes from './routes/profileRoutes';
import analysisRoutes from './routes/analysisRoutes';
import mlRoutes from './routes/mlRoutes';
import learningRoutes from './routes/learningRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import resumeRoutes from './routes/resumeRoutes';
import mentorshipRoutes from './routes/mentorshipRoutes';
import adminRoutes from './routes/adminRoutes';
import interviewRoutes from './routes/interviewRoutes';
import proctoringRoutes from './routes/proctoringRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/proctoring', proctoringRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
