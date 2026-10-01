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
import { formatDate, formatCurrencyLPA, isDeadlinePassed } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowLeft,
  FileCheck,
  Send,
  MapPin,
  IndianRupee,
  Check,
  X,
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
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'eligibility' | 'details'>('eligibility');

  const loadEligibility = async (driveId: string) => {
    setIsLoading(true);
    try {
      const res = await driveService.checkEligibility(driveId);
      const data = res?.data || res;
      setEligibilityData(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to check eligibility for this drive.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchStudentProfile());
    dispatch(fetchMyApplications());
    if (id) {
      loadEligibility(id);
    }
  }, [dispatch, id]);

  const existingApplication = applications.find(
    (app) => app.driveId === id || app.drive?.id === id
  );

  const handleApply = async () => {
    if (!id) return;
    setIsApplying(true);
    try {
      await applicationService.applyToDrive(id);
      setApplicationSubmitted(true);
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

  // Criteria evaluations
  const isTenthMet = (profile?.tenthPercentage || 0) >= (drive?.minTenthPercentage || 0);
  const isTwelfthMet =
    profile?.studentType === 'REGULAR'
      ? (profile?.twelfthPercentage || 0) >= (drive?.minTwelfthPercentage || 0)
      : (profile?.d2dCgpa || 0) >= (drive?.minD2dCgpa || 0);
  const isCgpaMet = (profile?.currentCgpa || 0) >= (drive?.minCgpa || 0);
  const isBacklogsMet = (profile?.activeBacklogs || 0) <= (drive?.maxActiveBacklogs ?? 0);
  const isVerificationMet = profile?.verificationStatus === 'VERIFIED';

  // -------------------------------------------------------------
  // VIEW B: STEP 11 — APPLICATION SUBMITTED CONFIRMATION
  // -------------------------------------------------------------
  if (applicationSubmitted) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <Card className="border-slate-200 shadow-lg text-center overflow-hidden">
          <div className="p-8 bg-gradient-to-b from-blue-50/50 to-white">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-200 shadow-xs">
              <Check className="h-8 w-8 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Application Submitted</h2>
            <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto">
              You have successfully applied to the{' '}
              <strong className="text-slate-900">
                {company?.name || 'Company'} — {drive?.role || 'Role'}
              </strong>{' '}
              recruitment drive.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5">
                <Link to="/student/applications">View My Applications</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => setApplicationSubmitted(false)}
                className="w-full sm:w-auto text-xs"
              >
                Back to Drive
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW A: STEP 10 — DRIVE DETAILS & ELIGIBILITY CHECK
  // -------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/student/drives')}
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
              <h1 className="text-xl font-bold tracking-tight text-white">
                {company?.name || 'Company'} — {drive?.role || 'Recruitment Drive'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-blue-100/80">
                {drive?.ctc && (
                  <span className="flex items-center gap-1 font-semibold text-emerald-300">
                    <IndianRupee className="h-3.5 w-3.5" />
                    CTC: {formatCurrencyLPA(drive.ctc)}
                  </span>
                )}
                {drive?.jobLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-blue-300" />
                    {drive.jobLocation}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-blue-300" />
                  Last Date: {drive?.deadline ? formatDate(drive.deadline) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-blue-200 block">Status</span>
            <span
              className={`text-lg font-bold ${
                existingApplication
                  ? 'text-blue-400'
                  : isEligible
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {existingApplication
                ? existingApplication.status
                : isEligible
                ? 'Eligible'
                : 'Not Eligible'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 flex gap-6">
          <button
            onClick={() => setActiveTab('eligibility')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'eligibility'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Eligibility Check (From Backend)
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Drive Details & Description
          </button>
        </div>

        <CardContent className="p-6">
          {activeTab === 'eligibility' ? (
            <div className="space-y-6">
              {/* Verdict Banner */}
              {isEligible ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">You are eligible for this drive.</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Your verified profile satisfies all academic qualifications and eligibility criteria.
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

              {/* Exact 4-Column Eligibility Table matching workflow diagram */}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-3.5">Criteria</th>
                      <th className="p-3.5">Required</th>
                      <th className="p-3.5">Your Value</th>
                      <th className="p-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Row 1: 10th Percentage */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-semibold text-slate-800">10th Percentage</td>
                      <td className="p-3.5 font-medium text-slate-600">
                        {drive?.minTenthPercentage ? `≥ ${drive.minTenthPercentage}%` : 'No minimum'}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {profile?.tenthPercentage ? `${profile.tenthPercentage}%` : '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        {isTenthMet ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                            <X className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Row 2: 12th / Diploma */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-semibold text-slate-800">
                        {profile?.studentType === 'D2D' ? 'Diploma CGPA' : '12th Percentage'}
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">
                        {profile?.studentType === 'D2D'
                          ? drive?.minD2dCgpa ? `≥ ${drive.minD2dCgpa}` : 'No minimum'
                          : drive?.minTwelfthPercentage ? `≥ ${drive.minTwelfthPercentage}%` : 'No minimum'}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {profile?.studentType === 'D2D'
                          ? profile?.d2dCgpa ?? '-'
                          : profile?.twelfthPercentage ? `${profile.twelfthPercentage}%` : '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        {isTwelfthMet ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                            <X className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Row 3: College CGPA */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-semibold text-slate-800">Engineering CGPA</td>
                      <td className="p-3.5 font-medium text-slate-600">
                        {drive?.minCgpa ? `≥ ${drive.minCgpa}` : 'No minimum'}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {profile?.currentCgpa ?? '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        {isCgpaMet ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                            <X className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Row 4: Active Backlogs */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-semibold text-slate-800">Active Backlogs</td>
                      <td className="p-3.5 font-medium text-slate-600">
                        {drive?.maxActiveBacklogs !== undefined ? `≤ ${drive.maxActiveBacklogs}` : '0'}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {profile?.activeBacklogs ?? '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        {isBacklogsMet ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                            <X className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Row 5: TPO Profile Verification */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-semibold text-slate-800">TPO Verification</td>
                      <td className="p-3.5 font-medium text-slate-600">VERIFIED</td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {profile?.verificationStatus || 'PENDING'}
                      </td>
                      <td className="p-3.5 text-center">
                        {isVerificationMet ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                            <X className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Button Section */}
              <div className="pt-2">
                {existingApplication ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          You have already applied for this position.
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Current status: <Badge variant="secondary" className="text-[10px]">{existingApplication.status}</Badge>
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="text-xs shrink-0">
                      <Link to="/student/applications">View In My Applications</Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleApply}
                    disabled={!isEligible || isApplying || isDeadlinePassed(drive?.deadline)}
                    isLoading={isApplying}
                    className={`w-full py-3.5 text-xs font-bold rounded-xl transition-all ${
                      isEligible && !isDeadlinePassed(drive?.deadline)
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    }`}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isDeadlinePassed(drive?.deadline)
                      ? 'Applications Closed'
                      : isEligible
                      ? 'Apply Now'
                      : 'Cannot Apply (Criteria Not Met)'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Job Description & Role</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {drive?.description ||
                    `Join ${company?.name || 'the team'} as a ${drive?.role || 'Engineer'}. Apply through the placement portal to schedule technical rounds and interviews.`}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Application Deadline</span>
                  <span className="font-semibold text-slate-800">
                    {drive?.deadline ? formatDate(drive.deadline) : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Drive Date</span>
                  <span className="font-semibold text-slate-800">
                    {drive?.driveDate ? formatDate(drive.driveDate) : 'TBA'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Package (CTC)</span>
                  <span className="font-bold text-emerald-600">
                    {drive?.ctc ? formatCurrencyLPA(drive.ctc) : 'Disclosed during interview'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Job Location</span>
                  <span className="font-semibold text-slate-800">
                    {drive?.jobLocation || 'Campus / Multiple Locations'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriveDetails;
