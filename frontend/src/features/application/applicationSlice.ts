import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Application } from '../../types/application'
import applicationService from '../../services/application.service'

interface ApplicationState {
  myApplications: Application[]
  applications: Application[]
  isLoading: boolean
  error: string | null
}

const initialState: ApplicationState = {
  myApplications: [],
  applications: [],
  isLoading: false,
  error: null,
}

export const fetchMyApplications = createAsyncThunk(
  'application/fetchMyApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await applicationService.getMyApplications()
      return response.data || []
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch applications')
    }
  }
)

export const applyForDrive = createAsyncThunk(
  'application/applyForDrive',
  async ({ driveId, driveRoleId, resumeFile }: { driveId: string, driveRoleId: string, resumeFile: File }, { rejectWithValue, dispatch }) => {
    try {
      const response = await applicationService.applyToDrive(driveId, driveRoleId, resumeFile)
      // Refresh applications list
      dispatch(fetchMyApplications())
      return response
    } catch (err: any) {
      return rejectWithValue({
        message: err.message || 'Failed to apply to drive',
        reasons: err.reasons,
      })
    }
  }
)

export const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    clearApplicationState: (state) => {
      state.myApplications = []
      state.applications = []
      state.error = null
      state.isLoading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyApplications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchMyApplications.fulfilled,
        (state, action: PayloadAction<Application[]>) => {
          state.isLoading = false
          state.myApplications = action.payload
          state.applications = action.payload
          state.error = null
        }
      )
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to fetch applications'
      })
  },
})

export const { clearApplicationState } = applicationSlice.actions
export default applicationSlice.reducer
