import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

/**
 * Middleware factory to authorize access based on user roles.
 * Usage:
 *   router.get('/student-only', authenticateToken, requireRole(Role.STUDENT), handler);
 *   router.get('/tpo-only', authenticateToken, requireRole(Role.TPO), handler);
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required before checking role permissions.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}.`,
      });
      return;
    }

    next();
  };
};
