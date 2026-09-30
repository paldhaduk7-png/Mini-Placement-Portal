import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mail, ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';
import authService from '@/services/auth.service';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      toast.success('If the email is registered, a verification code has been sent.');
      navigate('/verify-otp', { state: { email: email.trim() } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 md:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8 flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Forgot Password?</h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            Enter your registered email address and we'll send you a verification code.
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-9 text-xs h-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg shadow-sm mt-2 text-xs h-10"
            >
              Send Code
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </form>

          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
