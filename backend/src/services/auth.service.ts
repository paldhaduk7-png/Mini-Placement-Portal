import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role, StudentType, VerificationStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { config } from '../config/env';
import { sendOtpEmail, sendTpoOtpEmail } from '../lib/mailer';

// In-memory store for OTPs. Key is email.
// In production, this should ideally be in Redis or database.
const otpStore = new Map<string, { otp: string; expiresAt: number; verified: boolean }>();

export interface RegisterStudentInput {
  fullName: string;
  email: string;
  phone: string;
  dob: string | Date;
  password: string;
  studentType: StudentType;
  department: string;
  currentCgpa: number;
  activeBacklogs: number;
  totalBacklogs: number;
  tenthMathsMarks: number;
  tenthScienceMarks: number;
  tenthEnglishMarks: number;
  tenthSocialScienceMarks: number;
  tenthLanguageMarks?: number | null;
  tenthTotalMarks: number;
  tenthMaxMarks?: number;
  tenthPercentage: number;
  twelfthPercentage?: number | null;
  d2dCgpa?: number | null;
  diplomaBranch?: string | null;
  diplomaCollege?: string | null;
  profilePhoto?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  static async registerStudent(input: RegisterStudentInput) {
    const email = input.email?.trim().toLowerCase();

    // 1. Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error: any = new Error('A user with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    // 2. Hash password with bcryptjs
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(input.password, saltRounds);

    // 3. Parse date of birth
    const parsedDob = new Date(input.dob);
    if (isNaN(parsedDob.getTime())) {
      const error: any = new Error('Invalid date of birth provided.');
      error.statusCode = 400;
      throw error;
    }

    // 4. Create User and Student together in a Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // Role is ALWAYS enforced as STUDENT on public registration
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: Role.STUDENT,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          fullName: input.fullName.trim(),
          phone: input.phone.trim(),
          dob: parsedDob,
          studentType: input.studentType,
          department: input.department.trim(),
          currentCgpa: Number(input.currentCgpa),
          activeBacklogs: Number(input.activeBacklogs),
          totalBacklogs: Number(input.totalBacklogs),
          tenthMathsMarks: Number(input.tenthMathsMarks),
          tenthScienceMarks: Number(input.tenthScienceMarks),
          tenthEnglishMarks: Number(input.tenthEnglishMarks),
          tenthSocialScienceMarks: Number(input.tenthSocialScienceMarks),
          tenthLanguageMarks:
            input.tenthLanguageMarks != null ? Number(input.tenthLanguageMarks) : null,
          tenthTotalMarks: Number(input.tenthTotalMarks),
          tenthMaxMarks: input.tenthMaxMarks ? Number(input.tenthMaxMarks) : 500,
          tenthPercentage: Number(input.tenthPercentage),
          twelfthPercentage:
            input.studentType === StudentType.REGULAR
              ? Number(input.twelfthPercentage)
              : null,
          d2dCgpa:
            input.studentType === StudentType.D2D && input.d2dCgpa != null
              ? Number(input.d2dCgpa)
              : null,
          diplomaBranch:
            input.studentType === StudentType.D2D ? input.diplomaBranch?.trim() : null,
          diplomaCollege:
            input.studentType === StudentType.D2D ? input.diplomaCollege?.trim() : null,
          profilePhoto: input.profilePhoto ?? null,
          isProfileLocked: false,
          verificationStatus: VerificationStatus.PENDING,
        },
      });

      return { user, student };
    });

    // 5. Generate JWT for the newly registered student
    const token = this.generateToken(result.user.id, result.user.role);

    return {
      message: 'Student registered successfully',
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      student: {
        id: result.student.id,
        fullName: result.student.fullName,
        studentType: result.student.studentType,
        department: result.student.department,
        verificationStatus: result.student.verificationStatus,
        isProfileLocked: result.student.isProfileLocked,
      },
    };
  }

  static async login(input: LoginInput) {
    const email = input.email?.trim().toLowerCase();

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // 2. Compare password with bcryptjs
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // 3. Generate JWT
    const token = this.generateToken(user.id, user.role);

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  static generateToken(userId: string, role: Role): string {
    if (!config.jwtSecret) {
      throw new Error('JWT_SECRET environment variable is missing.');
    }

    return jwt.sign({ userId, role }, config.jwtSecret, {
      expiresIn: '7d',
    });
  }

  static async tpoLogin(input: LoginInput) {
    const email = input.email?.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== Role.TPO) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Generate 6 digit OTP
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Fallback for development without SMTP
    if (!config.mailUsername) {
      otp = '123456';
    }

    otpStore.set(email, { otp, expiresAt, verified: false });

    // Send email
    try {
      await sendTpoOtpEmail(email, otp);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      if (config.nodeEnv === 'development') {
        const fallbackOtp = '123456';
        otpStore.set(email, { otp: fallbackOtp, expiresAt, verified: false });
        console.log(`\n=========================================`);
        console.log(`[DEV MODE] TPO SMTP failed.`);
        console.log(`[DEV MODE] OTP for ${email} has been set to: ${fallbackOtp}`);
        console.log(`=========================================\n`);
      } else {
        const e: any = new Error('Failed to send email. Please try again later.');
        e.statusCode = 500;
        throw e;
      }
    }

    return {
      success: true,
      message: 'OTP sent to your registered email',
      requiresOtp: true,
    };
  }

  static async tpoVerifyOtp(email: string, otp: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const record = otpStore.get(normalizedEmail);

    if (!record) {
      const error: any = new Error('No OTP found for this email or it has expired.');
      error.statusCode = 400;
      throw error;
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);
      const error: any = new Error('OTP has expired. Please request a new OTP.');
      error.statusCode = 400;
      throw error;
    }

    if (record.otp !== otp) {
      const error: any = new Error('Invalid OTP. Please try again.');
      error.statusCode = 400;
      throw error;
    }

    // OTP is valid, get the user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || user.role !== Role.TPO) {
      const error: any = new Error('Invalid user or role.');
      error.statusCode = 401;
      throw error;
    }

    // Mark as verified and clean up
    otpStore.delete(normalizedEmail);

    const token = this.generateToken(user.id, user.role);

    return {
      success: true,
      message: 'TPO login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async forgotPassword(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't leak whether the email exists. Just return success.
      return { message: 'If the email exists, an OTP will be sent.' };
    }

    // Generate 6 digit OTP
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Fallback for development without SMTP
    if (!config.mailUsername) {
      otp = '123456';
    }

    otpStore.set(normalizedEmail, { otp, expiresAt, verified: false });

    // Send email
    try {
      await sendOtpEmail(normalizedEmail, otp);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      
      // Fallback for development so you can test the frontend flow even if SMTP credentials fail
      if (config.nodeEnv === 'development') {
        const fallbackOtp = '123456';
        otpStore.set(normalizedEmail, { otp: fallbackOtp, expiresAt, verified: false });
        console.log(`\n=========================================`);
        console.log(`[DEV MODE] SMTP failed.`);
        console.log(`[DEV MODE] OTP for ${normalizedEmail} has been set to: ${fallbackOtp}`);
        console.log(`=========================================\n`);
        return { message: `SMTP failed. Dev Mode active: use OTP ${fallbackOtp} to test.` };
      }

      const e: any = new Error('Failed to send email. Please try again later.');
      e.statusCode = 500;
      throw e;
    }

    return { message: 'OTP sent successfully to your email.' };
  }

  static async verifyOtp(email: string, otp: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const record = otpStore.get(normalizedEmail);

    if (!record) {
      const error: any = new Error('No OTP found for this email or it has expired.');
      error.statusCode = 400;
      throw error;
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);
      const error: any = new Error('OTP has expired. Please request a new one.');
      error.statusCode = 400;
      throw error;
    }

    if (record.otp !== otp) {
      const error: any = new Error('Invalid OTP.');
      error.statusCode = 400;
      throw error;
    }

    // Mark as verified
    record.verified = true;
    otpStore.set(normalizedEmail, record);

    return { message: 'OTP verified successfully.' };
  }

  static async resetPassword(email: string, otp: string, newPassword: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const record = otpStore.get(normalizedEmail);

    if (!record || !record.verified || record.otp !== otp) {
      const error: any = new Error('Invalid or unverified OTP. Please verify again.');
      error.statusCode = 400;
      throw error;
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);
      const error: any = new Error('Session expired. Please start over.');
      error.statusCode = 400;
      throw error;
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    // Clear OTP from store
    otpStore.delete(normalizedEmail);

    return { message: 'Password reset successfully.' };
  }
}
