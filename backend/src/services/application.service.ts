import { ApplicationStatus, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { EligibilityService } from './eligibility.service';

export interface ApplyToDriveResult {
  id: string;
  status: ApplicationStatus;
  appliedAt: Date;
  drive: {
    id: string;
    role: string;
    ctc: number;
    jobLocation: string | null;
    deadline: Date;
    company: {
      id: string;
      name: string;
      imageUrl: string | null;
    };
  };
}

export interface TpoApplicationFilter {
  driveId?: string;
  status?: string;
  studentId?: string;
}

export class ApplicationService {
  /**
   * STUDENT: Apply to a recruitment drive
   */
  static async applyToDrive(userId: string, driveId: string): Promise<ApplyToDriveResult> {
    // 1. Fetch authenticated student profile
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      const error: any = new Error('Student profile not found for the authenticated user.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Fetch recruitment drive with company details
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

    // 3. Check if application already exists
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_driveId: {
          studentId: student.id,
          driveId: drive.id,
        },
      },
    });

    if (existingApplication) {
      const error: any = new Error('You have already applied to this recruitment drive.');
      error.statusCode = 409;
      throw error;
    }

    // 4. Server-side eligibility re-check (never trust frontend)
    const eligibilityResult = await EligibilityService.checkStudentEligibility(student, drive);

    if (!eligibilityResult.eligible) {
      const error: any = new Error('You do not meet the eligibility criteria for this recruitment drive.');
      error.statusCode = 403;
      error.reasons = eligibilityResult.reasons;
      throw error;
    }

    // 5. Create application with status = APPLIED and remarks = null
    try {
      const application = await prisma.application.create({
        data: {
          student: { connect: { id: student.id } },
          drive: { connect: { id: drive.id } },
          status: ApplicationStatus.APPLIED,
          remarks: null,
        },
        include: {
          drive: {
            select: {
              id: true,
              role: true,
              ctc: true,
              jobLocation: true,
              deadline: true,
              company: {
                select: { id: true, name: true, imageUrl: true },
              },
            },
          },
        },
      });

      return {
        id: application.id,
        status: application.status,
        appliedAt: application.appliedAt,
        drive: application.drive,
      };
    } catch (err: any) {
      // Handle race condition or unique constraint violation code safely
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const error: any = new Error('You have already applied to this recruitment drive.');
        error.statusCode = 409;
        throw error;
      }
      throw err;
    }
  }

  /**
   * STUDENT: Get applications for the authenticated student only
   */
  static async getStudentApplications(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      const error: any = new Error('Student profile not found for the authenticated user.');
      error.statusCode = 404;
      throw error;
    }

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      select: {
        id: true,
        status: true,
        remarks: true,
        isCurrentPlacement: true,
        appliedAt: true,
        updatedAt: true,
        drive: {
          select: {
            id: true,
            role: true,
            ctc: true,
            jobLocation: true,
            deadline: true,
            company: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return applications;
  }

  /**
   * STUDENT: Get specific application by ID (only if belonging to the authenticated student)
   */
  static async getStudentApplicationById(userId: string, applicationId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      const error: any = new Error('Student profile not found for the authenticated user.');
      error.statusCode = 404;
      throw error;
    }

    // Must match both ID and studentId; if not matching, return 404 to avoid leaking existence
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        studentId: student.id,
      },
      select: {
        id: true,
        status: true,
        remarks: true,
        isCurrentPlacement: true,
        appliedAt: true,
        updatedAt: true,
        drive: {
          select: {
            id: true,
            role: true,
            ctc: true,
            jobLocation: true,
            deadline: true,
            company: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      const error: any = new Error(`Application with ID '${applicationId}' was not found.`);
      error.statusCode = 404;
      throw error;
    }

    return application;
  }

  /**
   * STUDENT: Get placement status and 2x minimum package eligibility rule
   */
  static async getPlacementStatus(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      const error: any = new Error('Student profile not found for the authenticated user.');
      error.statusCode = 404;
      throw error;
    }

    const currentPlacement = await prisma.application.findFirst({
      where: {
        studentId: student.id,
        isCurrentPlacement: true,
      },
      include: {
        drive: {
          include: {
            company: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
        },
      },
    });

    if (!currentPlacement) {
      return {
        isSelected: false,
        selectedCompany: null,
        selectedPackage: null,
        minimumNextPackage: null,
      };
    }

    const currentCtc = currentPlacement.drive.ctc;
    const minimumNextPackage = currentCtc * 2;

    return {
      isSelected: true,
      selectedCompany: currentPlacement.drive.company?.name || null,
      selectedPackage: currentCtc,
      minimumNextPackage,
    };
  }

  /**
   * TPO: Get all applications with optional filters
   */
  static async getTpoApplications(filters: TpoApplicationFilter) {
    let validatedStatus: ApplicationStatus | undefined;

    if (filters.status) {
      const normalizedStatus = filters.status.trim().toUpperCase();
      if (!Object.values(ApplicationStatus).includes(normalizedStatus as ApplicationStatus)) {
        const error: any = new Error(
          `Invalid status '${filters.status}'. Allowed statuses: ${Object.values(ApplicationStatus).join(', ')}.`
        );
        error.statusCode = 400;
        throw error;
      }
      validatedStatus = normalizedStatus as ApplicationStatus;
    }

    const where: Prisma.ApplicationWhereInput = {};

    if (filters.driveId?.trim()) {
      where.driveId = filters.driveId.trim();
    }

    if (filters.studentId?.trim()) {
      where.studentId = filters.studentId.trim();
    }

    if (validatedStatus) {
      where.status = validatedStatus;
    }

    const applications = await prisma.application.findMany({
      where,
      select: {
        id: true,
        status: true,
        remarks: true,
        isCurrentPlacement: true,
        appliedAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            fullName: true,
            user: {
              select: { email: true },
            },
            phone: true,
            department: true,
            studentType: true,
            currentCgpa: true,
            verificationStatus: true,
            resumeUrl: true,
            resumeFileName: true,
            resumeUploadedAt: true,
          },
        },
        drive: {
          select: {
            id: true,
            role: true,
            ctc: true,
            deadline: true,
            company: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return applications.map((app) => ({
      id: app.id,
      status: app.status,
      remarks: app.remarks,
      isCurrentPlacement: app.isCurrentPlacement,
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt,
      student: {
        id: app.student.id,
        fullName: app.student.fullName,
        email: app.student.user?.email || null,
        phone: app.student.phone,
        department: app.student.department,
        studentType: app.student.studentType,
        currentCgpa: app.student.currentCgpa,
        verificationStatus: app.student.verificationStatus,
        resumeUrl: app.student.resumeUrl,
        resumeFileName: app.student.resumeFileName,
        resumeUploadedAt: app.student.resumeUploadedAt,
      },
      drive: {
        id: app.drive.id,
        role: app.drive.role,
        ctc: app.drive.ctc,
        deadline: app.drive.deadline,
        company: app.drive.company,
      },
    }));
  }

  /**
   * TPO: Get application by ID
   */
  static async getTpoApplicationById(applicationId: string) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        status: true,
        remarks: true,
        isCurrentPlacement: true,
        appliedAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            fullName: true,
            user: {
              select: { email: true },
            },
            phone: true,
            department: true,
            studentType: true,
            currentCgpa: true,
            tenthPercentage: true,
            twelfthPercentage: true,
            d2dCgpa: true,
            activeBacklogs: true,
            verificationStatus: true,
            resumeUrl: true,
            resumeFileName: true,
            resumeUploadedAt: true,
          },
        },
        drive: {
          select: {
            id: true,
            role: true,
            ctc: true,
            jobLocation: true,
            deadline: true,
            company: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!app) {
      const error: any = new Error(`Application with ID '${applicationId}' was not found.`);
      error.statusCode = 404;
      throw error;
    }

    return {
      id: app.id,
      status: app.status,
      remarks: app.remarks,
      isCurrentPlacement: app.isCurrentPlacement,
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt,
      student: {
        id: app.student.id,
        fullName: app.student.fullName,
        email: app.student.user?.email || null,
        phone: app.student.phone,
        department: app.student.department,
        studentType: app.student.studentType,
        currentCgpa: app.student.currentCgpa,
        tenthPercentage: app.student.tenthPercentage,
        twelfthPercentage: app.student.twelfthPercentage,
        d2dCgpa: app.student.d2dCgpa,
        activeBacklogs: app.student.activeBacklogs,
        verificationStatus: app.student.verificationStatus,
        resumeUrl: app.student.resumeUrl,
        resumeFileName: app.student.resumeFileName,
        resumeUploadedAt: app.student.resumeUploadedAt,
      },
      drive: app.drive,
    };
  }

  /**
   * TPO: Update application status (only status and remarks can be updated)
   */
  static async updateApplicationStatus(
    applicationId: string,
    status: string,
    remarks?: string | null
  ) {
    if (!status || typeof status !== 'string') {
      const error: any = new Error('Application status is required.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedStatus = status.trim().toUpperCase();
    if (!Object.values(ApplicationStatus).includes(normalizedStatus as ApplicationStatus)) {
      const error: any = new Error(
        `Invalid status '${status}'. Allowed statuses: ${Object.values(ApplicationStatus).join(', ')}.`
      );
      error.statusCode = 400;
      throw error;
    }

    const existing = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!existing) {
      const error: any = new Error(`Application with ID '${applicationId}' was not found.`);
      error.statusCode = 404;
      throw error;
    }

    const dataToUpdate: any = {
      status: normalizedStatus as ApplicationStatus,
      remarks:
        remarks !== undefined
          ? remarks === null
            ? null
            : String(remarks).trim()
          : existing.remarks,
    };

    const selectObject = {
      id: true,
      status: true,
      remarks: true,
      isCurrentPlacement: true,
      appliedAt: true,
      updatedAt: true,
      student: {
        select: {
          id: true,
          fullName: true,
          user: {
            select: { email: true },
          },
          phone: true,
          department: true,
        },
      },
      drive: {
        select: {
          id: true,
          role: true,
          company: {
            select: { id: true, name: true, imageUrl: true },
          },
        },
      },
    };

    let updated;

    if (normalizedStatus === ApplicationStatus.SELECTED && existing.status !== ApplicationStatus.SELECTED) {
      dataToUpdate.isCurrentPlacement = true;
      const transactionOps = [
        prisma.application.updateMany({
          where: { studentId: existing.studentId, isCurrentPlacement: true },
          data: { isCurrentPlacement: false },
        }),
        prisma.application.update({
          where: { id: applicationId },
          data: dataToUpdate,
          select: selectObject,
        }),
      ];
      const results = await prisma.$transaction(transactionOps);
      updated = results[1];
    } else {
      if (normalizedStatus !== ApplicationStatus.SELECTED && existing.status === ApplicationStatus.SELECTED) {
        if ((existing as any).isCurrentPlacement) {
          dataToUpdate.isCurrentPlacement = false;
        }
      }
      updated = await prisma.application.update({
        where: { id: applicationId },
        data: dataToUpdate,
        select: selectObject,
      });
    }

    return {
      id: updated.id,
      status: updated.status,
      remarks: updated.remarks,
      isCurrentPlacement: (updated as any).isCurrentPlacement,
      appliedAt: updated.appliedAt,
      updatedAt: updated.updatedAt,
      student: {
        id: updated.student.id,
        fullName: updated.student.fullName,
        email: updated.student.user?.email || null,
        phone: updated.student.phone,
        department: updated.student.department,
      },
      drive: updated.drive,
    };
  }
}
