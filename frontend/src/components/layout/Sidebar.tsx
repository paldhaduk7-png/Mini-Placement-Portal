import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  GraduationCap,
  LayoutDashboard,
  User,
  Users,
  Building2,
  Briefcase,
  FileText,
  LogOut,
} from 'lucide-react'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { useAppSelector } from '../../hooks/useAppSelector'
import { logout } from '../../features/auth/authSlice'
import { cn } from '../../lib/utils'
import { ConfirmDialog } from '../common/ConfirmDialog'

export function Sidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const isTPO = user?.role === 'TPO'

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Profile', path: '/student/profile', icon: User },
    { name: 'Recruitment Drives', path: '/student/drives', icon: Briefcase },
    { name: 'Applications', path: '/student/applications', icon: FileText },
  ]

  const tpoLinks = [
    { name: 'Dashboard', path: '/tpo/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/tpo/students', icon: Users },
    { name: 'Companies', path: '/tpo/companies', icon: Building2 },
    { name: 'Recruitment Drives', path: '/tpo/drives', icon: Briefcase },
    { name: 'Applications', path: '/tpo/applications', icon: FileText },
  ]

  const links = isTPO ? tpoLinks : studentLinks

  const handleLogout = () => {
    setIsLogoutOpen(true)
  }

  const confirmLogout = () => {
    dispatch(logout())
    navigate('/login')
    setIsLogoutOpen(false)
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[#0b1528] text-slate-400 border-r border-slate-800 w-64 select-none',
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/80">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <span className="font-bold text-white text-base tracking-tight block">Mini Placement</span>
          <span className="text-xs text-blue-400 font-medium tracking-wide block uppercase">
            {isTPO ? 'TPO Portal' : 'Student Portal'}
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>

      <ConfirmDialog
        isOpen={isLogoutOpen}
        title="Confirm Logout"
        description="Are you sure you want to securely log out of the portal?"
        confirmText="Logout"
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutOpen(false)}
      />
    </aside>
  )
}

export default Sidebar
