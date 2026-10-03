import React, { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import studentService from '@/services/student.service';
import { StudentTable } from '@/components/tpo/StudentTable';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Input } from '@/components/ui/input';
import { Users, Search } from 'lucide-react';
import type { Student } from '@/types/student';

export const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);
  
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const abortControllerRef = React.useRef<AbortController | null>(null);

  useEffect(() => {
    loadStudents();
  }, [debouncedSearch, statusFilter]);

  const loadStudents = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (students.length === 0) {
      setIsLoading(true);
    } else {
      setIsSearching(true);
    }
    
    try {
      const params: any = {};
      if (debouncedSearch.trim().length >= 3) {
        params.search = debouncedSearch.trim();
      }
      if (statusFilter !== 'ALL') {
        params.verificationStatus = statusFilter;
      }

      const res = await studentService.getAllStudents(params, controller.signal);
      const list = Array.isArray(res) ? res : res?.data || [];
      setStudents(list);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return; // Ignore canceled requests
      }
      console.error('Failed to load students:', err);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  if (isLoading && students.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading students list..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Registered Students
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review academic profiles, verify credentials and monitor candidate backlogs.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Verification</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <div className="relative w-full sm:w-64 flex items-center">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, email..."
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
        </div>
      </div>

      {/* Content */}
      {students.length === 0 && !isLoading ? (
        <EmptyState
          icon={Users}
          title="No Students Found"
          description="No student profiles matched your search and filter criteria."
        />
      ) : (
        <StudentTable students={students} />
      )}
    </div>
  );
};
