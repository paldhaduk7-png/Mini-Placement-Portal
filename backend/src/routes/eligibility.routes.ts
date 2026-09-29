import { Router } from 'express';
import { Role } from '@prisma/client';
import { EligibilityController } from '../controllers/eligibility.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

// Router for TPO eligibility operations (/api/tpo/drives)
export const tpoEligibilityRouter = Router();

// GET /api/tpo/drives/:id/eligible-students
tpoEligibilityRouter.get(
  '/:id/eligible-students',
  authenticateToken,
  requireRole(Role.TPO),
  EligibilityController.getEligibleStudentsForDrive
);

// Router for Student eligibility operations (/api/student/drives)
export const studentEligibilityRouter = Router();

// GET /api/student/drives/:id/eligibility
studentEligibilityRouter.get(
  '/:id/eligibility',
  authenticateToken,
  requireRole(Role.STUDENT),
  EligibilityController.checkStudentEligibility
);

export default {
  tpoEligibilityRouter,
  studentEligibilityRouter,
};
