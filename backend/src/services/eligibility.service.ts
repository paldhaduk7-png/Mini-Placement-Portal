import { Student, RecruitmentDrive, StudentType, VerificationStatus } from '@prisma/client';
import prisma from '../lib/prisma';

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}

export type StudentWithUser = Student & {
  user?: {
    id: string;
    email: string;
  } | null;
};

export class EligibilityService {
  /**
   * Core Reusable Eligibility Engine
   * Evaluates student profile against drive criteria.
   * Collects all applicable failure reasons without short-circuiting.
   */
  static checkStudentEligibility(
    student: Student | StudentWithUser,
    drive: RecruitmentDrive,
    currentTime: Date = new Date()
  ): EligibilityResult {
    const reasons: string[] = [];

    // 1. Profile Verification Check
    if (drive.requiresVerification) {
      if (student.verificationStatus !== VerificationStatus.VERIFIED) {
        reasons.push(
          `Profile verification required. Current verification status is ${student.verificationStatus}.`
        );
      }
    }

    // 2. Student Type Check
    if (drive.allowedStudentTypes && drive.allowedStudentTypes.length > 0) {
      if (!drive.allowedStudentTypes.includes(student.studentType)) {
        reasons.push(
          `Student type '${student.studentType}' is not eligible for this drive. Allowed types: ${drive.allowedStudentTypes.join(', ')}.`
        );
      }
    }

    // 3. Department Check (if allowedDepartments is empty, no restriction)
    if (drive.allowedDepartments && drive.allowedDepartments.length > 0) {
      const studentDept = student.department?.trim().toLowerCase();
      const isDeptAllowed = drive.allowedDepartments.some(
        (d) => d.trim().toLowerCase() === studentDept
      );
      if (!isDeptAllowed) {
        reasons.push(
          `Department '${student.department}' is not eligible for this drive. Allowed departments: ${drive.allowedDepartments.join(', ')}.`
        );
      }
    }

    // 4. Current CGPA Check
    if (drive.minCgpa > 0) {
      if (student.currentCgpa < drive.minCgpa) {
        reasons.push(
          `Minimum CGPA required is ${drive.minCgpa}. Student CGPA is ${student.currentCgpa}.`
        );
      }
    }

    // 5. 10th Percentage Check
    if (drive.minTenthPercentage > 0) {
      if (student.tenthPercentage < drive.minTenthPercentage) {
        reasons.push(
          `Minimum 10th percentage required is ${drive.minTenthPercentage}%. Student has ${student.tenthPercentage}%.`
        );
      }
    }

    // 6. 12th Percentage Check (Only for REGULAR students)
    if (student.studentType === StudentType.REGULAR) {
      if (drive.minTwelfthPercentage !== null && drive.minTwelfthPercentage !== undefined) {
        if (student.twelfthPercentage === null || student.twelfthPercentage === undefined) {
          reasons.push('12th percentage is required for REGULAR students. Record missing.');
        } else if (student.twelfthPercentage < drive.minTwelfthPercentage) {
          reasons.push(
            `Minimum 12th percentage required is ${drive.minTwelfthPercentage}%. Student has ${student.twelfthPercentage}%.`
          );
        }
      }
    }
    // Note: D2D students are NOT restricted by 12th percentage.

    // 7. D2D CGPA Check (Only for D2D students)
    if (student.studentType === StudentType.D2D) {
      if (drive.minD2dCgpa !== null && drive.minD2dCgpa !== undefined) {
        if (student.d2dCgpa === null || student.d2dCgpa === undefined) {
          reasons.push('D2D CGPA is required for D2D students. Record missing.');
        } else if (student.d2dCgpa < drive.minD2dCgpa) {
          reasons.push(
            `Minimum D2D CGPA required is ${drive.minD2dCgpa}. Student D2D CGPA is ${student.d2dCgpa}.`
          );
        }
      }
    }
    // Note: REGULAR students are NOT restricted by d2dCgpa.

    // 8. Active Backlogs Check
    if (student.activeBacklogs > drive.maxActiveBacklogs) {
      reasons.push(
        `Maximum allowed active backlogs is ${drive.maxActiveBacklogs}. Student has ${student.activeBacklogs}.`
      );
    }

    // 9. Application Deadline Check
    if (currentTime.getTime() > drive.deadline.getTime()) {
      reasons.push(
        `Application deadline has passed on ${drive.deadline.toISOString()}.`
      );
    }

    return {
      eligible: reasons.length === 0,
      reasons,
    };
  }

  /**
   * TPO: Fetch all eligible students for a drive
   */
  static async getEligibleStudentsForDrive(driveId: string) {
    // 1. Fetch drive
    const drive = await prisma.recruitmentDrive.findUnique({
      where: { id: driveId },
      include: {
        company: {
          select: { id: true, name: true, imageUrl: true },
        },
      },
    });

    if (!drive) {
      const error: any = new Error(`Recruitment drive with ID '${driveId}' was not found.`);
      error.statusCode = 404;
      throw error;
    }

    // 2. Fetch all students with user details (passwords omitted)
    const students = await prisma.student.findMany({
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
      orderBy: { currentCgpa: 'desc' },
    });

    // 3. Evaluate each student through the core eligibility engine
    const eligibleStudents: any[] = [];
    const now = new Date();

    for (const student of students) {
      const result = this.checkStudentEligibility(student, drive, now);
      if (result.eligible) {
        eligibleStudents.push({
          id: student.id,
          userId: student.userId,
          fullName: student.fullName,
          email: student.user?.email || null,
          phone: student.phone,
          department: student.department,
          studentType: student.studentType,
          currentCgpa: student.currentCgpa,
          tenthPercentage: student.tenthPercentage,
          twelfthPercentage: student.twelfthPercentage,
          d2dCgpa: student.d2dCgpa,
          activeBacklogs: student.activeBacklogs,
          verificationStatus: student.verificationStatus,
        });
      }
    }

    return {
      drive: {
        id: drive.id,
        role: drive.role,
        ctc: drive.ctc,
        deadline: drive.deadline,
        company: drive.company,
      },
      count: eligibleStudents.length,
      eligibleStudents,
    };
  }

  /**
   * Student: Check own eligibility for a drive
   */
  static async checkStudentEligibilityForDrive(userId: string, driveId: string) {
    // 1. Fetch student by authenticated user's ID
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      const error: any = new Error('Student profile not found for the authenticated user.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Fetch drive with company details
    const drive = await prisma.recruitmentDrive.findUnique({
      where: { id: driveId },
      include: {
        company: {
          select: { id: true, name: true, imageUrl: true },
        },
      },
    });

    if (!drive) {
      const error: any = new Error(`Recruitment drive with ID '${driveId}' was not found.`);
      error.statusCode = 404;
      throw error;
    }

    // 3. Evaluate eligibility
    const result = this.checkStudentEligibility(student, drive);

    return {
      drive,
      eligible: result.eligible,
      reasons: result.reasons,
    };
  }
}
