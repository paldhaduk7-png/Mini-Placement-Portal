import { CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '../ui/badge'

export function EligibilityBadge({ eligible }: { eligible: boolean }) {
  if (eligible) {
    return (
      <Badge variant="success" className="gap-1 px-2.5 py-1">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        <span>Eligible</span>
      </Badge>
    )
  }

  return (
    <Badge variant="destructive" className="gap-1 px-2.5 py-1">
      <XCircle className="h-3.5 w-3.5 text-rose-600" />
      <span>Not Eligible</span>
    </Badge>
  )
}

export default EligibilityBadge
