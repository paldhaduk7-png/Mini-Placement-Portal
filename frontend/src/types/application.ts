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
  updatedAt: string

  student?: Student
  drive?: RecruitmentDrive
}
