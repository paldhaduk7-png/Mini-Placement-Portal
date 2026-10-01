import { Request, Response } from 'express';
import multer from 'multer';
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

      const data = { ...req.body };

      let uploadedPhotoUrl: string | null = null;
      if (data.profilePhoto && typeof data.profilePhoto === 'string' && data.profilePhoto.startsWith('data:image')) {
        try {
          const { uploadToCloudinary } = await import('../config/cloudinary');
          const result = await uploadToCloudinary(data.profilePhoto);
          uploadedPhotoUrl = result.secureUrl;
          data.profilePhoto = uploadedPhotoUrl;
        } catch (uploadError: any) {
          console.error('Profile photo upload error:', uploadError);
          // Delete from payload so it doesn't try to save base64 if it failed
          delete data.profilePhoto;
        }
      }

      const updated = await StudentService.updateStudentProfile(userId, data);
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

  /**
   * POST /api/students/me/resume
   * Uploads or replaces authenticated student's resume PDF.
   */
  static async uploadResume(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required.',
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Please choose a valid PDF file to upload as your resume.',
        });
        return;
      }

      const updated = await StudentService.uploadResume(
        userId,
        req.file.buffer,
        req.file.originalname
      );

      res.status(200).json({
        message: 'Resume uploaded successfully.',
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

      console.error('Error uploading resume:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred while uploading your resume.',
      });
    }
  }

  /**
   * GET /api/students/me/resume
   * Returns current resume metadata for authenticated student.
   */
  static async getResume(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required.',
        });
        return;
      }

      const resume = await StudentService.getResume(userId);
      res.status(200).json(resume);
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      console.error('Error fetching resume:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching your resume.',
      });
    }
  }

  /**
   * DELETE /api/students/me/resume
   * Removes current resume for authenticated student.
   */
  static async deleteResume(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required.',
        });
        return;
      }

      const updated = await StudentService.deleteResume(userId);
      res.status(200).json({
        message: 'Resume deleted successfully.',
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

      console.error('Error deleting resume:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while deleting your resume.',
      });
    }
  }
}

const resumeStorage = multer.memoryStorage();
export const uploadResumeMulter = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const isPdfMime = file.mimetype === 'application/pdf';
    const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');
    if (isPdfMime || isPdfExt) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for resumes.'));
    }
  },
});
