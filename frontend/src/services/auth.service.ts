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
    const response = await api.get<{ message: string; user: User }>('/auth/me')
    return response.data
  },
}

export default authService
