import { Role } from './auth'

export type StudentType = 'REGULAR' | 'D2D'
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface Student {
  id: string
  userId: string
  fullName: string
  phone: string
  dob: string
  studentType: StudentType
  department: string
  currentCgpa: number
  activeBacklogs: number
  totalBacklogs: number

  tenthMathsMarks: number
  tenthScienceMarks: number
  tenthEnglishMarks: number
  tenthSocialScienceMarks: number
  tenthLanguageMarks?: number | null
  tenthTotalMarks: number
  tenthMaxMarks: number
  tenthPercentage: number

  twelfthPercentage?: number | null

  d2dCgpa?: number | null
  diplomaBranch?: string | null
  diplomaCollege?: string | null

  isProfileLocked: boolean
  verificationStatus: VerificationStatus
  verifiedAt?: string | null
  rejectionReason?: string | null
  createdAt?: string
  updatedAt?: string

  user?: {
    id: string
    email: string
    role: Role
    createdAt?: string
  }
  profileCompleted?: boolean
}

export interface StudentProfileFormValues {
  fullName: string
  phone: string
  dob: string
  studentType: StudentType
  department: string
  currentCgpa: number
  activeBacklogs: number
  totalBacklogs: number

  tenthMathsMarks: number
  tenthScienceMarks: number
  tenthEnglishMarks: number
  tenthSocialScienceMarks: number
  tenthLanguageMarks?: number | null
  tenthTotalMarks: number
  tenthMaxMarks: number
  tenthPercentage: number

  twelfthPercentage?: number | null

  d2dCgpa?: number | null
  diplomaBranch?: string | null
  diplomaCollege?: string | null
}
