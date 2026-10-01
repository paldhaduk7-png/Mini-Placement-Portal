import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import driveService from '@/services/drive.service';
import applicationService from '@/services/application.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate, formatCurrencyLPA } from '@/lib/utils';
import {
  History as HistoryIcon,
  Building2,
  Calendar,
  Users,
  Search,
  ArrowLeft,
  ExternalLink,
  Eye,
  FileCheck,
  CheckCircle2,
  Clock,
  Briefcase,
} from 'lucide-react';
import type { RecruitmentDrive } from '@/types/drive';
import type { Application, ApplicationStatus } from '@/types/application';

export const History: React.FC = () => {
  const [completedDrives, setCompletedDrives] = useState<RecruitmentDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');

  // Drilldown state: when TPO clicks "View Students" for a completed drive
  const [selectedDrive, setSelectedDrive] = useState<RecruitmentDrive | null>(null);
  const [driveApplications, setDriveApplications] = useState<Application[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadCompletedDrives();
  }, []);

  const loadCompletedDrives = async () => {
    setIsLoading(true);
    try {
      const res = await driveService.getAllDrives();
      const allDrives: RecruitmentDrive[] = Array.isArray(res) ? res : (res as any)?.data || [];

      const now = new Date();
      // A drive belongs to history when driveDate has passed OR status is COMPLETED
      const isHistoryDrive = (d: RecruitmentDrive) =>
        d.status === 'COMPLETED' || (d.status !== 'CANCELLED' && new Date(d.driveDate) < now);

      const pastDrives = allDrives
        .filter(isHistoryDrive)
        .map((d) => ({ ...d, status: 'COMPLETED' as const }))
        .sort((a, b) => new Date(b.driveDate).getTime() - new Date(a.driveDate).getTime());

      setCompletedDrives(pastDrives);
    } catch (err) {
      console.error('Failed to load completed recruitment drives:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // View students belonging strictly to the selected drive
  const handleViewStudents = async (drive: RecruitmentDrive) => {
    setSelectedDrive(drive);
    setStudentSearchTerm('');
    setStatusFilter('ALL');
    setIsLoadingStudents(true);
    try {
      const res = await applicationService.getTpoApplications({ driveId: drive.id });
      const apps = Array.isArray(res) ? res : (res as any)?.data || [];
      setDriveApplications(apps);
    } catch (err) {
      console.error('Failed to load students for drive:', err);
    } finally {
      setIsLoadingStudents(false);
    }
  };

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

  // Extract unique companies from completed drives for filter dropdown
  const uniqueCompanies = Array.from(
    new Set(completedDrives.map((d) => d.company?.name).filter(Boolean))
  ) as string[];

  // Filter completed drives
  const filteredDrives = completedDrives.filter((d) => {
    const term = searchTerm.toLowerCase();
    const companyMatch = d.company?.name?.toLowerCase().includes(term);
    const roleMatch = d.role?.toLowerCase().includes(term);
    const locationMatch = d.jobLocation?.toLowerCase().includes(term);
    const matchesSearch = !term || companyMatch || roleMatch || locationMatch;

    const matchesCompany = companyFilter === 'ALL' || d.company?.name === companyFilter;

    return matchesSearch && matchesCompany;
  });

  // Filter students within the selected drive drilldown
  const filteredStudents = driveApplications.filter((app) => {
    const term = studentSearchTerm.toLowerCase();
    const nameMatch = app.student?.fullName?.toLowerCase().includes(term);
    const emailMatch = app.student?.user?.email?.toLowerCase().includes(term);
    const deptMatch = app.student?.department?.toLowerCase().includes(term);
    const matchesSearch = !term || nameMatch || emailMatch || deptMatch;

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading && completedDrives.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading completed recruitment drives..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* If a drive is selected to view its students */}
      {selectedDrive ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Top navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDrive(null)}
              className="text-slate-600 hover:text-slate-900 -ml-2 self-start cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Completed Drives
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 border-blue-200"
            >
              <Link to={`/tpo/drives/${selectedDrive.id}`}>
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Drive Details Page
              </Link>
            </Button>
          </div>

          {/* Drive Summary Header Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {selectedDrive.company?.imageUrl ? (
                <img
                  src={selectedDrive.company.imageUrl}
                  alt={selectedDrive.company.name}
                  className="h-14 w-14 rounded-xl object-contain bg-white p-1 border border-slate-200 shadow-2xs shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Building2 className="h-7 w-7" />
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedDrive.company?.name || 'Company'} — {selectedDrive.role}
                  </h2>
                  <Badge variant="success" className="text-[10px] font-bold">
                    COMPLETED
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {formatCurrencyLPA(selectedDrive.ctc)}
                  </span>
                  <span>•</span>
                  <span>Drive Date: <strong className="text-slate-800">{formatDate(selectedDrive.driveDate)}</strong></span>
                  <span>•</span>
                  <span>Deadline: <strong className="text-slate-800">{formatDate(selectedDrive.deadline)}</strong></span>
                  <span>•</span>
                  <span>Applications: <strong className="text-slate-800">{driveApplications.length}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Students Section */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Applicant Students ({filteredStudents.length} of {driveApplications.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    All candidates who applied to this completed drive with their recorded application status.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="SELECTED">SELECTED</option>
                    <option value="SHORTLISTED">SHORTLISTED</option>
                    <option value="APPLIED">APPLIED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>

                  <div className="relative w-48 sm:w-60">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search candidate name, email..."
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                      className="pl-8 text-xs h-8"
                    />
                  </div>
                </div>
              </div>

              {isLoadingStudents ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner size="md" text="Loading candidates..." />
                </div>
              ) : filteredStudents.length === 0 ? (
                <EmptyState
                  icon={FileCheck}
                  title="No Candidates Found"
                  description="No student applications match the selected criteria for this completed drive."
                />
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500">#</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Student</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Department</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">CGPA</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Applied On</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Application Status</TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase text-slate-500">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((app, idx) => (
                        <TableRow key={app.id} className="hover:bg-slate-50/70 transition-colors">
                          <TableCell className="text-center font-medium text-slate-400 text-xs">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 text-sm">
                                {app.student?.fullName || 'Student'}
                              </span>
                              <span className="text-xs text-slate-500">
                                {app.student?.user?.email || '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 font-medium">
                            {app.student?.department || '-'}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-800">
                            {app.student?.currentCgpa ? app.student.currentCgpa.toFixed(2) : '-'}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {formatDate(app.appliedAt)}
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
                          <TableCell className="text-right">
                            {app.student?.id ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-7 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                <Link to={`/tpo/students/${app.student.id}`}>
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  Profile
                                </Link>
                              </Button>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Completed Recruitment Drives List View */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <HistoryIcon className="h-6 w-6 text-blue-600" />
                Completed Recruitment Drives
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Centralized history of all past and completed campus recruitment drives across all companies.
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
              >
                <option value="ALL">All Companies</option>
                {uniqueCompanies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search company, role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-xs h-9"
                />
              </div>
            </div>
          </div>

          {/* Drives Table */}
          {filteredDrives.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No Completed Drives Found"
              description="No completed recruitment drives match your search criteria. Completed hiring events will appear here automatically."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500">#</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Company</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Role</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Package</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Drive Date</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Deadline</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Status</TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase text-slate-500">Applications</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase text-slate-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrives.map((drive, index) => {
                    const company = drive.company;
                    const appsCount = drive._count?.applications ?? 0;

                    return (
                      <TableRow key={drive.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell className="text-center font-medium text-slate-400 text-xs">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {company?.imageUrl ? (
                              <img
                                src={company.imageUrl}
                                alt={company.name}
                                className="h-8 w-8 rounded-lg object-contain bg-white border border-slate-100 p-0.5 shrink-0"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                                <Building2 className="h-4 w-4" />
                              </div>
                            )}
                            <span className="font-semibold text-slate-900 text-sm">
                              {company?.name || 'Company'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 text-xs">
                              {drive.role}
                            </span>
                            {drive.jobLocation && (
                              <span className="text-[11px] text-slate-400">
                                {drive.jobLocation}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
                            {formatCurrencyLPA(drive.ctc)}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 font-medium">
                          {formatDate(drive.driveDate)}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {formatDate(drive.deadline)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success" className="text-[10px] font-bold">
                            COMPLETED
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            <Users className="h-3 w-3 text-slate-500" />
                            {appsCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            onClick={() => handleViewStudents(drive)}
                            className="h-8 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <Users className="h-3.5 w-3.5" />
                            View Students
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;
