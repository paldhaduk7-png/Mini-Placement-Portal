import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import authService from '@/services/auth.service';

export const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error('Email is missing. Please start the password reset process again.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      toast.error('Please enter a valid 6-digit code.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyOtp(email, otp);
      toast.success('Verification successful!');
      navigate('/reset-password', { state: { email, otp } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authService.forgotPassword(email);
      toast.success('A new verification code has been sent.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 md:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8 flex flex-col items-center">
          <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Verify Your Email</h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            We've sent a 6-digit verification code to <br/>
            <span className="font-semibold text-slate-700">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">
                Enter 6-digit code
              </label>
              <Input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest h-14 font-mono"
              />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg shadow-sm mt-4 text-xs h-10"
            >
              Verify Code
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center space-y-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
            >
              {isResending ? 'Resending...' : 'Resend Code'}
            </button>
            <Link
              to="/forgot-password"
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
