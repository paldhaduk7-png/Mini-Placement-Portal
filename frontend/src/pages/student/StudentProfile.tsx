import React, { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchStudentProfile, submitStudentProfile } from '@/features/student/studentSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  User,
  GraduationCap,
  Building,
  FileCheck,
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isSubmitting } = useAppSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  const handleSubmitProfile = async () => {
    try {
      const resultAction = await dispatch(submitStudentProfile());
      if (submitStudentProfile.fulfilled.match(resultAction)) {
        toast.success('Profile submitted and locked successfully!');
      } else {
        toast.error((resultAction.payload as string) || 'Failed to submit profile');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading student profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-800">Profile Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          We could not load your student profile. Please verify your credentials or login again.
        </p>
      </div>
    );
  }

  const isLocked = profile.isProfileLocked;
  const isVerified = profile.verificationStatus === 'VERIFIED';
  const isRejected = profile.verificationStatus === 'REJECTED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isLocked ? 'My Profile' : 'Student Profile'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isLocked
              ? 'Your profile information is locked and under verification.'
              : 'Review your details and submit for TPO verification.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isVerified ? (
            <Badge variant="success" className="px-3 py-1 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Verified by TPO
            </Badge>
          ) : isRejected ? (
            <Badge variant="destructive" className="px-3 py-1 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Rejected: {profile.rejectionReason || 'Contact TPO'}
            </Badge>
          ) : isLocked ? (
            <Badge variant="warning" className="px-3 py-1 text-xs">
              <Lock className="h-3.5 w-3.5 mr-1" />
              Pending Verification
            </Badge>
          ) : (
            <Badge variant="secondary" className="px-3 py-1 text-xs">
              Draft / Unsubmitted
            </Badge>
          )}
        </div>
      </div>

      {/* Lock Notice Banner matching reference design */}
      {isLocked ? (
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-emerald-900">Profile Submitted & Locked</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              You cannot edit your profile now. It is currently under verification by the Training & Placement Officer (TPO).
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <FileCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-900">Ready to submit your profile?</h4>
              <p className="text-xs text-blue-700 mt-0.5">
                Once submitted, your profile will be locked for verification by the TPO and cannot be edited.
              </p>
            </div>
          </div>
          <Button
            onClick={handleSubmitProfile}
            isLoading={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 text-xs font-semibold px-4"
          >
            Submit & Lock Profile
          </Button>
        </div>
      )}

      {/* Profile Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Details */}
        <Card className="border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Personal Details</h3>
          </div>
          <CardContent className="p-5">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <dt className="text-slate-500 text-xs font-medium">Name</dt>
                <dd className="font-semibold text-slate-900 text-xs">{profile.fullName}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <dt className="text-slate-500 text-xs font-medium">Email</dt>
                <dd className="font-semibold text-slate-900 text-xs">{profile.user?.email || '-'}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <dt className="text-slate-500 text-xs font-medium">Phone</dt>
                <dd className="font-semibold text-slate-900 text-xs">{profile.phone}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <dt className="text-slate-500 text-xs font-medium">DOB</dt>
                <dd className="font-semibold text-slate-900 text-xs">{formatDate(profile.dob)}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <dt className="text-slate-500 text-xs font-medium">Student Type</dt>
                <dd className="font-semibold text-blue-700 text-xs">{profile.studentType}</dd>
              </div>
              <div className="flex justify-between items-center py-1">
                <dt className="text-slate-500 text-xs font-medium">Department</dt>
                <dd className="font-semibold text-slate-900 text-xs">{profile.department}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Academic Details */}
        <Card className="border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Academic Details</h3>
          </div>
          <CardContent className="p-5">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <dt className="text-slate-500 text-xs font-medium">10th Percentage</dt>
                <dd className="font-bold text-slate-900 text-xs">{profile.tenthPercentage}%</dd>
              </div>
              {profile.studentType === 'REGULAR' ? (
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <dt className="text-slate-500 text-xs font-medium">12th Percentage</dt>
                  <dd className="font-bold text-slate-900 text-xs">
                    {profile.twelfthPercentage ? `${profile.twelfthPercentage}%` : 'N/A'}
                  </dd>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <dt className="text-slate-500 text-xs font-medium">Diploma CGPA</dt>
                    <dd className="font-bold text-slate-900 text-xs">{profile.d2dCgpa ?? 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <dt className="text-slate-500 text-xs font-medium">Diploma College</dt>
                    <dd className="font-medium text-slate-800 text-xs truncate max-w-[180px]">
                      {profile.diplomaCollege ?? 'N/A'}
                    </dd>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <dt className="text-slate-500 text-xs font-medium">College CGPA</dt>
                <dd className="font-bold text-blue-600 text-xs">{profile.currentCgpa}</dd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <dt className="text-slate-500 text-xs font-medium">Active Backlogs</dt>
                <dd className="font-semibold text-slate-900 text-xs">{profile.activeBacklogs}</dd>
              </div>
              <div className="flex justify-between items-center py-1">
                <dt className="text-slate-500 text-xs font-medium">Total Backlogs</dt>
                <dd className="font-semibold text-slate-900 text-xs">{profile.totalBacklogs}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

      </div>

      {/* Std 10th Detailed Marks Breakdown */}
      <Card className="border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">10th Standard Subject Marks</h3>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            Total: {profile.tenthTotalMarks} / {profile.tenthMaxMarks}
          </span>
        </div>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="block text-[11px] text-slate-500 font-medium">Mathematics</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block">{profile.tenthMathsMarks}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="block text-[11px] text-slate-500 font-medium">Science</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block">{profile.tenthScienceMarks}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="block text-[11px] text-slate-500 font-medium">English</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block">{profile.tenthEnglishMarks}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="block text-[11px] text-slate-500 font-medium">Social Science</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block">{profile.tenthSocialScienceMarks}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="block text-[11px] text-slate-500 font-medium">Language</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block">{profile.tenthLanguageMarks ?? '-'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
