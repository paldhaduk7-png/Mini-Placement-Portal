import { Router } from 'express';
import { Role } from '@prisma/client';
import { StudentController } from '../controllers/student.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// All student routes require JWT authentication and the STUDENT role
router.use(authenticateToken);
router.use(requireRole(Role.STUDENT));

// 1. GET /api/students/me - View authenticated student's profile
router.get('/me', StudentController.getMe);

// 2. PUT / PATCH /api/students/me - Update student profile (when unlocked or rejected)
router.put('/me', StudentController.updateMe);
router.patch('/me', StudentController.updateMe);

// 3. POST /api/students/me/submit - Submit and lock profile
router.post('/me/submit', StudentController.submitProfile);

export default router;
