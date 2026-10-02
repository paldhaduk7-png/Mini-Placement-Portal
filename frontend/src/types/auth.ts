export type Role = 'STUDENT' | 'TPO'

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

export interface User {
  id: string
  email: string
  role: Role
  fullName?: string
  name?: string
  phone?: string
  createdAt?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  isLoading: boolean
  status: AuthStatus
  error: string | null
}

export interface LoginResponse {
  success?: boolean
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
