import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { loginUser, logout } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, isAuthenticated, isInitialized, user } = useAppSelector(
    (state) => state.auth
  );

  const [activeTab, setActiveTab] = useState<'STUDENT' | 'TPO'>(
    location.pathname.includes('/tpo/login') ? 'TPO' : 'STUDENT'
  );
  const [email, setEmail] = useState((location.state as any)?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // If already authenticated with a valid backend session, redirect to role's dashboard
  React.useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      if (user.role === 'TPO') {
        navigate('/tpo/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [isInitialized, isAuthenticated, user, navigate]);

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
      const resultAction = await dispatch(
        loginUser({ email: email.trim(), password })
      );
      if (loginUser.fulfilled.match(resultAction)) {
        const loggedUser = resultAction.payload.user;

        if (activeTab !== loggedUser.role) {
          dispatch(logout());
          if (loggedUser.role === 'STUDENT') {
            toast.error('Account found. Please login from the Student tab.');
          } else {
            toast.error('Account found. Please login from the TPO tab.');
          }
          return;
        }

        toast.success(`Welcome back!`);

        // Redirect according to real user role returned by backend
        if (loggedUser.role === 'TPO') {
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

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Login</h2>
            
            {/* Student / TPO Tab Toggle */}
            <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('STUDENT')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'STUDENT'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('TPO')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'TPO'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                TPO
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email / Phone number
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
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pl-9 pr-9 text-xs h-10"
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-blue-600 hover:underline cursor-pointer">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg shadow-sm mt-3 text-xs h-10"
            >
              Login
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </form>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Register
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
