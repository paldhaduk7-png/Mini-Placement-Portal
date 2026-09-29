import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export function LoadingSpinner({
  className,
  size = 'md',
  text,
}: {
  className?: string
  size?: number | 'sm' | 'md' | 'lg'
  text?: string
}) {
  const numericSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 16
      : size === 'lg'
      ? 36
      : 24

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 space-y-2', className)}>
      <Loader2 className="animate-spin text-blue-600" size={numericSize} />
      {text && <p className="text-xs text-slate-500 font-medium">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
