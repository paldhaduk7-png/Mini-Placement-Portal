import api from './api'
import { Application, PlacementStatus } from '../types/application'

export const applicationService = {
  // Student apply to drive — sends multipart/form-data with the resume PDF
  async applyToDrive(
    driveId: string,
    driveRoleId: string,
    resumeFile: File
  ): Promise<{ success: boolean; message: string; data: any }> {
    const formData = new FormData()
    formData.append('driveRoleId', driveRoleId)
    formData.append('resume', resumeFile)
    const response = await api.post(`/student/drives/${driveId}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Student own applications
  async getMyApplications(): Promise<{ success: boolean; data: Application[] }> {
    const response = await api.get<{ success: boolean; data: Application[] }>('/student/applications')
    return response.data
  },

  async getMyApplicationById(id: string): Promise<{ success: boolean; data: Application }> {
    const response = await api.get<{ success: boolean; data: Application }>(`/student/applications/${id}`)
    return response.data
  },

  // Get resume URL for a specific application (student: own only)
  async getApplicationResume(id: string): Promise<{
    success: boolean
    data: { applicationId: string; resumeUrl: string; resumeFileName: string | null; hasResume: boolean }
  }> {
    const response = await api.get(`/student/applications/${id}/resume`)
    return response.data
  },

  // Student placement status
  async getPlacementStatus(): Promise<{ success: boolean; data: PlacementStatus }> {
    const response = await api.get<{ success: boolean; data: PlacementStatus }>(
      '/student/applications/placement-status'
    )
    return response.data
  },

  // TPO application management
  async getTpoApplications(params?: {
    driveId?: string
    status?: string
    studentId?: string
    search?: string
  }, signal?: AbortSignal): Promise<{ success: boolean; data: Application[] }> {
    const response = await api.get<{ success: boolean; data: Application[] }>('/tpo/applications', {
      params,
      signal
    })
    return response.data
  },

  async getTpoApplicationById(id: string): Promise<{ success: boolean; data: Application }> {
    const response = await api.get<{ success: boolean; data: Application }>(`/tpo/applications/${id}`)
    return response.data
  },

  // Get resume URL for a specific application (TPO access)
  async getTpoApplicationResume(id: string): Promise<{
    success: boolean
    data: { applicationId: string; resumeUrl: string; resumeFileName: string | null; hasResume: boolean }
  }> {
    const response = await api.get(`/tpo/applications/${id}/resume`)
    return response.data
  },

  async exportApplicationsCsv(params?: {
    driveId?: string
    status?: string
    studentId?: string
    search?: string
    applicationIds?: string
  }): Promise<Blob> {
    const response = await api.get('/tpo/applications/export', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  async updateStatus(
    id: string,
    status: string,
    remarks?: string | null
  ): Promise<{ success: boolean; message: string; data: Application }> {
    const response = await api.patch<{ success: boolean; message: string; data: Application }>(
      `/tpo/applications/${id}/status`,
      { status, remarks }
    )
    return response.data
  },

  async scheduleInterview(id: string, data: any): Promise<{ success: boolean; data: any }> {
    const response = await api.post(`/tpo/applications/${id}/interview`, data)
    return response.data
  },

  async updateInterview(id: string, interviewId: string, data: any): Promise<{ success: boolean; data: any }> {
    const response = await api.patch(`/tpo/applications/${id}/interview/${interviewId}`, data)
    return response.data
  },
}

export default applicationService
