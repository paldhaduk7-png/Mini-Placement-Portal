import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useAppSelector'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { Role } from '../../types/auth'

export function RoleRoute({
  allowedRole,
  allowedRoles,
  children,
}: {
  allowedRole?: Role
  allowedRoles?: Role[]
  children?: React.ReactNode
}) {
  const { user, isAuthenticated, isInitialized, isLoading } = useAppSelector((state) => state.auth)

  // Wait for session verification before making role-based authorization decision
  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Checking permissions..." />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  const roles = allowedRoles || (allowedRole ? [allowedRole] : [])
  const verifiedRole = user.role

  if (roles.length > 0 && !roles.includes(verifiedRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default RoleRoute
