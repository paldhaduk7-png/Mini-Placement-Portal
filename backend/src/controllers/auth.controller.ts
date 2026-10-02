import { Request, Response } from 'express';
import { StudentType } from '@prisma/client';
import { AuthService } from '../services/auth.service';
import { VALID_DEPARTMENTS, DEFAULT_DEPARTMENT } from '../constants/departments';

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
        profilePhoto,
      } = req.body;

      // 1. Basic presence and type checks for account creation
      const missingFields: string[] = [];
      if (!fullName?.trim()) missingFields.push('fullName');
      if (!email?.trim()) missingFields.push('email');
      if (!phone?.trim()) missingFields.push('phone');
      if (!dob) missingFields.push('dob');
      if (!password) missingFields.push('password');

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

      // 4. StudentType validation (if provided)
      const effectiveStudentType =
        studentType === StudentType.D2D ? StudentType.D2D : StudentType.REGULAR;

      // 5. Academic details (defaulted safely if registering initially before profile wizard)
      const trimmedDept = department?.trim();
      const effectiveDept =
        trimmedDept && VALID_DEPARTMENTS.includes(trimmedDept as any)
          ? trimmedDept
          : DEFAULT_DEPARTMENT;
      const effectiveCgpa =
        currentCgpa !== undefined && currentCgpa !== null ? Number(currentCgpa) : 0;
      const effectiveActiveB =
        activeBacklogs !== undefined && activeBacklogs !== null ? Number(activeBacklogs) : 0;
      const effectiveTotalB =
        totalBacklogs !== undefined && totalBacklogs !== null ? Number(totalBacklogs) : 0;

      const effectiveTenthPercentage =
        tenthPercentage !== undefined && tenthPercentage !== null ? Number(tenthPercentage) : 0;
      const effectiveTenthMaths =
        tenthMathsMarks !== undefined && tenthMathsMarks !== null ? Number(tenthMathsMarks) : 0;
      const effectiveTenthScience =
        tenthScienceMarks !== undefined && tenthScienceMarks !== null ? Number(tenthScienceMarks) : 0;
      const effectiveTenthEnglish =
        tenthEnglishMarks !== undefined && tenthEnglishMarks !== null ? Number(tenthEnglishMarks) : 0;
      const effectiveTenthSocial =
        tenthSocialScienceMarks !== undefined && tenthSocialScienceMarks !== null
          ? Number(tenthSocialScienceMarks)
          : 0;
      const effectiveTenthTotal =
        tenthTotalMarks !== undefined && tenthTotalMarks !== null ? Number(tenthTotalMarks) : 0;
      const effectiveTenthMax =
        tenthMaxMarks !== undefined && tenthMaxMarks !== null ? Number(tenthMaxMarks) : 500;

      let uploadedPhotoUrl: string | null = null;
      if (profilePhoto && typeof profilePhoto === 'string' && profilePhoto.startsWith('data:image')) {
        try {
          const { uploadToCloudinary } = await import('../config/cloudinary');
          const result = await uploadToCloudinary(profilePhoto);
          uploadedPhotoUrl = result.secureUrl;
        } catch (uploadError: any) {
          console.error('Profile photo upload error:', uploadError);
          // Non-blocking error, user can still register
        }
      }

      // 6. Execute registration
      const responseData = await AuthService.registerStudent({
        fullName,
        email,
        phone,
        dob,
        password,
        studentType: effectiveStudentType,
        department: effectiveDept,
        currentCgpa: effectiveCgpa,
        activeBacklogs: effectiveActiveB,
        totalBacklogs: effectiveTotalB,
        tenthMathsMarks: effectiveTenthMaths,
        tenthScienceMarks: effectiveTenthScience,
        tenthEnglishMarks: effectiveTenthEnglish,
        tenthSocialScienceMarks: effectiveTenthSocial,
        tenthLanguageMarks: tenthLanguageMarks != null ? Number(tenthLanguageMarks) : null,
        tenthTotalMarks: effectiveTenthTotal,
        tenthMaxMarks: effectiveTenthMax,
        tenthPercentage: effectiveTenthPercentage,
        twelfthPercentage:
          effectiveStudentType === StudentType.REGULAR && twelfthPercentage !== undefined && twelfthPercentage !== null
            ? Number(twelfthPercentage)
            : null,
        d2dCgpa:
          effectiveStudentType === StudentType.D2D && d2dCgpa !== undefined && d2dCgpa !== null
            ? Number(d2dCgpa)
            : null,
        diplomaBranch: effectiveStudentType === StudentType.D2D ? diplomaBranch?.trim() : null,
        diplomaCollege: effectiveStudentType === StudentType.D2D ? diplomaCollege?.trim() : null,
        profilePhoto: uploadedPhotoUrl,
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
        details: error.message || String(error)
      });
    }
  }

  static async tpoLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email?.trim() || !password) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Email and password are required.',
        });
        return;
      }

      const response = await AuthService.tpoLogin({ email, password });
      res.status(200).json(response);
    } catch (error: any) {
      if (error.statusCode === 401) {
        res.status(401).json({
          error: 'Unauthorized',
          message: error.message,
        });
        return;
      }
      console.error('TPO Login Error:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred during login.',
      });
    }
  }

  static async tpoVerifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;

      if (!email?.trim() || !otp?.trim()) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Email and OTP are required.',
        });
        return;
      }

      const response = await AuthService.tpoVerifyOtp(email, otp);
      res.status(200).json(response);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: 'Bad Request',
          message: error.message,
        });
        return;
      }
      console.error('TPO Verify OTP Error:', error.message || error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred.',
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

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email?.trim()) {
        res.status(400).json({ error: 'Validation Error', message: 'Email is required.' });
        return;
      }

      const response = await AuthService.forgotPassword(email);
      res.status(200).json(response);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ error: 'Bad Request', message: error.message });
        return;
      }
      console.error('Forgot Password Error:', error.message || error);
      res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred.' });
    }
  }

  static async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      if (!email?.trim() || !otp?.trim()) {
        res.status(400).json({ error: 'Validation Error', message: 'Email and OTP are required.' });
        return;
      }

      const response = await AuthService.verifyOtp(email, otp);
      res.status(200).json(response);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ error: 'Bad Request', message: error.message });
        return;
      }
      console.error('Verify OTP Error:', error.message || error);
      res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred.' });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email?.trim() || !otp?.trim() || !newPassword) {
        res.status(400).json({ error: 'Validation Error', message: 'Email, OTP, and new password are required.' });
        return;
      }
      if (newPassword.length < 6) {
        res.status(400).json({ error: 'Validation Error', message: 'Password must be at least 6 characters long.' });
        return;
      }

      const response = await AuthService.resetPassword(email, otp, newPassword);
      res.status(200).json(response);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ error: 'Bad Request', message: error.message });
        return;
      }
      console.error('Reset Password Error:', error.message || error);
      res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred.' });
    }
  }
}
