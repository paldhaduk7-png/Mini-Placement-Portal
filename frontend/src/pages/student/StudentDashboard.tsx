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
import { formatDate, formatCurrencyLPA, isDeadlinePassed } from '@/lib/utils';
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
} from 'lucide-react';
import type { RecruitmentDrive } from '@/types/drive';
import type { PlacementStatus } from '@/types/application';

export const StudentDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, isLoading: isProfileLoading } = useAppSelector((state) => state.student);
  const { applications, isLoading: isAppsLoading } = useAppSelector((state) => state.application);
  const { user } = useAppSelector((state) => state.auth);

  const [availableDrives, setAvailableDrives] = useState<RecruitmentDrive[]>([]);
  const [placementStatus, setPlacementStatus] = useState<PlacementStatus | null>(null);

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
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">My Applications</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {appliedCount}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <FileCheck className="h-6 w-6" />
            </div>
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
                          {drive.role}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-slate-700">
                          {formatCurrencyLPA(drive.ctc || 0)}
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
    </div>
  );
};

export default StudentDashboard;
