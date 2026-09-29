import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchStudentProfile } from '@/features/student/studentSlice';
import { fetchMyApplications } from '@/features/application/applicationSlice';
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
import { formatDate, formatCurrencyLPA } from '@/lib/utils';
import {
  Building2,
  Briefcase,
  FileCheck,
  UserCheck,
  ArrowRight,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, isLoading: isProfileLoading } = useAppSelector((state) => state.student);
  const { applications, isLoading: isAppsLoading } = useAppSelector((state) => state.application);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchStudentProfile());
    dispatch(fetchMyApplications());
  }, [dispatch]);

  const studentName = profile?.fullName || user?.fullName || 'Student';
  const appliedCount = applications.length;

  // Derive drives from applications or display available list
  const recentDrives = applications.slice(0, 5).map((app) => ({
    ...app.drive,
    applicationStatus: app.status,
  }));

  const getProfileBadge = () => {
    if (!profile) return <Badge variant="secondary">Unknown</Badge>;
    if (profile.verificationStatus === 'VERIFIED') {
      return <Badge variant="success">Verified</Badge>;
    }
    if (profile.isProfileLocked) {
      return <Badge variant="warning">Submitted & Locked</Badge>;
    }
    return <Badge variant="secondary">Draft / Pending</Badge>;
  };

  const isLoading = isProfileLoading || isAppsLoading;

  if (isLoading && !profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading student dashboard..." />
      </div>
    );
  }

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

      {/* Notice if profile is not locked/submitted yet */}
      {profile && !profile.isProfileLocked && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-900">Complete & Submit Your Profile</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Your profile is currently unlocked. Submit your profile so TPO can verify your academic records and enable drive applications.
            </p>
          </div>
          <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
            <Link to="/student/profile">Submit Profile</Link>
          </Button>
        </div>
      )}

      {/* Top 4 Stat Cards matching reference design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available Companies */}
        <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Applied Companies</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {new Set(applications.map((a) => a.drive?.companyId).filter(Boolean)).size || appliedCount}
              </h3>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Open Drives */}
        <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Active Drives</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {applications.filter((a) => new Date(a.drive?.deadline || 0) > new Date()).length || applications.length}
              </h3>
            </div>
            <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Briefcase className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Applications Submitted */}
        <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">My Applications</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{appliedCount}</h3>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <FileCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Profile Status */}
        <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Profile Status</p>
              <div className="mt-2">{getProfileBadge()}</div>
            </div>
            <div className="h-11 w-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Recruitment Drives Section */}
      <Card className="border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Latest Recruitment Drives</h3>
            <p className="text-xs text-slate-500">Your recent recruitment drives and application statuses</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs text-blue-600 hover:text-blue-700">
            <Link to="/student/applications" className="flex items-center gap-1">
              View All Applications
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <CardContent className="p-0">
          {recentDrives.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No applications yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You haven't submitted any job drive applications yet. Once you apply, drives and status updates will appear here.
              </p>
              <Button asChild size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                <Link to="/student/drives">Explore Recruitment Drives</Link>
              </Button>
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
                  {recentDrives.map((drive: any, idx: number) => {
                    const company = drive?.company;
                    const isClosed = drive?.deadline && new Date(drive.deadline) < new Date();

                    return (
                      <TableRow key={drive?.id || idx} className="hover:bg-slate-50/50 transition-colors">
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
                          {drive?.role || 'Engineer'}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-slate-700">
                          {formatCurrencyLPA(drive?.ctc || 0)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {drive?.deadline ? formatDate(drive.deadline) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={isClosed ? 'destructive' : 'success'}>
                            {isClosed ? 'Closed' : 'Open'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-blue-600 hover:text-blue-700">
                            <Link to={`/student/drives/${drive?.id}`}>
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
