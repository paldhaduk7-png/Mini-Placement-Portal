import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { AuthState, LoginResponse, User } from '../../types/auth'
import authService from '../../services/auth.service'

// Initial token from localStorage
const storedToken = localStorage.getItem('token')

const initialState: AuthState = {
  user: null,
  token: storedToken,
  isAuthenticated: false,
  isInitialized: !storedToken,
  isLoading: !!storedToken,
  status: storedToken ? 'loading' : 'unauthenticated',
  error: null,
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('role', response.user.role)
      return response
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (studentData: any, { rejectWithValue }) => {
    try {
      const response = await authService.register(studentData)
      // Do NOT auto-login or store tokens in localStorage upon registration!
      // Registration creates the account; the user must log in explicitly on the login page.
      return response
    } catch (err: any) {
      return rejectWithValue(err.message || 'Registration failed')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe()
      return response.user
    } catch (err: any) {
      return rejectWithValue(err.message || 'Session expired')
    }
  }
)

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.isInitialized = true
      state.isLoading = false
      state.status = 'authenticated'
      state.error = null
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      localStorage.setItem('role', action.payload.user.role)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isInitialized = true
      state.isLoading = false
      state.status = 'unauthenticated'
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.isInitialized = true
        state.status = 'authenticated'
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.isInitialized = true
        state.status = 'unauthenticated'
        state.error = (action.payload as string) || 'Login failed'
      })

      // Register (creates account, does not authenticate)
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.isInitialized = true
        state.status = 'unauthenticated'
        state.user = null
        state.token = null
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.isInitialized = true
        state.status = 'unauthenticated'
        state.error = (action.payload as string) || 'Registration failed'
      })

      // Fetch Me
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true
        state.status = 'loading'
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.isInitialized = true
        state.status = 'authenticated'
        state.error = null
        localStorage.setItem('user', JSON.stringify(action.payload))
        localStorage.setItem('role', action.payload.role)
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.isInitialized = true
        state.status = 'unauthenticated'
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('role')
      })
  },
})

export const { setCredentials, logout, clearError } = authSlice.actions
export default authSlice.reducer
