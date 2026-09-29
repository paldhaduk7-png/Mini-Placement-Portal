import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { registerUser } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  UserCheck,
} from 'lucide-react';
import { DEPARTMENTS } from '@/constants';
import type { StudentType } from '@/types/student';

export const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: '',
    studentType: 'REGULAR' as StudentType,
    department: 'Computer Science and Engineering',
    // Academic (Engineering)
    currentCgpa: 8.5,
    activeBacklogs: 0,
    totalBacklogs: 0,
    // Std 10 Marks
    tenthMathsMarks: 85,
    tenthScienceMarks: 88,
    tenthEnglishMarks: 82,
    tenthSocialScienceMarks: 80,
    tenthLanguageMarks: 85,
    tenthTotalMarks: 420,
    tenthMaxMarks: 500,
    tenthPercentage: 84.0,
    // Regular
    twelfthPercentage: 80.5,
    // D2D
    d2dCgpa: 8.2,
    diplomaBranch: 'Computer Engineering',
    diplomaCollege: 'Government Polytechnic',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? '' : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Auto-calculate 10th Total & Percentage when subject marks change
  const handleTenthMarksChange = (field: string, val: number) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: val };
      const total =
        (Number(updated.tenthMathsMarks) || 0) +
        (Number(updated.tenthScienceMarks) || 0) +
        (Number(updated.tenthEnglishMarks) || 0) +
        (Number(updated.tenthSocialScienceMarks) || 0) +
        (Number(updated.tenthLanguageMarks) || 0);
      const percentage = Number(((total / 500) * 100).toFixed(2));
      return {
        ...updated,
        tenthTotalMarks: total,
        tenthPercentage: percentage,
      };
    });
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!formData.dob) {
      toast.error('Please select your date of birth');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.currentCgpa < 0 || formData.currentCgpa > 10) {
      toast.error('Current CGPA must be between 0 and 10');
      return false;
    }
    if (formData.activeBacklogs < 0 || formData.totalBacklogs < 0) {
      toast.error('Backlogs cannot be negative');
      return false;
    }
    if (formData.activeBacklogs > formData.totalBacklogs) {
      toast.error('Active backlogs cannot exceed total backlogs');
      return false;
    }
    if (formData.studentType === 'REGULAR') {
      if (
        formData.twelfthPercentage === undefined ||
        formData.twelfthPercentage < 0 ||
        formData.twelfthPercentage > 100
      ) {
        toast.error('12th percentage must be between 0 and 100');
        return false;
      }
    } else {
      if (!formData.d2dCgpa || formData.d2dCgpa < 0 || formData.d2dCgpa > 10) {
        toast.error('D2D CGPA must be between 0 and 10');
        return false;
      }
      if (!formData.diplomaCollege.trim() || !formData.diplomaBranch.trim()) {
        toast.error('Diploma branch and college are required for D2D students');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        dob: formData.dob,
        password: formData.password,
        studentType: formData.studentType,
        department: formData.department,
        currentCgpa: Number(formData.currentCgpa),
        activeBacklogs: Number(formData.activeBacklogs),
        totalBacklogs: Number(formData.totalBacklogs),
        tenthMathsMarks: Number(formData.tenthMathsMarks),
        tenthScienceMarks: Number(formData.tenthScienceMarks),
        tenthEnglishMarks: Number(formData.tenthEnglishMarks),
        tenthSocialScienceMarks: Number(formData.tenthSocialScienceMarks),
        tenthLanguageMarks: Number(formData.tenthLanguageMarks),
        tenthTotalMarks: Number(formData.tenthTotalMarks),
        tenthMaxMarks: 500,
        tenthPercentage: Number(formData.tenthPercentage),
      };

      if (formData.studentType === 'REGULAR') {
        payload.twelfthPercentage = Number(formData.twelfthPercentage);
      } else {
        payload.d2dCgpa = Number(formData.d2dCgpa);
        payload.diplomaBranch = formData.diplomaBranch.trim();
        payload.diplomaCollege = formData.diplomaCollege.trim();
      }

      const resultAction = await dispatch(registerUser(payload));
      if (registerUser.fulfilled.match(resultAction)) {
        toast.success('Registration successful! Please sign in with your email and password.');
        navigate('/login', { state: { email: formData.email.trim() }, replace: true });
      } else {
        toast.error((resultAction.payload as string) || 'Registration failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-[#0c1e38] text-white flex items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <GraduationCap className="h-5 w-5 text-blue-300" />
          </div>
          <span className="font-bold text-base tracking-tight">Mini Placement Portal</span>
        </div>
        <div className="text-xs text-slate-300">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold underline ml-1">
            Login
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex items-center justify-center">
        <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Multi-step progress indicator */}
          <div className="bg-slate-50 px-8 py-5 border-b border-slate-200">
            <div className="flex items-center justify-center max-w-xl mx-auto">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  1
                </div>
                <span className={`text-xs font-semibold ${step >= 1 ? 'text-blue-900' : 'text-slate-400'}`}>
                  Personal Info
                </span>
              </div>
              <div className={`h-0.5 w-12 mx-3 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  2
                </div>
                <span className={`text-xs font-semibold ${step >= 2 ? 'text-blue-900' : 'text-slate-400'}`}>
                  Academic Details
                </span>
              </div>
              <div className={`h-0.5 w-12 mx-3 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  3
                </div>
                <span className={`text-xs font-semibold ${step === 3 ? 'text-blue-900' : 'text-slate-400'}`}>
                  Review & Submit
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                  <p className="text-xs text-slate-500">Provide your basic personal details for placement registration.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Bhargav Radadiya"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. bhargav@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Birth *
                    </label>
                    <Input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password *
                    </label>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>

                {/* Student Type Selection */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Student Type *
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                      <input
                        type="radio"
                        name="studentType"
                        value="REGULAR"
                        checked={formData.studentType === 'REGULAR'}
                        onChange={handleChange}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      Regular Student (10th + 12th)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                      <input
                        type="radio"
                        name="studentType"
                        value="D2D"
                        checked={formData.studentType === 'D2D'}
                        onChange={handleChange}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      D2D Student (Diploma to Degree)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2: Academic Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Academic Details</h3>
                  <p className="text-xs text-slate-500">
                    Enter your 10th standard marks breakdown and current college performance.
                  </p>
                </div>

                {/* College Performance */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Engineering CGPA (0 - 10) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      name="currentCgpa"
                      value={formData.currentCgpa}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Active Backlogs *
                    </label>
                    <Input
                      type="number"
                      name="activeBacklogs"
                      value={formData.activeBacklogs}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Backlogs History *
                    </label>
                    <Input
                      type="number"
                      name="totalBacklogs"
                      value={formData.totalBacklogs}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* 10th Marks Breakdown (Backend Requirement) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Standard 10th Marks (Out of 100 per subject)
                    </span>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      Calculated 10th: {formData.tenthPercentage}% ({formData.tenthTotalMarks}/500)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Maths *</label>
                      <Input
                        type="number"
                        value={formData.tenthMathsMarks}
                        onChange={(e) => handleTenthMarksChange('tenthMathsMarks', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Science *</label>
                      <Input
                        type="number"
                        value={formData.tenthScienceMarks}
                        onChange={(e) => handleTenthMarksChange('tenthScienceMarks', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">English *</label>
                      <Input
                        type="number"
                        value={formData.tenthEnglishMarks}
                        onChange={(e) => handleTenthMarksChange('tenthEnglishMarks', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Social Sci *</label>
                      <Input
                        type="number"
                        value={formData.tenthSocialScienceMarks}
                        onChange={(e) => handleTenthMarksChange('tenthSocialScienceMarks', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Language *</label>
                      <Input
                        type="number"
                        value={formData.tenthLanguageMarks}
                        onChange={(e) => handleTenthMarksChange('tenthLanguageMarks', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Regular vs D2D Details */}
                {formData.studentType === 'REGULAR' ? (
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <label className="block text-xs font-bold text-blue-900 mb-1">
                      12th Percentage (%) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      name="twelfthPercentage"
                      value={formData.twelfthPercentage}
                      onChange={handleChange}
                      placeholder="e.g. 78.5"
                      className="bg-white max-w-xs"
                      required
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-4">
                    <span className="text-xs font-bold text-indigo-900 uppercase">Diploma Details</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">D2D CGPA (0-10) *</label>
                        <Input
                          type="number"
                          step="0.01"
                          name="d2dCgpa"
                          value={formData.d2dCgpa}
                          onChange={handleChange}
                          className="bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Diploma Branch *</label>
                        <Input
                          name="diplomaBranch"
                          value={formData.diplomaBranch}
                          onChange={handleChange}
                          placeholder="e.g. Computer Engineering"
                          className="bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Diploma College *</label>
                        <Input
                          name="diplomaCollege"
                          value={formData.diplomaCollege}
                          onChange={handleChange}
                          placeholder="e.g. Government Polytechnic"
                          className="bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Review & Submit */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Review & Submit Profile</h3>
                  <p className="text-xs text-slate-500">
                    Verify all information before creating your placement portal account.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-3 flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                      Personal Information
                    </h4>
                    <dl className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Full Name:</dt>
                        <dd className="font-semibold text-slate-900">{formData.fullName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Email:</dt>
                        <dd className="font-semibold text-slate-900">{formData.email}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Phone:</dt>
                        <dd className="font-semibold text-slate-900">{formData.phone}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Date of Birth:</dt>
                        <dd className="font-semibold text-slate-900">{formData.dob}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Student Type:</dt>
                        <dd className="font-semibold text-blue-700">{formData.studentType}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Department:</dt>
                        <dd className="font-semibold text-slate-900">{formData.department}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-3 flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      Academic Records
                    </h4>
                    <dl className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Current CGPA:</dt>
                        <dd className="font-bold text-slate-900">{formData.currentCgpa}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Active / Total Backlogs:</dt>
                        <dd className="font-semibold text-slate-900">
                          {formData.activeBacklogs} / {formData.totalBacklogs}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">10th Percentage:</dt>
                        <dd className="font-semibold text-slate-900">{formData.tenthPercentage}%</dd>
                      </div>
                      {formData.studentType === 'REGULAR' ? (
                        <div className="flex justify-between">
                          <dt className="text-slate-500">12th Percentage:</dt>
                          <dd className="font-semibold text-slate-900">{formData.twelfthPercentage}%</dd>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Diploma CGPA:</dt>
                            <dd className="font-semibold text-slate-900">{formData.d2dCgpa}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Diploma College:</dt>
                            <dd className="font-semibold text-slate-900">{formData.diplomaCollege}</dd>
                          </div>
                        </>
                      )}
                    </dl>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    By submitting, your account will be created. Once submitted and locked, you can apply to drives once verified by the TPO.
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => (s - 1) as any)}
                  className="text-slate-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
                >
                  Confirm & Register
                  <CheckCircle2 className="h-4 w-4 ml-1.5" />
                </Button>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
