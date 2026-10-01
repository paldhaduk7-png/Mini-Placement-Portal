import { Request, Response } from 'express';
import { ApplicationService } from '../services/application.service';

export class ApplicationController {
  /**
   * POST /api/student/drives/:id/apply
   * Applies the authenticated student to a recruitment drive
   */
  static async applyToDrive(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const driveId = req.params.id;

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

      const result = await ApplicationService.applyToDrive(userId, driveId.trim());

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const responseBody: any = {
        success: false,
        message: error.message || 'An unexpected error occurred while applying.',
      };

      if (error.reasons && Array.isArray(error.reasons)) {
        responseBody.reasons = error.reasons;
      }

      res.status(statusCode).json(responseBody);
    }
  }

  /**
   * GET /api/student/applications
   * Returns all applications for the authenticated student
   */
  static async getStudentApplications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required.',
        });
        return;
      }

      const applications = await ApplicationService.getStudentApplications(userId);

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while fetching applications.',
      });
    }
  }

  /**
   * GET /api/student/applications/:id
   * Returns a specific application for the authenticated student
   */
  static async getStudentApplicationById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const applicationId = req.params.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required.',
        });
        return;
      }

      if (!applicationId?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Application ID is required.',
        });
        return;
      }

      const application = await ApplicationService.getStudentApplicationById(
        userId,
        applicationId.trim()
      );

      res.status(200).json({
        success: true,
        data: application,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while fetching application.',
      });
    }
  }

  /**
   * GET /api/student/applications/placement-status
   * Returns placement status and 2x package calculation for the authenticated student
   */
  static async getPlacementStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required.',
        });
        return;
      }

      const placementStatus = await ApplicationService.getPlacementStatus(userId);

      res.status(200).json({
        success: true,
        data: placementStatus,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while fetching placement status.',
      });
    }
  }

  /**
   * GET /api/tpo/applications
   * Returns all applications with optional query filters (driveId, status, studentId)
   */
  static async getTpoApplications(req: Request, res: Response): Promise<void> {
    try {
      const { driveId, status, studentId } = req.query;

      const applications = await ApplicationService.getTpoApplications({
        driveId: typeof driveId === 'string' ? driveId : undefined,
        status: typeof status === 'string' ? status : undefined,
        studentId: typeof studentId === 'string' ? studentId : undefined,
      });

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while fetching applications.',
      });
    }
  }

  /**
   * GET /api/tpo/applications/:id
   * Returns complete application details by ID for TPO
   */
  static async getTpoApplicationById(req: Request, res: Response): Promise<void> {
    try {
      const applicationId = req.params.id;

      if (!applicationId?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Application ID is required.',
        });
        return;
      }

      const application = await ApplicationService.getTpoApplicationById(applicationId.trim());

      res.status(200).json({
        success: true,
        data: application,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while fetching application.',
      });
    }
  }

  /**
   * PATCH /api/tpo/applications/:id/status
   * Updates application status and optional remarks (TPO only)
   */
  static async updateApplicationStatus(req: Request, res: Response): Promise<void> {
    try {
      const applicationId = req.params.id;
      const { status, remarks } = req.body;

      if (!applicationId?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Application ID is required.',
        });
        return;
      }

      const updated = await ApplicationService.updateApplicationStatus(
        applicationId.trim(),
        status,
        remarks
      );

      res.status(200).json({
        success: true,
        message: 'Application status updated successfully',
        data: updated,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while updating status.',
      });
    }
  }
}
