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
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    if (!formData.dob) {
      toast.error('Please select your date of birth');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        dob: formData.dob,
        password: formData.password,
      };

      const resultAction = await dispatch(registerUser(payload));

      if (registerUser.fulfilled.match(resultAction)) {
        toast.success('Registration successful! Please login with your credentials.');
        navigate('/login', {
          state: { email: formData.email.trim() },
          replace: true,
        });
      } else {
        toast.error((resultAction.payload as string) || 'Registration failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100/90 py-3 sm:py-5 px-3 sm:px-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: LDCE Institutional Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#0b192c] via-[#0f223d] to-[#142d50] p-5 sm:p-6 lg:p-8 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          {/* Subtle Institutional Geometric Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl pointer-events-none" />

          {/* Top: College Identity */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-13 w-13 rounded-xl bg-white p-1 shadow-md flex items-center justify-center shrink-0 border border-slate-200/40">
                <img
                  src="/images/ldce-logo.png"
                  alt="L.D. College of Engineering"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                  L.D. College of Engineering
                </h1>
                <p className="text-[11px] font-medium text-slate-300">
                  Ahmedabad
                </p>
                <p className="text-[10px] font-semibold text-blue-400 tracking-wide mt-0.5">
                  Training & Placement Cell
                </p>
              </div>
            </div>

            {/* Portal Badge & Tagline */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-950/90 border border-blue-700/40 text-blue-300 text-[10px] font-semibold tracking-wider uppercase mb-2">
                <GraduationCap className="h-3 w-3 text-blue-400" />
                Mini Placement Portal
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Connecting students with campus recruitment opportunities.
              </p>
            </div>

            {/* Registration Guidance Highlights */}
            <div className="hidden sm:flex flex-col gap-2.5 mt-5 pt-4 border-t border-slate-800/60 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-md bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span className="text-[11px] leading-tight">Create your student credentials to register with the T&P Cell</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-md bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <Briefcase className="h-3 w-3" />
                </div>
                <span className="text-[11px] leading-tight">Complete academic profile verification to unlock recruitment drives</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-md bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <ShieldCheck className="h-3 w-3" />
                </div>
                <span className="text-[11px] leading-tight">Receive interview notifications, shortlists, and placement offers</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="relative z-10 pt-3 mt-4 border-t border-slate-800/70 text-[10px] text-slate-400 text-center lg:text-left">
            © {new Date().getFullYear()} L.D. College of Engineering • Ahmedabad
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-7 p-5 sm:p-6 lg:p-7 flex flex-col justify-center bg-white">
          <div className="mb-3.5 pb-2.5 border-b border-slate-100">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-blue-800 uppercase bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              L.D. COLLEGE OF ENGINEERING, AHMEDABAD
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Student Registration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create your student account to access campus placement opportunities.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Section 1: Personal Information */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Personal Information
                </span>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <Input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name as per college records"
                    className="pl-8 text-xs h-9 border-slate-200 focus:border-blue-500 rounded-md"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <Input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. student@ldce.ac.in or personal email"
                    className="pl-8 text-xs h-9 border-slate-200 focus:border-blue-500 rounded-md"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Phone & Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <Input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      className="pl-8 text-xs h-9 border-slate-200 focus:border-blue-500 rounded-md"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                    </div>
                    <Input
                      type="date"
                      name="dob"
                      required
                      value={formData.dob}
                      onChange={handleChange}
                      className="pl-8 text-xs h-9 border-slate-200 focus:border-blue-500 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Account Security */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Account Security
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 6 characters"
                      className="pl-8 pr-8 text-xs h-9 border-slate-200 focus:border-blue-500 rounded-md"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className="pl-8 pr-8 text-xs h-9 border-slate-200 focus:border-blue-500 rounded-md"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg shadow-sm mt-3 text-xs h-9.5 transition-colors cursor-pointer"
            >
              Create Student Account
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </form>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
            >
              Login
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
