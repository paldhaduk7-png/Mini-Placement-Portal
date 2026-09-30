import prisma from '../lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';

export interface CreateCompanyInput {
  name: string;
  imageInput: Buffer | string;
  createdById: string;
}

export interface UpdateCompanyInput {
  name?: string;
  imageInput?: Buffer | string;
}

export class CompanyService {
  /**
   * Create a new company with Cloudinary image upload.
   */
  static async createCompany(input: CreateCompanyInput) {
    const trimmedName = input.name?.trim();

    if (!trimmedName) {
      const error: any = new Error('Company name is required.');
      error.statusCode = 400;
      throw error;
    }

    if (!input.imageInput) {
      const error: any = new Error('Company image is required.');
      error.statusCode = 400;
      throw error;
    }

    // 1. Check uniqueness of company name
    const existing = await prisma.company.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      const error: any = new Error(`A company with the name '${trimmedName}' already exists.`);
      error.statusCode = 409;
      throw error;
    }

    // 2. Upload image to Cloudinary
    const uploadResult = await uploadToCloudinary(input.imageInput);

    // 3. Verify createdById exists in User table to avoid FK violations
    let validCreatedById: string | null = null;
    if (input.createdById) {
      const userExists = await prisma.user.findUnique({
        where: { id: input.createdById },
        select: { id: true },
      });
      if (userExists) {
        validCreatedById = userExists.id;
      }
    }

    // 4. Create Company in PostgreSQL
    const company = await prisma.company.create({
      data: {
        name: trimmedName,
        imageUrl: uploadResult.secureUrl,
        createdById: validCreatedById,
      },
      include: {
        _count: {
          select: { drives: true },
        },
      },
    });

    return company;
  }

  /**
   * Retrieve all companies with recruitment drive count.
   */
  static async getAllCompanies() {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { drives: true },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return companies;
  }

  /**
   * Retrieve single company by ID.
   */
  static async getCompanyById(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: { drives: true },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!company) {
      const error: any = new Error(`Company with ID '${id}' was not found.`);
      error.statusCode = 404;
      throw error;
    }

    return company;
  }

  /**
   * Update company details and optionally replace image on Cloudinary.
   */
  static async updateCompany(id: string, input: UpdateCompanyInput) {
    const existing = await prisma.company.findUnique({
      where: { id },
    });

    if (!existing) {
      const error: any = new Error(`Company with ID '${id}' was not found.`);
      error.statusCode = 404;
      throw error;
    }

    const dataToUpdate: any = {};

    // 1. Name update and uniqueness check
    if (input.name !== undefined) {
      const trimmedName = input.name.trim();
      if (!trimmedName) {
        const error: any = new Error('Company name cannot be empty.');
        error.statusCode = 400;
        throw error;
      }

      if (trimmedName.toLowerCase() !== existing.name.toLowerCase()) {
        const nameDuplicate = await prisma.company.findUnique({
          where: { name: trimmedName },
        });

        if (nameDuplicate) {
          const error: any = new Error(`A company with the name '${trimmedName}' already exists.`);
          error.statusCode = 409;
          throw error;
        }
      }

      dataToUpdate.name = trimmedName;
    }

    // 2. Image replacement
    if (input.imageInput) {
      const uploadResult = await uploadToCloudinary(input.imageInput);
      dataToUpdate.imageUrl = uploadResult.secureUrl;

      // Clean up old image safely (non-blocking)
      if (existing.imageUrl) {
        deleteFromCloudinary(existing.imageUrl).catch(() => {});
      }
    }

    // 3. Update in PostgreSQL
    const updated = await prisma.company.update({
      where: { id },
      data: dataToUpdate,
      include: {
        _count: {
          select: { drives: true },
        },
      },
    });

    return updated;
  }

  /**
   * Delete company if no associated recruitment drives exist.
   */
  static async deleteCompany(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: { drives: true },
        },
      },
    });

    if (!company) {
      const error: any = new Error(`Company with ID '${id}' was not found.`);
      error.statusCode = 404;
      throw error;
    }

    // Business Rule: Check if company has recruitment drives
    if (company._count.drives > 0) {
      const error: any = new Error(
        `Cannot delete company '${company.name}' because it has ${company._count.drives} associated recruitment drive(s). Delete or reassign the recruitment drives first.`
      );
      error.statusCode = 409;
      throw error;
    }

    // 1. Delete from PostgreSQL
    await prisma.company.delete({
      where: { id },
    });

    // 2. Clean up Cloudinary asset
    if (company.imageUrl) {
      deleteFromCloudinary(company.imageUrl).catch(() => {});
    }

    return {
      message: `Company '${company.name}' was deleted successfully.`,
      deletedCompanyId: id,
    };
  }
}
