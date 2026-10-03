import { RecruitmentDrive } from './drive'
import { Student } from './student'

export type ApplicationStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED'

export interface Application {
  id: string
  studentId: string
  driveId: string
  appliedAt: string
  status: ApplicationStatus
  remarks?: string | null
  isCurrentPlacement?: boolean
  updatedAt: string

  // Per-application resume (NOT student-level resume)
  resumeUrl?: string | null
  resumeFileName?: string | null
  resumePath?: string | null
  hasResume?: boolean

  student?: Student
  drive?: RecruitmentDrive
  interviews?: Interview[]
}

export interface Interview {
  id: string
  applicationId: string
  interviewDate: string
  interviewTime: string
  round: string
  mode: 'ONLINE' | 'OFFLINE'
  meetingLink?: string | null
  location?: string | null
  instructions?: string | null
  createdAt: string
  updatedAt: string
}

export interface PlacementStatus {
  isSelected: boolean
  selectedCompany: string | null
  selectedPackage: number | null
  minimumNextPackage: number | null
}
