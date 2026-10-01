import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchMyApplications } from '@/features/application/applicationSlice';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate, formatCurrencyLPA } from '@/lib/utils';
import { FileCheck, Building2, ExternalLink } from 'lucide-react';
import type { ApplicationStatus } from '@/types/application';

export const Applications: React.FC = () => {
  const dispatch = useAppDispatch();
  const { applications, isLoading } = useAppSelector((state) => state.application);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'SELECTED':
        return <Badge variant="success">Selected</Badge>;
      case 'SHORTLISTED':
        return <Badge variant="warning">Shortlisted</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'APPLIED':
      default:
        return <Badge variant="secondary">Applied</Badge>;
    }
  };

  if (isLoading && applications.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your applications..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Applications
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track the status of your applications submitted for campus recruitment drives.
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No Applications Found"
          description="You have not applied to any recruitment drives yet. Browse open drives to begin applying."
          action={
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
              <Link to="/student/drives">View Open Drives</Link>
            </Button>
          }
        />
      ) : (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500">#</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-slate-500">Company</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-slate-500">Role</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-slate-500">Package (CTC)</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-slate-500">Applied On</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-slate-500">Status</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase text-slate-500">Drive Info</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const selectedApps = applications.filter((a) => a.status === 'SELECTED');
                  const currentSelectedApp =
                    selectedApps.find((a) => a.isCurrentPlacement) ||
                    (selectedApps.length > 0 ? selectedApps[0] : null);

                  return applications.map((app, index) => {
                    const drive = app.drive;
                    const company = drive?.company;
                    const isCurrent =
                      app.status === 'SELECTED' &&
                      (app.isCurrentPlacement ?? currentSelectedApp?.id === app.id);
                    const isSuperseded =
                      app.status === 'SELECTED' && !isCurrent;

                    return (
                      <TableRow key={app.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell className="text-center font-medium text-slate-400 text-xs">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {company?.imageUrl ? (
                              <img
                                src={company.imageUrl}
                                alt={company.name}
                                className="h-8 w-8 rounded-md object-contain border border-slate-100 p-0.5 bg-white"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-100">
                                <Building2 className="h-4 w-4" />
                              </div>
                            )}
                            <span className="font-semibold text-slate-900 text-sm">
                              {company?.name || 'Company'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-800 text-sm">
                          {drive?.role || 'Engineer'}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-slate-700">
                          {drive?.ctc ? formatCurrencyLPA(drive.ctc) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {formatDate(app.appliedAt)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(app.status)}
                          {isCurrent && (
                            <div className="mt-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded inline-block">
                              CURRENT PLACEMENT
                            </div>
                          )}
                          {isSuperseded && (
                            <div className="mt-1.5 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block border border-slate-200">
                              SUPERSEDED
                            </div>
                          )}
                        </TableCell>
                      <TableCell className="text-right">
                        {drive?.id && (
                          <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-blue-600 hover:text-blue-700">
                            <Link to={`/student/drives/${drive.id}`}>
                              View
                              <ExternalLink className="h-3.5 w-3.5 ml-1" />
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                });
              })()}
            </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};
