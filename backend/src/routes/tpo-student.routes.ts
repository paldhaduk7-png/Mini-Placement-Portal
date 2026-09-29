import { Router } from 'express';
import { Role } from '@prisma/client';
import { TpoStudentController } from '../controllers/tpo-student.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// All routes require authentication and TPO role
router.use(authenticateToken);
router.use(requireRole(Role.TPO));

// 1. GET /api/tpo/students - List all students
router.get('/', TpoStudentController.getAllStudents);

// 2. GET /api/tpo/students/:id - View single student details
router.get('/:id', TpoStudentController.getStudentById);

// 3. PATCH /api/tpo/students/:id - Update student profile (works even if locked)
router.patch('/:id', TpoStudentController.updateStudent);

// 4. PATCH /api/tpo/students/:id/verify - Verify or Reject student profile
router.patch('/:id/verify', TpoStudentController.verifyStudent);

export default router;
