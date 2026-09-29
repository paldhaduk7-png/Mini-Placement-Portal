import { VerificationStatus, StudentType } from '@prisma/client';
import prisma from '../lib/prisma';

export interface UpdateStudentByTpoInput {
  fullName?: string;
  phone?: string;
  dob?: string | Date;
  department?: string;
  currentCgpa?: number;
  activeBacklogs?: number;
  totalBacklogs?: number;
  tenthMathsMarks?: number;
  tenthScienceMarks?: number;
  tenthEnglishMarks?: number;
  tenthSocialScienceMarks?: number;
  tenthLanguageMarks?: number | null;
  tenthTotalMarks?: number;
  tenthMaxMarks?: number;
  tenthPercentage?: number;
  twelfthPercentage?: number | null;
  d2dCgpa?: number | null;
  diplomaBranch?: string | null;
  diplomaCollege?: string | null;
}

export interface VerifyStudentInput {
  status: 'VERIFIED' | 'REJECTED';
  rejectionReason?: string | null;
}

export class TpoStudentService {
  /**
   * Helper to find student by either Student.id or Student.userId
   */
  private static async findStudentById(identifier: string) {
    let student = await prisma.student.findUnique({
      where: { id: identifier },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!student) {
      student = await prisma.student.findUnique({
        where: { userId: identifier },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
        },
      });
    }

    return student;
  }

  /**
   * List all students with user metadata (passwords omitted).
   */
  static async getAllStudents(filters?: {
    department?: string;
    studentType?: StudentType;
    verificationStatus?: VerificationStatus;
  }) {
    const where: any = {};
    if (filters?.department) where.department = filters.department;
    if (filters?.studentType) where.studentType = filters.studentType;
    if (filters?.verificationStatus) where.verificationStatus = filters.verificationStatus;

    const students = await prisma.student.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    return students;
  }

  /**
   * Get single student profile by Student ID or User ID.
   */
  static async getStudentById(studentId: string) {
    const student = await this.findStudentById(studentId);

    if (!student) {
      const error: any = new Error(`Student with ID '${studentId}' was not found.`);
      error.statusCode = 404;
      throw error;
    }

    return student;
  }

  /**
   * Update student profile/academic info by TPO.
   * Can update even when isProfileLocked is true.
   * Never modifies User password, email, or role.
   */
  static async updateStudent(studentId: string, input: UpdateStudentByTpoInput) {
    const existing = await this.findStudentById(studentId);

    if (!existing) {
      const error: any = new Error(`Student with ID '${studentId}' was not found.`);
      error.statusCode = 404;
      throw error;
    }

    const dataToUpdate: any = {};

    if (input.fullName !== undefined) {
      if (!input.fullName.trim()) {
        const error: any = new Error('fullName cannot be empty.');
        error.statusCode = 400;
        throw error;
      }
      dataToUpdate.fullName = input.fullName.trim();
    }

    if (input.phone !== undefined) {
      if (!input.phone.trim()) {
        const error: any = new Error('phone cannot be empty.');
        error.statusCode = 400;
        throw error;
      }
      dataToUpdate.phone = input.phone.trim();
    }

    if (input.dob !== undefined) {
      const parsedDob = new Date(input.dob);
      if (isNaN(parsedDob.getTime())) {
        const error: any = new Error('Invalid date of birth format.');
        error.statusCode = 400;
        throw error;
      }
      dataToUpdate.dob = parsedDob;
    }

    if (input.department !== undefined) {
      if (!input.department.trim()) {
        const error: any = new Error('department cannot be empty.');
        error.statusCode = 400;
        throw error;
      }
      dataToUpdate.department = input.department.trim();
    }

    if (input.currentCgpa !== undefined) {
      const cgpa = Number(input.currentCgpa);
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        const error: any = new Error('currentCgpa must be a number between 0 and 10.');
        error.statusCode = 400;
        throw error;
      }
      dataToUpdate.currentCgpa = cgpa;
    }

    // Backlog validation
    const activeB = input.activeBacklogs !== undefined ? Number(input.activeBacklogs) : existing.activeBacklogs;
    const totalB = input.totalBacklogs !== undefined ? Number(input.totalBacklogs) : existing.totalBacklogs;

    if (isNaN(activeB) || activeB < 0 || isNaN(totalB) || totalB < 0) {
      const error: any = new Error('Backlog counts must be non-negative integers.');
      error.statusCode = 400;
      throw error;
    }
    if (activeB > totalB) {
      const error: any = new Error('activeBacklogs cannot exceed totalBacklogs.');
      error.statusCode = 400;
      throw error;
    }
    if (input.activeBacklogs !== undefined) dataToUpdate.activeBacklogs = activeB;
    if (input.totalBacklogs !== undefined) dataToUpdate.totalBacklogs = totalB;

    // Std 10 validation
    if (input.tenthPercentage !== undefined) {
      const p = Number(input.tenthPercentage);
      if (isNaN(p) || p < 0 || p > 100) {
        const error: any = new Error('tenthPercentage must be between 0 and 100.');
        error.statusCode = 400;
        throw error;
      }
      dataToUpdate.tenthPercentage = p;
    }

    if (input.tenthMathsMarks !== undefined) {
      const m = Number(input.tenthMathsMarks);
      if (isNaN(m) || m < 0) throw Object.assign(new Error('tenthMathsMarks must be >= 0.'), { statusCode: 400 });
      dataToUpdate.tenthMathsMarks = m;
    }

    if (input.tenthScienceMarks !== undefined) {
      const s = Number(input.tenthScienceMarks);
      if (isNaN(s) || s < 0) throw Object.assign(new Error('tenthScienceMarks must be >= 0.'), { statusCode: 400 });
      dataToUpdate.tenthScienceMarks = s;
    }

    if (input.tenthEnglishMarks !== undefined) {
      const e = Number(input.tenthEnglishMarks);
      if (isNaN(e) || e < 0) throw Object.assign(new Error('tenthEnglishMarks must be >= 0.'), { statusCode: 400 });
      dataToUpdate.tenthEnglishMarks = e;
    }

    if (input.tenthSocialScienceMarks !== undefined) {
      const ss = Number(input.tenthSocialScienceMarks);
      if (isNaN(ss) || ss < 0) throw Object.assign(new Error('tenthSocialScienceMarks must be >= 0.'), { statusCode: 400 });
      dataToUpdate.tenthSocialScienceMarks = ss;
    }

    if (input.tenthLanguageMarks !== undefined) {
      if (input.tenthLanguageMarks !== null) {
        const l = Number(input.tenthLanguageMarks);
        if (isNaN(l) || l < 0) throw Object.assign(new Error('tenthLanguageMarks must be >= 0.'), { statusCode: 400 });
        dataToUpdate.tenthLanguageMarks = l;
      } else {
        dataToUpdate.tenthLanguageMarks = null;
      }
    }

    if (input.tenthTotalMarks !== undefined) {
      const t = Number(input.tenthTotalMarks);
      if (isNaN(t) || t < 0) throw Object.assign(new Error('tenthTotalMarks must be >= 0.'), { statusCode: 400 });
      dataToUpdate.tenthTotalMarks = t;
    }

    if (input.tenthMaxMarks !== undefined) {
      const max = Number(input.tenthMaxMarks);
      if (isNaN(max) || max <= 0) throw Object.assign(new Error('tenthMaxMarks must be > 0.'), { statusCode: 400 });
      dataToUpdate.tenthMaxMarks = max;
    }

    // REGULAR vs D2D validation
    if (existing.studentType === StudentType.REGULAR) {
      if (input.twelfthPercentage !== undefined) {
        if (input.twelfthPercentage !== null) {
          const p12 = Number(input.twelfthPercentage);
          if (isNaN(p12) || p12 < 0 || p12 > 100) {
            throw Object.assign(new Error('twelfthPercentage must be between 0 and 100.'), { statusCode: 400 });
          }
          dataToUpdate.twelfthPercentage = p12;
        } else {
          throw Object.assign(new Error('twelfthPercentage is required for REGULAR students.'), { statusCode: 400 });
        }
      }
    } else if (existing.studentType === StudentType.D2D) {
      if (input.d2dCgpa !== undefined) {
        if (input.d2dCgpa !== null) {
          const dCgpa = Number(input.d2dCgpa);
          if (isNaN(dCgpa) || dCgpa < 0 || dCgpa > 10) {
            throw Object.assign(new Error('d2dCgpa must be between 0 and 10.'), { statusCode: 400 });
          }
          dataToUpdate.d2dCgpa = dCgpa;
        } else {
          throw Object.assign(new Error('d2dCgpa is required for D2D students.'), { statusCode: 400 });
        }
      }
      if (input.diplomaBranch !== undefined) dataToUpdate.diplomaBranch = input.diplomaBranch?.trim() || null;
      if (input.diplomaCollege !== undefined) dataToUpdate.diplomaCollege = input.diplomaCollege?.trim() || null;
    }

    const updated = await prisma.student.update({
      where: { id: existing.id },
      data: dataToUpdate,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      message: 'Student profile updated successfully by TPO.',
      student: updated,
    };
  }

  /**
   * Verify or Reject student profile by TPO.
   * Does NOT unlock the student profile.
   */
  static async verifyStudent(studentId: string, input: VerifyStudentInput) {
    const existing = await this.findStudentById(studentId);

    if (!existing) {
      const error: any = new Error(`Student with ID '${studentId}' was not found.`);
      error.statusCode = 404;
      throw error;
    }

    if (input.status !== 'VERIFIED' && input.status !== 'REJECTED') {
      const error: any = new Error("status must be either 'VERIFIED' or 'REJECTED'.");
      error.statusCode = 400;
      throw error;
    }

    let updateData: any = {};

    if (input.status === 'VERIFIED') {
      updateData = {
        verificationStatus: VerificationStatus.VERIFIED,
        verifiedAt: new Date(),
        rejectionReason: null,
      };
    } else {
      // REJECTED requires a reason
      if (!input.rejectionReason?.trim()) {
        const error: any = new Error('A rejectionReason must be provided when rejecting a student.');
        error.statusCode = 400;
        throw error;
      }

      updateData = {
        verificationStatus: VerificationStatus.REJECTED,
        verifiedAt: null,
        rejectionReason: input.rejectionReason.trim(),
      };
    }

    // Notice: isProfileLocked is preserved exactly as is!
    const updated = await prisma.student.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      message: `Student profile ${input.status.toLowerCase()} successfully.`,
      student: updated,
    };
  }
}
