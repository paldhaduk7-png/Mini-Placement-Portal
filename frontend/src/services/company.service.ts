import api from './api'
import { Company } from '../types/company'

export const companyService = {
  async getAllCompanies(params?: { search?: string }, signal?: AbortSignal): Promise<{ success?: boolean; count?: number; data: Company[] }> {
    const response = await api.get('/tpo/companies', { params, signal })
    return response.data
  },

  async getCompanyById(id: string): Promise<{ success?: boolean; data: Company }> {
    const response = await api.get(`/tpo/companies/${id}`)
    return response.data
  },

  async createCompany(formData: FormData): Promise<{ success?: boolean; data: Company }> {
    const response = await api.post('/tpo/companies', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async updateCompany(id: string, formData: FormData): Promise<{ success?: boolean; data: Company }> {
    const response = await api.patch(`/tpo/companies/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteCompany(id: string): Promise<{ success?: boolean; message: string }> {
    const response = await api.delete(`/tpo/companies/${id}`)
    return response.data
  },
}

export default companyService
