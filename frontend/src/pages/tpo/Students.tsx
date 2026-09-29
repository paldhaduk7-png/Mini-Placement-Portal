import React, { useEffect, useState } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const res = await studentService.getAllStudents();
      const list = Array.isArray(res) ? res : res?.data || [];
      setStudents(list);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      s.fullName?.toLowerCase().includes(term) ||
      s.department?.toLowerCase().includes(term) ||
      s.user?.email?.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'ALL' || s.verificationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Found"
          description="No student profiles matched your search and filter criteria."
        />
      ) : (
        <StudentTable students={filteredStudents} />
      )}
    </div>
  );
};
