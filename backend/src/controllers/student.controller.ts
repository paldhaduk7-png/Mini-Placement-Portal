import { Request, Response } from 'express';
import { StudentService } from '../services/student.service';

export class StudentController {
  /**
   * GET /api/students/me
   * Returns authenticated student's profile.
   */
  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required.',
        });
        return;
      }

      const profile = await StudentService.getStudentProfile(userId);
      res.status(200).json(profile);
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      console.error('Error fetching student profile:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching your profile.',
      });
    }
  }

  /**
   * PUT / PATCH /api/students/me
   * Updates authenticated student's profile (when unlocked or rejected).
   */
  static async updateMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required.',
        });
        return;
      }

      const updated = await StudentService.updateStudentProfile(userId, req.body);
      res.status(200).json({
        message: 'Profile updated successfully.',
        student: updated,
      });
    } catch (error: any) {
      if (error.statusCode === 403) {
        res.status(403).json({
          error: 'Forbidden',
          message: error.message,
        });
        return;
      }

      if (error.statusCode === 404) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      console.error('Error updating student profile:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while updating your profile.',
      });
    }
  }

  /**
   * POST /api/students/me/submit
   * Submits and locks the authenticated student's profile.
   */
  static async submitProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required.',
        });
        return;
      }

      const result = await StudentService.submitStudentProfile(userId);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode === 409) {
        res.status(409).json({
          error: 'Conflict',
          message: error.message,
        });
        return;
      }

      if (error.statusCode === 400) {
        res.status(400).json({
          error: 'Validation Error',
          message: error.message,
        });
        return;
      }

      if (error.statusCode === 404) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      console.error('Error submitting student profile:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while submitting your profile.',
      });
    }
  }
}
