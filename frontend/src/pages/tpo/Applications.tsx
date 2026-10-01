import React, { useEffect, useState } from 'react';
import applicationService from '@/services/application.service';
import { ApplicationTable } from '@/components/tpo/ApplicationTable';
import { ScheduleInterviewModal } from '@/components/tpo/ScheduleInterviewModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FileCheck, Search } from 'lucide-react';
import type { Application, ApplicationStatus, Interview } from '@/types/application';

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [scheduleApp, setScheduleApp] = useState<{
    application: Application;
    existingInterview?: Interview;
  } | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const res = await applicationService.getTpoApplications();
      const list = Array.isArray(res) ? res : res?.data || [];
      setApplications(list);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load applications.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    setIsUpdating(true);
    try {
      await applicationService.updateStatus(appId, newStatus);
      toast.success(`Application updated to ${newStatus}`);
      await loadApplications();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update application status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveInterview = async (applicationId: string, data: any) => {
    try {
      if (scheduleApp?.existingInterview) {
        await applicationService.updateInterview(applicationId, scheduleApp.existingInterview.id, data);
        toast.success('Interview updated successfully');
      } else {
        await applicationService.scheduleInterview(applicationId, data);
        toast.success('Interview scheduled successfully');
      }
      await loadApplications();
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule/update interview.');
      throw err;
    }
  };

  const filteredApplications = applications.filter((app) => {
    const term = searchTerm.toLowerCase();
    const studentMatch = app.student?.fullName?.toLowerCase().includes(term);
    const companyMatch = app.drive?.company?.name?.toLowerCase().includes(term);
    const roleMatch = app.drive?.role?.toLowerCase().includes(term);
    const matchesSearch = !term || studentMatch || companyMatch || roleMatch;

    const matchesStatus =
      statusFilter === 'ALL' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading && applications.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading applications..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review drive candidates, update candidate stages (Applied, Shortlisted, Selected, Rejected).
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
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search student, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredApplications.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No Applications Found"
          description="No candidate applications match your selected status and filter criteria."
        />
      ) : (
        <ApplicationTable
          applications={filteredApplications}
          onStatusChange={handleStatusChange}
          onScheduleInterview={(app, interview) => setScheduleApp({ application: app, existingInterview: interview })}
          isUpdating={isUpdating}
        />
      )}

      {scheduleApp && (
        <ScheduleInterviewModal
          application={scheduleApp.application}
          existingInterview={scheduleApp.existingInterview}
          onClose={() => setScheduleApp(null)}
          onSave={handleSaveInterview}
        />
      )}
    </div>
  );
};
