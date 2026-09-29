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
  BookOpen,
  Sparkles,
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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 md:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Brand & Visual Illustration */}
        <div className="bg-gradient-to-br from-[#0c1e38] via-[#102a4c] to-[#1e40af] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <GraduationCap className="h-6 w-6 text-blue-300" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Mini Placement Portal</h2>
            </div>
            <p className="text-blue-200 text-xs font-medium tracking-wide uppercase mb-1">
              Your Future, Our Priority
            </p>
            <p className="text-blue-100/80 text-sm leading-relaxed">
              Connect with top companies and build your career through seamless campus placement opportunities.
            </p>
          </div>

          {/* Central graphic illustration */}
          <div className="my-8 flex flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-blue-600/40 to-indigo-500/40 border border-white/10 flex items-center justify-center shadow-lg backdrop-blur-sm mb-4">
                <BookOpen className="w-14 h-14 text-blue-200" />
              </div>
              <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 rounded-full p-1.5 shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium text-blue-200 border border-white/10">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              Student Registration Portal
            </div>
          </div>

          <div className="text-xs text-blue-200/60 text-center">
            © {new Date().getFullYear()} Mini Placement Portal. All rights reserved.
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Student Registration</h2>
            <p className="text-xs text-slate-500 mt-1">
              Create your student account to get started with recruitment drives.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="pl-9 text-xs h-9.5"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="pl-9 text-xs h-9.5"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <Input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="pl-9 text-xs h-9.5"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <Input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="pl-9 text-xs h-9.5"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="pl-9 pr-9 text-xs h-9.5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="pl-9 pr-9 text-xs h-9.5"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg shadow-sm mt-3 text-xs"
            >
              Register
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
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
