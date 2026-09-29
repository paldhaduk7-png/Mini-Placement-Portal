import { Request, Response } from 'express';
import { StudentType } from '@prisma/client';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const {
        fullName,
        email,
        phone,
        dob,
        password,
        studentType,
        department,
        currentCgpa,
        activeBacklogs,
        totalBacklogs,
        tenthMathsMarks,
        tenthScienceMarks,
        tenthEnglishMarks,
        tenthSocialScienceMarks,
        tenthLanguageMarks,
        tenthTotalMarks,
        tenthMaxMarks,
        tenthPercentage,
        twelfthPercentage,
        d2dCgpa,
        diplomaBranch,
        diplomaCollege,
      } = req.body;

      // 1. Basic presence and type checks
      const missingFields: string[] = [];
      if (!fullName?.trim()) missingFields.push('fullName');
      if (!email?.trim()) missingFields.push('email');
      if (!phone?.trim()) missingFields.push('phone');
      if (!dob) missingFields.push('dob');
      if (!password) missingFields.push('password');
      if (!studentType) missingFields.push('studentType');
      if (!department?.trim()) missingFields.push('department');

      if (currentCgpa === undefined || currentCgpa === null) missingFields.push('currentCgpa');
      if (activeBacklogs === undefined || activeBacklogs === null) missingFields.push('activeBacklogs');
      if (totalBacklogs === undefined || totalBacklogs === null) missingFields.push('totalBacklogs');

      if (tenthMathsMarks === undefined || tenthMathsMarks === null) missingFields.push('tenthMathsMarks');
      if (tenthScienceMarks === undefined || tenthScienceMarks === null) missingFields.push('tenthScienceMarks');
      if (tenthEnglishMarks === undefined || tenthEnglishMarks === null) missingFields.push('tenthEnglishMarks');
      if (tenthSocialScienceMarks === undefined || tenthSocialScienceMarks === null) missingFields.push('tenthSocialScienceMarks');
      if (tenthTotalMarks === undefined || tenthTotalMarks === null) missingFields.push('tenthTotalMarks');
      if (tenthPercentage === undefined || tenthPercentage === null) missingFields.push('tenthPercentage');

      if (missingFields.length > 0) {
        res.status(400).json({
          error: 'Validation Error',
          message: `Missing required field(s): ${missingFields.join(', ')}`,
        });
        return;
      }

      // 2. Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Please provide a valid email address.',
        });
        return;
      }

      // 3. Password length validation
      if (typeof password !== 'string' || password.length < 6) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Password must be at least 6 characters long.',
        });
        return;
      }

      // 4. StudentType validation
      if (studentType !== StudentType.REGULAR && studentType !== StudentType.D2D) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'studentType must be either REGULAR or D2D.',
        });
        return;
      }

      // 5. REGULAR vs D2D validation
      if (studentType === StudentType.REGULAR) {
        if (twelfthPercentage === undefined || twelfthPercentage === null) {
          res.status(400).json({
            error: 'Validation Error',
            message: 'twelfthPercentage is required for REGULAR students.',
          });
          return;
        }
        const parsed12th = Number(twelfthPercentage);
        if (isNaN(parsed12th) || parsed12th < 0 || parsed12th > 100) {
          res.status(400).json({
            error: 'Validation Error',
            message: 'twelfthPercentage must be a number between 0 and 100.',
          });
          return;
        }
      }

      if (studentType === StudentType.D2D) {
        if (d2dCgpa === undefined || d2dCgpa === null || !diplomaBranch?.trim() || !diplomaCollege?.trim()) {
          res.status(400).json({
            error: 'Validation Error',
            message: 'd2dCgpa, diplomaBranch, and diplomaCollege are required for D2D students.',
          });
          return;
        }
        const parsedD2dCgpa = Number(d2dCgpa);
        if (isNaN(parsedD2dCgpa) || parsedD2dCgpa < 0 || parsedD2dCgpa > 10) {
          res.status(400).json({
            error: 'Validation Error',
            message: 'd2dCgpa must be a number between 0 and 10.',
          });
          return;
        }
      }

      // 6. Academic range validations
      const cgpa = Number(currentCgpa);
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'currentCgpa must be a number between 0 and 10.',
        });
        return;
      }

      const activeB = Number(activeBacklogs);
      const totalB = Number(totalBacklogs);
      if (isNaN(activeB) || activeB < 0 || isNaN(totalB) || totalB < 0) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Backlog counts must be non-negative integers.',
        });
        return;
      }
      if (activeB > totalB) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Active backlogs cannot exceed total backlogs.',
        });
        return;
      }

      // 7. Std 10 marks and percentage validations
      const t10Percent = Number(tenthPercentage);
      if (isNaN(t10Percent) || t10Percent < 0 || t10Percent > 100) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'tenthPercentage must be a number between 0 and 100.',
        });
        return;
      }

      const tMaths = Number(tenthMathsMarks);
      const tScience = Number(tenthScienceMarks);
      const tEnglish = Number(tenthEnglishMarks);
      const tSocial = Number(tenthSocialScienceMarks);
      const tTotal = Number(tenthTotalMarks);
      const tMax = tenthMaxMarks !== undefined ? Number(tenthMaxMarks) : 500;

      if ([tMaths, tScience, tEnglish, tSocial, tTotal, tMax].some((m) => isNaN(m) || m < 0)) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Std 10 subject marks and totals must be non-negative numbers.',
        });
        return;
      }

      // 8. Execute registration
      const responseData = await AuthService.registerStudent({
        fullName,
        email,
        phone,
        dob,
        password,
        studentType,
        department,
        currentCgpa: cgpa,
        activeBacklogs: activeB,
        totalBacklogs: totalB,
        tenthMathsMarks: tMaths,
        tenthScienceMarks: tScience,
        tenthEnglishMarks: tEnglish,
        tenthSocialScienceMarks: tSocial,
        tenthLanguageMarks: tenthLanguageMarks != null ? Number(tenthLanguageMarks) : null,
        tenthTotalMarks: tTotal,
        tenthMaxMarks: tMax,
        tenthPercentage: t10Percent,
        twelfthPercentage: studentType === StudentType.REGULAR ? Number(twelfthPercentage) : null,
        d2dCgpa: studentType === StudentType.D2D ? Number(d2dCgpa) : null,
        diplomaBranch,
        diplomaCollege,
      });

      res.status(201).json(responseData);
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

      console.error('Registration Error:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred during registration.',
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email?.trim() || !password) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Email and password are required.',
        });
        return;
      }

      const loginData = await AuthService.login({ email, password });
      res.status(200).json(loginData);
    } catch (error: any) {
      if (error.statusCode === 401) {
        res.status(401).json({
          error: 'Unauthorized',
          message: error.message,
        });
        return;
      }

      console.error('Login Error:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred during login.',
      });
    }
  }

  static async me(req: Request, res: Response): Promise<void> {
    // Helper endpoint to verify authenticated user info
    res.status(200).json({
      message: 'Authenticated',
      user: req.user,
    });
  }
}
