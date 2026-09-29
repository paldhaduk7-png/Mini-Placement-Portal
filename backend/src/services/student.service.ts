import { StudentType, VerificationStatus } from '@prisma/client';
import prisma from '../lib/prisma';

export class StudentService {
  /**
   * Retrieves the profile of the authenticated student.
   * Excludes sensitive authentication credentials (password/hashes).
   */
  static async getStudentProfile(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
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
      const error: any = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    return student;
  }

  /**
   * Submits and locks the student profile.
   * Once locked, the profile cannot be submitted again or edited by the student.
   */
  static async submitStudentProfile(userId: string) {
    // 1. Fetch current student profile
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      const error: any = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Reject if already locked
    if (student.isProfileLocked) {
      const error: any = new Error('Profile is already locked and cannot be submitted again.');
      error.statusCode = 409;
      throw error;
    }

    // 3. Validate required academic data completeness before locking
    const missing: string[] = [];
    if (!student.fullName?.trim()) missing.push('fullName');
    if (!student.phone?.trim()) missing.push('phone');
    if (!student.dob) missing.push('dob');
    if (!student.department?.trim()) missing.push('department');
    if (student.currentCgpa == null) missing.push('currentCgpa');
    if (student.tenthPercentage == null) missing.push('tenthPercentage');

    if (student.studentType === StudentType.REGULAR) {
      if (student.twelfthPercentage == null) {
        missing.push('twelfthPercentage (required for REGULAR students)');
      }
    } else if (student.studentType === StudentType.D2D) {
      if (student.d2dCgpa == null) missing.push('d2dCgpa');
      if (!student.diplomaBranch?.trim()) missing.push('diplomaBranch');
      if (!student.diplomaCollege?.trim()) missing.push('diplomaCollege');
    }

    if (missing.length > 0) {
      const error: any = new Error(
        `Cannot submit profile. Missing required data: ${missing.join(', ')}`
      );
      error.statusCode = 400;
      throw error;
    }

    // 4. Lock profile and set status to PENDING
    const updatedStudent = await prisma.student.update({
      where: { userId },
      data: {
        isProfileLocked: true,
        verificationStatus: VerificationStatus.PENDING,
      },
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
      message: 'Profile submitted and locked successfully. Pending TPO verification.',
      student: updatedStudent,
    };
  }
}
