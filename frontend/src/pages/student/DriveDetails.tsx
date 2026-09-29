import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchStudentProfile } from '@/features/student/studentSlice';
import { fetchMyApplications } from '@/features/application/applicationSlice';
import driveService from '@/services/drive.service';
import applicationService from '@/services/application.service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowLeft,
  FileCheck,
  Send,
} from 'lucide-react';
import type { EligibilityResult } from '@/types/drive';

export const DriveDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { profile } = useAppSelector((state) => state.student);
  const { applications } = useAppSelector((state) => state.application);

  const [eligibilityData, setEligibilityData] = useState<EligibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'eligibility'>('eligibility');

  useEffect(() => {
    dispatch(fetchStudentProfile());
    dispatch(fetchMyApplications());

    if (id) {
      loadEligibility(id);
    }
  }, [id, dispatch]);

  const loadEligibility = async (driveId: string) => {
    setIsLoading(true);
    try {
      const res = await driveService.checkEligibility(driveId);
      // Backend returns { success: true, data: { drive, eligible, reasons } }
      const data = res?.data || res;
      setEligibilityData(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to check eligibility for this drive.');
    } finally {
      setIsLoading(false);
    }
  };

  const existingApplication = applications.find((app) => app.driveId === id || app.drive?.id === id);

  const handleApply = async () => {
    if (!id) return;
    setIsApplying(true);
    try {
      await applicationService.applyToDrive(id);
      toast.success('Successfully applied for the recruitment drive!');
      await dispatch(fetchMyApplications());
      await loadEligibility(id);
    } catch (err: any) {
      toast.error(err.message || 'Application failed.');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Evaluating drive eligibility..." />
      </div>
    );
  }

  const drive = eligibilityData?.drive;
  const isEligible = eligibilityData?.eligible ?? false;
  const reasons = eligibilityData?.reasons || [];
  const company = drive?.company;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="text-slate-600 hover:text-slate-900 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to Drives
      </Button>

      {/* Main Drive Header Card */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {company?.imageUrl ? (
              <img
                src={company.imageUrl}
                alt={company.name}
                className="h-14 w-14 rounded-xl object-contain bg-white p-1 border border-white/20 shadow"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Building2 className="h-7 w-7" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {company?.name || 'Company'} - {drive?.role || 'Recruitment Drive'}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-blue-100/80">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-blue-300" />
                  Deadline: {drive?.deadline ? formatDate(drive.deadline) : 'N/A'}
                </span>
                {existingApplication && (
                  <Badge variant="success" className="text-[11px] font-semibold">
                    Applied on {formatDate(existingApplication.appliedAt)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-blue-200 block">Status</span>
            <span className="text-lg font-bold text-emerald-400">
              {existingApplication ? existingApplication.status : isEligible ? 'Eligible' : 'Not Eligible'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 flex gap-6">
          <button
            onClick={() => setActiveTab('eligibility')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'eligibility'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Eligibility Check
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Drive Details
          </button>
        </div>

        <CardContent className="p-6">
          {activeTab === 'eligibility' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Eligibility Check</h3>
                <p className="text-xs text-slate-500">
                  Verification evaluated directly by the server backend criteria.
                </p>
              </div>

              {/* Status Banner */}
              {isEligible ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">You are eligible for this drive!</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Your profile satisfies all academic qualifications and placement criteria for this role.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <h4 className="text-sm font-bold text-rose-900">You do not meet the criteria for this drive</h4>
                  </div>
                  {reasons.length > 0 && (
                    <ul className="text-xs text-rose-700 list-disc list-inside space-y-1 pl-1">
                      {reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Student Academic Summary vs Drive Criteria Table */}
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="p-3">Criteria</th>
                      <th className="p-3">Your Academic Record</th>
                      <th className="p-3 text-right">Criteria Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-semibold text-slate-700">TPO Profile Verification</td>
                      <td className="p-3 font-medium text-slate-900">{profile?.verificationStatus}</td>
                      <td className="p-3 text-right">
                        {profile?.verificationStatus === 'VERIFIED' ? (
                          <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Passed
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold inline-flex items-center gap-1">
                            <XCircle className="h-4 w-4" /> Required
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-700">10th Percentage</td>
                      <td className="p-3 font-medium text-slate-900">{profile?.tenthPercentage}%</td>
                      <td className="p-3 text-right">
                        <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Evaluated
                        </span>
                      </td>
                    </tr>
                    {profile?.studentType === 'REGULAR' && (
                      <tr>
                        <td className="p-3 font-semibold text-slate-700">12th Percentage</td>
                        <td className="p-3 font-medium text-slate-900">{profile?.twelfthPercentage}%</td>
                        <td className="p-3 text-right">
                          <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Evaluated
                          </span>
                        </td>
                      </tr>
                    )}
                    {profile?.studentType === 'D2D' && (
                      <tr>
                        <td className="p-3 font-semibold text-slate-700">D2D Diploma CGPA</td>
                        <td className="p-3 font-medium text-slate-900">{profile?.d2dCgpa}</td>
                        <td className="p-3 text-right">
                          <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Evaluated
                          </span>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="p-3 font-semibold text-slate-700">Current Engineering CGPA</td>
                      <td className="p-3 font-medium text-slate-900">{profile?.currentCgpa}</td>
                      <td className="p-3 text-right">
                        <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Evaluated
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-700">Active Backlogs</td>
                      <td className="p-3 font-medium text-slate-900">{profile?.activeBacklogs}</td>
                      <td className="p-3 text-right">
                        <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Evaluated
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {existingApplication ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-800">
                        You have already applied for this position.
                      </span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/student/applications">View In My Applications</Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleApply}
                    disabled={!isEligible || isApplying}
                    isLoading={isApplying}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-sm rounded-lg"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isEligible ? 'Apply Now' : 'Not Eligible to Apply'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Role & Responsibilities</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Join {company?.name || 'the team'} as a {drive?.role || 'Engineer'}. Apply through the placement portal to schedule technical rounds and interviews.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Application Deadline</span>
                  <span className="font-semibold text-slate-800">{drive?.deadline ? formatDate(drive.deadline) : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Company Website</span>
                  <span className="font-semibold text-blue-600">{(company as any)?.website || 'Official Campus Drive'}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
