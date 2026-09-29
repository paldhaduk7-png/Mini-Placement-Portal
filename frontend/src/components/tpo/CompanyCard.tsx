import { Building2, Globe, Edit2, Trash2 } from 'lucide-react'
import { Company } from '../../types/company'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'

export function CompanyCard({
  company,
  onEdit,
  onDelete,
  onViewDrives,
}: {
  company: Company
  onEdit?: (company: Company) => void
  onDelete?: (company: Company) => void
  onViewDrives?: (company: Company) => void
}) {
  return (
    <Card className="hover:shadow-xs transition-shadow border-slate-200/90">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-start gap-3.5 mb-4">
            {company.imageUrl ? (
              <img
                src={company.imageUrl}
                alt={company.name}
                className="h-12 w-12 rounded-xl object-contain p-1 border border-slate-100 bg-white shadow-2xs"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold border border-blue-100 shadow-2xs">
                <Building2 className="h-6 w-6" />
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 text-base">{company.name}</h4>
              {company.website ? (
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <Globe className="h-3 w-3" />
                  <span className="line-clamp-1">{company.website.replace(/^https?:\/\//, '')}</span>
                </a>
              ) : (
                <span className="text-xs text-slate-400 block mt-0.5">No website provided</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
          {onViewDrives && (
            <Button variant="outline" size="sm" onClick={() => onViewDrives(company)} className="text-xs h-8">
              View Drives
            </Button>
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(company)}
                className="h-8 w-8 text-slate-600 hover:text-blue-600"
                title="Edit Company"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(company)}
                className="h-8 w-8 text-slate-400 hover:text-rose-600"
                title="Delete Company"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CompanyCard
