import { Router } from 'express';
import { Role } from '@prisma/client';
import { RecruitmentDriveController } from '../controllers/recruitment-drive.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// All recruitment drive management routes require JWT authentication and TPO role
router.use(authenticateToken);
router.use(requireRole(Role.TPO));

// 1. POST /api/tpo/drives - Create a recruitment drive
router.post('/', RecruitmentDriveController.createDrive);

// 2. GET /api/tpo/drives - List all drives with optional filters
router.get('/', RecruitmentDriveController.getAllDrives);

// 3. GET /api/tpo/drives/:id - Get single drive details
router.get('/:id', RecruitmentDriveController.getDriveById);

// 4. PATCH /api/tpo/drives/:id - Update recruitment drive
router.patch('/:id', RecruitmentDriveController.updateDrive);

// 5. DELETE /api/tpo/drives/:id - Delete recruitment drive (blocked if applications exist)
router.delete('/:id', RecruitmentDriveController.deleteDrive);

export default router;
