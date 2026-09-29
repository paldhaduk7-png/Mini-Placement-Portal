import { AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-rose-200 bg-rose-50/40',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-rose-900">{title}</h3>
      {message && <p className="mt-1 text-xs text-rose-600 max-w-sm">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 border-rose-200 text-rose-700 hover:bg-rose-50">
          Try Again
        </Button>
      )}
    </div>
  )
}

export default ErrorState
