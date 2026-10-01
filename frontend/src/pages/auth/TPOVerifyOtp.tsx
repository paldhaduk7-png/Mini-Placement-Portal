import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setCredentials } from '@/features/auth/authSlice';
import authService from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export const TPOVerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const email = (location.state as any)?.email;
  const password = (location.state as any)?.password; // Needed for resend

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(300);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [localIsLoading, setLocalIsLoading] = useState(false);

  React.useEffect(() => {
    if (!email || !password) {
      toast.error('Session missing. Please login again.');
      navigate('/tpo/login');
    }
  }, [email, password, navigate]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    } else if (resendCooldown === 0) {
      setIsResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleResendOtp = async () => {
    if (isResendDisabled) return;
    try {
      setLocalIsLoading(true);
      const response = await authService.tpoLogin({ email, password });
      if (response.requiresOtp) {
        setCountdown(300);
        setResendCooldown(30);
        setIsResendDisabled(true);
        toast.success('New verification code sent to your email.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to resend OTP.');
    } finally {
      setLocalIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }
    try {
      setLocalIsLoading(true);
      const response = await authService.tpoVerifyOtp(email, otp);
      dispatch(setCredentials({ user: response.user, token: response.token }));
      toast.success('TPO login successful.');
      navigate('/tpo/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLocalIsLoading(false);
    }
  };

  if (!email || !password) return null;

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
              Official College Placement Cell
            </div>
          </div>

          <div className="text-xs text-blue-200/60 text-center">
            © {new Date().getFullYear()} Mini Placement Portal. All rights reserved.
          </div>
        </div>

        {/* Right Side: OTP Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <Link
              to="/tpo/login"
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Login
            </Link>
            
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Verify TPO Login
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              We've sent a 6-digit verification code to your registered email address.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                6-Digit OTP
              </label>
              <Input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="text-center tracking-[0.5em] text-lg font-medium h-12"
                autoComplete="one-time-code"
              />
              {countdown > 0 ? (
                <p className="text-xs text-slate-500 mt-2 text-right">
                  OTP expires in {formatTime(countdown)}
                </p>
              ) : (
                <p className="text-xs text-red-500 mt-2 text-right">
                  OTP has expired. Please request a new code.
                </p>
              )}
            </div>

            <Button
              type="submit"
              isLoading={localIsLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg shadow-sm mt-3 text-xs h-10"
            >
              Verify OTP
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResendDisabled || localIsLoading}
              className={`font-semibold ${
                isResendDisabled || localIsLoading
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-700 hover:underline'
              }`}
            >
              {isResendDisabled ? `Resend available in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TPOVerifyOtp;
