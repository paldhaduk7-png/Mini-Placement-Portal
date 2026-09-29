import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { config } from '../config/env';

interface JwtPayload {
  userId: string;
  role: Role;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied. Missing or invalid Authorization header.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied. No token provided.',
    });
    return;
  }

  if (!config.jwtSecret) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Server configuration error: JWT_SECRET missing.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    if (!decoded.userId || !decoded.role) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token payload.',
      });
      return;
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired. Please log in again.',
      });
      return;
    }

    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or malformed token.',
    });
  }
};
