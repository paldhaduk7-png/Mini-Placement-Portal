import { useState, useRef, useEffect } from 'react'
import { Menu, User as UserIcon, LogOut, Settings } from 'lucide-react'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { logout } from '../../features/auth/authSlice'
import { Badge } from '../ui/badge'
import { useNavigate } from 'react-router-dom'

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const user = useAppSelector((state) => state.auth.user)
  const isTPO = user?.role === 'TPO'
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Extract initials or display name
  const displayName = user?.name || (isTPO ? 'TPO Admin' : user?.email?.split('@')[0] || 'Student')
  const initial = displayName.charAt(0).toUpperCase()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Portal Mode:</span>
          <Badge variant={isTPO ? 'purple' : 'default'} className="font-semibold uppercase tracking-wider text-[10px]">
            {user?.role || 'STUDENT'}
          </Badge>
        </div>
      </div>

      {/* User profile capsule matching reference top-right */}
      <div className="relative flex items-center gap-3" ref={dropdownRef}>
        <div 
          onClick={() => isTPO && setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full border border-slate-200/80 bg-slate-50/60 shadow-2xs transition-colors ${isTPO ? 'cursor-pointer hover:bg-slate-100' : ''}`}
        >
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-900 leading-tight capitalize">{displayName}</span>
            <span className="text-[10px] text-slate-400 leading-tight">{user?.email}</span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-xs shadow-xs">
            {initial || <UserIcon className="h-4 w-4" />}
          </div>
        </div>

        {isDropdownOpen && isTPO && (
          <div className="absolute right-0 top-12 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
            <div className="py-1">
              <button
                onClick={() => {
                  setIsDropdownOpen(false)
                  navigate('/tpo/profile')
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="mr-2 h-4 w-4 text-slate-400" />
                My Profile
              </button>
              <div className="h-px bg-slate-100 my-1"></div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4 text-red-500" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
