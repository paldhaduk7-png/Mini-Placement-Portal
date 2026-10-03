import { Request, Response } from 'express';
import { EligibilityService } from '../services/eligibility.service';

export class EligibilityController {
  /**
   * GET /api/tpo/drives/:id/eligible-students
   * Returns all students meeting the drive criteria. (TPO only)
   */
  static async getEligibleStudentsForDrive(req: Request, res: Response): Promise<void> {
    try {
      const driveId = req.params.id;
      const roleId = req.query.roleId as string | undefined;

      if (!driveId?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Drive ID is required.',
        });
        return;
      }

      const result = await EligibilityService.getEligibleStudentsForDrive(driveId.trim(), roleId?.trim());

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while fetching eligible students.',
      });
    }
  }

  /**
   * GET /api/student/drives/:id/eligibility
   * Evaluates the authenticated student's eligibility for a drive. (Student only)
   */
  static async checkStudentEligibility(req: Request, res: Response): Promise<void> {
    try {
      const driveId = req.params.id;
      const roleId = req.query.roleId as string | undefined;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required.',
        });
        return;
      }

      if (!driveId?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Drive ID is required.',
        });
        return;
      }

      const result = await EligibilityService.checkStudentEligibilityForDrive(
        userId,
        driveId.trim(),
        roleId?.trim()
      );

      // Ineligibility returns HTTP 200 with eligible=false and human-readable reasons
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while checking eligibility.',
      });
    }
  }
}
