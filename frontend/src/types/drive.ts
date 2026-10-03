import { Company } from './company'
import { StudentType } from './student'

export type DriveStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

export interface RecruitmentDrive {
  id: string
  companyId: string
  roles?: DriveRole[]
  description?: string | null
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
  drive?: RecruitmentDrive
}

export interface DriveRole {
  id: string
  driveId?: string
  title: string
  minCTC: number
  maxCTC: number
  openings?: number | null
}
