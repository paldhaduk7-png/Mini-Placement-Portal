import { Request, Response } from 'express';
import { StudentType, VerificationStatus } from '@prisma/client';
import { TpoStudentService } from '../services/tpo-student.service';

export class TpoStudentController {
  /**
   * GET /api/tpo/students
   * Lists all students (with optional query filters: department, studentType, verificationStatus).
   */
  static async getAllStudents(req: Request, res: Response): Promise<void> {
    try {
      const { department, studentType, verificationStatus, search } = req.query;

      const filters: any = {};
      if (typeof department === 'string') filters.department = department;
      if (typeof search === 'string') filters.search = search;
      if (studentType === StudentType.REGULAR || studentType === StudentType.D2D) {
        filters.studentType = studentType;
      }
      if (
        verificationStatus === VerificationStatus.PENDING ||
        verificationStatus === VerificationStatus.VERIFIED ||
        verificationStatus === VerificationStatus.REJECTED
      ) {
        filters.verificationStatus = verificationStatus;
      }

      const students = await TpoStudentService.getAllStudents(filters);
      res.status(200).json({
        success: true,
        count: students.length,
        data: students,
      });
    } catch (error: any) {
      console.error('Error in TpoStudentController.getAllStudents:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching students.',
      });
    }
  }

  /**
   * GET /api/tpo/students/:id
   * Retrieves single student profile.
   */
  static async getStudentById(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.params.id;

      if (!studentId?.trim()) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Student ID is required.',
        });
        return;
      }

      const student = await TpoStudentService.getStudentById(studentId);
      res.status(200).json(student);
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      console.error('Error in TpoStudentController.getStudentById:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching student details.',
      });
    }
  }

  /**
   * PATCH /api/tpo/students/:id
   * Updates student profile/academic info by TPO.
   */
  static async updateStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.params.id;

      if (!studentId?.trim()) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Student ID is required.',
        });
        return;
      }

      // Explicitly reject attempts to modify auth-level User credentials/role
      if (req.body.password || req.body.email || req.body.role) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'User email, password, and role cannot be modified through this endpoint.',
        });
        return;
      }

      const result = await TpoStudentService.updateStudent(studentId, req.body);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({
          error: 'Not Found',
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

      console.error('Error in TpoStudentController.updateStudent:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while updating the student profile.',
      });
    }
  }

  /**
   * PATCH /api/tpo/students/:id/verify
   * Verifies or Rejects a student profile.
   */
  static async verifyStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.params.id;
      const { status, rejectionReason } = req.body;

      if (!studentId?.trim()) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Student ID is required.',
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          error: 'Validation Error',
          message: "A verification status ('VERIFIED' or 'REJECTED') is required.",
        });
        return;
      }

      const result = await TpoStudentService.verifyStudent(studentId, {
        status,
        rejectionReason,
      });

      res.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({
          error: 'Not Found',
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

      console.error('Error in TpoStudentController.verifyStudent:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while updating student verification status.',
      });
    }
  }
}
