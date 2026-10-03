import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import companyService from '@/services/company.service';
import driveService from '@/services/drive.service';
import { applicationService } from '@/services/application.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { DriveTable } from '@/components/tpo/DriveTable';
import { formatDate, formatCurrencyLPA } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Building2,
  ArrowLeft,
  History,
  Briefcase,
  Users,
  Calendar,
  ExternalLink,
  Eye,
  FileText,
  Search,
  GraduationCap,
} from 'lucide-react';
import type { Company } from '@/types/company';
import type { RecruitmentDrive } from '@/types/drive';
import type { Application, ApplicationStatus } from '@/types/application';

export const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [company, setCompany] = useState<Company | null>(null);
  const [activeDrives, setActiveDrives] = useState<RecruitmentDrive[]>([]);
  const [historyDrives, setHistoryDrives] = useState<RecruitmentDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tab: 'drives' | 'history'
  const initialTab = searchParams.get('tab') === 'history' ? 'history' : 'drives';
  const [activeTab, setActiveTab] = useState<'drives' | 'history'>(initialTab);

  // Drilldown state when viewing students of a completed drive in History
  const [selectedHistoryDrive, setSelectedHistoryDrive] = useState<RecruitmentDrive | null>(null);
  const [driveApplications, setDriveApplications] = useState<Application[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  // Sync tab with searchParams if user changes it
  const handleTabChange = (tab: 'drives' | 'history') => {
    setActiveTab(tab);
    setSearchParams(tab === 'history' ? { tab: 'history' } : {});
    // Clear student drilldown when switching tabs
    setSelectedHistoryDrive(null);
  };

  const loadData = async (companyId: string) => {
    setIsLoading(true);
    try {
      const compRes = await companyService.getCompanyById(companyId);
      const compData = (compRes as any)?.data || (compRes as any)?.company || compRes;
      setCompany(compData);

      const drivesRes = await driveService.getAllDrives({ companyId });
      const allDrives: RecruitmentDrive[] = Array.isArray(drivesRes) ? drivesRes : (drivesRes as any)?.data || [];
      
      const now = new Date();
      // Drive belongs to History when driveDate has passed OR status is COMPLETED
      const isHistoryDrive = (d: RecruitmentDrive) =>
        d.status === 'COMPLETED' || (d.status !== 'CANCELLED' && new Date(d.driveDate) < now);

      const history = allDrives
        .filter(isHistoryDrive)
        .map(d => ({ ...d, status: 'COMPLETED' as const }));

      const active = allDrives.filter(
        (d: RecruitmentDrive) => !isHistoryDrive(d) && d.status !== 'CANCELLED'
      );
      
      setActiveDrives(active);
      setHistoryDrives(history);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load company details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open "View Students" for a specific completed drive in History
  const handleViewStudents = async (drive: RecruitmentDrive) => {
    setSelectedHistoryDrive(drive);
    setIsLoadingStudents(true);
    setStudentSearchTerm('');
    setStatusFilter('ALL');

    try {
      const res = await applicationService.getTpoApplications({ driveId: drive.id });
      const apps = Array.isArray(res) ? res : (res as any)?.data || [];
      setDriveApplications(apps);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load applications for this drive.');
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

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading company profile..." />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <Building2 className="h-10 w-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-800">Company Not Found</h3>
        <Button variant="outline" size="sm" onClick={() => navigate('/tpo/companies')} className="mt-4">
          Return to Companies
        </Button>
      </div>
    );
  }

  // Filter students in the drilldown view
  const filteredApplications = driveApplications.filter((app) => {
    const student = app.student;
    const matchesSearch =
      !studentSearchTerm.trim() ||
      student?.fullName?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      (student as any)?.email?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student?.user?.email?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student?.department?.toLowerCase().includes(studentSearchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/tpo/companies')}
        className="text-slate-600 hover:text-slate-900 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to Companies
      </Button>

      {/* Header Banner */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {company.imageUrl ? (
              <img
                src={company.imageUrl}
                alt={company.name}
                className="h-14 w-28 rounded-lg object-contain bg-white p-2 border border-white/20"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Building2 className="h-7 w-7" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                {company.name}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Corporate Profile & Recruitment Drive History
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-center">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Active Drives</span>
              <span className="text-lg font-bold text-emerald-400">{activeDrives.length}</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-center">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Completed History</span>
              <span className="text-lg font-bold text-blue-400">{historyDrives.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 flex gap-6">
          <button
            onClick={() => handleTabChange('drives')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'drives'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Recruitment Drives ({activeDrives.length})
          </button>
          <button
            onClick={() => handleTabChange('history')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="h-4 w-4" />
            History ({historyDrives.length})
          </button>
        </div>

        <CardContent className="p-6 bg-slate-50 min-h-[420px]">
          {activeTab === 'drives' ? (
            /* Active / Upcoming Drives */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Current & Upcoming Recruitment Drives</h3>
                  <p className="text-xs text-slate-500">Active campus hiring drives open for student applications</p>
                </div>
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                  <Link to="/tpo/drives/create">Create New Drive</Link>
                </Button>
              </div>

              {activeDrives.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No Active Drives"
                  description="This company currently has no upcoming or active recruitment drives."
                  action={
                    <Button asChild size="sm" className="bg-blue-600 text-white text-xs">
                      <Link to="/tpo/drives/create">Create Drive</Link>
                    </Button>
                  }
                />
              ) : (
                <DriveTable drives={activeDrives} />
              )}
            </div>
          ) : (
            /* History Tab: Past Completed Recruitment Drives */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* If TPO has selected a completed drive to view its students */}
              {selectedHistoryDrive ? (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Back to Completed Drives */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedHistoryDrive(null)}
                      className="text-slate-600 hover:text-slate-900 -ml-2 self-start"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1.5" />
                      Back to Drive History
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 border-blue-200"
                    >
                      <Link to={`/tpo/drives/${selectedHistoryDrive.id}`}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        Full Drive Details Page
                      </Link>
                    </Button>
                  </div>

                  {/* Drive Summary Box */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-700 text-white text-[10px] font-bold">COMPLETED DRIVE</Badge>
                        <h2 className="text-lg font-bold text-slate-900">
                          {selectedHistoryDrive.roles && selectedHistoryDrive.roles.length > 0 ? (selectedHistoryDrive.roles.length === 1 ? selectedHistoryDrive.roles[0].title : 'Multiple Roles') : 'Role'}
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {selectedHistoryDrive.roles && selectedHistoryDrive.roles.length > 0 ? (selectedHistoryDrive.roles.length === 1 ? formatCurrencyLPA(selectedHistoryDrive.roles[0].minCTC || 0) : 'Multiple Packages') : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Drive Date: <strong className="text-slate-800">{formatDate(selectedHistoryDrive.driveDate)}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Deadline: <strong className="text-slate-800">{formatDate(selectedHistoryDrive.deadline)}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-right shrink-0">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Applications</span>
                      <span className="text-xl font-extrabold text-blue-700">{driveApplications.length} Students</span>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Search student by name or email..."
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        className="pl-9 text-xs h-9 bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">Filter Status:</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs font-medium bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="SELECTED">SELECTED</option>
                        <option value="SHORTLISTED">SHORTLISTED</option>
                        <option value="APPLIED">APPLIED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>
                  </div>

                  {/* Students Table */}
                  {isLoadingStudents ? (
                    <div className="flex h-64 items-center justify-center bg-white rounded-xl border border-slate-200">
                      <LoadingSpinner size="md" text="Loading student applications..." />
                    </div>
                  ) : filteredApplications.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                      <Users className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <h4 className="text-sm font-semibold text-slate-800">No Student Applications Found</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {driveApplications.length === 0
                          ? 'No students applied to this recruitment drive.'
                          : 'No applications match your filter criteria.'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500">#</TableHead>
                            <TableHead className="text-xs font-semibold uppercase text-slate-500">Student Name</TableHead>
                            <TableHead className="text-xs font-semibold uppercase text-slate-500">Email & Contact</TableHead>
                            <TableHead className="text-xs font-semibold uppercase text-slate-500">Department & CGPA</TableHead>
                            <TableHead className="text-xs font-semibold uppercase text-slate-500">Resume</TableHead>
                            <TableHead className="text-xs font-semibold uppercase text-slate-500">Application Status</TableHead>
                            <TableHead className="text-right text-xs font-semibold uppercase text-slate-500">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredApplications.map((app, index) => {
                            const student = app.student;
                            const email = (student as any)?.email || student?.user?.email || 'N/A';

                            return (
                              <TableRow key={app.id} className="hover:bg-slate-50/70 transition-colors">
                                <TableCell className="text-center font-medium text-slate-400 text-xs">
                                  {index + 1}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                      {student?.fullName?.charAt(0).toUpperCase() || 'S'}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-900 text-sm block">
                                        {student?.fullName || 'Student'}
                                      </span>
                                      <span className="text-[11px] text-slate-400">
                                        Applied {formatDate(app.appliedAt)}
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-xs">
                                    <div className="font-medium text-slate-800">{email}</div>
                                    <div className="text-slate-500 text-[11px] mt-0.5">{student?.phone || 'No phone'}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-xs">
                                    <div className="font-medium text-slate-800 flex items-center gap-1">
                                      <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
                                      {student?.department || 'N/A'}
                                    </div>
                                    <div className="text-slate-600 text-[11px] mt-0.5">
                                      CGPA: <strong className="text-blue-700">{student?.currentCgpa ?? 'N/A'}</strong>
                                    </div>
                                  </div>
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
                                      Resume
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
                                <TableCell className="text-right">
                                  {student?.id ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      asChild
                                      className="h-8 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                                    >
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
                  )}
                </div>
              ) : (
                /* Completed Drives List */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Completed & Past Recruitment Drives</h3>
                      <p className="text-xs text-slate-500">
                        History of completed hiring events and applicant records for {company.name}
                      </p>
                    </div>
                  </div>

                  {historyDrives.length === 0 ? (
                    <EmptyState
                      icon={History}
                      title="No Completed Drives"
                      description="This company does not have any completed recruitment drives in its history yet."
                    />
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500">#</TableHead>
                            <TableHead className="text-xs font-semibold uppercase text-slate-500">Drive Name (Role)</TableHead>
                            <TableHead className="text-xs font-semibold uppercase text-slate-500">Package (CTC)</TableHead>
                            <TableHead className="text-xs font-semibold uppercase text-slate-500">Drive Event Date</TableHead>
                            <TableHead className="text-xs font-semibold uppercase text-slate-500">Application Deadline</TableHead>
                            <TableHead className="text-xs font-semibold uppercase text-slate-500">Status</TableHead>
                            <TableHead className="text-xs font-semibold uppercase text-slate-500">Applications</TableHead>
                            <TableHead className="text-right text-xs font-semibold uppercase text-slate-500">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historyDrives.map((drive, index) => {
                            const appCount = drive._count?.applications ?? 0;

                            return (
                              <TableRow key={drive.id} className="hover:bg-slate-50/70 transition-colors">
                                <TableCell className="text-center font-medium text-slate-400 text-xs">
                                  {index + 1}
                                </TableCell>
                                <TableCell>
                                  <div className="font-bold text-slate-900 text-sm">
                                    {drive?.roles && drive?.roles.length > 0 ? (drive?.roles.length === 1 ? drive?.roles[0].title : 'Multiple Roles') : 'Role'}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {drive.jobLocation || 'Campus Placement'}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm font-semibold text-emerald-700">
                                  {drive?.roles && drive?.roles.length > 0 ? (drive?.roles.length === 1 ? formatCurrencyLPA(drive?.roles[0].minCTC || 0) : 'Multiple Packages') : 'N/A'}
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span>{formatDate(drive.driveDate)}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span>{formatDate(drive.deadline)}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-slate-700 hover:bg-slate-800 text-white font-semibold text-[10px]">
                                    COMPLETED
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                                    <Users className="h-3 w-3" />
                                    {appCount} {appCount === 1 ? 'Student' : 'Students'}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleViewStudents(drive)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8 shadow-xs cursor-pointer"
                                    >
                                      <Users className="h-3.5 w-3.5 mr-1.5" />
                                      View Students
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      asChild
                                      className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600"
                                      title="Open Full Drive"
                                    >
                                      <Link to={`/tpo/drives/${drive.id}`}>
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
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
