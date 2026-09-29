export type Role = 'STUDENT' | 'TPO'

export interface User {
  id: string
  email: string
  role: Role
  fullName?: string
  createdAt?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginResponse {
  message: string
  token: string
  user: User
}

export interface RegisterResponse {
  message: string
  token: string
  user: User
  student: any
}
