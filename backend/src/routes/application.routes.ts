import { Router } from 'express';
import { Role } from '@prisma/client';
import { ApplicationController, uploadApplicationResumeMulter } from '../controllers/application.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

// Router for Student Drive Application operations (/api/student/drives)
export const studentDriveApplicationRouter = Router();

// POST /api/student/drives/:id/apply
// Accepts multipart/form-data with a `resume` PDF file
studentDriveApplicationRouter.post(
  '/:id/apply',
  authenticateToken,
  requireRole(Role.STUDENT),
  uploadApplicationResumeMulter.single('resume'),
  ApplicationController.applyToDrive
);

// Router for Student Applications operations (/api/student/applications)
export const studentApplicationRouter = Router();

// GET /api/student/applications
studentApplicationRouter.get(
  '/',
  authenticateToken,
  requireRole(Role.STUDENT),
  ApplicationController.getStudentApplications
);

// GET /api/student/applications/placement-status
studentApplicationRouter.get(
  '/placement-status',
  authenticateToken,
  requireRole(Role.STUDENT),
  ApplicationController.getPlacementStatus
);

// GET /api/student/applications/:id/resume
studentApplicationRouter.get(
  '/:id/resume',
  authenticateToken,
  requireRole(Role.STUDENT),
  ApplicationController.getApplicationResume
);

// GET /api/student/applications/:id
studentApplicationRouter.get(
  '/:id',
  authenticateToken,
  requireRole(Role.STUDENT),
  ApplicationController.getStudentApplicationById
);

// Router for TPO Applications operations (/api/tpo/applications)
export const tpoApplicationRouter = Router();

// GET /api/tpo/applications
tpoApplicationRouter.get(
  '/',
  authenticateToken,
  requireRole(Role.TPO),
  ApplicationController.getTpoApplications
);

// GET /api/tpo/applications/export (MUST be defined before /:id)
tpoApplicationRouter.get(
  '/export',
  authenticateToken,
  requireRole(Role.TPO),
  ApplicationController.exportApplicationsCsv
);

// GET /api/tpo/applications/:id/resume
tpoApplicationRouter.get(
  '/:id/resume',
  authenticateToken,
  requireRole(Role.TPO),
  ApplicationController.getApplicationResume
);

// GET /api/tpo/applications/:id
tpoApplicationRouter.get(
  '/:id',
  authenticateToken,
  requireRole(Role.TPO),
  ApplicationController.getTpoApplicationById
);

// PATCH /api/tpo/applications/:id/status
tpoApplicationRouter.patch(
  '/:id/status',
  authenticateToken,
  requireRole(Role.TPO),
  ApplicationController.updateApplicationStatus
);

// POST /api/tpo/applications/:id/interview
tpoApplicationRouter.post(
  '/:id/interview',
  authenticateToken,
  requireRole(Role.TPO),
  ApplicationController.scheduleInterview
);

// PATCH /api/tpo/applications/:id/interview/:interviewId
tpoApplicationRouter.patch(
  '/:id/interview/:interviewId',
  authenticateToken,
  requireRole(Role.TPO),
  ApplicationController.updateInterview
);

export default {
  studentDriveApplicationRouter,
  studentApplicationRouter,
  tpoApplicationRouter,
};
