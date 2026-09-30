import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import authService from '@/services/auth.service';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const email = location.state?.email;
  const otp = location.state?.otp;

  useEffect(() => {
    if (!email || !otp) {
      toast.error('Invalid session. Please verify your OTP first.');
      navigate('/forgot-password');
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      toast.success('Password reset successfully.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !otp) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 md:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8 flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Create New Password</h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            Your new password must be different from previous used passwords.
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pl-9 pr-9 text-xs h-10"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pl-9 pr-9 text-xs h-10"
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

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg shadow-sm mt-4 text-xs h-10"
            >
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
