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
  static async checkStudentEligibility(
    student: Student | StudentWithUser,
    drive: RecruitmentDrive,
    currentTime: Date = new Date(),
    role?: any
  ): Promise<EligibilityResult> {
    const reasons: string[] = [];

    const effectiveCriteria = role && !role.useCommonEligibility
      ? {
          minCgpa: role.minCgpa ?? drive.minCgpa,
          minTenthPercentage: role.minTenthPercentage ?? drive.minTenthPercentage,
          minTwelfthPercentage: role.minTwelfthPercentage ?? drive.minTwelfthPercentage,
          minD2dCgpa: role.minD2dCgpa ?? drive.minD2dCgpa,
          maxActiveBacklogs: role.maxActiveBacklogs ?? drive.maxActiveBacklogs,
          allowedStudentTypes: role.allowedStudentTypes?.length ? role.allowedStudentTypes : drive.allowedStudentTypes,
          allowedDepartments: role.allowedDepartments?.length ? role.allowedDepartments : drive.allowedDepartments,
          requiresVerification: drive.requiresVerification,
          deadline: drive.deadline,
        }
      : drive;

    // 1. Profile Verification Check
    if (effectiveCriteria.requiresVerification) {
      if (student.verificationStatus !== VerificationStatus.VERIFIED) {
        reasons.push(
          `Profile verification required. Current verification status is ${student.verificationStatus}.`
        );
      }
    }

    // 2. Student Type Check
    if (effectiveCriteria.allowedStudentTypes && effectiveCriteria.allowedStudentTypes.length > 0) {
      if (!effectiveCriteria.allowedStudentTypes.includes(student.studentType)) {
        reasons.push(
          `Student type '${student.studentType}' is not eligible for this drive. Allowed types: ${effectiveCriteria.allowedStudentTypes.join(', ')}.`
        );
      }
    }

    // 3. Department Check (if allowedDepartments is empty, no restriction)
    if (effectiveCriteria.allowedDepartments && effectiveCriteria.allowedDepartments.length > 0) {
      const studentDept = student.department?.trim().toLowerCase();
      const isDeptAllowed = effectiveCriteria.allowedDepartments.some(
        (d: string) => d.trim().toLowerCase() === studentDept
      );
      if (!isDeptAllowed) {
        reasons.push(
          `Department '${student.department}' is not eligible for this drive. Allowed departments: ${effectiveCriteria.allowedDepartments.join(', ')}.`
        );
      }
    }

    // 4. Current CGPA Check
    if (effectiveCriteria.minCgpa > 0) {
      if (student.currentCgpa < effectiveCriteria.minCgpa) {
        reasons.push(
          `Minimum CGPA required is ${effectiveCriteria.minCgpa}. Student CGPA is ${student.currentCgpa}.`
        );
      }
    }

    // 5. 10th Percentage Check
    if (effectiveCriteria.minTenthPercentage > 0) {
      if (student.tenthPercentage < effectiveCriteria.minTenthPercentage) {
        reasons.push(
          `Minimum 10th percentage required is ${effectiveCriteria.minTenthPercentage}%. Student has ${student.tenthPercentage}%.`
        );
      }
    }

    // 6. 12th Percentage Check (Only for REGULAR students)
    if (student.studentType === StudentType.REGULAR) {
      if (effectiveCriteria.minTwelfthPercentage !== null && effectiveCriteria.minTwelfthPercentage !== undefined) {
        if (student.twelfthPercentage === null || student.twelfthPercentage === undefined) {
          reasons.push('12th percentage is required for REGULAR students. Record missing.');
        } else if (student.twelfthPercentage < effectiveCriteria.minTwelfthPercentage) {
          reasons.push(
            `Minimum 12th percentage required is ${effectiveCriteria.minTwelfthPercentage}%. Student has ${student.twelfthPercentage}%.`
          );
        }
      }
    }
    // Note: D2D students are NOT restricted by 12th percentage.

    // 7. D2D CGPA Check (Only for D2D students)
    if (student.studentType === StudentType.D2D) {
      if (effectiveCriteria.minD2dCgpa !== null && effectiveCriteria.minD2dCgpa !== undefined) {
        if (student.d2dCgpa === null || student.d2dCgpa === undefined) {
          reasons.push('D2D CGPA is required for D2D students. Record missing.');
        } else if (student.d2dCgpa < effectiveCriteria.minD2dCgpa) {
          reasons.push(
            `Minimum D2D CGPA required is ${effectiveCriteria.minD2dCgpa}. Student D2D CGPA is ${student.d2dCgpa}.`
          );
        }
      }
    }
    // Note: REGULAR students are NOT restricted by d2dCgpa.

    // 8. Active Backlogs Check
    if (student.activeBacklogs > effectiveCriteria.maxActiveBacklogs) {
      reasons.push(
        `Maximum allowed active backlogs is ${effectiveCriteria.maxActiveBacklogs}. Student has ${student.activeBacklogs}.`
      );
    }

    // 9. Application Deadline Check
    // If deadline was saved at midnight UTC (00:00:00.000Z), treat cutoff as evening 6:00 PM IST (18:00 IST / 12:30 UTC) on that date
    let effectiveDeadline = new Date(effectiveCriteria.deadline);
    if (
      effectiveDeadline.getUTCHours() === 0 &&
      effectiveDeadline.getUTCMinutes() === 0 &&
      effectiveDeadline.getUTCSeconds() === 0
    ) {
      effectiveDeadline = new Date(Date.UTC(
        effectiveDeadline.getUTCFullYear(),
        effectiveDeadline.getUTCMonth(),
        effectiveDeadline.getUTCDate(),
        12, 30, 0, 0
      ));
    }

    if (currentTime.getTime() > effectiveDeadline.getTime()) {
      const formattedDate = effectiveDeadline.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      reasons.push(
        `Application deadline passed on ${formattedDate} at 06:00 PM.`
      );
    }

    // 10. Package-based Placement Eligibility Check
    let currentPlacement = await prisma.application.findFirst({
      where: {
        studentId: student.id,
        status: 'SELECTED',
        isCurrentPlacement: true,
      },
      include: {
        drive: true,
        driveRole: true,
      },
    });

    if (!currentPlacement) {
      currentPlacement = await prisma.application.findFirst({
        where: {
          studentId: student.id,
          status: 'SELECTED',
        },
        orderBy: [{ updatedAt: 'desc' }, { appliedAt: 'desc' }],
        include: {
          drive: true,
          driveRole: true,
        },
      });
    }

    if (currentPlacement && currentPlacement.driveRole) {
      const currentCtc = currentPlacement.driveRole.maxCTC;
      const requiredPackage = currentCtc * 2;
      
      const hasEligibleRole = (drive as any).roles?.some((r: any) => r.maxCTC >= requiredPackage) || false;
      
      if (!hasEligibleRole) {
        reasons.push(
          `You are currently placed with a ₹${currentCtc} LPA package. This drive requires a minimum package of ₹${requiredPackage} LPA under the current placement eligibility rule.`
        );
      }
    }

    return {
      eligible: reasons.length === 0,
      reasons,
    };
  }

  /**
   * TPO: Fetch all eligible students for a drive
   */
  static async getEligibleStudentsForDrive(driveId: string, roleId?: string) {
    // 1. Fetch drive
    const drive = await prisma.recruitmentDrive.findUnique({
      where: { id: driveId },
      include: {
        company: {
          select: { id: true, name: true, imageUrl: true },
        },
        roles: true,
      },
    });

    if (!drive) {
      const error: any = new Error(`Recruitment drive with ID '${driveId}' was not found.`);
      error.statusCode = 404;
      throw error;
    }

    const selectedRole = roleId ? drive.roles.find(r => r.id === roleId) : undefined;

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
      const result = await this.checkStudentEligibility(student, drive, now, selectedRole);
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
        roles: drive.roles,
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
  static async checkStudentEligibilityForDrive(userId: string, driveId: string, roleId?: string) {
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
        roles: true,
      },
    });

    if (!drive) {
      const error: any = new Error(`Recruitment drive with ID '${driveId}' was not found.`);
      error.statusCode = 404;
      throw error;
    }
    
    const selectedRole = roleId ? drive.roles.find(r => r.id === roleId) : undefined;

    // 3. Evaluate eligibility
    const result = await this.checkStudentEligibility(student, drive, new Date(), selectedRole);

    return {
      drive,
      eligible: result.eligible,
      reasons: result.reasons,
    };
  }
}
