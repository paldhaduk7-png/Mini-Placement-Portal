-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TPO');

-- CreateEnum
CREATE TYPE "StudentType" AS ENUM ('REGULAR', 'D2D');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DriveStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "studentType" "StudentType" NOT NULL DEFAULT 'REGULAR',
    "department" TEXT NOT NULL,
    "currentCgpa" DOUBLE PRECISION NOT NULL,
    "activeBacklogs" INTEGER NOT NULL DEFAULT 0,
    "totalBacklogs" INTEGER NOT NULL DEFAULT 0,
    "tenthMathsMarks" DOUBLE PRECISION NOT NULL,
    "tenthScienceMarks" DOUBLE PRECISION NOT NULL,
    "tenthEnglishMarks" DOUBLE PRECISION NOT NULL,
    "tenthSocialScienceMarks" DOUBLE PRECISION NOT NULL,
    "tenthLanguageMarks" DOUBLE PRECISION,
    "tenthTotalMarks" DOUBLE PRECISION NOT NULL,
    "tenthMaxMarks" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "tenthPercentage" DOUBLE PRECISION NOT NULL,
    "twelfthPercentage" DOUBLE PRECISION,
    "d2dCgpa" DOUBLE PRECISION,
    "diplomaBranch" TEXT,
    "diplomaCollege" TEXT,
    "isProfileLocked" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "website" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentDrive" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "description" TEXT,
    "ctc" DOUBLE PRECISION NOT NULL,
    "jobLocation" TEXT,
    "driveDate" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "DriveStatus" NOT NULL DEFAULT 'UPCOMING',
    "minCgpa" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "minTenthPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "minTwelfthPercentage" DOUBLE PRECISION,
    "minD2dCgpa" DOUBLE PRECISION,
    "maxActiveBacklogs" INTEGER NOT NULL DEFAULT 0,
    "allowedStudentTypes" "StudentType"[] DEFAULT ARRAY['REGULAR', 'D2D']::"StudentType"[],
    "allowedDepartments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiresVerification" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitmentDrive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "remarks" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Application_studentId_driveId_key" ON "Application"("studentId", "driveId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentDrive" ADD CONSTRAINT "RecruitmentDrive_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentDrive" ADD CONSTRAINT "RecruitmentDrive_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "RecruitmentDrive"("id") ON DELETE CASCADE ON UPDATE CASCADE;
