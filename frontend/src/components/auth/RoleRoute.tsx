import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useAppSelector'
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
  const { user } = useAppSelector((state) => state.auth)
  const localRole = (localStorage.getItem('role') as Role) || user?.role

  const roles = allowedRoles || (allowedRole ? [allowedRole] : [])

  if (!localRole) {
    return <Navigate to="/login" replace />
  }

  if (roles.length > 0 && !roles.includes(localRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default RoleRoute
