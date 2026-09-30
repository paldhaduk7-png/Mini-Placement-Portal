import api from './api'
import { LoginResponse, RegisterResponse, User } from '../types/auth'

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  async register(studentData: any): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', studentData)
    return response.data
  },

  async getMe(): Promise<{ message: string; user: User }> {
    const response = await api.get<{ message: string; user: any }>('/auth/me')
    const rawUser = response.data.user
    const normalizedUser: User = {
      id: rawUser.id || rawUser.userId,
      email: rawUser.email || '',
      role: rawUser.role,
      fullName: rawUser.fullName || '',
    }
    return {
      message: response.data.message,
      user: normalizedUser,
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email })
    return response.data
  },

  async verifyOtp(email: string, otp: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/verify-otp', { email, otp })
    return response.data
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/reset-password', { email, otp, newPassword })
    return response.data
  },
}

export default authService
