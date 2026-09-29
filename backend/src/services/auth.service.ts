import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role, StudentType, VerificationStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { config } from '../config/env';

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
}
