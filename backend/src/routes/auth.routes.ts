import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public Authentication Endpoints
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/reset-password', AuthController.resetPassword);

// TPO Authentication Endpoints
router.post('/tpo/login', AuthController.tpoLogin);
router.post('/tpo/verify-otp', AuthController.tpoVerifyOtp);

// Protected Verification Endpoint (for verifying JWT and current user)
router.get('/me', authenticateToken, AuthController.me);

// Protected Role-specific Test Endpoint (verifying role authorization)
router.get(
  '/student-check',
  authenticateToken,
  requireRole(Role.STUDENT),
  (req, res) => {
    res.status(200).json({
      message: 'Student access authorized',
      user: req.user,
    });
  }
);

router.get(
  '/tpo-check',
  authenticateToken,
  requireRole(Role.TPO),
  (req, res) => {
    res.status(200).json({
      message: 'TPO access authorized',
      user: req.user,
    });
  }
);

export default router;
