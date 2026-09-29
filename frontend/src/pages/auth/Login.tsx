import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { loginUser } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { GraduationCap, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState((location.state as any)?.email || '');
  const [password, setPassword] = useState('');

  // If already authenticated with a valid backend session, redirect to the role's dashboard
  React.useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      if (user.role === 'TPO') {
        navigate('/tpo/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [isInitialized, isAuthenticated, user, navigate]);

  // Show loading indicator while session verification is running
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Checking session..." />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      const resultAction = await dispatch(loginUser({ email: email.trim(), password }));
      if (loginUser.fulfilled.match(resultAction)) {
        const user = resultAction.payload.user;
        toast.success(`Welcome back, ${user.fullName || user.email}!`);

        // Redirect according to actual user role returned by backend
        if (user.role === 'TPO') {
          navigate('/tpo/dashboard', { replace: true });
        } else {
          navigate('/student/dashboard', { replace: true });
        }
      } else {
        toast.error((resultAction.payload as string) || 'Invalid email or password');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 md:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Brand & Visual Hero */}
        <div className="bg-gradient-to-br from-[#0c1e38] via-[#102a4c] to-[#1e40af] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <GraduationCap className="h-6 w-6 text-blue-300" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Mini Placement Portal</h2>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">
              Your Future. Our Priority.
            </h1>
            <p className="text-blue-100/80 text-sm leading-relaxed">
              Connect with leading companies, apply for top job drives, and kickstart your career with seamless campus placement workflows.
            </p>
          </div>

          {/* Central graphic representation */}
          <div className="my-8 flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-indigo-500/30 border border-white/10 flex items-center justify-center shadow-inner mb-4 backdrop-blur-sm">
              <GraduationCap className="w-16 h-16 text-blue-200 animate-pulse" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium text-blue-200 border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Official College Placement Cell
            </div>
          </div>

          <div className="text-xs text-blue-200/60 text-center">
            © {new Date().getFullYear()} Mini Placement Portal. All rights reserved.
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Login</h2>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back! Please login to your account.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                  placeholder="Enter your registered email"
                  className="pl-9 text-sm"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-xs text-slate-400">
                  Forgot password? Contact TPO
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-9 text-sm"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm mt-4"
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
