import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import tpoStudentRoutes from './routes/tpo-student.routes';
import companyRoutes from './routes/company.routes';
import recruitmentDriveRoutes from './routes/recruitment-drive.routes';
import { tpoEligibilityRouter, studentEligibilityRouter } from './routes/eligibility.routes';
import {
  studentDriveApplicationRouter,
  studentApplicationRouter,
  tpoApplicationRouter,
} from './routes/application.routes';

const app: Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/tpo/students', tpoStudentRoutes);
app.use('/api/tpo/companies', companyRoutes);

// Eligibility Routes
app.use('/api/tpo/drives', tpoEligibilityRouter);
app.use('/api/student/drives', studentEligibilityRouter);

// Application Routes
app.use('/api/student/drives', studentDriveApplicationRouter);
app.use('/api/student/applications', studentApplicationRouter);
app.use('/api/tpo/applications', tpoApplicationRouter);

// Recruitment Drive Routes
app.use('/api/tpo/drives', recruitmentDriveRoutes);
app.use('/api/student/drives', recruitmentDriveRoutes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Mini Placement Portal API is running' });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

export default app;
