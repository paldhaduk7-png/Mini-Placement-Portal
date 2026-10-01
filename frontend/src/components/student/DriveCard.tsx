import { Link } from 'react-router-dom'
import { Building2, MapPin, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react'
import { RecruitmentDrive } from '../../types/drive'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { formatCurrencyLPA, formatDate, isDeadlinePassed } from '../../lib/utils'

export function DriveCard({ drive }: { drive: RecruitmentDrive }) {
  const isExpired = isDeadlinePassed(drive.deadline)

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-slate-200/90 group">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div>
          {/* Header with Company Logo & Status */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              {drive.company?.imageUrl ? (
                <img
                  src={drive.company.imageUrl}
                  alt={drive.company.name}
                  className="h-11 w-11 rounded-lg object-contain p-1 border border-slate-100 bg-white"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold border border-blue-100">
                  <Building2 className="h-5 w-5" />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {drive.company?.name || 'Company'}
                </h4>
                <p className="text-xs text-slate-500 font-medium line-clamp-1">{drive.role}</p>
              </div>
            </div>

            <Badge variant={isExpired ? 'destructive' : 'success'} className="text-[10px] uppercase font-semibold">
              {isExpired ? 'Closed' : 'Open'}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-1.5 text-xs text-slate-600 my-4 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">CTC Package:</span>
              <span className="font-bold text-slate-900 text-sm text-blue-700">
                {formatCurrencyLPA(drive.ctc)}
              </span>
            </div>
            {drive.jobLocation && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Location:
                </span>
                <span className="font-medium text-slate-700">{drive.jobLocation}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Deadline:
              </span>
              <span className="font-medium text-slate-700">{formatDate(drive.deadline)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Drive Date:
              </span>
              <span className="font-medium text-slate-700">{formatDate(drive.driveDate)}</span>
            </div>
            {drive.status === 'COMPLETED' && (
              <div className="flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-slate-200 text-emerald-600 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Drive Completed
              </div>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-2">
          <Link to={`/student/drives/${drive.id}`} className="w-full block">
            <Button variant="default" size="sm" className="w-full gap-1.5 text-xs">
              <span>View Details & Eligibility</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default DriveCard
