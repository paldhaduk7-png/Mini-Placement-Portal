import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { loginUser, logout } from '@/features/auth/authSlice';
import authService from '@/services/auth.service';
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
  ShieldCheck,
  Briefcase,
  Users,
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

  const [localIsLoading, setLocalIsLoading] = useState(false);

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

    if (activeTab === 'TPO') {
      try {
        setLocalIsLoading(true);
        const response = await authService.tpoLogin({ email: email.trim(), password });
        if (response.requiresOtp) {
          toast.success(response.message || 'Verification code sent to your email.');
          navigate('/tpo/verify-otp', { state: { email: email.trim(), password } });
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || 'Invalid email or password.');
      } finally {
        setLocalIsLoading(false);
      }
      return;
    }

    try {
      const resultAction = await dispatch(
        loginUser({ email: email.trim(), password })
      );
      if (loginUser.fulfilled.match(resultAction)) {
        const loggedUser = resultAction.payload.user;

        const userRole = loggedUser.role as string;
        if ((activeTab as string) !== userRole) {
          dispatch(logout());
          if (userRole === 'STUDENT') {
            toast.error('Account found. Please login from the Student tab.');
          } else {
            toast.error('Account found. Please login from the TPO tab.');
          }
          return;
        }

        toast.success(`Welcome back!`);

        // Redirect according to real user role returned by backend
        if (userRole === 'TPO') {
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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100/90 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: LDCE Institutional Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#0b192c] via-[#0f223d] to-[#142d50] p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          {/* Subtle Institutional Geometric Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl pointer-events-none" />

          {/* Top: College Identity */}
          <div className="relative z-10">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-slate-200/40">
                <img
                  src="/images/ldce-logo.png"
                  alt="L.D. College of Engineering"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    // Graceful fallback if image path ever fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  L.D. College of Engineering
                </h1>
                <p className="text-xs font-medium text-slate-300">
                  Ahmedabad
                </p>
                <p className="text-[11px] font-semibold text-blue-400 tracking-wide mt-0.5">
                  Training & Placement Cell
                </p>
              </div>
            </div>

            {/* Portal Badge & Tagline */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/90 border border-blue-700/40 text-blue-300 text-[11px] font-semibold tracking-wider uppercase mb-2.5">
                <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                Mini Placement Portal
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Connecting students with campus recruitment opportunities.
              </p>
            </div>

            {/* Institutional Features Highlights */}
            <div className="hidden sm:flex flex-col gap-2.5 mt-8 pt-6 border-t border-slate-800/60 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-md bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Briefcase className="h-3.5 w-3.5" />
                </div>
                <span>Campus recruitment drives & eligibility evaluation</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-md bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <span>Direct student profile verification by TPO Cell</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-md bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <span>Official gateway for students & placement coordinators</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="relative z-10 pt-6 mt-6 border-t border-slate-800/70 text-[11px] text-slate-400 text-center lg:text-left">
            © {new Date().getFullYear()} L.D. College of Engineering • Ahmedabad
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-blue-800 uppercase bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              LDCE • TRAINING & PLACEMENT CELL
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to access the placement portal.
            </p>
            
            {/* Student / TPO Tab Toggle */}
            <div className="grid grid-cols-2 gap-1.5 mt-5 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveTab('STUDENT')}
                className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'STUDENT'
                    ? 'bg-white text-blue-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('TPO')}
                className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'TPO'
                    ? 'bg-white text-blue-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                TPO Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
              <span className="font-semibold shrink-0">Error:</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {activeTab === 'TPO' ? 'Official TPO Email' : 'Email / Phone Number'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  type={activeTab === 'TPO' ? 'email' : 'text'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'TPO' ? 'Enter official TPO email' : 'Enter email or phone number'}
                  className="pl-9 text-xs h-10 border-slate-200 focus:border-blue-500 rounded-lg"
                  autoComplete="username"
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
                  placeholder="Enter your password"
                  className="pl-9 pr-9 text-xs h-10 border-slate-200 focus:border-blue-500 rounded-lg"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              isLoading={isLoading || localIsLoading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg shadow-sm mt-3 text-xs h-10 transition-colors"
            >
              {activeTab === 'TPO' ? 'Sign In as TPO' : 'Login to Portal'}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </form>

          {activeTab === 'STUDENT' ? (
            <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
              >
                Register as Student
              </Link>
            </div>
          ) : (
            <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Official TPO administrators must authenticate via email OTP.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;
