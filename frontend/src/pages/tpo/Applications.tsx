import React, { useEffect, useState, useRef, useMemo } from 'react';
import applicationService from '@/services/application.service';
import { ApplicationTable } from '@/components/tpo/ApplicationTable';
import { ScheduleInterviewModal } from '@/components/tpo/ScheduleInterviewModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileCheck, Search, Download, ChevronDown } from 'lucide-react';
import type { Application, ApplicationStatus, Interview } from '@/types/application';

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [updatingAppIds, setUpdatingAppIds] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [scheduleApp, setScheduleApp] = useState<{
    application: Application;
    existingInterview?: Interview;
  } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    // 1. Prevent double requests on the same application
    if (updatingAppIds[appId]) return;

    const targetApp = applications.find((a) => a.id === appId);
    if (!targetApp || targetApp.status === newStatus) return;

    // Snapshot state for rollback if network fails
    const previousApplications = applications;
    const studentId = targetApp.student?.id;

    // 2. Lock only this application row
    setUpdatingAppIds((prev) => ({ ...prev, [appId]: true }));

    // 3. OPTIMISTIC UI UPDATE: Immediate UI update
    setApplications((prevApps) =>
      prevApps.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            status: newStatus,
            isCurrentPlacement: newStatus === 'SELECTED' ? true : false,
          };
        }
        // If newly SELECTED, any previous SELECTED application for this student becomes REPLACED
        if (
          newStatus === 'SELECTED' &&
          studentId &&
          app.student?.id === studentId &&
          app.status === 'SELECTED'
        ) {
          return {
            ...app,
            isCurrentPlacement: false,
          };
        }
        return app;
      })
    );

    // 4. Send backend API request in the background
    try {
      const res = await applicationService.updateStatus(appId, newStatus);
      if (res?.data) {
        setApplications((prevApps) =>
          prevApps.map((app) => {
            if (app.id === appId) {
              return {
                ...app,
                ...res.data,
                student: res.data.student || app.student,
                drive: res.data.drive || app.drive,
                interviews: res.data.interviews || app.interviews,
              };
            }
            if (
              newStatus === 'SELECTED' &&
              studentId &&
              app.student?.id === studentId &&
              app.id !== appId
            ) {
              return {
                ...app,
                isCurrentPlacement: false,
              };
            }
            return app;
          })
        );
      }
      toast.success('Application status updated successfully');
    } catch (err: any) {
      // 5. ROLLBACK ON FAILURE
      setApplications(previousApplications);
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        'Failed to update application status. Please try again.';
      toast.error(errorMessage);
    } finally {
      // 6. Release lock on this row
      setUpdatingAppIds((prev) => {
        const next = { ...prev };
        delete next[appId];
        return next;
      });
    }
  };

  const handleSaveInterview = async (applicationId: string, data: any) => {
    try {
      if (scheduleApp?.existingInterview) {
        const res = await applicationService.updateInterview(applicationId, scheduleApp.existingInterview.id, data);
        toast.success('Interview updated successfully');
        if (res?.data) {
          setApplications((prevApps) =>
            prevApps.map((app) => {
              if (app.id === applicationId) {
                const updated = res.data;
                const interviews = app.interviews
                  ? [updated, ...app.interviews.filter((i) => i.id !== updated.id)]
                  : [updated];
                return { ...app, interviews };
              }
              return app;
            })
          );
        }
      } else {
        const res = await applicationService.scheduleInterview(applicationId, data);
        toast.success('Interview scheduled successfully');
        if (res?.data) {
          setApplications((prevApps) =>
            prevApps.map((app) => {
              if (app.id === applicationId) {
                const newIntv = res.data;
                const interviews = [newIntv, ...(app.interviews || [])];
                return { ...app, interviews };
              }
              return app;
            })
          );
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to schedule/update interview.');
      throw err;
    }
  };

  const handleExportCsv = async (mode: 'all' | 'filtered') => {
    setIsExportMenuOpen(false);

    if (mode === 'filtered' && filteredApplications.length === 0) {
      toast.error('No applications available to export.');
      return;
    }

    if (mode === 'all' && applications.length === 0) {
      toast.error('No applications available to export.');
      return;
    }

    setIsExporting(true);
    try {
      const params =
        mode === 'filtered'
          ? {
              status: statusFilter !== 'ALL' ? statusFilter : undefined,
              search: searchTerm.trim() ? searchTerm.trim() : undefined,
              applicationIds: filteredApplications.map((a) => a.id).join(','),
            }
          : undefined;

      const blob = await applicationService.exportApplicationsCsv(params);

      // Trigger browser download
      const today = new Date().toISOString().split('T')[0];
      const filename = `placement-applications-${today}.csv`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(
        mode === 'all'
          ? 'All applications exported successfully.'
          : 'Filtered applications exported successfully.'
      );
    } catch (err: any) {
      let message = 'Failed to export applications.';
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed?.message) message = parsed.message;
        } catch {
          // ignore
        }
      } else if (err?.message) {
        message = err.message;
      }
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // 1. Status Filter
      const currentFilter = statusFilter.toUpperCase();
      const matchesStatus =
        currentFilter === 'ALL' ||
        (app.status || '').toUpperCase() === currentFilter;

      if (!matchesStatus) return false;

      // 2. Search Filter
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;

      const studentName = app.student?.fullName?.toLowerCase() || '';
      const companyName = app.drive?.company?.name?.toLowerCase() || '';
      const roleName = app.drive?.role?.toLowerCase() || '';
      const email = app.student?.user?.email?.toLowerCase() || '';
      const phone = app.student?.phone?.toLowerCase() || '';
      const department = app.student?.department?.toLowerCase() || '';

      return (
        studentName.includes(term) ||
        companyName.includes(term) ||
        roleName.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        department.includes(term)
      );
    });
  }, [applications, statusFilter, searchTerm]);

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

          {/* Export CSV Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <Button
              type="button"
              variant="outline"
              disabled={isExporting}
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              className="h-9 px-3 text-xs font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isExporting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 text-slate-600" />
                  <span>Export CSV</span>
                  <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
                </>
              )}
            </Button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  disabled={applications.length === 0 || isExporting}
                  onClick={() => handleExportCsv('all')}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center justify-between transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-700"
                >
                  <span className="font-medium">Export All Applications</span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
                    {applications.length}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={filteredApplications.length === 0 || isExporting}
                  onClick={() => handleExportCsv('filtered')}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center justify-between transition-colors cursor-pointer border-t border-slate-100/80 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-700"
                >
                  <span className="font-medium">Export Filtered Applications</span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
                    {filteredApplications.length}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredApplications.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No applications found"
          description="No candidate applications match your selected status and filter criteria."
        />
      ) : (
        <ApplicationTable
          applications={filteredApplications}
          onStatusChange={handleStatusChange}
          onScheduleInterview={(app, interview) => setScheduleApp({ application: app, existingInterview: interview })}
          updatingAppIds={updatingAppIds}
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
