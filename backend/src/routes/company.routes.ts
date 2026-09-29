import { Router } from 'express';
import { Role } from '@prisma/client';
import { CompanyController, uploadCompanyImage } from '../controllers/company.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// All company management routes require JWT authentication and TPO role
router.use(authenticateToken);
router.use(requireRole(Role.TPO));

// 1. POST /api/tpo/companies - Add company with Cloudinary image upload
router.post('/', uploadCompanyImage.single('image'), CompanyController.createCompany);

// 2. GET /api/tpo/companies - List all companies
router.get('/', CompanyController.getAllCompanies);

// 3. GET /api/tpo/companies/:id - View single company details
router.get('/:id', CompanyController.getCompanyById);

// 4. PATCH /api/tpo/companies/:id - Update company name / replace image
router.patch('/:id', uploadCompanyImage.single('image'), CompanyController.updateCompany);

// 5. DELETE /api/tpo/companies/:id - Delete company (blocked if drives exist)
router.delete('/:id', CompanyController.deleteCompany);

export default router;
