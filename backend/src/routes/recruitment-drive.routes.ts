import { Router } from 'express';
import { Role } from '@prisma/client';
import { RecruitmentDriveController } from '../controllers/recruitment-drive.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// All recruitment drive management routes require JWT authentication
router.use(authenticateToken);

// 1. POST /api/tpo/drives - Create a recruitment drive (TPO only)
router.post('/', requireRole(Role.TPO), RecruitmentDriveController.createDrive);

// 2. GET /api/tpo/drives or /api/student/drives - List all drives with optional filters (TPO and STUDENT)
router.get('/', requireRole(Role.TPO, Role.STUDENT), RecruitmentDriveController.getAllDrives);

// 3. GET /api/tpo/drives/:id or /api/student/drives/:id - Get single drive details (TPO and STUDENT)
router.get('/:id', requireRole(Role.TPO, Role.STUDENT), RecruitmentDriveController.getDriveById);

// 4. PATCH /api/tpo/drives/:id - Update recruitment drive (TPO only)
router.patch('/:id', requireRole(Role.TPO), RecruitmentDriveController.updateDrive);

// 5. DELETE /api/tpo/drives/:id - Delete recruitment drive (blocked if applications exist, TPO only)
router.delete('/:id', requireRole(Role.TPO), RecruitmentDriveController.deleteDrive);

export default router;
