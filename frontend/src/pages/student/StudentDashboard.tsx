import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchStudentProfile } from '@/features/student/studentSlice';
import { fetchMyApplications } from '@/features/application/applicationSlice';
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
import { formatDate, formatCurrencyLPA, isDeadlinePassed, formatInterviewTime } from '@/lib/utils';
import {
  Building2,
  Calendar,
  FileCheck,
  UserCheck,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import type { RecruitmentDrive } from '@/types/drive';
import type { PlacementStatus, Application, Interview, ApplicationStatus } from '@/types/application';

export const StudentDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, isLoading: isProfileLoading } = useAppSelector((state) => state.student);
  const { applications, isLoading: isAppsLoading, error: appsError } = useAppSelector((state) => state.application);
  const { user } = useAppSelector((state) => state.auth);

  const [availableDrives, setAvailableDrives] = useState<RecruitmentDrive[]>([]);
  const [placementStatus, setPlacementStatus] = useState<PlacementStatus | null>(null);
  const [selectedInterviewModal, setSelectedInterviewModal] = useState<{
    app: Application;
    interview: Interview;
  } | null>(null);

  const loadDrives = async () => {
    try {
      const res = await driveService.getStudentDrives();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAvailableDrives(list);
    } catch (err) {
      console.error('Failed to load drives:', err);
    }
  };

  const loadPlacementStatus = async () => {
    try {
      const res = await applicationService.getPlacementStatus();
      if (res?.data) {
        setPlacementStatus(res.data);
      }
    } catch (err) {
      console.error('Failed to load placement status:', err);
    }
  };

  useEffect(() => {
    dispatch(fetchStudentProfile());
    dispatch(fetchMyApplications());
    loadDrives();
    loadPlacementStatus();
  }, [dispatch]);

  const studentName = profile?.fullName || user?.fullName || 'Student';
  const appliedCount = applications.length;

  const totalApps = applications.length;
  const pendingCount = applications.filter((app) => app.status === 'APPLIED').length;
  const shortlistedCount = applications.filter(
    (app) => app.status === 'SHORTLISTED' || app.status === 'INTERVIEW'
  ).length;
  const selectedCount = applications.filter((app) => app.status === 'SELECTED').length;
  const rejectedCount = applications.filter((app) => app.status === 'REJECTED').length;

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  const selectedApps = applications.filter((a) => a.status === 'SELECTED');
  const currentSelectedApp =
    selectedApps.find((a) => a.isCurrentPlacement) ||
    (selectedApps.length > 0 ? selectedApps[0] : null);

  const getApplicationStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'SELECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Selected
          </span>
        );
      case 'SHORTLISTED':
      case 'INTERVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            {status === 'INTERVIEW' ? 'Interview' : 'Shortlisted'}
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      case 'APPLIED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Applied
          </span>
        );
    }
  };

  const getProfileBadge = () => {
    if (!profile) return <Badge variant="secondary">Unknown</Badge>;
    if (profile.verificationStatus === 'VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Verified
        </span>
      );
    }
    if (profile.verificationStatus === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <XCircle className="h-3.5 w-3.5 text-rose-600" />
          Rejected
        </span>
      );
    }
    if (profile.isProfileLocked) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          <Clock className="h-3.5 w-3.5 text-blue-600" />
          Submitted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
        Incomplete
      </span>
    );
  };

  const isLoading = isProfileLoading || isAppsLoading;

  if (isLoading && !profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading student dashboard..." />
      </div>
    );
  }

  // Drives to display in Latest Recruitment Drives table
  const displayDrives = availableDrives.slice(0, 5);

  const isVerified = profile?.verificationStatus === 'VERIFIED';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Hello, {studentName}! 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here's what's happening with your placement journey.
        </p>
      </div>

      {/* Notice if profile is not submitted/locked yet */}
      {profile && !profile.isProfileLocked && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">Complete & Submit Your Profile</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Your profile is not locked yet. Complete all 3 steps and submit your profile so TPO can verify your records and unlock drive applications.
              </p>
            </div>
          </div>
          <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 text-xs">
            <Link to="/student/profile">Complete Profile</Link>
          </Button>
        </div>
      )}

      {/* Notice if profile was rejected */}
      {profile && profile.verificationStatus === 'REJECTED' && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-900">Profile Rejected by TPO</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Reason: {profile.rejectionReason || 'Please review your academic details and resubmit.'}
              </p>
            </div>
          </div>
          <Button size="sm" asChild className="bg-rose-600 hover:bg-rose-700 text-white shrink-0 text-xs">
            <Link to="/student/profile">Update Profile</Link>
          </Button>
        </div>
      )}

      {/* Notice for Scheduled Interview */}
      {(() => {
        const scheduledApps = applications.filter(
          (app) => app.interviews && app.interviews.length > 0 && app.status === 'SHORTLISTED'
        );
        if (scheduledApps.length === 0) return null;

        return (
          <div className="space-y-4">
            {scheduledApps.map((interviewApp) => {
              const intv = interviewApp.interviews![0];
              const companyName = interviewApp.drive?.company?.name || 'Company';
              const formattedDate = new Date(intv.interviewDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={interviewApp.id}
                  className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-blue-50/90 border border-blue-200/90 shadow-xs"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎯</span>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          Interview Scheduled
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-700">
                        <div>
                          <span className="text-slate-500 font-medium">Company:</span>{' '}
                          <span className="font-bold text-slate-900">{companyName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Date:</span>{' '}
                          <span className="font-bold text-slate-900">{formattedDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Time:</span>{' '}
                          <span className="font-bold text-slate-900">{formatInterviewTime(intv.interviewTime)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Round:</span>{' '}
                          <span className="font-bold text-slate-900">{intv.round}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Mode:</span>{' '}
                          <span className="font-bold text-slate-900">{intv.mode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 pt-1 md:pt-0">
                      <Button
                        size="sm"
                        onClick={() => setSelectedInterviewModal({ app: interviewApp, interview: intv })}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                      >
                        View Interview Details
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Top Stat Cards matching Step 4 Reference Image */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Profile Status */}
        <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Profile Status</p>
              <div className="mt-2">{getProfileBadge()}</div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <UserCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Available Drives */}
        <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Available Drives</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {isVerified ? availableDrives.length : 0}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Calendar className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: My Applications */}
        <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Applications</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {totalApps}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <FileCheck className="h-6 w-6" />
              </div>
            </div>
            {totalApps > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-4 gap-1 text-center">
                <div title="Applied / Pending">
                  <span className="block text-[10px] font-semibold text-amber-600 uppercase tracking-tight">Pending</span>
                  <span className="text-xs font-bold text-slate-800">{pendingCount}</span>
                </div>
                <div title="Shortlisted">
                  <span className="block text-[10px] font-semibold text-blue-600 uppercase tracking-tight">Shortlist</span>
                  <span className="text-xs font-bold text-slate-800">{shortlistedCount}</span>
                </div>
                <div title="Selected">
                  <span className="block text-[10px] font-semibold text-emerald-600 uppercase tracking-tight">Selected</span>
                  <span className="text-xs font-bold text-slate-800">{selectedCount}</span>
                </div>
                <div title="Rejected">
                  <span className="block text-[10px] font-semibold text-rose-600 uppercase tracking-tight">Rejected</span>
                  <span className="text-xs font-bold text-slate-800">{rejectedCount}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Placement Update Notice (Shown ONLY when student has an application with status = SELECTED) */}
      {placementStatus?.isSelected && placementStatus.selectedPackage != null && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/70 border border-emerald-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-100/90 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-emerald-950 flex items-center gap-1.5">
                  🎉 Placement Update
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Selected
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800 mt-1">
                You have been selected for a <span className="font-bold text-emerald-800">₹{placementStatus.selectedPackage} LPA</span> package{placementStatus.selectedCompany ? ` at ${placementStatus.selectedCompany}` : ''}.
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                You can apply to companies offering <span className="font-bold text-slate-900">₹{placementStatus.minimumNextPackage} LPA</span> or more.
              </p>
            </div>
          </div>
          <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 text-xs font-semibold gap-1.5 self-start sm:self-center shadow-sm">
            <Link to="/student/drives">
              View Recruitment Drives
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Application Status / Recent Applications Section */}
      <Card className="border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">Application Status</h3>
              {totalApps > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {totalApps} {totalApps === 1 ? 'Application' : 'Applications'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status of your submitted recruitment drive applications
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                dispatch(fetchMyApplications());
                loadPlacementStatus();
              }}
              disabled={isAppsLoading}
              className="text-xs h-8 text-slate-600 hover:text-slate-900 gap-1.5"
              title="Refresh application status"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isAppsLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-xs text-blue-600 hover:text-blue-700">
              <Link to="/student/applications" className="flex items-center gap-1 font-semibold">
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          {isAppsLoading && applications.length === 0 ? (
            <div className="p-8 flex items-center justify-center">
              <LoadingSpinner size="md" text="Loading application status..." />
            </div>
          ) : appsError && applications.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Failed to load application status</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">{appsError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(fetchMyApplications())}
                className="text-xs"
              >
                Try Again
              </Button>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center">
              <FileCheck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                You haven't applied to any recruitment drives yet.
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Explore open recruitment drives matching your profile and submit your applications.
              </p>
              <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                <Link to="/student/drives">Browse Recruitment Drives</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentApplications.map((app) => {
                const drive = app.drive;
                const company = drive?.company;
                const isCurrent =
                  app.status === 'SELECTED' &&
                  (app.isCurrentPlacement ?? currentSelectedApp?.id === app.id);

                return (
                  <div
                    key={app.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      {company?.imageUrl ? (
                        <img
                          src={company.imageUrl}
                          alt={company.name || 'Company'}
                          className="h-10 w-10 rounded-lg object-contain border border-slate-100 p-1 bg-white shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold text-sm border border-blue-100 shrink-0">
                          <Building2 className="h-5 w-5" />
                        </div>
                      )}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                            {company?.name || 'Company'}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                              CURRENT PLACEMENT
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                          <span className="font-medium text-slate-800">
                            {app.driveRole?.title || 'Role N/A'}
                          </span>
                          {app.driveRole?.maxCTC != null && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="font-semibold text-slate-700">
                                {formatCurrencyLPA(app.driveRole.maxCTC)}
                              </span>
                            </>
                          )}
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">
                            Applied on {formatDate(app.appliedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div>{getApplicationStatusBadge(app.status)}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 font-semibold h-8 px-2.5"
                      >
                        <Link to="/student/applications">
                          View Details
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest Recruitment Drives Section */}
      <Card className="border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Latest Recruitment Drives</h3>
            <p className="text-xs text-slate-500">Upcoming and active recruitment drives on the portal</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs text-blue-600 hover:text-blue-700">
            <Link to="/student/drives" className="flex items-center gap-1 font-semibold">
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <CardContent className="p-0">
          {!isVerified ? (
            <div className="p-8 text-center">
              <Clock className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Verification Pending</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Waiting for verification from TPO side. You will be able to view and apply to recruitment drives once your profile is verified.
              </p>
            </div>
          ) : displayDrives.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No recruitment drives available</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                There are currently no active recruitment drives scheduled. New drives posted by TPO will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Company</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Role</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">CTC</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Last Date</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Status</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase text-slate-500">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayDrives.map((drive) => {
                    const company = drive?.company;
                    const isClosed = drive?.deadline ? isDeadlinePassed(drive.deadline) : false;

                    return (
                      <TableRow key={drive.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {company?.imageUrl ? (
                              <img
                                src={company.imageUrl}
                                alt={company.name || 'Company'}
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
                          {drive?.roles && drive?.roles.length > 0 ? (drive?.roles.length === 1 ? drive?.roles[0].title : 'Multiple Roles') : 'Multiple Roles'}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-slate-700">
                          {drive?.roles && drive?.roles.length > 0 ? (
                            drive?.roles.length === 1 
                              ? formatCurrencyLPA(drive?.roles[0].minCTC || 0) 
                              : 'Varies by role'
                          ) : 'Varies'}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {drive.deadline ? formatDate(drive.deadline) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              isClosed
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isClosed ? 'Closed' : 'Open'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-blue-600 hover:text-blue-700">
                            <Link to={`/student/drives/${drive.id}`}>
                              View
                              <ExternalLink className="h-3.5 w-3.5 ml-1" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for View Interview Details */}
      {selectedInterviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 text-lg">
                  🎯
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Interview Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedInterviewModal.app.drive?.company?.name || 'Company'} — {selectedInterviewModal.app.driveRole?.title || 'Role'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInterviewModal(null)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors text-base"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3.5 text-xs divide-y divide-slate-100">
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Interview Date</span>
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(selectedInterviewModal.interview.interviewDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Interview Time</span>
                  <p className="text-sm font-bold text-slate-900">
                    {formatInterviewTime(selectedInterviewModal.interview.interviewTime)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3.5">
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Round</span>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedInterviewModal.interview.round}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Mode</span>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedInterviewModal.interview.mode}
                  </p>
                </div>
              </div>

              {selectedInterviewModal.interview.mode === 'ONLINE' ? (
                <div className="pt-3.5 space-y-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Meeting Link</span>
                  {selectedInterviewModal.interview.meetingLink ? (
                    <div>
                      <a
                        href={selectedInterviewModal.interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold underline break-all"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        {selectedInterviewModal.interview.meetingLink}
                      </a>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No link provided</p>
                  )}
                </div>
              ) : (
                <div className="pt-3.5 space-y-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Interview Location</span>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedInterviewModal.interview.location || 'To be communicated'}
                  </p>
                </div>
              )}

              {selectedInterviewModal.interview.instructions && (
                <div className="pt-3.5 space-y-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Instructions / Notes</span>
                  <p className="text-xs text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedInterviewModal.interview.instructions}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                <Link to={`/student/drives/${selectedInterviewModal.app.driveId}`}>
                  View Drive Details
                </Link>
              </Button>
              <Button
                size="sm"
                onClick={() => setSelectedInterviewModal(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
