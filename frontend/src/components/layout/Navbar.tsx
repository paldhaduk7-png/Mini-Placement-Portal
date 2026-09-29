import { Menu, User as UserIcon } from 'lucide-react'
import { useAppSelector } from '../../hooks/useAppSelector'
import { Badge } from '../ui/badge'

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const user = useAppSelector((state) => state.auth.user)
  const isTPO = user?.role === 'TPO'

  // Extract initials or display name
  const displayName = isTPO ? 'TPO Admin' : user?.email?.split('@')[0] || 'Student'
  const initial = displayName.charAt(0).toUpperCase()

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
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full border border-slate-200/80 bg-slate-50/60 shadow-2xs">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-900 leading-tight capitalize">{displayName}</span>
            <span className="text-[10px] text-slate-400 leading-tight">{user?.email}</span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-xs shadow-xs">
            {initial || <UserIcon className="h-4 w-4" />}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
