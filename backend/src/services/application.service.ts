import { ApplicationStatus, Prisma, DriveStatus } from '@prisma/client';
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
  search?: string;
  applicationIds?: string[] | string;
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

    const now = new Date();
    if (drive.status === DriveStatus.CANCELLED) {
      const error: any = new Error('This recruitment drive has been cancelled.');
      error.statusCode = 400;
      throw error;
    }
    
    if (drive.deadline < now) {
      const error: any = new Error('The application deadline for this drive has passed.');
      error.statusCode = 400;
      throw error;
    }

    if (drive.status === DriveStatus.COMPLETED || drive.driveDate < now) {
      const error: any = new Error('This recruitment drive has already been completed.');
      error.statusCode = 400;
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
        studentId: true,
        status: true,
        remarks: true,
        isCurrentPlacement: true,
        appliedAt: true,
        updatedAt: true,
        interviews: {
          orderBy: { createdAt: 'desc' },
          take: 1
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
      orderBy: { appliedAt: 'desc' },
    });

    // Enforce placement resolution strictly scoped to this student
    const selectedApps = applications.filter((app) => app.status === ApplicationStatus.SELECTED);
    const currentSelected =
      selectedApps.find((app) => app.isCurrentPlacement) ||
      (selectedApps.length > 0 ? selectedApps[0] : null);

    return applications.map((app) => ({
      ...app,
      isCurrentPlacement:
        app.status === ApplicationStatus.SELECTED && currentSelected
          ? app.id === currentSelected.id
          : false,
    }));
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
        interviews: {
          orderBy: { createdAt: 'desc' },
          take: 1
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

    let currentPlacement = await prisma.application.findFirst({
      where: {
        studentId: student.id,
        status: ApplicationStatus.SELECTED,
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

    // Fallback: if student has a SELECTED application but isCurrentPlacement wasn't flagged yet
    if (!currentPlacement) {
      currentPlacement = await prisma.application.findFirst({
        where: {
          studentId: student.id,
          status: ApplicationStatus.SELECTED,
        },
        orderBy: [{ updatedAt: 'desc' }, { appliedAt: 'desc' }],
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
    }

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
        interviews: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
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

    // Resolve current placement scoped strictly per studentId
    const studentIds = Array.from(new Set(applications.map((a) => a.student.id)));
    const currentPlacementMap = new Map<string, string>();

    if (studentIds.length > 0) {
      const currentPlacements = await prisma.application.findMany({
        where: {
          studentId: { in: studentIds },
          status: ApplicationStatus.SELECTED,
          isCurrentPlacement: true,
        },
        select: { id: true, studentId: true },
      });

      for (const cp of currentPlacements) {
        currentPlacementMap.set(cp.studentId, cp.id);
      }

      // For any student with SELECTED applications who has no isCurrentPlacement: true marked yet
      for (const sid of studentIds) {
        if (!currentPlacementMap.has(sid)) {
          const latestSelected = await prisma.application.findFirst({
            where: { studentId: sid, status: ApplicationStatus.SELECTED },
            orderBy: [{ updatedAt: 'desc' }, { appliedAt: 'desc' }],
            select: { id: true },
          });
          if (latestSelected) {
            currentPlacementMap.set(sid, latestSelected.id);
            prisma.application
              .update({
                where: { id: latestSelected.id },
                data: { isCurrentPlacement: true },
              })
              .catch(() => {});
          }
        }
      }
    }

    return applications.map((app) => ({
      id: app.id,
      status: app.status,
      remarks: app.remarks,
      isCurrentPlacement:
        app.status === ApplicationStatus.SELECTED &&
        currentPlacementMap.get(app.student.id) === app.id,
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt,
      interviews: app.interviews,
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
        interviews: { orderBy: { createdAt: 'desc' }, take: 1 },
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

    // Determine current placement scoped to this student
    let isCurrentPlacement = false;
    if (app.status === ApplicationStatus.SELECTED) {
      const currentPlacement =
        (await prisma.application.findFirst({
          where: {
            studentId: app.student.id,
            status: ApplicationStatus.SELECTED,
            isCurrentPlacement: true,
          },
          select: { id: true },
        })) ||
        (await prisma.application.findFirst({
          where: {
            studentId: app.student.id,
            status: ApplicationStatus.SELECTED,
          },
          orderBy: [{ updatedAt: 'desc' }, { appliedAt: 'desc' }],
          select: { id: true },
        }));

      isCurrentPlacement = currentPlacement?.id === app.id;
    }

    return {
      id: app.id,
      status: app.status,
      remarks: app.remarks,
      isCurrentPlacement,
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt,
      interviews: app.interviews,
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
   * Scoped strictly per studentId: ensures exactly the current/latest SELECTED application has
   * isCurrentPlacement = true, and all other applications of this student have isCurrentPlacement = false.
   */
  static async syncStudentPlacements(studentId: string, preferredCurrentAppId?: string) {
    const apps = await prisma.application.findMany({
      where: { studentId },
      orderBy: [{ updatedAt: 'desc' }, { appliedAt: 'desc' }],
    });

    const selectedApps = apps.filter((a) => a.status === ApplicationStatus.SELECTED);

    if (selectedApps.length === 0) {
      await prisma.application.updateMany({
        where: { studentId, isCurrentPlacement: true },
        data: { isCurrentPlacement: false },
      });
      return;
    }

    let currentAppId: string;
    if (preferredCurrentAppId && selectedApps.some((a) => a.id === preferredCurrentAppId)) {
      currentAppId = preferredCurrentAppId;
    } else {
      const existingCurrent = selectedApps.find((a) => a.isCurrentPlacement);
      currentAppId = existingCurrent ? existingCurrent.id : selectedApps[0].id;
    }

    // Set the current placement to true
    await prisma.application.update({
      where: { id: currentAppId },
      data: { isCurrentPlacement: true },
    });

    // Set all other applications of this student to false
    await prisma.application.updateMany({
      where: {
        studentId,
        id: { not: currentAppId },
        isCurrentPlacement: true,
      },
      data: { isCurrentPlacement: false },
    });
  }

  /**
   * Synchronizes and verifies current placement status for all students in the database.
   * Scoped strictly per studentId.
   */
  static async syncAllStudentPlacements() {
    const studentsWithApps = await prisma.student.findMany({
      where: {
        applications: {
          some: {},
        },
      },
      select: { id: true },
    });

    for (const student of studentsWithApps) {
      await this.syncStudentPlacements(student.id);
    }
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
      interviews: { orderBy: { createdAt: Prisma.SortOrder.desc }, take: 1 },
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

    // Update status and remarks
    await prisma.application.update({
      where: { id: applicationId },
      data: dataToUpdate,
    });

    // Synchronize placement state strictly scoped to this student
    if (normalizedStatus === ApplicationStatus.SELECTED) {
      await this.syncStudentPlacements(existing.studentId, applicationId);
    } else {
      await this.syncStudentPlacements(existing.studentId);
    }

    const updated = await prisma.application.findUnique({
      where: { id: applicationId },
      select: selectObject,
    });

    if (!updated) {
      const error: any = new Error('Failed to retrieve updated application.');
      error.statusCode = 500;
      throw error;
    }

    return {
      id: updated.id,
      status: updated.status,
      remarks: updated.remarks,
      isCurrentPlacement: updated.isCurrentPlacement,
      appliedAt: updated.appliedAt,
      updatedAt: updated.updatedAt,
      interviews: updated.interviews,
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

  /**
   * TPO: Schedule interview for a SHORTLISTED application
   */
  static async scheduleInterview(applicationId: string, data: any) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      const error: any = new Error(`Application with ID '${applicationId}' was not found.`);
      error.statusCode = 404;
      throw error;
    }

    if (application.status !== ApplicationStatus.SHORTLISTED) {
      const error: any = new Error(`Can only schedule an interview for SHORTLISTED applications. Current status is ${application.status}.`);
      error.statusCode = 400;
      throw error;
    }

    if (!data.interviewDate || !data.interviewTime || !data.round || !data.mode) {
      const error: any = new Error('Interview Date, Time, Round, and Mode are required.');
      error.statusCode = 400;
      throw error;
    }

    if (data.mode === 'ONLINE' && !data.meetingLink?.trim()) {
      const error: any = new Error('Meeting Link is required for ONLINE interviews.');
      error.statusCode = 400;
      throw error;
    }

    if (data.mode === 'OFFLINE' && !data.location?.trim()) {
      const error: any = new Error('Location is required for OFFLINE interviews.');
      error.statusCode = 400;
      throw error;
    }

    const interview = await prisma.interview.create({
      data: {
        applicationId,
        interviewDate: new Date(data.interviewDate),
        interviewTime: data.interviewTime,
        round: data.round,
        mode: data.mode,
        meetingLink: data.meetingLink || null,
        location: data.location || null,
        instructions: data.instructions || null,
      },
    });

    return interview;
  }

  /**
   * TPO: Edit/Update an interview
   */
  static async updateInterview(applicationId: string, interviewId: string, data: any) {
    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, applicationId },
    });

    if (!interview) {
      const error: any = new Error(`Interview with ID '${interviewId}' was not found for this application.`);
      error.statusCode = 404;
      throw error;
    }

    if (data.mode === 'ONLINE' && !data.meetingLink?.trim()) {
      const error: any = new Error('Meeting Link is required for ONLINE interviews.');
      error.statusCode = 400;
      throw error;
    }

    if (data.mode === 'OFFLINE' && !data.location?.trim()) {
      const error: any = new Error('Location is required for OFFLINE interviews.');
      error.statusCode = 400;
      throw error;
    }

    const updateData: any = {};
    if (data.interviewDate) updateData.interviewDate = new Date(data.interviewDate);
    if (data.interviewTime) updateData.interviewTime = data.interviewTime;
    if (data.round) updateData.round = data.round;
    if (data.mode) updateData.mode = data.mode;
    
    // Explicit undefined checks so we can unset them
    if (data.meetingLink !== undefined) updateData.meetingLink = data.meetingLink || null;
    if (data.location !== undefined) updateData.location = data.location || null;
    if (data.instructions !== undefined) updateData.instructions = data.instructions || null;

    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: updateData,
    });

    return updatedInterview;
  }

  /**
   * TPO: Export applications as a structured CSV string
   */
  static async exportApplicationsCsv(filters: TpoApplicationFilter): Promise<string> {
    const where: any = {};

    if (filters.applicationIds) {
      const rawIds = Array.isArray(filters.applicationIds)
        ? filters.applicationIds
        : filters.applicationIds.split(',').map((id) => id.trim()).filter(Boolean);
      if (rawIds.length > 0) {
        where.id = { in: rawIds };
      }
    }

    if (filters.driveId?.trim()) {
      where.driveId = filters.driveId.trim();
    }

    if (filters.studentId?.trim()) {
      where.studentId = filters.studentId.trim();
    }

    if (filters.status && filters.status !== 'ALL') {
      const normalizedStatus = filters.status.trim().toUpperCase();
      if (Object.values(ApplicationStatus).includes(normalizedStatus as ApplicationStatus)) {
        where.status = normalizedStatus as ApplicationStatus;
      }
    }

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { student: { fullName: { contains: q, mode: 'insensitive' } } },
        { student: { user: { email: { contains: q, mode: 'insensitive' } } } },
        { student: { phone: { contains: q, mode: 'insensitive' } } },
        { student: { department: { contains: q, mode: 'insensitive' } } },
        { drive: { role: { contains: q, mode: 'insensitive' } } },
        { drive: { company: { name: { contains: q, mode: 'insensitive' } } } },
      ];
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
        interviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        student: {
          select: {
            id: true,
            fullName: true,
            user: { select: { email: true } },
            phone: true,
            department: true,
            studentType: true,
            currentCgpa: true,
            activeBacklogs: true,
            verificationStatus: true,
            resumeUrl: true,
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
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    if (applications.length === 0) {
      const error: any = new Error('No applications available to export.');
      error.statusCode = 404;
      throw error;
    }

    const headers = [
      'Student Name',
      'Student Email',
      'Student Phone',
      'Department',
      'Student Type',
      'CGPA',
      'Active Backlogs',
      'Verification Status',
      'Company',
      'Job Role',
      'CTC (LPA)',
      'Job Location',
      'Applied Date',
      'Application Status',
      'Placement Status',
      'Interview Round',
      'Interview Mode',
      'Interview Date',
      'Interview Time',
      'Interview Location / Meeting Link',
      'Resume Availability',
    ];

    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return '';
      const str = String(val).trim();
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = applications.map((app) => {
      const latestInterview = app.interviews?.[0];
      const appliedDateStr = app.appliedAt
        ? new Date(app.appliedAt).toISOString().split('T')[0]
        : '';
      const interviewDateStr = latestInterview?.interviewDate
        ? new Date(latestInterview.interviewDate).toISOString().split('T')[0]
        : '-';

      let placementStatus = '-';
      if (app.status === ApplicationStatus.SELECTED) {
        placementStatus = app.isCurrentPlacement ? 'CURRENT PLACEMENT' : 'REPLACED';
      }

      let locationOrLink = '-';
      if (latestInterview) {
        locationOrLink = latestInterview.mode === 'ONLINE'
          ? (latestInterview.meetingLink || '-')
          : (latestInterview.location || '-');
      }

      return [
        escapeCsv(app.student?.fullName || ''),
        escapeCsv(app.student?.user?.email || ''),
        escapeCsv(app.student?.phone || ''),
        escapeCsv(app.student?.department || ''),
        escapeCsv(app.student?.studentType || ''),
        escapeCsv(app.student?.currentCgpa != null ? app.student.currentCgpa : ''),
        escapeCsv(app.student?.activeBacklogs != null ? app.student.activeBacklogs : '0'),
        escapeCsv(app.student?.verificationStatus || ''),
        escapeCsv(app.drive?.company?.name || ''),
        escapeCsv(app.drive?.role || ''),
        escapeCsv(app.drive?.ctc != null ? `${app.drive.ctc} LPA` : ''),
        escapeCsv(app.drive?.jobLocation || ''),
        escapeCsv(appliedDateStr),
        escapeCsv(app.status),
        escapeCsv(placementStatus),
        escapeCsv(latestInterview?.round || '-'),
        escapeCsv(latestInterview?.mode || '-'),
        escapeCsv(interviewDateStr),
        escapeCsv(latestInterview?.interviewTime || '-'),
        escapeCsv(locationOrLink),
        escapeCsv(app.student?.resumeUrl ? 'Available' : 'Not Uploaded'),
      ].join(',');
    });

    // \uFEFF is UTF-8 Byte Order Mark (BOM) for compatibility with Excel
    return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  }
}

