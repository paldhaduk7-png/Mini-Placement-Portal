import { Router } from 'express';
import { TpoUserController } from '../controllers/tpo-user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// All routes in this file require TPO authentication
router.use(authenticateToken);
router.use(requireRole(Role.TPO));

// TPO User Management
router.get('/users', TpoUserController.getTpoUsers);
router.post('/users', TpoUserController.createTpoUser);
router.put('/users/:id', TpoUserController.updateTpoUser);
router.delete('/users/:id', TpoUserController.deleteTpoUser);

// TPO Profile Management (My Profile)
router.get('/profile', TpoUserController.getMyProfile);
router.put('/profile', TpoUserController.updateMyProfile);

export default router;
