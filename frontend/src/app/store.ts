import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import studentReducer from '../features/student/studentSlice'
import applicationReducer from '../features/application/applicationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
    application: applicationReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
