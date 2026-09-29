import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchMyApplications } from '@/features/application/applicationSlice';
import driveService from '@/services/drive.service';
import { DriveCard } from '@/components/student/DriveCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Input } from '@/components/ui/input';
import { Briefcase, Search } from 'lucide-react';
import type { RecruitmentDrive } from '@/types/drive';

export const Drives: React.FC = () => {
  const dispatch = useAppDispatch();
  const { applications, isLoading: isAppsLoading } = useAppSelector((state) => state.application);
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [isLoadingDrives, setIsLoadingDrives] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchMyApplications());

    // Attempt to fetch drives
    const loadDrives = async () => {
      setIsLoadingDrives(true);
      try {
        const res = await driveService.getAllDrives();
        if (Array.isArray(res)) {
          setDrives(res);
        } else if (res?.data && Array.isArray(res.data)) {
          setDrives(res.data);
        }
      } catch (err: any) {
        // If student role does not have direct access to /api/tpo/drives, derive from applications
        console.warn('Recruitment drives endpoint returned:', err.message);
      } finally {
        setIsLoadingDrives(false);
      }
    };

    loadDrives();
  }, [dispatch]);

  // Combine fetched drives with drives from applications
  const allDrivesMap = new Map<string, RecruitmentDrive>();
  drives.forEach((d) => allDrivesMap.set(d.id, d));
  applications.forEach((app) => {
    if (app.drive && !allDrivesMap.has(app.drive.id)) {
      allDrivesMap.set(app.drive.id, app.drive);
    }
  });

  const displayDrives = Array.from(allDrivesMap.values()).filter((d) => {
    const term = searchTerm.toLowerCase();
    const companyMatch = d.company?.name?.toLowerCase().includes(term);
    const roleMatch = d.role?.toLowerCase().includes(term);
    const locationMatch = d.jobLocation?.toLowerCase().includes(term);
    return !searchTerm || companyMatch || roleMatch || locationMatch;
  });

  const isLoading = isLoadingDrives && isAppsLoading && displayDrives.length === 0;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading recruitment drives..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Recruitment Drives
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and apply for campus placement drives matching your profile criteria.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by company, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Drives Grid */}
      {displayDrives.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Recruitment Drives Available"
          description="There are currently no active recruitment drives listed for campus placement. Check back soon or contact your TPO."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayDrives.map((drive) => (
            <DriveCard key={drive.id} drive={drive} />
          ))}
        </div>
      )}
    </div>
  );
};
