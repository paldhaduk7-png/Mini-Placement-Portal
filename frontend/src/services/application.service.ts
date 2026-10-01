import api from './api'
import { Application, PlacementStatus } from '../types/application'

export const applicationService = {
  // Student apply to drive
  async applyToDrive(driveId: string): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.post(`/student/drives/${driveId}/apply`)
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
  }): Promise<{ success: boolean; data: Application[] }> {
    const response = await api.get<{ success: boolean; data: Application[] }>('/tpo/applications', {
      params,
    })
    return response.data
  },

  async getTpoApplicationById(id: string): Promise<{ success: boolean; data: Application }> {
    const response = await api.get<{ success: boolean; data: Application }>(`/tpo/applications/${id}`)
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
}

export default applicationService
