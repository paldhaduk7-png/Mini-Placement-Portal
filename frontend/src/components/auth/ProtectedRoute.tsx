import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useAppSelector'

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)
  const location = useLocation()
  const localToken = localStorage.getItem('token')

  if (!isAuthenticated && !token && !localToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute
