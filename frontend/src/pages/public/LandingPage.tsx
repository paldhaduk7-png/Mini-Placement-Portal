import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Briefcase, Building, Users, ArrowRight, BookOpen, CheckCircle, ChevronRight, BarChart3, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/hooks/useAppSelector';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, isInitialized, user, isLoading } = useAppSelector((state) => state.auth);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Loading Mini Placement Portal..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      {/* 1. Header/Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 leading-tight">LDCE Placement Cell</span>
                <span className="text-xs font-medium text-slate-500 leading-tight">Mini Placement Portal</span>
              </div>
            </div>

            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Home</a>
              <a href="#about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">About Placement Cell</a>
              <a href="#stats" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Recruiters</a>
              <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Contact</a>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to={user?.role === 'TPO' ? "/tpo/dashboard" : "/student/dashboard"}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 h-9">
                    Go to Dashboard
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/tpo/login" className="hidden sm:block text-xs font-semibold text-slate-600 hover:text-blue-600 px-2">
                    TPO Login
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" className="text-xs h-9 border-slate-300 text-slate-700 hover:bg-slate-50">
                      Student Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 shadow-sm">
                      Student Registration
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section & 3. Visual Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-36 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-blue-800 text-xs font-semibold mb-6">
                <SparkleIcon className="w-4 h-4 text-blue-600" />
                Official Portal of LDCE
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Connecting LDCE Students with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Career Opportunities</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                Mini Placement Portal for streamlined campus recruitment, student applications, and placement drive management.
              </p>
              
              {!isAuthenticated && (
                <div className="flex flex-wrap items-center gap-4">
                  <Link to="/register">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-xl h-12 px-6 text-sm font-semibold">
                      Student Registration
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-xl h-12 px-6 text-sm font-semibold shadow-sm">
                      Student Login
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Visual Section */}
            <div className="relative lg:ml-auto w-full max-w-lg">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-blue-200 to-indigo-100 blur-2xl opacity-60"></div>
              <div className="relative bg-white border border-slate-200 rounded-3xl shadow-xl p-8 overflow-hidden">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-2xl p-6 flex flex-col items-center justify-center aspect-square shadow-sm border border-blue-100/50">
                    <div className="bg-blue-600 text-white p-4 rounded-xl mb-3 shadow-md shadow-blue-200">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <span className="font-semibold text-slate-800 text-sm">Students</span>
                  </div>
                  <div className="bg-indigo-50 rounded-2xl p-6 flex flex-col items-center justify-center aspect-square shadow-sm border border-indigo-100/50 mt-8">
                    <div className="bg-indigo-600 text-white p-4 rounded-xl mb-3 shadow-md shadow-indigo-200">
                      <Building className="w-8 h-8" />
                    </div>
                    <span className="font-semibold text-slate-800 text-sm">Recruiters</span>
                  </div>
                  <div className="bg-emerald-50 rounded-2xl p-6 flex flex-col items-center justify-center aspect-square shadow-sm border border-emerald-100/50 -mt-8">
                    <div className="bg-emerald-600 text-white p-4 rounded-xl mb-3 shadow-md shadow-emerald-200">
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <span className="font-semibold text-slate-800 text-sm">Placement Drives</span>
                  </div>
                  <div className="bg-amber-50 rounded-2xl p-6 flex flex-col items-center justify-center aspect-square shadow-sm border border-amber-100/50">
                    <div className="bg-amber-500 text-white p-4 rounded-xl mb-3 shadow-md shadow-amber-200">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <span className="font-semibold text-slate-800 text-sm">Opportunities</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 4. About Placement Cell */}
      <section id="about" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">About the Placement Cell</h2>
            <p className="text-slate-600">The Mini Placement Portal is designed to bridge the gap between talented students and top-tier recruiters, providing a seamless and transparent recruitment experience.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition-transform duration-500">
                <GraduationCap className="w-48 h-48" />
              </div>
              <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">For Students</h3>
              <ul className="space-y-3">
                {[
                  "Maintain and update your comprehensive academic profile",
                  "View eligibility for upcoming recruitment drives",
                  "Apply for companies effortlessly with a single click",
                  "Track the status of all your applications in real-time"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                    <span className="text-slate-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
               <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition-transform duration-500">
                <Building className="w-48 h-48" />
              </div>
              <div className="bg-indigo-100 text-indigo-700 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">For TPO / Placement Cell</h3>
              <ul className="space-y-3">
                {[
                  "Efficiently manage and verify student academic profiles",
                  "Onboard new recruiters and add company profiles",
                  "Create and schedule campus recruitment drives",
                  "Automatically filter and manage eligible student applicants"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-indigo-500 mr-3 shrink-0" />
                    <span className="text-slate-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600">A streamlined process for everyone involved.</p>
          </div>

          <div className="space-y-12">
            {/* Student Flow */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Student Workflow
              </h3>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {[
                  { step: '1', title: 'Register', desc: 'Create account' },
                  { step: '2', title: 'Complete Profile', desc: 'Add academics' },
                  { step: '3', title: 'Verification', desc: 'TPO approves' },
                  { step: '4', title: 'View Drives', desc: 'Check eligibility' },
                  { step: '5', title: 'Apply', desc: 'Submit application' },
                ].map((item, i, arr) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center text-center w-32 relative">
                      <div className="w-12 h-12 bg-white rounded-full border-2 border-blue-200 flex items-center justify-center text-blue-700 font-bold mb-3 shadow-sm z-10">
                        {item.step}
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="hidden md:block flex-1 h-0.5 bg-slate-200 relative">
                        <div className="absolute -right-2 -top-1.5 text-slate-300">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-slate-200 max-w-4xl mx-auto"></div>

            {/* TPO Flow */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-center gap-2">
                <Users2 className="w-5 h-5 text-indigo-600" />
                TPO Workflow
              </h3>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
                {[
                  { step: '1', title: 'Login', desc: 'Access dashboard' },
                  { step: '2', title: 'Manage Students', desc: 'Verify records' },
                  { step: '3', title: 'Add Company', desc: 'Recruiter details' },
                  { step: '4', title: 'Create Drive', desc: 'Set criteria' },
                  { step: '5', title: 'Manage', desc: 'Review applicants' },
                ].map((item, i, arr) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center text-center w-32 relative">
                      <div className="w-12 h-12 bg-white rounded-full border-2 border-indigo-200 flex items-center justify-center text-indigo-700 font-bold mb-3 shadow-sm z-10">
                        {item.step}
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="hidden md:block flex-1 h-0.5 bg-slate-200 relative">
                        <div className="absolute -right-2 -top-1.5 text-slate-300">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Stats Section */}
      <section id="stats" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { label: 'Registered Students', value: '2000+', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Recruiters', value: '50+', icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Placement Drives', value: '100+', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Applications', value: '5000+', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((stat, i) => (
              <div key={i} className="border border-slate-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-6 md:mb-0">
            <div className="bg-slate-800 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">LDCE Placement Cell</span>
              <span className="text-xs font-medium text-slate-400 leading-tight">Mini Placement Portal</span>
            </div>
          </div>
          
          <div className="text-sm text-slate-400 text-center md:text-right">
            <p>L.D. College of Engineering, Ahmedabad</p>
            <p className="mt-1">© {new Date().getFullYear()} Mini Placement Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

export default LandingPage;
