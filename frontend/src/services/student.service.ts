import api from './api'
import { Student } from '../types/student'

export const studentService = {
  // Student own profile
  async getProfile(): Promise<Student> {
    const response = await api.get<Student>('/students/me')
    return response.data
  },

  async updateProfile(data: any): Promise<{ message: string; student: Student }> {
    const response = await api.put<{ message: string; student: Student }>('/students/me', data)
    return response.data
  },

  async submitProfile(): Promise<{ message: string; student: Student }> {
    const response = await api.post<{ message: string; student: Student }>('/students/me/submit')
    return response.data
  },

  async uploadResume(file: File): Promise<{ message: string; student: Student }> {
    const formData = new FormData()
    formData.append('resume', file)
    const response = await api.post<{ message: string; student: Student }>('/students/me/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteResume(): Promise<{ message: string; student: Student }> {
    const response = await api.delete<{ message: string; student: Student }>('/students/me/resume')
    return response.data
  },

  // TPO student management
  async getAllStudents(): Promise<{ success?: boolean; count?: number; data: Student[] }> {
    const response = await api.get('/tpo/students')
    return response.data
  },

  async getStudentById(id: string): Promise<{ success?: boolean; data: Student } | Student> {
    const response = await api.get(`/tpo/students/${id}`)
    return response.data
  },

  async updateStudent(id: string, data: any): Promise<any> {
    const response = await api.patch(`/tpo/students/${id}`, data)
    return response.data
  },

  async verifyStudent(
    id: string,
    data: { status: 'VERIFIED' | 'REJECTED'; rejectionReason?: string }
  ): Promise<any> {
    const response = await api.patch(`/tpo/students/${id}/verify`, data)
    return response.data
  },
}

export default studentService
