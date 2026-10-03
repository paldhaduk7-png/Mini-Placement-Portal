import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
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
  const [isSearching, setIsSearching] = useState(false);
  
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);
  
  const abortControllerRef = React.useRef<AbortController | null>(null);

  useEffect(() => {
    if (debouncedSearch.trim().length === 0 || debouncedSearch.trim().length >= 3) {
      loadDrives();
    }
  }, [debouncedSearch]);

  const loadDrives = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (drives.length === 0) {
      setIsLoading(true);
    } else {
      setIsSearching(true);
    }
    
    try {
      const params: any = {};
      if (debouncedSearch.trim().length >= 3) {
        params.search = debouncedSearch.trim();
      }

      const res = await driveService.getAllDrives(params, controller.signal);
      const list = Array.isArray(res) ? res : res?.data || [];
      setDrives(list);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return; // Ignore canceled requests
      }
      console.error('Failed to load drives:', err);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

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
          <div className="relative w-48 sm:w-64 flex items-center">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search drives..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-14 text-xs h-9"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {isSearching && <div className="h-3 w-3 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin" />}
              {searchInput && !isSearching && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              )}
            </div>
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
      {drives.length === 0 && !isLoading ? (
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
        <DriveTable drives={drives} />
      )}
    </div>
  );
};
