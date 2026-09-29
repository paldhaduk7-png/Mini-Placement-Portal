import api from './api'
import { RecruitmentDrive, EligibilityResult } from '../types/drive'

export const driveService = {
  // TPO Drive Management
  async getAllDrives(params?: any): Promise<{ success?: boolean; count?: number; data: RecruitmentDrive[] }> {
    const response = await api.get('/tpo/drives', { params })
    return response.data
  },

  async getDriveById(id: string): Promise<{ success?: boolean; data: RecruitmentDrive }> {
    const response = await api.get(`/tpo/drives/${id}`)
    return response.data
  },

  async createDrive(data: any): Promise<{ success?: boolean; message?: string; data: RecruitmentDrive }> {
    const response = await api.post('/tpo/drives', data)
    return response.data
  },

  async updateDrive(id: string, data: any): Promise<{ success?: boolean; message?: string; data: RecruitmentDrive }> {
    const response = await api.patch(`/tpo/drives/${id}`, data)
    return response.data
  },

  async deleteDrive(id: string): Promise<{ success?: boolean; message?: string }> {
    const response = await api.delete(`/tpo/drives/${id}`)
    return response.data
  },

  // TPO Eligible Students for a drive
  async getEligibleStudents(driveId: string): Promise<{
    success: boolean
    data: {
      drive: any
      count: number
      eligibleStudents: any[]
    }
  }> {
    const response = await api.get(`/tpo/drives/${driveId}/eligible-students`)
    return response.data
  },

  // Student Drive Methods
  async getStudentDrives(params?: any): Promise<{ success?: boolean; count?: number; data: RecruitmentDrive[] }> {
    const response = await api.get('/student/drives', { params })
    return response.data
  },

  async getStudentDriveById(id: string): Promise<{ success?: boolean; data: RecruitmentDrive }> {
    const response = await api.get(`/student/drives/${id}`)
    return response.data
  },

  // Student check eligibility for a drive
  async checkEligibility(driveId: string): Promise<{ success: boolean; data: EligibilityResult }> {
    const response = await api.get<{ success: boolean; data: EligibilityResult }>(
      `/student/drives/${driveId}/eligibility`
    )
    return response.data
  },
}

export default driveService
