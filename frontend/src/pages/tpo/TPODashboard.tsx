import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import studentService from '@/services/student.service';
import companyService from '@/services/company.service';
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
import { formatDate } from '@/lib/utils';
import {
  Users,
  UserCheck,
  Building2,
  Briefcase,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import type { Application } from '@/types/application';

export const TPODashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    verifiedStudents: 0,
    totalCompanies: 0,
    totalDrives: 0,
  });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [studentsRes, companiesRes, drivesRes, appsRes] = await Promise.allSettled([
          studentService.getAllStudents(),
          companyService.getAllCompanies(),
          driveService.getAllDrives(),
          applicationService.getTpoApplications(),
        ]);

        let totalStudents = 0;
        let verifiedStudents = 0;
        if (studentsRes.status === 'fulfilled') {
          const raw = studentsRes.value as any;
          const students = Array.isArray(raw) ? raw : raw?.data || [];
          totalStudents = students.length;
          verifiedStudents = students.filter((s: any) => s.verificationStatus === 'VERIFIED').length;
        }

        let totalCompanies = 0;
        if (companiesRes.status === 'fulfilled') {
          const raw = companiesRes.value as any;
          const companies = Array.isArray(raw) ? raw : raw?.data || [];
          totalCompanies = companies.length;
        }

        let totalDrives = 0;
        if (drivesRes.status === 'fulfilled') {
          const raw = drivesRes.value as any;
          const drives = Array.isArray(raw) ? raw : raw?.data || [];
          totalDrives = drives.length;
        }

        if (appsRes.status === 'fulfilled') {
          const raw = appsRes.value as any;
          const apps = Array.isArray(raw) ? raw : raw?.data || [];
          setRecentApplications(apps.slice(0, 6));
        }

        setStats({
          totalStudents,
          verifiedStudents,
          totalCompanies,
          totalDrives,
        });
      } catch (err) {
        console.error('Failed to load TPO dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
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

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading TPO Dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome, TPO Admin
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage students, companies, recruitment drives and track applications.
        </p>
      </div>

      {/* 4 Stat Cards matching reference design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <Link to="/tpo/students" className="block group">
          <Card className="border-slate-200 shadow-sm group-hover:border-blue-400 group-hover:shadow transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalStudents}</h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Verified Students */}
        <Link to="/tpo/students" className="block group">
          <Card className="border-slate-200 shadow-sm group-hover:border-emerald-400 group-hover:shadow transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Students</p>
                <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.verifiedStudents}</h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <UserCheck className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Companies */}
        <Link to="/tpo/companies" className="block group">
          <Card className="border-slate-200 shadow-sm group-hover:border-indigo-400 group-hover:shadow transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Companies</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalCompanies}</h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Building2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Drives */}
        <Link to="/tpo/drives" className="block group">
          <Card className="border-slate-200 shadow-sm group-hover:border-amber-400 group-hover:shadow transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Drives</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalDrives}</h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Briefcase className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Applications Section matching reference design */}
      <Card className="border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Applications</h3>
            <p className="text-xs text-slate-500">Latest student job drive submissions</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs text-blue-600 hover:text-blue-700">
            <Link to="/tpo/applications" className="flex items-center gap-1">
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <CardContent className="p-0">
          {recentApplications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <FileCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              No student applications recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Student</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Company</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Role</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Status</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase text-slate-500">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentApplications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-xs">
                            {app.student?.fullName || 'Student'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {app.student?.department || ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-800 text-xs">
                        {app.drive?.company?.name || 'Company'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-medium">
                        {app.drive?.role || 'Role'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(app.status)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-500">
                        {formatDate(app.appliedAt)}
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
  );
};
