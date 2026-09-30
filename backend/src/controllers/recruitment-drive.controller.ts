import { Request, Response } from 'express';
import { RecruitmentDriveService } from '../services/recruitment-drive.service';
import prisma from '../lib/prisma';

export class RecruitmentDriveController {
  /**
   * POST /api/tpo/drives
   * Create a recruitment drive.
   */
  static async createDrive(req: Request, res: Response): Promise<void> {
    try {
      const createdById = req.user?.userId;

      if (!createdById) {
        res.status(401).json({
          success: false,
          message: 'Authentication required.',
        });
        return;
      }

      const {
        companyId,
        role,
        description,
        ctc,
        jobLocation,
        driveDate,
        deadline,
        status,
        minCgpa,
        minTenthPercentage,
        minTwelfthPercentage,
        minD2dCgpa,
        maxActiveBacklogs,
        allowedStudentTypes,
        allowedDepartments,
        requiresVerification,
      } = req.body;

      const drive = await RecruitmentDriveService.createDrive({
        companyId,
        role,
        description,
        ctc,
        jobLocation,
        driveDate,
        deadline,
        status,
        minCgpa,
        minTenthPercentage,
        minTwelfthPercentage,
        minD2dCgpa,
        maxActiveBacklogs,
        allowedStudentTypes,
        allowedDepartments,
        requiresVerification,
        createdById,
      });

      res.status(201).json({
        success: true,
        message: 'Recruitment drive created successfully',
        data: drive,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while creating recruitment drive.',
      });
    }
  }

  /**
   * GET /api/tpo/drives
   * List all recruitment drives with optional filters (?companyId=, ?status=, ?search=).
   */
  static async getAllDrives(req: Request, res: Response): Promise<void> {
    try {
      const { companyId, status, search } = req.query;

      let studentDepartment: string | undefined = undefined;

      if (req.user?.role === 'STUDENT' && req.user?.userId) {
        const student = await prisma.student.findUnique({
          where: { userId: req.user.userId },
          select: { department: true }
        });
        if (student) {
          studentDepartment = student.department;
        }
      }

      const drives = await RecruitmentDriveService.getAllDrives({
        companyId: typeof companyId === 'string' ? companyId : undefined,
        status: typeof status === 'string' ? status : undefined,
        search: typeof search === 'string' ? search : undefined,
        studentDepartment,
      });

      res.status(200).json({
        success: true,
        count: drives.length,
        data: drives,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while fetching recruitment drives.',
      });
    }
  }

  /**
   * GET /api/tpo/drives/:id
   * Get single recruitment drive details.
   */
  static async getDriveById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Drive ID is required.',
        });
        return;
      }

      const drive = await RecruitmentDriveService.getDriveById(id);

      res.status(200).json({
        success: true,
        data: drive,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while fetching recruitment drive.',
      });
    }
  }

  /**
   * PATCH /api/tpo/drives/:id
   * Update an existing recruitment drive.
   */
  static async updateDrive(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Drive ID is required.',
        });
        return;
      }

      // Explicitly reject prohibited system fields
      if (req.body.id || req.body.createdById || req.body.createdAt) {
        res.status(400).json({
          success: false,
          message: 'id, createdById, and createdAt cannot be modified.',
        });
        return;
      }

      const updated = await RecruitmentDriveService.updateDrive(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Recruitment drive updated successfully',
        data: updated,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while updating recruitment drive.',
      });
    }
  }

  /**
   * DELETE /api/tpo/drives/:id
   * Delete recruitment drive (blocked if applications exist).
   */
  static async deleteDrive(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Drive ID is required.',
        });
        return;
      }

      const result = await RecruitmentDriveService.deleteDrive(id);

      res.status(200).json({
        success: true,
        message: 'Recruitment drive deleted successfully',
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while deleting recruitment drive.',
      });
    }
  }
}
