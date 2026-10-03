import { Building2, Calendar, FileText } from 'lucide-react'
import { Application } from '../../types/application'
import { Card, CardContent } from '../ui/card'
import { formatDate } from '../../lib/utils'
import { APPLICATION_STATUS_COLORS } from '../../constants'

export function ApplicationCard({ application }: { application: Application }) {
  const drive = application.drive
  const company = drive?.company

  return (
    <Card className="hover:shadow-xs transition-shadow">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {company?.imageUrl ? (
            <img
              src={company.imageUrl}
              alt={company.name}
              className="h-12 w-12 rounded-lg object-contain p-1 border border-slate-100 bg-white"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold border border-blue-100">
              <Building2 className="h-6 w-6" />
            </div>
          )}
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">{company?.name || 'Company'}</h4>
            <p className="text-xs text-slate-500 font-medium">{application.driveRole?.title || 'Role'}</p>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Applied on {formatDate(application.appliedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
              APPLICATION_STATUS_COLORS[application.status] || 'bg-slate-100 text-slate-800'
            }`}
          >
            {application.status}
          </span>
          {application.remarks && (
            <p className="text-[11px] text-slate-500 max-w-xs sm:text-right flex items-center gap-1">
              <FileText className="h-3 w-3 inline text-slate-400" />
              <span>{application.remarks}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ApplicationCard
