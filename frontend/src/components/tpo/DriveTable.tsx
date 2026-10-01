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
import { formatDate, formatCurrencyLPA, isDeadlinePassed } from '@/lib/utils';
import type { RecruitmentDrive } from '@/types/drive';
import { Users, ExternalLink, Calendar, MapPin, Building2, Pencil } from 'lucide-react';

interface DriveTableProps {
  drives: RecruitmentDrive[];
  onDelete?: (id: string) => void;
}

export const DriveTable: React.FC<DriveTableProps> = ({ drives }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500">#</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-500">Company</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-500">Role</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-500">CTC</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-500">Location</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-500">Deadline</TableHead>
            <TableHead className="text-xs font-semibold uppercase text-slate-500">Status</TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase text-slate-500">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drives.map((drive, index) => {
            const isClosed = drive.status === 'COMPLETED' || drive.status === 'CANCELLED' || isDeadlinePassed(drive.deadline);
            const companyName = drive.company?.name || 'Company';

            return (
              <TableRow key={drive.id} className="hover:bg-slate-50/70 transition-colors">
                <TableCell className="text-center font-medium text-slate-400 text-xs">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {drive.company?.imageUrl ? (
                      <img
                        src={drive.company.imageUrl}
                        alt={companyName}
                        className="h-8 w-8 rounded-md object-contain border border-slate-100 p-0.5 bg-white"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-100">
                        <Building2 className="h-4 w-4" />
                      </div>
                    )}
                    <span className="font-semibold text-slate-900 text-sm">{companyName}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-800 text-sm">
                  {drive.role || (drive as any).jobRole}
                </TableCell>
                <TableCell className="text-sm font-semibold text-slate-700">
                  {formatCurrencyLPA(drive.ctc ?? (drive as any).ctcLpa ?? 0)}
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{drive.jobLocation || (drive as any).location || 'Not Specified'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{formatDate(drive.deadline)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={isClosed ? 'destructive' : 'success'}>
                    {drive.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" asChild className="h-8 text-xs font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-200">
                      <Link to={`/tpo/drives/${drive.id}`}>
                        <Users className="h-3.5 w-3.5 mr-1 text-blue-600" />
                        Eligible Students
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 bg-transparent hover:bg-blue-50">
                      <Link to={`/tpo/drives/${drive.id}/edit`} title="Edit Drive">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800">
                      <Link to={`/tpo/drives/${drive.id}`} title="View Details">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
