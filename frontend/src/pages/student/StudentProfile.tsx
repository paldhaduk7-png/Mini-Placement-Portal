import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
  fetchStudentProfile,
  updateStudentProfile,
  submitStudentProfile,
} from '@/features/student/studentSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  User,
  GraduationCap,
  Check,
  Edit3,
  ArrowRight,
  ArrowLeft,
  Send,
  XCircle,
  Camera,
} from 'lucide-react';
import { DEPARTMENTS } from '@/constants';
import type { StudentType } from '@/types/student';

export const StudentProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isSubmitting } = useAppSelector((state) => state.student);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isEditingRejected, setIsEditingRejected] = useState(false);
  const [isOtherCollege, setIsOtherCollege] = useState(false);

  // Form State for Steps 1 & 2
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    studentType: 'REGULAR' as StudentType,
    department: 'Computer Science and Engineering',
    tenthPercentage: '',
    tenthMathsMarks: '',
    tenthScienceMarks: '',
    tenthEnglishMarks: '',
    tenthSocialScienceMarks: '',
    tenthGujaratiMarks: '',
    tenthLanguageMarks: '',
    tenthTotalMarks: '',
    tenthMaxMarks: '600',
    twelfthPercentage: '',
    currentCgpa: '',
    activeBacklogs: '0',
    totalBacklogs: '0',
    d2dCgpa: '',
    diplomaBranch: '',
    diplomaCollege: '',
    profilePhoto: '',
  });

  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  // Populate form data once profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        email: profile.user?.email || '',
        phone: profile.phone || '',
        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
        studentType: profile.studentType || 'REGULAR',
        department: profile.department || 'Computer Science and Engineering',
        tenthPercentage: profile.tenthPercentage ? String(profile.tenthPercentage) : '',
        tenthMathsMarks: profile.tenthMathsMarks ? String(profile.tenthMathsMarks) : '',
        tenthScienceMarks: profile.tenthScienceMarks ? String(profile.tenthScienceMarks) : '',
        tenthEnglishMarks: profile.tenthEnglishMarks ? String(profile.tenthEnglishMarks) : '',
        tenthSocialScienceMarks: profile.tenthSocialScienceMarks ? String(profile.tenthSocialScienceMarks) : '',
        tenthGujaratiMarks: '', // DB limitation: No dedicated field for Gujarati yet
        tenthLanguageMarks: profile.tenthLanguageMarks ? String(profile.tenthLanguageMarks) : '',
        tenthTotalMarks: profile.tenthTotalMarks ? String(profile.tenthTotalMarks) : '',
        tenthMaxMarks: '600',
        twelfthPercentage: profile.twelfthPercentage ? String(profile.twelfthPercentage) : '',
        currentCgpa: profile.currentCgpa ? String(profile.currentCgpa) : '',
        activeBacklogs: profile.activeBacklogs !== undefined ? String(profile.activeBacklogs) : '0',
        totalBacklogs: profile.totalBacklogs !== undefined ? String(profile.totalBacklogs) : '0',
        d2dCgpa: profile.d2dCgpa ? String(profile.d2dCgpa) : '',
        diplomaBranch: profile.diplomaBranch || '',
        diplomaCollege: profile.diplomaCollege || '',
        profilePhoto: profile.profilePhoto || '',
      });
      if (profile.diplomaCollege && ![
        "Government Polytechnic, Ahmedabad",
        "L.J. Polytechnic, Ahmedabad",
        "Government Polytechnic for Girls, Ahmedabad",
        "R.C. Technical Institute, Ahmedabad",
        "Silver Oak Polytechnic, Ahmedabad",
        "Government Polytechnic, Gandhinagar",
        "Government Polytechnic, Vadodara",
        "Government Polytechnic, Rajkot",
        "Government Polytechnic, Surat",
        "Parul Polytechnic Institute, Vadodara"
      ].includes(profile.diplomaCollege)) {
        setIsOtherCollege(true);
      } else {
        setIsOtherCollege(false);
      }
    }
  }, [profile]);

  // Auto-calculate 10th Total and Percentage
  useEffect(() => {
    const maths = formData.tenthMathsMarks !== '' ? Number(formData.tenthMathsMarks) : null;
    const science = formData.tenthScienceMarks !== '' ? Number(formData.tenthScienceMarks) : null;
    const english = formData.tenthEnglishMarks !== '' ? Number(formData.tenthEnglishMarks) : null;
    const social = formData.tenthSocialScienceMarks !== '' ? Number(formData.tenthSocialScienceMarks) : null;
    const gujarati = formData.tenthGujaratiMarks !== '' ? Number(formData.tenthGujaratiMarks) : null;
    const language = formData.tenthLanguageMarks !== '' ? Number(formData.tenthLanguageMarks) : null;
    
    const hasAnyMarks = maths !== null || science !== null || english !== null || social !== null || gujarati !== null || language !== null;
    
    if (hasAnyMarks) {
      const total = (maths || 0) + (science || 0) + (english || 0) + (social || 0) + (gujarati || 0) + (language || 0);
      const percentage = ((total / 600) * 100).toFixed(2);
      
      setFormData(prev => {
        if (prev.tenthTotalMarks === String(total) && prev.tenthPercentage === percentage && prev.tenthMaxMarks === '600') {
          return prev;
        }
        return {
          ...prev,
          tenthTotalMarks: String(total),
          tenthMaxMarks: '600',
          tenthPercentage: percentage
        };
      });
    } else {
      setFormData(prev => {
        if (prev.tenthTotalMarks === '' && prev.tenthPercentage === '' && prev.tenthMaxMarks === '600') return prev;
        return {
          ...prev,
          tenthTotalMarks: '',
          tenthMaxMarks: '600',
          tenthPercentage: ''
        };
      });
    }
  }, [
    formData.tenthMathsMarks,
    formData.tenthScienceMarks,
    formData.tenthEnglishMarks,
    formData.tenthSocialScienceMarks,
    formData.tenthGujaratiMarks,
    formData.tenthLanguageMarks
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!formData.dob) {
      toast.error('Please enter your date of birth');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const maths = Number(formData.tenthMathsMarks);
    const science = Number(formData.tenthScienceMarks);
    const english = Number(formData.tenthEnglishMarks);
    const social = Number(formData.tenthSocialScienceMarks);
    const gujarati = Number(formData.tenthGujaratiMarks);
    const language = Number(formData.tenthLanguageMarks);
    const total = Number(formData.tenthTotalMarks);
    const max = Number(formData.tenthMaxMarks);

    if (
      formData.tenthMathsMarks === '' || isNaN(maths) || maths < 0 || maths > 100 ||
      formData.tenthScienceMarks === '' || isNaN(science) || science < 0 || science > 100 ||
      formData.tenthEnglishMarks === '' || isNaN(english) || english < 0 || english > 100 ||
      formData.tenthSocialScienceMarks === '' || isNaN(social) || social < 0 || social > 100 ||
      formData.tenthGujaratiMarks === '' || isNaN(gujarati) || gujarati < 0 || gujarati > 100 ||
      formData.tenthLanguageMarks === '' || isNaN(language) || language < 0 || language > 100
    ) {
      toast.error('Please enter valid marks (0-100) for all 6 Class 10 subjects');
      return false;
    }

    if (!formData.tenthTotalMarks || isNaN(total) || total <= 0) {
      toast.error('Please enter valid 10th total marks');
      return false;
    }

    if (!formData.tenthMaxMarks || isNaN(max) || max <= 0) {
      toast.error('Please enter valid 10th max marks');
      return false;
    }
    
    if (total > max) {
      toast.error('Total marks cannot exceed max marks');
      return false;
    }

    const tenth = Number(formData.tenthPercentage);
    if (!formData.tenthPercentage || isNaN(tenth) || tenth < 0 || tenth > 100) {
      toast.error('Please enter a valid 10th percentage (0-100)');
      return false;
    }

    if (formData.studentType === 'REGULAR') {
      const twelfth = Number(formData.twelfthPercentage);
      if (!formData.twelfthPercentage || isNaN(twelfth) || twelfth < 0 || twelfth > 100) {
        toast.error('Please enter a valid 12th percentage (0-100)');
        return false;
      }
    } else {
      const d2d = Number(formData.d2dCgpa);
      if (!formData.d2dCgpa || isNaN(d2d) || d2d < 0 || d2d > 10) {
        toast.error('Please enter a valid Diploma CGPA (0-10)');
        return false;
      }
      if (!formData.diplomaCollege.trim()) {
        toast.error('Please enter your Diploma College');
        return false;
      }
    }

    const cgpa = Number(formData.currentCgpa);
    if (!formData.currentCgpa || isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      toast.error('Please enter a valid current CGPA (0-10)');
      return false;
    }

    const backlogs = Number(formData.activeBacklogs);
    if (isNaN(backlogs) || backlogs < 0) {
      toast.error('Backlogs must be a non-negative number');
      return false;
    }

    return true;
  };

  const handleNextStep1 = () => {
    if (validateStep1()) {
      setActiveStep(2);
    }
  };

  const handleNextStep2 = () => {
    if (validateStep2()) {
      setActiveStep(3);
    }
  };

  const handleSubmitProfile = async () => {
    try {
      // 1. Save updated profile data to backend via PUT /api/students/me
      const updatePayload: any = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        dob: formData.dob,
        studentType: formData.studentType,
        department: formData.department,
        tenthPercentage: Number(formData.tenthPercentage),
        tenthMathsMarks: Number(formData.tenthMathsMarks),
        tenthScienceMarks: Number(formData.tenthScienceMarks),
        tenthEnglishMarks: Number(formData.tenthEnglishMarks),
        tenthSocialScienceMarks: Number(formData.tenthSocialScienceMarks),
        tenthLanguageMarks: formData.tenthLanguageMarks ? Number(formData.tenthLanguageMarks) : null,
        tenthTotalMarks: Number(formData.tenthTotalMarks),
        tenthMaxMarks: Number(formData.tenthMaxMarks),
        currentCgpa: Number(formData.currentCgpa),
        activeBacklogs: Number(formData.activeBacklogs),
        totalBacklogs: Number(formData.totalBacklogs) || Number(formData.activeBacklogs),
        profilePhoto: formData.profilePhoto || undefined,
      };

      if (formData.studentType === 'REGULAR') {
        updatePayload.twelfthPercentage = Number(formData.twelfthPercentage);
        updatePayload.d2dCgpa = null;
        updatePayload.diplomaCollege = null;
        updatePayload.diplomaBranch = null;
      } else {
        updatePayload.twelfthPercentage = null;
        updatePayload.d2dCgpa = Number(formData.d2dCgpa);
        updatePayload.diplomaCollege = formData.diplomaCollege.trim();
        updatePayload.diplomaBranch = formData.diplomaBranch.trim() || formData.department;
      }

      await dispatch(updateStudentProfile(updatePayload)).unwrap();

      // 2. Lock profile via POST /api/students/me/submit
      const resultAction = await dispatch(submitStudentProfile());
      if (submitStudentProfile.fulfilled.match(resultAction)) {
        toast.success('Profile submitted and locked successfully! Sent to TPO for verification.');
        setIsEditingRejected(false);
        await dispatch(fetchStudentProfile());
      } else {
        toast.error((resultAction.payload as string) || 'Failed to submit profile');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while submitting your profile');
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

  // -------------------------------------------------------------
  // VIEW A: PROFILE SUBMITTED & LOCKED (STEP 8 in workflow diagram)
  // Shows locked read-only state unless rejected and student clicked "Update Profile"
  // -------------------------------------------------------------
  if (isLocked && (!isRejected || !isEditingRejected)) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              My Profile
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your profile has been submitted and is locked for TPO verification.
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
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Profile Rejected
              </Badge>
            ) : (
              <Badge variant="warning" className="px-3 py-1 text-xs">
                <Lock className="h-3.5 w-3.5 mr-1" />
                Under Verification
              </Badge>
            )}
          </div>
        </div>

        {/* Status Banners */}
        {isVerified ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-emerald-900">Profile Verified by TPO</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your academic qualifications have been verified. You can now apply for all eligible campus recruitment drives.
              </p>
            </div>
          </div>
        ) : isRejected ? (
          <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">Profile Rejected by TPO</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  <strong>Reason:</strong> {profile.rejectionReason || 'Discrepancy found in academic records.'}
                </p>
                <p className="text-xs text-rose-600 mt-1">
                  You can update your profile information and resubmit for verification.
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setIsEditingRejected(true);
                setActiveStep(1);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0"
            >
              Update Profile
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Lock className="h-4 w-4 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900">Profile Submitted & Locked</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your profile has been submitted and is under verification by TPO.
              </p>
            </div>
          </div>
        )}

        {/* Read-only Profile Details matching Step 8 in reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Details Card */}
          <Card className="border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Personal Details</h3>
            </div>
            <CardContent className="p-5">
              <div className="flex flex-col items-center mb-4">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover border border-slate-200 shadow-sm" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                    <User className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </div>
              <dl className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Name:</dt>
                  <dd className="font-bold text-slate-900">{profile.fullName}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Email:</dt>
                  <dd className="font-semibold text-slate-800">{profile.user?.email || '-'}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Phone:</dt>
                  <dd className="font-semibold text-slate-800">{profile.phone}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">DOB:</dt>
                  <dd className="font-semibold text-slate-800">{formatDate(profile.dob)}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-slate-500 font-medium">Student Type:</dt>
                  <dd className="font-bold text-blue-600">
                    {profile.studentType === 'REGULAR' ? 'Regular' : 'D2D'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Academic Details Card */}
          <Card className="border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Academic Details</h3>
            </div>
            <CardContent className="p-5">
              <dl className="space-y-3 text-xs">
                <div className="flex flex-col py-2 border-b border-slate-50 gap-2">
                  <div className="flex justify-between">
                    <dt className="text-slate-500 font-medium">10th Details:</dt>
                    <dd className="font-bold text-slate-900">
                      {profile.tenthPercentage}% ({profile.tenthTotalMarks}/{profile.tenthMaxMarks})
                    </dd>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-700 bg-slate-50 p-2 rounded-md">
                    <div className="flex justify-between"><span>Maths:</span> <span className="font-semibold">{profile.tenthMathsMarks}</span></div>
                    <div className="flex justify-between"><span>Science:</span> <span className="font-semibold">{profile.tenthScienceMarks}</span></div>
                    <div className="flex justify-between"><span>English:</span> <span className="font-semibold">{profile.tenthEnglishMarks}</span></div>
                    <div className="flex justify-between"><span>Social:</span> <span className="font-semibold">{profile.tenthSocialScienceMarks}</span></div>
                    {profile.tenthLanguageMarks != null && (
                      <div className="flex justify-between"><span>Language:</span> <span className="font-semibold">{profile.tenthLanguageMarks}</span></div>
                    )}
                  </div>
                </div>
                {profile.studentType === 'REGULAR' ? (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">12th Percentage:</dt>
                    <dd className="font-bold text-slate-900">
                      {profile.twelfthPercentage ? `${profile.twelfthPercentage}%` : 'N/A'}
                    </dd>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <dt className="text-slate-500 font-medium">Diploma CGPA:</dt>
                      <dd className="font-bold text-slate-900">{profile.d2dCgpa ?? 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <dt className="text-slate-500 font-medium">Diploma College:</dt>
                      <dd className="font-medium text-slate-800 truncate max-w-[180px]">
                        {profile.diplomaCollege ?? 'N/A'}
                      </dd>
                    </div>
                  </>
                )}
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">CGPA:</dt>
                  <dd className="font-bold text-blue-600">{profile.currentCgpa}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-slate-500 font-medium">Backlogs:</dt>
                  <dd className="font-bold text-slate-900">{profile.activeBacklogs}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: EDITABLE 3-STEP WIZARD (STEPS 5, 6, 7 in workflow diagram)
  // -------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Student Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete and submit your profile for TPO verification.
        </p>
      </div>

      {/* Stepper Indicator */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                activeStep === 1
                  ? 'bg-blue-600 text-white'
                  : activeStep > 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {activeStep > 1 ? <Check className="h-3 w-3" /> : '1'}
            </div>
            <span
              className={`text-[11px] ${
                activeStep === 1 ? 'text-blue-700 font-bold' : 'text-slate-600 font-medium'
              }`}
            >
              Personal Info
            </span>
          </button>

          <div
            className={`h-0.5 flex-1 mx-2 ${
              activeStep > 1 ? 'bg-emerald-500' : 'bg-slate-200'
            }`}
          />

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setActiveStep(2);
            }}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                activeStep === 2
                  ? 'bg-blue-600 text-white'
                  : activeStep > 2
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {activeStep > 2 ? <Check className="h-3 w-3" /> : '2'}
            </div>
            <span
              className={`text-[11px] ${
                activeStep === 2 ? 'text-blue-700 font-bold' : 'text-slate-600 font-medium'
              }`}
            >
              Academic Details
            </span>
          </button>

          <div
            className={`h-0.5 flex-1 mx-2 ${
              activeStep > 2 ? 'bg-emerald-500' : 'bg-slate-200'
            }`}
          />

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1() && validateStep2()) setActiveStep(3);
            }}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                activeStep === 3
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              3
            </div>
            <span
              className={`text-[11px] ${
                activeStep === 3 ? 'text-blue-700 font-bold' : 'text-slate-600 font-medium'
              }`}
            >
              Review & Submit
            </span>
          </button>
        </div>
      </div>

      {/* STEP 1: PERSONAL INFORMATION */}
      {activeStep === 1 && (
        <Card className="border-slate-200 shadow-sm">
          <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Personal Information</h3>
            </div>
          </div>
          <CardContent className="p-5 space-y-5">
            {/* Group 1: Basic Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                Basic Details
              </h4>
              <div className="flex justify-center mb-4">
                <label htmlFor="profilePhoto" className="cursor-pointer group relative">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 group-hover:border-blue-500 transition-colors">
                    {formData.profilePhoto ? (
                      <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input
                    type="file"
                    id="profilePhoto"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Bhargav Radadiya"
                    className="text-xs h-8"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="text-xs h-8 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className="text-xs h-8"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="text-xs h-8"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Group 2: Academic Path */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                Academic Path
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    Student Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-6 h-8">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                      <input
                        type="radio"
                        name="studentType"
                        value="REGULAR"
                        checked={formData.studentType === 'REGULAR'}
                        onChange={handleChange}
                        className="text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      Regular Student
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                      <input
                        type="radio"
                        name="studentType"
                        value="D2D"
                        checked={formData.studentType === 'D2D'}
                        onChange={handleChange}
                        className="text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      D2D Student
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full h-8 px-3 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                onClick={handleNextStep1}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 h-8"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: ACADEMIC DETAILS */}
      {activeStep === 2 && (
        <Card className="border-slate-200 shadow-sm">
          <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Academic Information</h3>
            </div>
          </div>
          <CardContent className="p-5 space-y-5">
            
            {/* Section 1: 10th Standard */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                  10th Standard
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Subject Marks - 8 columns */}
                <div className="col-span-1 md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Mathematics <span className="text-red-500">*</span></label>
                    <Input type="number" name="tenthMathsMarks" value={formData.tenthMathsMarks} onChange={handleChange} className="text-xs h-8" required />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Science <span className="text-red-500">*</span></label>
                    <Input type="number" name="tenthScienceMarks" value={formData.tenthScienceMarks} onChange={handleChange} className="text-xs h-8" required />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">English <span className="text-red-500">*</span></label>
                    <Input type="number" name="tenthEnglishMarks" value={formData.tenthEnglishMarks} onChange={handleChange} className="text-xs h-8" required />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Social Science <span className="text-red-500">*</span></label>
                    <Input type="number" name="tenthSocialScienceMarks" value={formData.tenthSocialScienceMarks} onChange={handleChange} className="text-xs h-8" required />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Gujarati <span className="text-red-500">*</span></label>
                    <Input type="number" name="tenthGujaratiMarks" value={formData.tenthGujaratiMarks} onChange={handleChange} className="text-xs h-8" required />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Optional Language <span className="text-red-500">*</span></label>
                    <Input type="number" name="tenthLanguageMarks" value={formData.tenthLanguageMarks} onChange={handleChange} className="text-xs h-8" required />
                  </div>
                </div>

                {/* Summary - 4 columns */}
                <div className="col-span-1 md:col-span-4 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3 flex flex-col justify-center">
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">Max Marks</span>
                    <span className="text-sm font-bold text-slate-900">600</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-medium text-slate-600">Total Marks</span>
                      <span className="text-xs font-bold text-slate-900">{formData.tenthTotalMarks || '—'} <span className="text-[10px] font-medium text-slate-500">/ 600</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-medium text-slate-600">Percentage</span>
                      <span className="text-xs font-bold text-blue-600">{formData.tenthPercentage ? `${formData.tenthPercentage}%` : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Higher Secondary / Diploma */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                {formData.studentType === 'REGULAR' ? 'Higher Secondary & Engineering' : 'Diploma & Engineering'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {formData.studentType === 'REGULAR' ? (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      12th Percentage <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      name="twelfthPercentage"
                      value={formData.twelfthPercentage}
                      onChange={handleChange}
                      placeholder="e.g. 78.6"
                      className="text-xs h-8"
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Diploma College <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="diplomaCollege"
                        value={isOtherCollege ? "Other" : formData.diplomaCollege}
                        onChange={(e) => {
                          if (e.target.value === "Other") {
                            setIsOtherCollege(true);
                            setFormData(prev => ({ ...prev, diplomaCollege: '' }));
                          } else {
                            setIsOtherCollege(false);
                            handleChange(e as any);
                          }
                        }}
                        className="w-full h-8 px-3 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="" disabled>Select Diploma College</option>
                        <option value="Government Polytechnic, Ahmedabad">Government Polytechnic, Ahmedabad</option>
                        <option value="L.J. Polytechnic, Ahmedabad">L.J. Polytechnic, Ahmedabad</option>
                        <option value="Government Polytechnic for Girls, Ahmedabad">Government Polytechnic for Girls, Ahmedabad</option>
                        <option value="R.C. Technical Institute, Ahmedabad">R.C. Technical Institute, Ahmedabad</option>
                        <option value="Silver Oak Polytechnic, Ahmedabad">Silver Oak Polytechnic, Ahmedabad</option>
                        <option value="Government Polytechnic, Gandhinagar">Government Polytechnic, Gandhinagar</option>
                        <option value="Government Polytechnic, Vadodara">Government Polytechnic, Vadodara</option>
                        <option value="Government Polytechnic, Rajkot">Government Polytechnic, Rajkot</option>
                        <option value="Government Polytechnic, Surat">Government Polytechnic, Surat</option>
                        <option value="Parul Polytechnic Institute, Vadodara">Parul Polytechnic Institute, Vadodara</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {isOtherCollege && (
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Enter Diploma College Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          name="diplomaCollege"
                          value={formData.diplomaCollege}
                          onChange={handleChange}
                          placeholder="Enter your college name"
                          className="text-xs h-8"
                          required
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Diploma CGPA <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        name="d2dCgpa"
                        value={formData.d2dCgpa}
                        onChange={handleChange}
                        placeholder="e.g. 8.5"
                        className="text-xs h-8"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Engineering CGPA (0-10) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    name="currentCgpa"
                    value={formData.currentCgpa}
                    onChange={handleChange}
                    placeholder="e.g. 8.5"
                    className="text-xs h-8"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Active Backlogs <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="activeBacklogs"
                    value={formData.activeBacklogs}
                    onChange={handleChange}
                    placeholder="0"
                    className="text-xs h-8"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setActiveStep(1)}
                className="text-xs h-8 px-4"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back
              </Button>
              <Button
                onClick={handleNextStep2}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 h-8"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: REVIEW & SUBMIT */}
      {activeStep === 3 && (
        <Card className="border-slate-200 shadow-sm">
          <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Review Your Profile</h3>
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            {/* Section 1: Personal Information */}
            <div className="relative p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                  Personal Information
                </h4>
                <Button variant="ghost" size="sm" onClick={() => setActiveStep(1)} className="text-[11px] text-blue-600 hover:bg-blue-50 h-6 px-2 -mt-1 -mr-1">
                  <Edit3 className="h-3 w-3 mr-1" /> Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="block text-slate-500 font-medium mb-0.5">Full Name</span>
                  <span className="font-semibold text-slate-900">{formData.fullName}</span>
                </div>
                <div>
                  <span className="block text-slate-500 font-medium mb-0.5">Email</span>
                  <span className="font-semibold text-slate-900 truncate block">{formData.email}</span>
                </div>
                <div>
                  <span className="block text-slate-500 font-medium mb-0.5">Phone</span>
                  <span className="font-semibold text-slate-900">{formData.phone}</span>
                </div>
                <div>
                  <span className="block text-slate-500 font-medium mb-0.5">DOB</span>
                  <span className="font-semibold text-slate-900">{formatDate(formData.dob)}</span>
                </div>
                <div>
                  <span className="block text-slate-500 font-medium mb-0.5">Student Type</span>
                  <span className="font-semibold text-slate-900">{formData.studentType === 'REGULAR' ? 'Regular' : 'D2D'}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-slate-500 font-medium mb-0.5">Department</span>
                  <span className="font-semibold text-slate-900">{formData.department}</span>
                </div>
              </div>
            </div>

            {/* Section 2: 10th Standard */}
            <div className="relative p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                  10th Standard
                </h4>
                <Button variant="ghost" size="sm" onClick={() => setActiveStep(2)} className="text-[11px] text-emerald-600 hover:bg-emerald-50 h-6 px-2 -mt-1 -mr-1">
                  <Edit3 className="h-3 w-3 mr-1" /> Edit
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="block text-slate-500 font-medium mb-0.5">Mathematics</span>
                    <span className="font-semibold text-slate-900">{formData.tenthMathsMarks || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-medium mb-0.5">Science</span>
                    <span className="font-semibold text-slate-900">{formData.tenthScienceMarks || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-medium mb-0.5">English</span>
                    <span className="font-semibold text-slate-900">{formData.tenthEnglishMarks || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-medium mb-0.5">Social Science</span>
                    <span className="font-semibold text-slate-900">{formData.tenthSocialScienceMarks || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-medium mb-0.5">Gujarati</span>
                    <span className="font-semibold text-slate-900">{formData.tenthGujaratiMarks || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-medium mb-0.5">Optional Language</span>
                    <span className="font-semibold text-slate-900">{formData.tenthLanguageMarks || '—'}</span>
                  </div>
                </div>
                <div className="col-span-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-col justify-center space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Total Marks</span>
                    <span className="font-bold text-slate-900 text-xs">{formData.tenthTotalMarks || '—'} <span className="text-slate-500 font-normal text-[10px]">/ 600</span></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Percentage</span>
                    <span className="font-bold text-emerald-700 text-xs">{formData.tenthPercentage ? `${formData.tenthPercentage}%` : '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Higher Secondary & Engineering / Diploma */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-[10px] font-bold text-purple-800 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded">
                    {formData.studentType === 'REGULAR' ? 'Higher Secondary' : 'Diploma'}
                  </h4>
                  <Button variant="ghost" size="sm" onClick={() => setActiveStep(2)} className="text-[11px] text-purple-600 hover:bg-purple-50 h-6 px-2 -mt-1 -mr-1">
                    <Edit3 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {formData.studentType === 'REGULAR' ? (
                    <div>
                      <span className="block text-slate-500 font-medium mb-0.5">12th Percentage</span>
                      <span className="font-semibold text-slate-900">{formData.twelfthPercentage}%</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="block text-slate-500 font-medium mb-0.5">Diploma CGPA</span>
                        <span className="font-semibold text-slate-900">{formData.d2dCgpa}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 font-medium mb-0.5">Diploma College</span>
                        <span className="font-semibold text-slate-900">{formData.diplomaCollege}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="relative p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-[10px] font-bold text-orange-800 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded">
                    Engineering Details
                  </h4>
                  <Button variant="ghost" size="sm" onClick={() => setActiveStep(2)} className="text-[11px] text-orange-600 hover:bg-orange-50 h-6 px-2 -mt-1 -mr-1">
                    <Edit3 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block text-slate-500 font-medium mb-0.5">Current CGPA</span>
                    <span className="font-bold text-blue-600">{formData.currentCgpa}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-medium mb-0.5">Active Backlogs</span>
                    <span className="font-bold text-slate-900">{formData.activeBacklogs}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setActiveStep(2)}
                className="text-xs h-8 px-4"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back
              </Button>
              <Button
                onClick={() => setIsConfirmDialogOpen(true)}
                isLoading={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 h-8"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Submit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Profile Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your profile? Once submitted, your profile will be securely locked and sent for TPO verification. You will not be able to edit it unless it is rejected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => { setIsConfirmDialogOpen(false); handleSubmitProfile(); }} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentProfile;
