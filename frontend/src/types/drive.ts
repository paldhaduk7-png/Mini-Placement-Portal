import { Company } from './company'
import { StudentType } from './student'

export type DriveStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

export interface RecruitmentDrive {
  id: string
  companyId: string
  role: string
  description?: string | null
  ctc: number
  jobLocation?: string | null
  driveDate: string
  deadline: string
  status: DriveStatus

  minCgpa: number
  minTenthPercentage: number
  minTwelfthPercentage?: number | null
  minD2dCgpa?: number | null
  maxActiveBacklogs: number
  allowedStudentTypes: StudentType[]
  allowedDepartments: string[]
  requiresVerification: boolean

  createdById?: string
  createdAt?: string
  updatedAt?: string

  company?: Company
  applications?: any[]
  _count?: {
    applications: number
  }
}

export interface EligibilityResult {
  eligible: boolean
  reasons: string[]
  drive?: {
    id: string
    role: string
    deadline: string
    company?: {
      id: string
      name: string
      imageUrl?: string | null
    }
  }
}
