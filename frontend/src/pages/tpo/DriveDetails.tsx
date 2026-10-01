import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import driveService from '@/services/drive.service';
import applicationService from '@/services/application.service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { formatDate, formatCurrencyLPA } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Building2,
  Users,
  Calendar,
  MapPin,
  Eye,
  FileCheck,
  FileText,
} from 'lucide-react';
import type { RecruitmentDrive } from '@/types/drive';
import type { Application, ApplicationStatus } from '@/types/application';

export const DriveDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [drive, setDrive] = useState<RecruitmentDrive | null>(null);
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'eligible' | 'applications'>('eligible');
  const [isUpdatingApp, setIsUpdatingApp] = useState(false);

  useEffect(() => {
    if (id) {
      loadDriveData(id);
    }
  }, [id]);

  const loadDriveData = async (driveId: string) => {
    setIsLoading(true);
    try {
      const [driveRes, eligibleRes, appsRes] = await Promise.allSettled([
        driveService.getDriveById(driveId),
        driveService.getEligibleStudents(driveId),
        applicationService.getTpoApplications(),
      ]);

      if (driveRes.status === 'fulfilled') {
        const raw = driveRes.value as any;
        setDrive(raw?.data || raw);
      }

      if (eligibleRes.status === 'fulfilled') {
        const raw = eligibleRes.value as any;
        // Backend returns: { drive, count, eligibleStudents: [...] }
        const list = raw?.data?.eligibleStudents || raw?.eligibleStudents || [];
        setEligibleStudents(list);
      }

      if (appsRes.status === 'fulfilled') {
        const raw = appsRes.value as any;
        const allApps = Array.isArray(raw) ? raw : raw?.data || [];
        // Filter applications for this specific drive
        const driveApps = allApps.filter((a: Application) => a.driveId === driveId || a.drive?.id === driveId);
        setApplications(driveApps);
      }
    } catch (err) {
      console.error('Failed to load drive details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    setIsUpdatingApp(true);
    try {
      await applicationService.updateStatus(appId, newStatus);
      toast.success(`Application updated to ${newStatus}`);
      if (id) loadDriveData(id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update application status.');
    } finally {
      setIsUpdatingApp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading drive details and eligible students..." />
      </div>
    );
  }

  const company = drive?.company;
  const isClosed = drive?.status === 'COMPLETED' || drive?.status === 'CANCELLED' || (drive?.deadline ? new Date(drive.deadline) < new Date() : false);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/tpo/drives')}
        className="text-slate-600 hover:text-slate-900 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to Drives
      </Button>

      {/* Header Banner matching reference design */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {company?.imageUrl ? (
              <img
                src={company.imageUrl}
                alt={company.name}
                className="h-14 w-14 rounded-xl object-contain bg-white p-1 border border-white/20"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Building2 className="h-7 w-7" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {company?.name || 'Company'} - {drive?.role || 'Role'}
                </h1>
                <Badge variant={isClosed ? 'destructive' : 'success'}>
                  {drive?.status || (isClosed ? 'CLOSED' : 'OPEN')}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold">
                  {formatCurrencyLPA(drive?.ctc || 0)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {drive?.jobLocation || 'Not specified'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Deadline: {drive?.deadline ? formatDate(drive.deadline) : 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Drive Date: {drive?.driveDate ? formatDate(drive.driveDate) : 'TBA'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-slate-400 block">Eligible Pool</span>
            <span className="text-2xl font-bold text-white">{eligibleStudents.length} Students</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-50 px-6 border-b border-slate-200 flex gap-6">
          <button
            onClick={() => setActiveTab('eligible')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'eligible'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="h-4 w-4" />
            Eligible Students ({eligibleStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'applications'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileCheck className="h-4 w-4" />
            Applications Received ({applications.length})
          </button>
        </div>

        <CardContent className="p-6">
          {activeTab === 'eligible' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Eligible Students - {company?.name} ({drive?.role})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Students evaluated by the backend engine meeting all academic criteria for this drive.
                  </p>
                </div>
              </div>

              {eligibleStudents.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No Eligible Students"
                  description="No registered students currently satisfy all criteria (CGPA, 10th/12th marks, backlog limits) for this recruitment drive."
                />
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500">#</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Name</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">10th %</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">12th % / D2D</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">CGPA</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Backlogs</TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase text-slate-500">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eligibleStudents.map((st, index) => (
                        <TableRow key={st.id || index} className="hover:bg-slate-50/70 transition-colors">
                          <TableCell className="text-center font-medium text-slate-400 text-xs">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 text-sm">{st.fullName}</span>
                              <span className="text-xs text-slate-500">{st.department}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-slate-700">
                            {st.tenthPercentage}%
                          </TableCell>
                          <TableCell className="text-sm font-medium text-slate-700">
                            {st.studentType === 'REGULAR'
                              ? st.twelfthPercentage ? `${st.twelfthPercentage}%` : '-'
                              : `D2D: ${st.d2dCgpa ?? '-'}`}
                          </TableCell>
                          <TableCell className="text-sm font-bold text-blue-600">
                            {st.currentCgpa}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {st.activeBacklogs}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-blue-600 hover:text-blue-800">
                              <Link to={`/tpo/students/${st.id}`}>
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                View Profile
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Submitted Applications</h3>
              {applications.length === 0 ? (
                <EmptyState
                  icon={FileCheck}
                  title="No Applications Submitted"
                  description="Eligible candidates have not yet submitted applications for this recruitment drive."
                />
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="w-12 text-center text-xs font-semibold uppercase text-slate-500">#</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Student</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Applied Date</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Resume</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Status</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-slate-500">Update Status</TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase text-slate-500">Profile</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app, index) => (
                        <TableRow key={app.id} className="hover:bg-slate-50/70 transition-colors">
                          <TableCell className="text-center font-medium text-slate-400 text-xs">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-slate-900 text-sm">
                              {app.student?.fullName || 'Student'}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {formatDate(app.appliedAt)}
                          </TableCell>
                          <TableCell>
                            {app.student?.resumeUrl ? (
                              <a
                                href={
                                  app.student.resumeUrl.startsWith('http://') || app.student.resumeUrl.startsWith('https://')
                                    ? app.student.resumeUrl
                                    : `${(import.meta.env.VITE_API_URL as string)?.replace(/\/api\/?$/, '') || 'http://localhost:5000'}${app.student.resumeUrl.startsWith('/') ? '' : '/'}${app.student.resumeUrl}`
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
                            <Badge
                              variant={
                                app.status === 'SELECTED'
                                  ? 'success'
                                  : app.status === 'SHORTLISTED'
                                  ? 'warning'
                                  : app.status === 'REJECTED'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <select
                              value={app.status}
                              disabled={isUpdatingApp}
                              onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                              className="text-xs font-medium bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="APPLIED">APPLIED</option>
                              <option value="SHORTLISTED">SHORTLISTED</option>
                              <option value="SELECTED">SELECTED</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          </TableCell>
                          <TableCell className="text-right">
                            {app.student?.id && (
                              <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-blue-600 hover:text-blue-800">
                                <Link to={`/tpo/students/${app.student.id}`}>
                                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                                </Link>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
