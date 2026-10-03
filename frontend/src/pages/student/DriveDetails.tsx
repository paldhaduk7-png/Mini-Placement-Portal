import React, { useEffect, useState, useRef } from 'react';
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
import { formatDate, formatCurrencyLPA, isDeadlinePassed, formatInterviewTime } from '@/lib/utils';
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
  FileText,
  Upload,
  Loader2,
} from 'lucide-react';
import type { EligibilityResult } from '@/types/drive';

// ── Apply Modal ──────────────────────────────────────────────────────────────
interface ApplyModalProps {
  companyName: string;
  driveRoleTitle: string;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ companyName, driveRoleTitle, onClose, onSubmit }) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) { setResumeFile(null); return; }

    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Only PDF files are allowed.');
      setResumeFile(null);
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError('Resume must be less than 5 MB.');
      setResumeFile(null);
      e.target.value = '';
      return;
    }
    setResumeFile(file);
  };

  const handleSubmit = async () => {
    if (!resumeFile) return;
    setIsSubmitting(true);
    try {
      await onSubmit(resumeFile);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-5 text-white">
          <h2 className="text-base font-bold">Apply for {driveRoleTitle}</h2>
          <p className="text-xs text-blue-200 mt-0.5">{companyName}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Company / Drive info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <span className="text-slate-400 font-medium block mb-0.5">Company</span>
              <span className="font-semibold text-slate-800">{companyName}</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <span className="text-slate-400 font-medium block mb-0.5">Position</span>
              <span className="font-semibold text-slate-800">{driveRoleTitle}</span>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Resume <span className="text-rose-500">*</span>
            </label>

            <div
              onClick={() => !isSubmitting && fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 cursor-pointer transition-colors
                ${fileError ? 'border-rose-300 bg-rose-50' :
                  resumeFile ? 'border-emerald-300 bg-emerald-50' :
                  'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50'}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />

              {resumeFile ? (
                <div className="flex items-center gap-2 text-emerald-700">
                  <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span className="text-sm font-semibold truncate max-w-[240px]">{resumeFile.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setResumeFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="ml-auto p-0.5 rounded-full text-emerald-600 hover:bg-emerald-100"
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <Upload className="h-6 w-6" />
                  <span className="text-xs font-semibold">Click to choose PDF</span>
                  <span className="text-[11px]">PDF only · Max 5 MB</span>
                </div>
              )}
            </div>

            {fileError && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <X className="h-3.5 w-3.5" /> {fileError}
              </p>
            )}

            {!fileError && (
              <p className="text-[11px] text-slate-400">
                Accepted format: PDF · Maximum size: 5 MB
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 text-xs"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!resumeFile || isSubmitting}
            className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Submit Application
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Main DriveDetails Page ────────────────────────────────────────────────────
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
  const [activeTab, setActiveTab] = useState<'eligibility' | 'details' | 'roles'>('roles');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

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

  const handleSubmitWithResume = async (resumeFile: File) => {
    if (!id || !selectedRoleId) return;
    setIsApplying(true);
    try {
      await applicationService.applyToDrive(id, selectedRoleId, resumeFile);
      setShowApplyModal(false);
      setApplicationSubmitted(true);
      toast.success('Application submitted successfully!');
      await dispatch(fetchMyApplications());
      await loadEligibility(id);
    } catch (err: any) {
      toast.error(err.message || 'Application failed. Please try again.');
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
                {company?.name || 'Company'} — Recruitment Drive
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
    <>
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
                {company?.name || 'Company'} — Recruitment Drive
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-blue-100/80">
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
        {existingApplication?.interviews && existingApplication.interviews.length > 0 && (
          <div className="bg-blue-50/80 border-t border-b border-blue-100 p-6">
            <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Interview Scheduled
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3.5 border border-blue-100/50 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Date & Time</span>
                <span className="text-sm font-semibold text-slate-800">
                  {new Date(existingApplication.interviews[0].interviewDate).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })} • {formatInterviewTime(existingApplication.interviews[0].interviewTime)}
                </span>
              </div>
              <div className="bg-white rounded-lg p-3.5 border border-blue-100/50 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Round & Mode</span>
                <span className="text-sm font-semibold text-slate-800">
                  {existingApplication.interviews[0].round} ({existingApplication.interviews[0].mode})
                </span>
              </div>
              
              {existingApplication.interviews[0].mode === 'ONLINE' && existingApplication.interviews[0].meetingLink ? (
                <div className="bg-white rounded-lg p-3.5 border border-blue-100/50 shadow-sm sm:col-span-2 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Meeting Link</span>
                    <a href={existingApplication.interviews[0].meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline break-all">
                      {existingApplication.interviews[0].meetingLink}
                    </a>
                  </div>
                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                    <a href={existingApplication.interviews[0].meetingLink} target="_blank" rel="noopener noreferrer">Join Interview</a>
                  </Button>
                </div>
              ) : existingApplication.interviews[0].location ? (
                <div className="bg-white rounded-lg p-3.5 border border-blue-100/50 shadow-sm sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Location</span>
                  <span className="text-sm font-semibold text-slate-800 flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                    {existingApplication.interviews[0].location}
                  </span>
                </div>
              ) : null}

              {existingApplication.interviews[0].instructions && (
                <div className="bg-white rounded-lg p-3.5 border border-blue-100/50 shadow-sm sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Instructions</span>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {existingApplication.interviews[0].instructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-b border-slate-200 bg-slate-50 px-6 flex gap-6">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'roles'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Job Roles & Apply
          </button>
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
            </div>
          ) : activeTab === 'roles' ? (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Available Roles</h4>
              {drive?.roles && drive.roles.length > 0 ? drive.roles.map((r) => (
                <div key={r.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-slate-900">{r.title}</h5>
                    <div className="text-xs text-slate-600 mt-1 flex items-center gap-3">
                      <span className="font-semibold text-emerald-600">
                        {r.minCTC === r.maxCTC ? formatCurrencyLPA(r.minCTC) : `${formatCurrencyLPA(r.minCTC)} - ${formatCurrencyLPA(r.maxCTC)}`}
                      </span>
                      {r.openings && <span>• {r.openings} Openings</span>}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    {existingApplication ? (
                      existingApplication.driveRoleId === r.id ? (
                        <div className="flex items-center gap-3">
                           <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                             Applied ({existingApplication.status})
                           </Badge>
                           <Button variant="outline" size="sm" asChild className="text-xs shrink-0 bg-white">
                             <Link to="/student/applications">View Application</Link>
                           </Button>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">Cannot apply to multiple roles</span>
                      )
                    ) : (
                      <Button
                        onClick={() => { setSelectedRoleId(r.id); setShowApplyModal(true); }}
                        disabled={!isEligible || isApplying || drive?.status === 'CANCELLED' || isDeadlinePassed(drive?.deadline)}
                        className={`text-xs px-4 ${
                          isEligible && drive?.status !== 'CANCELLED' && !isDeadlinePassed(drive?.deadline)
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                        }`}
                        size="sm"
                      >
                        {drive?.status === 'CANCELLED' || isDeadlinePassed(drive?.deadline)
                          ? 'Closed'
                          : isEligible
                          ? 'Apply'
                          : 'Not Eligible'}
                      </Button>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-500">No roles available for this drive.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Job Description & Role</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {drive?.description ||
                    `Join ${company?.name || 'the team'} as a ${drive?.roles || 'Engineer'}. Apply through the placement portal to schedule technical rounds and interviews.`}
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
      {/* Apply Modal — renders as overlay when showApplyModal is true */}
      {showApplyModal && drive && company && (
        <ApplyModal
          companyName={company.name}
          driveRoleTitle={drive.roles?.find(r => r.id === selectedRoleId)?.title || ''}
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleSubmitWithResume}
        />
      )}
    </div>
    </>
  );
};

export default DriveDetails;
