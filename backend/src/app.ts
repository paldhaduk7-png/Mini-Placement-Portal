import express, { Application, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import tpoStudentRoutes from './routes/tpo-student.routes';
import tpoUserRoutes from './routes/tpo-user.routes';
import companyRoutes from './routes/company.routes';
import recruitmentDriveRoutes from './routes/recruitment-drive.routes';
import { tpoEligibilityRouter, studentEligibilityRouter } from './routes/eligibility.routes';
import {
  studentDriveApplicationRouter,
  studentApplicationRouter,
  tpoApplicationRouter,
} from './routes/application.routes';

const app: Application = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://mini-placement-portal-orpin.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file storage for uploads (e.g. resumes)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes (mounted under both /api/* and root /* so requests work regardless of frontend baseURL configuration)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/students', studentRoutes);
app.use('/students', studentRoutes);
app.use('/api/student', studentRoutes); // Alias for singular path
app.use('/student', studentRoutes);

app.use('/api/tpo/students', tpoStudentRoutes);
app.use('/tpo/students', tpoStudentRoutes);
app.use('/api/tpo/companies', companyRoutes);
app.use('/tpo/companies', companyRoutes);
app.use('/api/tpo', tpoUserRoutes);
app.use('/tpo', tpoUserRoutes);

// Eligibility Routes
app.use('/api/tpo/drives', tpoEligibilityRouter);
app.use('/tpo/drives', tpoEligibilityRouter);
app.use('/api/student/drives', studentEligibilityRouter);
app.use('/student/drives', studentEligibilityRouter);

// Application Routes
app.use('/api/student/drives', studentDriveApplicationRouter);
app.use('/student/drives', studentDriveApplicationRouter);
app.use('/api/student/applications', studentApplicationRouter);
app.use('/student/applications', studentApplicationRouter);
app.use('/api/tpo/applications', tpoApplicationRouter);
app.use('/tpo/applications', tpoApplicationRouter);
app.use('/api/applications', tpoApplicationRouter);
app.use('/applications', tpoApplicationRouter);

// Recruitment Drive Routes
app.use('/api/tpo/drives', recruitmentDriveRoutes);
app.use('/tpo/drives', recruitmentDriveRoutes);
app.use('/api/student/drives', recruitmentDriveRoutes);
app.use('/student/drives', recruitmentDriveRoutes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Mini Placement Portal API is running' });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

export default app;
