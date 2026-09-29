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
} from 'lucide-react';
import { DEPARTMENTS } from '@/constants';
import type { StudentType } from '@/types/student';

export const StudentProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isSubmitting } = useAppSelector((state) => state.student);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [isEditingRejected, setIsEditingRejected] = useState(false);

  // Form State for Steps 1 & 2
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    studentType: 'REGULAR' as StudentType,
    department: 'Computer Science and Engineering',
    tenthPercentage: '',
    twelfthPercentage: '',
    currentCgpa: '',
    activeBacklogs: '0',
    totalBacklogs: '0',
    d2dCgpa: '',
    diplomaBranch: '',
    diplomaCollege: '',
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
        twelfthPercentage: profile.twelfthPercentage ? String(profile.twelfthPercentage) : '',
        currentCgpa: profile.currentCgpa ? String(profile.currentCgpa) : '',
        activeBacklogs: profile.activeBacklogs !== undefined ? String(profile.activeBacklogs) : '0',
        totalBacklogs: profile.totalBacklogs !== undefined ? String(profile.totalBacklogs) : '0',
        d2dCgpa: profile.d2dCgpa ? String(profile.d2dCgpa) : '',
        diplomaBranch: profile.diplomaBranch || '',
        diplomaCollege: profile.diplomaCollege || '',
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        currentCgpa: Number(formData.currentCgpa),
        activeBacklogs: Number(formData.activeBacklogs),
        totalBacklogs: Number(formData.totalBacklogs) || Number(formData.activeBacklogs),
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
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">10th Percentage:</dt>
                  <dd className="font-bold text-slate-900">{profile.tenthPercentage}%</dd>
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
    <div className="max-w-4xl mx-auto space-y-6">
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                activeStep === 1
                  ? 'bg-blue-600 text-white'
                  : activeStep > 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {activeStep > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <span
              className={`text-xs ${
                activeStep === 1 ? 'text-blue-700 font-bold' : 'text-slate-600 font-medium'
              }`}
            >
              Personal Info
            </span>
          </button>

          <div
            className={`h-0.5 flex-1 mx-3 ${
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
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                activeStep === 2
                  ? 'bg-blue-600 text-white'
                  : activeStep > 2
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {activeStep > 2 ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <span
              className={`text-xs ${
                activeStep === 2 ? 'text-blue-700 font-bold' : 'text-slate-600 font-medium'
              }`}
            >
              Academic Details
            </span>
          </button>

          <div
            className={`h-0.5 flex-1 mx-3 ${
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
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                activeStep === 3
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              3
            </div>
            <span
              className={`text-xs ${
                activeStep === 3 ? 'text-blue-700 font-bold' : 'text-slate-600 font-medium'
              }`}
            >
              Review & Submit
            </span>
          </button>
        </div>
      </div>

      {/* STEP 1: PERSONAL INFORMATION (Reference Panel 5) */}
      {activeStep === 1 && (
        <Card className="border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Personal Information</h3>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Bhargav Radadiya"
                  className="text-xs h-9.5"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="text-xs h-9.5 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="text-xs h-9.5"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="text-xs h-9.5"
                  required
                />
              </div>
            </div>

            {/* Student Type Selection */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Student Type <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                  <input
                    type="radio"
                    name="studentType"
                    value="REGULAR"
                    checked={formData.studentType === 'REGULAR'}
                    onChange={handleChange}
                    className="text-blue-600 focus:ring-blue-500 h-4 w-4"
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
                    className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  D2D Student
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full h-9.5 px-3 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                onClick={handleNextStep1}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 h-9"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: ACADEMIC DETAILS (Reference Panel 6) */}
      {activeStep === 2 && (
        <Card className="border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Academic Information</h3>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* D2D Specific Fields */}
              {formData.studentType === 'D2D' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Diploma College <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="diplomaCollege"
                      value={formData.diplomaCollege}
                      onChange={handleChange}
                      placeholder="e.g. Government Polytechnic, Ahmedabad"
                      className="text-xs h-9.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Diploma CGPA <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      name="d2dCgpa"
                      value={formData.d2dCgpa}
                      onChange={handleChange}
                      placeholder="e.g. 8.5"
                      className="text-xs h-9.5"
                      required
                    />
                  </div>
                </>
              )}

              {/* 10th Percentage */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  10th Percentage <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  name="tenthPercentage"
                  value={formData.tenthPercentage}
                  onChange={handleChange}
                  placeholder="e.g. 82.4"
                  className="text-xs h-9.5"
                  required
                />
              </div>

              {/* 12th Percentage (Only for Regular Students) */}
              {formData.studentType === 'REGULAR' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    12th Percentage <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    name="twelfthPercentage"
                    value={formData.twelfthPercentage}
                    onChange={handleChange}
                    placeholder="e.g. 78.6"
                    className="text-xs h-9.5"
                    required
                  />
                </div>
              )}

              {/* Engineering CGPA */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Engineering CGPA (0-10) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  name="currentCgpa"
                  value={formData.currentCgpa}
                  onChange={handleChange}
                  placeholder="e.g. 8.5"
                  className="text-xs h-9.5"
                  required
                />
              </div>

              {/* Backlogs */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Backlogs <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="activeBacklogs"
                  value={formData.activeBacklogs}
                  onChange={handleChange}
                  placeholder="0"
                  className="text-xs h-9.5"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setActiveStep(1)}
                className="text-xs h-9"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back
              </Button>
              <Button
                onClick={handleNextStep2}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 h-9"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: REVIEW & SUBMIT (Reference Panel 7) */}
      {activeStep === 3 && (
        <Card className="border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Review Your Profile</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify your information before submitting. Once submitted, your profile will be locked for verification.
            </p>
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Section 1: Personal Information */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  &gt; Personal Information
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {formData.fullName} • {formData.phone} • {formatDate(formData.dob)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveStep(1)}
                className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50 h-7"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>

            {/* Section 2: Academic Details */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  &gt; Academic Details
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  10th: <strong>{formData.tenthPercentage}%</strong>
                  {formData.studentType === 'REGULAR'
                    ? ` • 12th: ${formData.twelfthPercentage}%`
                    : ` • Diploma CGPA: ${formData.d2dCgpa} (${formData.diplomaCollege})`}
                  {` • CGPA: `}
                  <strong>{formData.currentCgpa}</strong>
                  {` • Backlogs: `}
                  <strong>{formData.activeBacklogs}</strong>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveStep(2)}
                className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50 h-7"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>

            {/* Section 3: Student Type */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  &gt; Student Type
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {formData.studentType === 'REGULAR' ? 'Regular Student' : 'D2D Student'} • {formData.department}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveStep(1)}
                className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50 h-7"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setActiveStep(2)}
                className="text-xs h-9"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back
              </Button>
              <Button
                onClick={handleSubmitProfile}
                isLoading={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 h-9"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Submit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentProfile;
