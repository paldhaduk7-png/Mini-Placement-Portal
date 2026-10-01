import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import companyService from '@/services/company.service';
import driveService from '@/services/drive.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { DriveTable } from '@/components/tpo/DriveTable';
import { toast } from 'sonner';
import { Building2, ArrowLeft, History, Briefcase } from 'lucide-react';
import type { Company } from '@/types/company';
import type { RecruitmentDrive } from '@/types/drive';

export const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [activeDrives, setActiveDrives] = useState<RecruitmentDrive[]>([]);
  const [historyDrives, setHistoryDrives] = useState<RecruitmentDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'drives' | 'history'>('drives');

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (companyId: string) => {
    setIsLoading(true);
    try {
      const compRes = await companyService.getCompanyById(companyId);
      const compData = (compRes as any)?.data || (compRes as any)?.company || compRes;
      setCompany(compData);

      const drivesRes = await driveService.getAllDrives({ companyId });
      const allDrives = Array.isArray(drivesRes) ? drivesRes : (drivesRes as any)?.data || [];
      
      const active = allDrives.filter((d: RecruitmentDrive) => d.status !== 'COMPLETED' && d.status !== 'CANCELLED');
      const history = allDrives.filter((d: RecruitmentDrive) => d.status === 'COMPLETED');
      
      setActiveDrives(active);
      setHistoryDrives(history);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load company details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading company profile..." />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <Building2 className="h-10 w-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-800">Company Not Found</h3>
        <Button variant="outline" size="sm" onClick={() => navigate('/tpo/companies')} className="mt-4">
          Return to Companies
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/tpo/companies')}
        className="text-slate-600 hover:text-slate-900 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to Companies
      </Button>

      {/* Header Banner */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {company.imageUrl ? (
              <img
                src={company.imageUrl}
                alt={company.name}
                className="h-14 w-28 rounded-lg object-contain bg-white p-2 border border-white/20"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Building2 className="h-7 w-7" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                {company.name}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Company Information
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 flex gap-6">
          <button
            onClick={() => setActiveTab('drives')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'drives'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Recruitment Drives ({activeDrives.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="h-4 w-4" />
            History ({historyDrives.length})
          </button>
        </div>

        <CardContent className="p-6 bg-slate-50 min-h-[400px]">
          {activeTab === 'drives' ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {activeDrives.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No Active Drives"
                  description="This company currently has no upcoming or active recruitment drives."
                  action={
                    <Button asChild size="sm" className="bg-blue-600 text-white text-xs">
                      <Link to="/tpo/drives/create">Create Drive</Link>
                    </Button>
                  }
                />
              ) : (
                <DriveTable drives={activeDrives} />
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              {historyDrives.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No Completed Drives"
                  description="This company does not have any completed recruitment drives in its history yet."
                />
              ) : (
                <DriveTable drives={historyDrives} />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
