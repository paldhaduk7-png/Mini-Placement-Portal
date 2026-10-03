import { Request, Response } from 'express';
import multer from 'multer';
import { CompanyService } from '../services/company.service';

// Configure multer to use in-memory buffer storage (max 5MB)
const storage = multer.memoryStorage();
export const uploadCompanyImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP, etc.) are allowed.'));
    }
  },
});

export class CompanyController {
  /**
   * Helper to extract image input from multer file or JSON body.
   */
  private static extractImageInput(req: Request): Buffer | string | null {
    if (req.file?.buffer) {
      return req.file.buffer;
    }
    if (typeof req.body.image === 'string' && req.body.image.trim()) {
      return req.body.image.trim();
    }
    if (typeof req.body.imageUrl === 'string' && req.body.imageUrl.trim()) {
      return req.body.imageUrl.trim();
    }
    return null;
  }

  /**
   * POST /api/tpo/companies
   * Create a new company with Cloudinary image upload.
   */
  static async createCompany(req: Request, res: Response): Promise<void> {
    try {
      const name = req.body.name;
      const createdById = req.user?.userId;

      if (!createdById) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required.',
        });
        return;
      }

      if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Company name is required.',
        });
        return;
      }

      const imageInput = CompanyController.extractImageInput(req);
      if (!imageInput) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Company image is required. Provide an image file or base64 image string.',
        });
        return;
      }

      const company = await CompanyService.createCompany({
        name,
        imageInput,
        createdById,
      });

      res.status(201).json({
        message: 'Company created successfully.',
        company,
      });
    } catch (error: any) {
      if (error.statusCode === 409) {
        res.status(409).json({
          error: 'Conflict',
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

      console.error('Error creating company:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while creating the company.',
      });
    }
  }

  /**
   * GET /api/tpo/companies
   * List all companies.
   */
  static async getAllCompanies(req: Request, res: Response): Promise<void> {
    try {
      const { search } = req.query;
      const filters: any = {};
      if (typeof search === 'string') filters.search = search;

      const companies = await CompanyService.getAllCompanies(filters);
      res.status(200).json({
        success: true,
        count: companies.length,
        data: companies,
      });
    } catch (error: any) {
      console.error('Error fetching companies:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching companies.',
      });
    }
  }

  /**
   * GET /api/tpo/companies/:id
   * Get single company by ID.
   */
  static async getCompanyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id?.trim()) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Company ID is required.',
        });
        return;
      }

      const company = await CompanyService.getCompanyById(id);
      res.status(200).json(company);
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      console.error('Error fetching company:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching company details.',
      });
    }
  }

  /**
   * PATCH /api/tpo/companies/:id
   * Update company details and optionally replace image on Cloudinary.
   */
  static async updateCompany(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const imageInput = CompanyController.extractImageInput(req);

      if (!id?.trim()) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Company ID is required.',
        });
        return;
      }

      if (name === undefined && !imageInput) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Provide at least one field (name, or image) to update.',
        });
        return;
      }

      const updated = await CompanyService.updateCompany(id, {
        name,
        imageInput: imageInput || undefined,
      });

      res.status(200).json({
        message: 'Company updated successfully.',
        company: updated,
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      if (error.statusCode === 409) {
        res.status(409).json({
          error: 'Conflict',
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

      console.error('Error updating company:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while updating the company.',
      });
    }
  }

  /**
   * DELETE /api/tpo/companies/:id
   * Delete company (prevented if company has recruitment drives).
   */
  static async deleteCompany(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id?.trim()) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Company ID is required.',
        });
        return;
      }

      const result = await CompanyService.deleteCompany(id);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }

      if (error.statusCode === 409) {
        res.status(409).json({
          error: 'Conflict',
          message: error.message,
        });
        return;
      }

      console.error('Error deleting company:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while deleting the company.',
      });
    }
  }
}
