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
   * Updates the profile of the authenticated student.
   * Allowed only when profile is not locked, or when verificationStatus is REJECTED.
   */
  static async updateStudentProfile(userId: string, data: any) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      const error: any = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    if (student.isProfileLocked && student.verificationStatus !== VerificationStatus.REJECTED) {
      const error: any = new Error('Profile is locked and cannot be edited.');
      error.statusCode = 403;
      throw error;
    }

    const updateData: any = {};
    if (data.fullName !== undefined) updateData.fullName = String(data.fullName).trim();
    if (data.phone !== undefined) updateData.phone = String(data.phone).trim();
    if (data.dob !== undefined && data.dob) {
      const parsed = new Date(data.dob);
      if (!isNaN(parsed.getTime())) updateData.dob = parsed;
    }
    if (data.studentType !== undefined) updateData.studentType = data.studentType;
    if (data.department !== undefined) updateData.department = String(data.department).trim();
    if (data.currentCgpa !== undefined && data.currentCgpa !== null) {
      updateData.currentCgpa = Number(data.currentCgpa);
    }
    if (data.activeBacklogs !== undefined && data.activeBacklogs !== null) {
      updateData.activeBacklogs = Number(data.activeBacklogs);
    }
    if (data.totalBacklogs !== undefined && data.totalBacklogs !== null) {
      updateData.totalBacklogs = Number(data.totalBacklogs);
    }
    if (data.tenthPercentage !== undefined && data.tenthPercentage !== null) {
      updateData.tenthPercentage = Number(data.tenthPercentage);
    }
    if (data.tenthMathsMarks !== undefined && data.tenthMathsMarks !== null) {
      updateData.tenthMathsMarks = Number(data.tenthMathsMarks);
    }
    if (data.tenthScienceMarks !== undefined && data.tenthScienceMarks !== null) {
      updateData.tenthScienceMarks = Number(data.tenthScienceMarks);
    }
    if (data.tenthEnglishMarks !== undefined && data.tenthEnglishMarks !== null) {
      updateData.tenthEnglishMarks = Number(data.tenthEnglishMarks);
    }
    if (data.tenthSocialScienceMarks !== undefined && data.tenthSocialScienceMarks !== null) {
      updateData.tenthSocialScienceMarks = Number(data.tenthSocialScienceMarks);
    }
    if (data.tenthLanguageMarks !== undefined) {
      updateData.tenthLanguageMarks = data.tenthLanguageMarks !== null ? Number(data.tenthLanguageMarks) : null;
    }
    if (data.tenthTotalMarks !== undefined && data.tenthTotalMarks !== null) {
      updateData.tenthTotalMarks = Number(data.tenthTotalMarks);
    }
    if (data.tenthMaxMarks !== undefined && data.tenthMaxMarks !== null) {
      updateData.tenthMaxMarks = Number(data.tenthMaxMarks);
    }
    if (data.twelfthPercentage !== undefined) {
      updateData.twelfthPercentage = data.twelfthPercentage != null && data.twelfthPercentage !== '' ? Number(data.twelfthPercentage) : null;
    }
    if (data.d2dCgpa !== undefined) {
      updateData.d2dCgpa = data.d2dCgpa != null && data.d2dCgpa !== '' ? Number(data.d2dCgpa) : null;
    }
    if (data.diplomaBranch !== undefined) {
      updateData.diplomaBranch = data.diplomaBranch ? String(data.diplomaBranch).trim() : null;
    }
    if (data.diplomaCollege !== undefined) {
      updateData.diplomaCollege = data.diplomaCollege ? String(data.diplomaCollege).trim() : null;
    }

    const updatedStudent = await prisma.student.update({
      where: { userId },
      data: updateData,
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

    return updatedStudent;
  }

  /**
   * Submits and locks the student profile.
   * Once locked, the profile cannot be submitted again unless REJECTED by TPO.
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

    // 2. Reject if already locked and not rejected
    if (student.isProfileLocked && student.verificationStatus !== VerificationStatus.REJECTED) {
      const error: any = new Error('Profile is already locked and cannot be submitted again.');
      error.statusCode = 409;
      throw error;
    }

    // 3. Validate required academic data completeness before locking
    const missing: string[] = [];
    if (!student.fullName?.trim()) missing.push('fullName');
    if (!student.phone?.trim()) missing.push('phone');
    if (!student.dob) missing.push('dob');
    if (student.currentCgpa == null || student.currentCgpa < 0) missing.push('currentCgpa');

    // 10th marks validation
    if (student.tenthMathsMarks == null || student.tenthMathsMarks < 0) missing.push('tenthMathsMarks');
    if (student.tenthScienceMarks == null || student.tenthScienceMarks < 0) missing.push('tenthScienceMarks');
    if (student.tenthEnglishMarks == null || student.tenthEnglishMarks < 0) missing.push('tenthEnglishMarks');
    if (student.tenthSocialScienceMarks == null || student.tenthSocialScienceMarks < 0) missing.push('tenthSocialScienceMarks');
    if (student.tenthTotalMarks == null || student.tenthTotalMarks <= 0) missing.push('tenthTotalMarks');
    
    if (student.tenthTotalMarks != null && student.tenthMaxMarks != null) {
      if (student.tenthTotalMarks > student.tenthMaxMarks) {
        missing.push('tenthTotalMarks cannot exceed tenthMaxMarks');
      }
    }

    if (student.tenthPercentage == null || student.tenthPercentage <= 0) missing.push('tenthPercentage');

    if (student.studentType === StudentType.REGULAR) {
      if (student.twelfthPercentage == null || student.twelfthPercentage <= 0) {
        missing.push('twelfthPercentage (required for REGULAR students)');
      }
    } else if (student.studentType === StudentType.D2D) {
      if (student.d2dCgpa == null || student.d2dCgpa <= 0) missing.push('d2dCgpa');
      if (!student.diplomaCollege?.trim()) missing.push('diplomaCollege');
    }

    if (missing.length > 0) {
      const error: any = new Error(
        `Cannot submit profile. Missing required data: ${missing.join(', ')}`
      );
      error.statusCode = 400;
      throw error;
    }

    // 4. Lock profile, clear previous rejection reason, and set status to PENDING
    const updatedStudent = await prisma.student.update({
      where: { userId },
      data: {
        isProfileLocked: true,
        verificationStatus: VerificationStatus.PENDING,
        rejectionReason: null,
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
