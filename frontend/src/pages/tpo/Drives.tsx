import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import driveService from '@/services/drive.service';
import { DriveTable } from '@/components/tpo/DriveTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Briefcase, Plus, Search } from 'lucide-react';
import type { RecruitmentDrive } from '@/types/drive';

export const Drives: React.FC = () => {
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDrives();
  }, []);

  const loadDrives = async () => {
    setIsLoading(true);
    try {
      const res = await driveService.getAllDrives();
      const list = Array.isArray(res) ? res : res?.data || [];
      setDrives(list);
    } catch (err) {
      console.error('Failed to load drives:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDrives = drives.filter((d) => {
    const term = searchTerm.toLowerCase();
    const company = d.company?.name?.toLowerCase() || '';
    const role = d.role?.toLowerCase() || '';
    const location = d.jobLocation?.toLowerCase() || '';
    return company.includes(term) || role.includes(term) || location.includes(term);
  });

  if (isLoading && drives.length === 0) {
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
            Publish hiring events, set eligibility criteria and review qualified students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search drives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 gap-1.5">
            <Link to="/tpo/drives/create">
              <Plus className="h-4 w-4" />
              Add Recruitment Drive
            </Link>
          </Button>
        </div>
      </div>

      {/* Drives Table */}
      {filteredDrives.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Recruitment Drives Found"
          description="Create your first recruitment drive to invite qualified students to apply."
          action={
            <Button asChild size="sm" className="bg-blue-600 text-white text-xs">
              <Link to="/tpo/drives/create">
                <Plus className="h-4 w-4 mr-1" /> Create Drive
              </Link>
            </Button>
          }
        />
      ) : (
        <DriveTable drives={filteredDrives} />
      )}
    </div>
  );
};
