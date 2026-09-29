import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Student } from '../../types/student'
import studentService from '../../services/student.service'

interface StudentState {
  profile: Student | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
}

const initialState: StudentState = {
  profile: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
}

export const fetchStudentProfile = createAsyncThunk(
  'student/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await studentService.getProfile()
      return data
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch student profile')
    }
  }
)

export const submitStudentProfile = createAsyncThunk(
  'student/submitProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await studentService.submitProfile()
      return data.student
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to submit profile')
    }
  }
)

export const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    clearStudentState: (state) => {
      state.profile = null
      state.error = null
      state.isLoading = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchStudentProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStudentProfile.fulfilled, (state, action: PayloadAction<Student>) => {
        state.isLoading = false
        state.profile = action.payload
        state.error = null
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch student profile'
      })

      // Submit Profile
      .addCase(submitStudentProfile.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(submitStudentProfile.fulfilled, (state, action: PayloadAction<Student>) => {
        state.isSubmitting = false
        state.profile = action.payload
        state.error = null
      })
      .addCase(submitStudentProfile.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = (action.payload as string) || 'Failed to submit profile'
      })
  },
})

export const { clearStudentState } = studentSlice.actions
export default studentSlice.reducer
