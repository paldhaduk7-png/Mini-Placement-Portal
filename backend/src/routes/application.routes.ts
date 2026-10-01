import { Router } from 'express';
import { Role } from '@prisma/client';
import { ApplicationController } from '../controllers/application.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

// Router for Student Drive Application operations (/api/student/drives)
export const studentDriveApplicationRouter = Router();

// POST /api/student/drives/:id/apply
studentDriveApplicationRouter.post(
  '/:id/apply',
  authenticateToken,
  requireRole(Role.STUDENT),
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

export default {
  studentDriveApplicationRouter,
  studentApplicationRouter,
  tpoApplicationRouter,
};
