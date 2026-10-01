import React from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { Application, ApplicationStatus, Interview } from '@/types/application';
import { Eye, Building2, FileText, Calendar, CalendarPlus, CalendarCheck } from 'lucide-react';

interface ApplicationTableProps {
  applications: Application[];
  onStatusChange?: (applicationId: string, newStatus: ApplicationStatus) => void;
  onScheduleInterview?: (app: Application, existingInterview?: Interview) => void;
  isUpdating?: boolean;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  onStatusChange,
  onScheduleInterview,
  isUpdating,
}) => {
  const getStatusBadgeVariant = (status: ApplicationStatus) => {
    switch (status) {
      case 'SELECTED':
        return 'success';
      case 'SHORTLISTED':
        return 'warning';
      case 'REJECTED':
        return 'destructive';
      case 'APPLIED':
      default:
        return 'secondary';
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500">#</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-500">Student</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-500">Company</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-500">Role</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-500">Applied On</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-500">Resume</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-500">Current Status</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-500">Update Status</TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase text-slate-500">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app, index) => {
            const student = app.student;
            const drive = app.drive;
            const company = drive?.company;

            return (
              <TableRow key={app.id} className="hover:bg-slate-50/70 transition-colors">
                <TableCell className="text-center font-medium text-slate-400 text-xs">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 text-sm">
                      {student?.fullName || 'Student'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {student?.user?.email || student?.department || ''}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {company?.imageUrl ? (
                      <img
                        src={company.imageUrl}
                        alt={company.name}
                        className="h-6 w-6 rounded object-contain border border-slate-100 p-0.5"
                      />
                    ) : (
                      <Building2 className="h-4 w-4 text-slate-400" />
                    )}
                    <span className="font-medium text-slate-800 text-sm">
                      {company?.name || 'N/A'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-700">
                  {drive?.role || (drive as any)?.jobRole || 'N/A'}
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {formatDate(app.appliedAt)}
                </TableCell>
                <TableCell>
                  {student?.resumeUrl ? (
                    <a
                      href={
                        student.resumeUrl.startsWith('http://') || student.resumeUrl.startsWith('https://')
                          ? student.resumeUrl
                          : `${(import.meta.env.VITE_API_URL as string)?.replace(/\/api\/?$/, '') || 'http://localhost:5000'}${student.resumeUrl.startsWith('/') ? '' : '/'}${student.resumeUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-semibold transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View Resume
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No Resume</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(app.status)}>
                    {app.status}
                  </Badge>
                  {app.status === 'SELECTED' && app.isCurrentPlacement && (
                    <div className="mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded block w-max">
                      CURRENT PLACEMENT
                    </div>
                  )}
                  {app.status === 'SELECTED' && app.isCurrentPlacement === false && (
                    <div className="mt-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded block w-max">
                      REPLACED
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1.5">
                    {onStatusChange ? (
                      <select
                        value={app.status}
                        disabled={isUpdating}
                        onChange={(e) => onStatusChange(app.id, e.target.value as ApplicationStatus)}
                        aria-label="Update Application Status"
                        className="text-xs font-medium bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="APPLIED">APPLIED</option>
                        <option value="SHORTLISTED">SHORTLISTED</option>
                        <option value="SELECTED">SELECTED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}

                    {app.status === 'SHORTLISTED' && onScheduleInterview && (
                      app.interviews && app.interviews.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => onScheduleInterview(app, app.interviews![0])}
                          title="Click to view or edit interview details"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                        >
                          <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
                          Interview Scheduled
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onScheduleInterview(app, undefined)}
                          title="Schedule interview for this candidate"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                        >
                          <CalendarPlus className="h-3.5 w-3.5 text-blue-600" />
                          Schedule Interview
                        </button>
                      )
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {student?.id ? (
                    <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                      <Link to={`/tpo/students/${student.id}`}>
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Profile
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
