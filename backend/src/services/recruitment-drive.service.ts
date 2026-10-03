import { DriveStatus, StudentType } from '@prisma/client';
import prisma from '../lib/prisma';

export interface CreateDriveInput {
  companyId: string;
  description?: string | null;
  jobLocation?: string | null;
  roles: {
    title: string;
    description?: string | null;
    minCTC: number;
    maxCTC: number;
    openings?: number | null;
    useCommonEligibility?: boolean;
    minCgpa?: number | null;
    minTenthPercentage?: number | null;
    minTwelfthPercentage?: number | null;
    minD2dCgpa?: number | null;
    maxActiveBacklogs?: number | null;
    allowedStudentTypes?: StudentType[];
    allowedDepartments?: string[];
  }[];
  driveDate: string | Date;
  deadline: string | Date;
  status?: DriveStatus;
  minCgpa?: number;
  minTenthPercentage?: number;
  minTwelfthPercentage?: number | null;
  minD2dCgpa?: number | null;
  maxActiveBacklogs?: number;
  allowedStudentTypes?: StudentType[];
  allowedDepartments?: string[];
  requiresVerification?: boolean;
  createdById: string;
}

export interface UpdateDriveInput {
  companyId?: string;
  description?: string | null;
  jobLocation?: string | null;
  roles?: {
    id?: string;
    title: string;
    description?: string | null;
    minCTC: number;
    maxCTC: number;
    openings?: number | null;
    useCommonEligibility?: boolean;
    minCgpa?: number | null;
    minTenthPercentage?: number | null;
    minTwelfthPercentage?: number | null;
    minD2dCgpa?: number | null;
    maxActiveBacklogs?: number | null;
    allowedStudentTypes?: StudentType[];
    allowedDepartments?: string[];
  }[];
  driveDate?: string | Date;
  deadline?: string | Date;
  status?: DriveStatus;
  minCgpa?: number;
  minTenthPercentage?: number;
  minTwelfthPercentage?: number | null;
  minD2dCgpa?: number | null;
  maxActiveBacklogs?: number;
  allowedStudentTypes?: StudentType[];
  allowedDepartments?: string[];
  requiresVerification?: boolean;
}

export function normalizeDeadline(val: string | Date): Date {
  const d = new Date(val);
  // If string matching YYYY-MM-DD
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    const [y, m, day] = val.trim().split('-').map(Number);
    // Evening 6:00 PM IST is 12:30:00 UTC
    return new Date(Date.UTC(y, m - 1, day, 12, 30, 0, 0));
  }
  // If date object has midnight UTC (00:00:00.000Z)
  if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 30, 0, 0));
  }
  return d;
}

export function normalizeDriveDate(val: string | Date): Date {
  const d = new Date(val);
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    const [y, m, day] = val.trim().split('-').map(Number);
    // End of day IST: 23:59:59.999 IST = 18:29:59.999 UTC
    return new Date(Date.UTC(y, m - 1, day, 18, 29, 59, 999));
  }
  if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 18, 29, 59, 999));
  }
  return d;
}

/**
 * Convert any Date or date string to a date-only 'YYYY-MM-DD' string in Asia/Kolkata (IST).
 * Using date-only string comparison prevents timezone differences or hour offsets from causing
 * a drive to change status prematurely or unexpectedly.
 */
export function toDateOnlyString(val: Date | string | null | undefined): string {
  if (!val) return '';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    return val.trim();
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Calculates recruitment drive status automatically based on drive dates:
 * - If current date is BEFORE the drive start date (deadline):
 *     status = "UPCOMING"
 * - If current date is ON or AFTER the drive start date (deadline)
 *   AND current date is ON or BEFORE the drive end date (driveDate):
 *     status = "ONGOING"
 * - If current date is AFTER the drive end date (driveDate):
 *     status = "COMPLETED"
 * - If drive was explicitly CANCELLED, preserves CANCELLED status.
 */
export function calculateDriveStatus(
  startDate: Date | string,
  endDate: Date | string,
  currentStatus?: DriveStatus
): DriveStatus {
  if (currentStatus === DriveStatus.CANCELLED) {
    return DriveStatus.CANCELLED;
  }

  const todayStr = toDateOnlyString(new Date());
  const startStr = toDateOnlyString(startDate);
  const endStr = toDateOnlyString(endDate);

  if (!startStr || !endStr) {
    return currentStatus || DriveStatus.UPCOMING;
  }

  // If current date is BEFORE the drive start date:
  if (todayStr < startStr) {
    return DriveStatus.UPCOMING;
  }

  // If current date is ON or AFTER the drive start date
  // AND current date is ON or BEFORE the drive end date:
  if (todayStr >= startStr && todayStr <= endStr) {
    return DriveStatus.ONGOING;
  }

  // If current date is AFTER the drive end date:
  return DriveStatus.COMPLETED;
}

export class RecruitmentDriveService {
  /**
   * Automatically synchronize recruitment drive statuses in the database based on their current dates
   */
  static async syncAllDriveStatuses(): Promise<void> {
    try {
      const drives = await prisma.recruitmentDrive.findMany({
        where: { status: { not: DriveStatus.CANCELLED } },
        select: { id: true, deadline: true, driveDate: true, status: true },
      });

      for (const d of drives) {
        const calculated = calculateDriveStatus(d.deadline, d.driveDate, d.status);
        if (d.status !== calculated) {
          await prisma.recruitmentDrive.update({
            where: { id: d.id },
            data: { status: calculated },
          });
        }
      }
    } catch (err: any) {
      console.warn('[RecruitmentDriveService] syncAllDriveStatuses warning:', err?.message || err);
    }
  }

  /**
   * Helper to validate academic and date constraints
   */
  private static validateDriveData(
    data: Partial<CreateDriveInput>,
    existingData?: { driveDate: Date; deadline: Date }
  ) {
    if (data.roles !== undefined) {
      if (!Array.isArray(data.roles) || data.roles.length === 0) {
        throw Object.assign(new Error('At least one role is required.'), { statusCode: 400 });
      }
      
      const roleTitles = new Set<string>();
      
      for (const role of data.roles) {
        if (!role.title || !role.title.trim()) {
          throw Object.assign(new Error('Role title is required.'), { statusCode: 400 });
        }
        
        const normalizedTitle = role.title.trim().toLowerCase();
        if (roleTitles.has(normalizedTitle)) {
          throw Object.assign(new Error(`Duplicate role '${role.title}' found in the same drive.`), { statusCode: 400 });
        }
        roleTitles.add(normalizedTitle);
        
        const minCTC = Number(role.minCTC);
        const maxCTC = Number(role.maxCTC);
        
        if (isNaN(minCTC) || isNaN(maxCTC)) {
          throw Object.assign(new Error('Minimum and Maximum CTC must be valid numbers.'), { statusCode: 400 });
        }
        
        if (minCTC < 0) {
          throw Object.assign(new Error('Minimum CTC must be >= 0.'), { statusCode: 400 });
        }
        
        if (maxCTC < minCTC) {
          throw Object.assign(new Error('Maximum CTC cannot be less than Minimum CTC.'), { statusCode: 400 });
        }
        
        if (role.openings !== undefined && role.openings !== null) {
          const openings = Number(role.openings);
          if (isNaN(openings) || openings <= 0 || !Number.isInteger(openings)) {
            throw Object.assign(new Error('Openings must be a positive integer.'), { statusCode: 400 });
          }
        }
      }
    }

    // Dates validation
    let resolvedDriveDate: Date | undefined;
    let resolvedDeadline: Date | undefined;

    if (data.driveDate !== undefined) {
      resolvedDriveDate = normalizeDriveDate(data.driveDate);
      if (isNaN(resolvedDriveDate.getTime())) {
        throw Object.assign(new Error('driveDate must be a valid date format.'), { statusCode: 400 });
      }
    } else if (existingData) {
      resolvedDriveDate = normalizeDriveDate(existingData.driveDate);
    }

    if (data.deadline !== undefined) {
      resolvedDeadline = normalizeDeadline(data.deadline);
      if (isNaN(resolvedDeadline.getTime())) {
        throw Object.assign(new Error('deadline must be a valid date format.'), { statusCode: 400 });
      }
    } else if (existingData) {
      resolvedDeadline = normalizeDeadline(existingData.deadline);
    }

    if (resolvedDriveDate && resolvedDeadline) {
      if (resolvedDeadline.getTime() > resolvedDriveDate.getTime()) {
        throw Object.assign(
          new Error('Application deadline cannot be after the drive date.'),
          { statusCode: 400 }
        );
      }
    }

    // CGPA validation (0 to 10)
    if (data.minCgpa !== undefined && data.minCgpa !== null) {
      const cgpa = Number(data.minCgpa);
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        throw Object.assign(new Error('minCgpa must be a number between 0 and 10.'), { statusCode: 400 });
      }
    }

    if (data.minD2dCgpa !== undefined && data.minD2dCgpa !== null) {
      const dCgpa = Number(data.minD2dCgpa);
      if (isNaN(dCgpa) || dCgpa < 0 || dCgpa > 10) {
        throw Object.assign(new Error('minD2dCgpa must be a number between 0 and 10.'), { statusCode: 400 });
      }
    }

    // Percentage validation (0 to 100)
    if (data.minTenthPercentage !== undefined && data.minTenthPercentage !== null) {
      const p10 = Number(data.minTenthPercentage);
      if (isNaN(p10) || p10 < 0 || p10 > 100) {
        throw Object.assign(new Error('minTenthPercentage must be a number between 0 and 100.'), { statusCode: 400 });
      }
    }

    if (data.minTwelfthPercentage !== undefined && data.minTwelfthPercentage !== null) {
      const p12 = Number(data.minTwelfthPercentage);
      if (isNaN(p12) || p12 < 0 || p12 > 100) {
        throw Object.assign(new Error('minTwelfthPercentage must be a number between 0 and 100.'), { statusCode: 400 });
      }
    }

    // Backlog validation (>= 0)
    if (data.maxActiveBacklogs !== undefined && data.maxActiveBacklogs !== null) {
      const b = Number(data.maxActiveBacklogs);
      if (isNaN(b) || b < 0) {
        throw Object.assign(new Error('maxActiveBacklogs must be a non-negative integer (>= 0).'), { statusCode: 400 });
      }
    }

    // Student types validation
    if (data.allowedStudentTypes !== undefined) {
      if (!Array.isArray(data.allowedStudentTypes)) {
        throw Object.assign(new Error('allowedStudentTypes must be an array.'), { statusCode: 400 });
      }
      for (const st of data.allowedStudentTypes) {
        if (st !== StudentType.REGULAR && st !== StudentType.D2D) {
          throw Object.assign(
            new Error(`Invalid studentType '${st}'. Allowed values: REGULAR, D2D.`),
            { statusCode: 400 }
          );
        }
      }
    }

    // Departments validation
    if (data.allowedDepartments !== undefined) {
      if (!Array.isArray(data.allowedDepartments)) {
        throw Object.assign(new Error('allowedDepartments must be an array of strings.'), { statusCode: 400 });
      }
    }

    // Status validation
    if (data.status !== undefined) {
      const validStatuses = Object.values(DriveStatus);
      if (!validStatuses.includes(data.status)) {
        throw Object.assign(
          new Error(`Invalid drive status '${data.status}'. Allowed values: ${validStatuses.join(', ')}.`),
          { statusCode: 400 }
        );
      }
    }

    // Verification requirement
    if (data.requiresVerification !== undefined && typeof data.requiresVerification !== 'boolean') {
      throw Object.assign(new Error('requiresVerification must be a boolean (true or false).'), { statusCode: 400 });
    }
  }

  /**
   * 1. Create a recruitment drive
   */
  static async createDrive(input: CreateDriveInput) {
    if (!input.companyId?.trim()) {
      throw Object.assign(new Error('companyId is required.'), { statusCode: 400 });
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: input.companyId.trim() },
      select: { id: true, name: true, imageUrl: true },
    });

    if (!company) {
      throw Object.assign(
        new Error(`Company with ID '${input.companyId}' does not exist.`),
        { statusCode: 404 }
      );
    }

    if (!input.roles || input.roles.length === 0) {
      throw Object.assign(new Error('roles array is required and must contain at least one role.'), { statusCode: 400 });
    }

    if (!input.driveDate) {
      throw Object.assign(new Error('driveDate is required.'), { statusCode: 400 });
    }

    if (!input.deadline) {
      throw Object.assign(new Error('deadline is required.'), { statusCode: 400 });
    }

    // Run field validations
    this.validateDriveData(input);

    // Resolve valid createdById (fallback safely to existing user if needed)
    let validUserId = input.createdById;
    const userExists = await prisma.user.findUnique({
      where: { id: input.createdById },
      select: { id: true },
    });
    if (!userExists) {
      const defaultUser = await prisma.user.findFirst({ select: { id: true } });
      if (defaultUser) validUserId = defaultUser.id;
    }

    const drive = await prisma.recruitmentDrive.create({
      data: {
        companyId: company.id,
        description: input.description?.trim() || null,
        jobLocation: input.jobLocation?.trim() || null,
        driveDate: normalizeDriveDate(input.driveDate),
        deadline: normalizeDeadline(input.deadline),
        status: calculateDriveStatus(input.deadline, input.driveDate),
        minCgpa: input.minCgpa !== undefined ? Number(input.minCgpa) : 0.0,
        minTenthPercentage: input.minTenthPercentage !== undefined ? Number(input.minTenthPercentage) : 0.0,
        minTwelfthPercentage: input.minTwelfthPercentage !== undefined && input.minTwelfthPercentage !== null ? Number(input.minTwelfthPercentage) : null,
        minD2dCgpa: input.minD2dCgpa !== undefined && input.minD2dCgpa !== null ? Number(input.minD2dCgpa) : null,
        maxActiveBacklogs: input.maxActiveBacklogs !== undefined ? Number(input.maxActiveBacklogs) : 0,
        allowedStudentTypes: input.allowedStudentTypes && input.allowedStudentTypes.length > 0 ? input.allowedStudentTypes : [StudentType.REGULAR, StudentType.D2D],
        allowedDepartments: input.allowedDepartments || [],
        requiresVerification: input.requiresVerification !== undefined ? input.requiresVerification : true,
        createdById: validUserId,
        roles: {
          create: input.roles.map(r => ({
            title: r.title.trim(),
            description: r.description?.trim() || null,
            minCTC: Number(r.minCTC),
            maxCTC: Number(r.maxCTC),
            openings: r.openings !== undefined && r.openings !== null ? Number(r.openings) : null,
            useCommonEligibility: r.useCommonEligibility !== undefined ? Boolean(r.useCommonEligibility) : true,
            minCgpa: r.minCgpa !== undefined && r.minCgpa !== null ? Number(r.minCgpa) : null,
            minTenthPercentage: r.minTenthPercentage !== undefined && r.minTenthPercentage !== null ? Number(r.minTenthPercentage) : null,
            minTwelfthPercentage: r.minTwelfthPercentage !== undefined && r.minTwelfthPercentage !== null ? Number(r.minTwelfthPercentage) : null,
            minD2dCgpa: r.minD2dCgpa !== undefined && r.minD2dCgpa !== null ? Number(r.minD2dCgpa) : null,
            maxActiveBacklogs: r.maxActiveBacklogs !== undefined && r.maxActiveBacklogs !== null ? Number(r.maxActiveBacklogs) : null,
            allowedStudentTypes: r.allowedStudentTypes && r.allowedStudentTypes.length > 0 ? r.allowedStudentTypes : undefined,
            allowedDepartments: r.allowedDepartments || undefined,
          }))
        },
      },
      include: {
        company: {
          select: { id: true, name: true, imageUrl: true },
        },
        roles: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    return drive;
  }

  /**
   * 2. List all recruitment drives with optional filters
   */
  static async getAllDrives(filters?: {
    companyId?: string;
    status?: string;
    search?: string;
    studentDepartment?: string;
  }) {
    const where: any = { AND: [] };

    if (filters?.companyId?.trim()) {
      where.AND.push({ companyId: filters.companyId.trim() });
    }

    let filterStatus: DriveStatus | undefined;
    if (filters?.status?.trim()) {
      const validStatuses = Object.values(DriveStatus);
      const uppercaseStatus = filters.status.trim().toUpperCase() as DriveStatus;
      if (!validStatuses.includes(uppercaseStatus)) {
        throw Object.assign(
          new Error(`Invalid status filter '${filters.status}'. Allowed values: ${validStatuses.join(', ')}.`),
          { statusCode: 400 }
        );
      }
      filterStatus = uppercaseStatus;
    }

    if (filters?.search?.trim() && filters.search.trim().length >= 3) {
      const term = filters.search.trim();
      where.AND.push({
        OR: [
          { roles: { some: { title: { contains: term, mode: 'insensitive' } } } },
          { company: { name: { contains: term, mode: 'insensitive' } } },
          { jobLocation: { contains: term, mode: 'insensitive' } },
        ]
      });
    }

    if (filters?.studentDepartment) {
      where.AND.push({
        OR: [
          { allowedDepartments: { isEmpty: true } },
          { allowedDepartments: { has: filters.studentDepartment } }
        ]
      });
    }

    if (where.AND.length === 0) {
      delete where.AND;
    }

    const drives = await prisma.recruitmentDrive.findMany({
      where,
      orderBy: { driveDate: 'asc' },
      include: {
        company: {
          select: { id: true, name: true, imageUrl: true },
        },
        roles: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    const mappedDrives = await Promise.all(
      drives.map(async (drive) => {
        const calculated = calculateDriveStatus(drive.deadline, drive.driveDate, drive.status);
        if (drive.status !== calculated && drive.status !== DriveStatus.CANCELLED) {
          prisma.recruitmentDrive
            .update({
              where: { id: drive.id },
              data: { status: calculated },
            })
            .catch((err) =>
              console.warn(`Failed to sync drive status in DB for ${drive.id}:`, err?.message)
            );
        }
        return { ...drive, status: calculated };
      })
    );

    if (filterStatus) {
      return mappedDrives.filter((d) => d.status === filterStatus);
    }

    return mappedDrives;
  }

  /**
   * 3. Get single recruitment drive by ID
   */
  static async getDriveById(id: string) {
    const drive = await prisma.recruitmentDrive.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true, imageUrl: true, website: true },
        },
        roles: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!drive) {
      throw Object.assign(
        new Error(`Recruitment drive with ID '${id}' was not found.`),
        { statusCode: 404 }
      );
    }

    const calculated = calculateDriveStatus(drive.deadline, drive.driveDate, drive.status);
    if (drive.status !== calculated && drive.status !== DriveStatus.CANCELLED) {
      prisma.recruitmentDrive
        .update({
          where: { id: drive.id },
          data: { status: calculated },
        })
        .catch((err) =>
          console.warn(`Failed to sync drive status in DB for ${drive.id}:`, err?.message)
        );
    }
    drive.status = calculated;

    return drive;
  }

  /**
   * 4. Update an existing recruitment drive
   */
  static async updateDrive(id: string, input: UpdateDriveInput) {
    const existing = await prisma.recruitmentDrive.findUnique({
      where: { id },
    });

    if (!existing) {
      throw Object.assign(
        new Error(`Recruitment drive with ID '${id}' was not found.`),
        { statusCode: 404 }
      );
    }

    // If companyId is being changed, verify the new company exists
    if (input.companyId && input.companyId.trim() !== existing.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: input.companyId.trim() },
        select: { id: true },
      });
      if (!company) {
        throw Object.assign(
          new Error(`Company with ID '${input.companyId}' does not exist.`),
          { statusCode: 404 }
        );
      }
    }

    // Validate inputs
    this.validateDriveData(input, {
      driveDate: existing.driveDate,
      deadline: existing.deadline,
    });

    const dataToUpdate: any = {};

    if (input.companyId !== undefined) dataToUpdate.companyId = input.companyId.trim();
    if (input.description !== undefined) dataToUpdate.description = input.description?.trim() || null;
    if (input.jobLocation !== undefined) dataToUpdate.jobLocation = input.jobLocation?.trim() || null;
    if (input.driveDate !== undefined) dataToUpdate.driveDate = normalizeDriveDate(input.driveDate);
    if (input.deadline !== undefined) dataToUpdate.deadline = normalizeDeadline(input.deadline);
    
    // Automatically calculate status from dates
    const finalDeadline = dataToUpdate.deadline || existing.deadline;
    const finalDriveDate = dataToUpdate.driveDate || existing.driveDate;
    dataToUpdate.status = calculateDriveStatus(
      finalDeadline,
      finalDriveDate,
      input.status === DriveStatus.CANCELLED ? DriveStatus.CANCELLED : existing.status
    );
    if (input.minCgpa !== undefined) dataToUpdate.minCgpa = Number(input.minCgpa);
    if (input.minTenthPercentage !== undefined) dataToUpdate.minTenthPercentage = Number(input.minTenthPercentage);
    if (input.minTwelfthPercentage !== undefined) {
      dataToUpdate.minTwelfthPercentage = input.minTwelfthPercentage !== null ? Number(input.minTwelfthPercentage) : null;
    }
    if (input.minD2dCgpa !== undefined) {
      dataToUpdate.minD2dCgpa = input.minD2dCgpa !== null ? Number(input.minD2dCgpa) : null;
    }
    if (input.maxActiveBacklogs !== undefined) dataToUpdate.maxActiveBacklogs = Number(input.maxActiveBacklogs);
    if (input.allowedStudentTypes !== undefined) dataToUpdate.allowedStudentTypes = input.allowedStudentTypes;
    if (input.allowedDepartments !== undefined) dataToUpdate.allowedDepartments = input.allowedDepartments;
    if (input.requiresVerification !== undefined) dataToUpdate.requiresVerification = input.requiresVerification;

    // Roles handling: Upsert provided roles, delete missing ones
    if (input.roles && input.roles.length > 0) {
      // Find all existing applications for this drive to prevent deleting roles that have applications
      const applications = await prisma.application.findMany({
        where: { driveId: id },
        select: { driveRoleId: true }
      });
      const rolesWithApplications = new Set(applications.map(a => a.driveRoleId));

      const incomingRoleIds = input.roles.map(r => r.id).filter(id => id) as string[];
      
      // Prevent deleting roles that have applications
      const existingRoles = await prisma.driveRole.findMany({ where: { driveId: id } });
      for (const er of existingRoles) {
        if (!incomingRoleIds.includes(er.id) && rolesWithApplications.has(er.id)) {
          throw Object.assign(new Error(`Cannot remove role '${er.title}' because there are student applications tied to it.`), { statusCode: 409 });
        }
      }

      dataToUpdate.roles = {
        deleteMany: {
          id: { notIn: incomingRoleIds }
        },
        upsert: input.roles.map(r => ({
          where: { id: r.id || 'new_temp_id_impossible' },
          create: {
            title: r.title.trim(),
            description: r.description?.trim() || null,
            minCTC: Number(r.minCTC),
            maxCTC: Number(r.maxCTC),
            openings: r.openings !== undefined && r.openings !== null ? Number(r.openings) : null,
            useCommonEligibility: r.useCommonEligibility !== undefined ? Boolean(r.useCommonEligibility) : true,
            minCgpa: r.minCgpa !== undefined && r.minCgpa !== null ? Number(r.minCgpa) : null,
            minTenthPercentage: r.minTenthPercentage !== undefined && r.minTenthPercentage !== null ? Number(r.minTenthPercentage) : null,
            minTwelfthPercentage: r.minTwelfthPercentage !== undefined && r.minTwelfthPercentage !== null ? Number(r.minTwelfthPercentage) : null,
            minD2dCgpa: r.minD2dCgpa !== undefined && r.minD2dCgpa !== null ? Number(r.minD2dCgpa) : null,
            maxActiveBacklogs: r.maxActiveBacklogs !== undefined && r.maxActiveBacklogs !== null ? Number(r.maxActiveBacklogs) : null,
            allowedStudentTypes: r.allowedStudentTypes && r.allowedStudentTypes.length > 0 ? r.allowedStudentTypes : undefined,
            allowedDepartments: r.allowedDepartments || undefined,
          },
          update: {
            title: r.title.trim(),
            description: r.description?.trim() || null,
            minCTC: Number(r.minCTC),
            maxCTC: Number(r.maxCTC),
            openings: r.openings !== undefined && r.openings !== null ? Number(r.openings) : null,
            useCommonEligibility: r.useCommonEligibility !== undefined ? Boolean(r.useCommonEligibility) : true,
            minCgpa: r.minCgpa !== undefined && r.minCgpa !== null ? Number(r.minCgpa) : null,
            minTenthPercentage: r.minTenthPercentage !== undefined && r.minTenthPercentage !== null ? Number(r.minTenthPercentage) : null,
            minTwelfthPercentage: r.minTwelfthPercentage !== undefined && r.minTwelfthPercentage !== null ? Number(r.minTwelfthPercentage) : null,
            minD2dCgpa: r.minD2dCgpa !== undefined && r.minD2dCgpa !== null ? Number(r.minD2dCgpa) : null,
            maxActiveBacklogs: r.maxActiveBacklogs !== undefined && r.maxActiveBacklogs !== null ? Number(r.maxActiveBacklogs) : null,
            allowedStudentTypes: r.allowedStudentTypes && r.allowedStudentTypes.length > 0 ? r.allowedStudentTypes : undefined,
            allowedDepartments: r.allowedDepartments || undefined,
          }
        }))
      };
    }

    const updated = await prisma.recruitmentDrive.update({
      where: { id },
      data: dataToUpdate,
      include: {
        company: {
          select: { id: true, name: true, imageUrl: true },
        },
        roles: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    return updated;
  }

  /**
   * 5. Delete recruitment drive (blocked if applications exist)
   */
  static async deleteDrive(id: string) {
    const drive = await prisma.recruitmentDrive.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!drive) {
      throw Object.assign(
        new Error(`Recruitment drive with ID '${id}' was not found.`),
        { statusCode: 404 }
      );
    }

    if (drive._count.applications > 0) {
      throw Object.assign(
        new Error(
          `Cannot delete recruitment drive because it has ${drive._count.applications} associated student application(s). Deletion is blocked to protect applicant records.`
        ),
        { statusCode: 409 }
      );
    }

    await prisma.recruitmentDrive.delete({
      where: { id },
    });

    return { id };
  }
}
