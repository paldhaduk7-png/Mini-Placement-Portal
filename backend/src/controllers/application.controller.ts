import { Request, Response } from 'express';
import multer from 'multer';
import { ApplicationService } from '../services/application.service';

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Multer for application resume upload (in-memory)
const applicationResumeStorage = multer.memoryStorage();
export const uploadApplicationResumeMulter = multer({
  storage: applicationResumeStorage,
  limits: { fileSize: MAX_RESUME_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const isPdfMime = file.mimetype === 'application/pdf';
    const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');
    if (isPdfMime && isPdfExt) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF resumes are allowed.'));
    }
  },
});

export class ApplicationController {
  /**
   * POST /api/student/drives/:id/apply
   * Accepts multipart/form-data with a `resume` PDF file.
   * Applies the authenticated student to a recruitment drive and uploads their resume.
   */
  static async applyToDrive(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const driveId = req.params.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      if (!driveId?.trim()) {
        res.status(400).json({ success: false, message: 'Drive ID is required.' });
        return;
      }

      // Validate resume file
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, message: 'Please upload your resume before applying.' });
        return;
      }

      // Extra backend validation: MIME type
      if (file.mimetype !== 'application/pdf') {
        res.status(400).json({ success: false, message: 'Only PDF files are allowed.' });
        return;
      }

      // Extra backend validation: file extension
      if (!file.originalname.toLowerCase().endsWith('.pdf')) {
        res.status(400).json({ success: false, message: 'Only PDF files are allowed.' });
        return;
      }

      // Extra backend validation: size (multer already blocks >5MB but double-check)
      if (file.size > MAX_RESUME_SIZE_BYTES) {
        res.status(400).json({ success: false, message: 'Resume must be less than 5 MB.' });
        return;
      }

      const result = await ApplicationService.applyToDrive(userId, driveId.trim(), {
        buffer: file.buffer,
        originalName: file.originalname,
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: result,
      });
    } catch (error: any) {
      // Handle multer file-size error
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ success: false, message: 'Resume size must be less than 5 MB.' });
        return;
      }

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
      const { driveId, status, studentId, search } = req.query;

      const applications = await ApplicationService.getTpoApplications({
        driveId: typeof driveId === 'string' ? driveId : undefined,
        status: typeof status === 'string' ? status : undefined,
        studentId: typeof studentId === 'string' ? studentId : undefined,
        search: typeof search === 'string' ? search : undefined,
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
   * GET /api/tpo/applications/export (or /api/applications/export)
   * Streams a formatted CSV export of applications (TPO only)
   */
  static async exportApplicationsCsv(req: Request, res: Response): Promise<void> {
    try {
      const { driveId, status, studentId, search, applicationIds } = req.query;

      const csvData = await ApplicationService.exportApplicationsCsv({
        driveId: typeof driveId === 'string' ? driveId : undefined,
        status: typeof status === 'string' ? status : undefined,
        studentId: typeof studentId === 'string' ? studentId : undefined,
        search: typeof search === 'string' ? search : undefined,
        applicationIds: typeof applicationIds === 'string' ? applicationIds : undefined,
      });

      const today = new Date().toISOString().split('T')[0];
      const filename = `placement-applications-${today}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csvData);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to export applications.',
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

  /**
   * POST /api/tpo/applications/:id/interview
   * Schedules an interview for a SHORTLISTED application (TPO only)
   */
  static async scheduleInterview(req: Request, res: Response): Promise<void> {
    try {
      const applicationId = req.params.id;
      const interviewData = req.body;

      if (!applicationId?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Application ID is required.',
        });
        return;
      }

      const scheduled = await ApplicationService.scheduleInterview(
        applicationId.trim(),
        interviewData
      );

      res.status(201).json({
        success: true,
        message: 'Interview scheduled successfully',
        data: scheduled,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while scheduling interview.',
      });
    }
  }

  /**
   * PATCH /api/tpo/applications/:id/interview/:interviewId
   * Updates an existing interview (TPO only)
   */
  static async updateInterview(req: Request, res: Response): Promise<void> {
    try {
      const { id: applicationId, interviewId } = req.params;
      const interviewData = req.body;

      if (!applicationId?.trim() || !interviewId?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Application ID and Interview ID are required.',
        });
        return;
      }

      const updated = await ApplicationService.updateInterview(
        applicationId.trim(),
        interviewId.trim(),
        interviewData
      );

      res.status(200).json({
        success: true,
        message: 'Interview updated successfully',
        data: updated,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while updating interview.',
      });
    }
  }

  /**
   * GET /api/student/applications/:id/resume
   * Returns the resume URL for a specific application (student can only access their own).
   *
   * GET /api/tpo/applications/:id/resume
   * Returns the resume URL for a specific application (TPO can access any).
   */
  static async getApplicationResume(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const applicationId = req.params.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      if (!applicationId?.trim()) {
        res.status(400).json({ success: false, message: 'Application ID is required.' });
        return;
      }

      const result = await ApplicationService.getApplicationResume(
        applicationId.trim(),
        userId,
        userRole as 'STUDENT' | 'TPO'
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred while fetching resume.',
      });
    }
  }
}
