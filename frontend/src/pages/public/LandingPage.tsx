import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, GraduationCap, Building, Briefcase, FileText, CheckCircle, ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/hooks/useAppSelector';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const campusImages = [
  '/fee51836-8791-4fcc-8808-191b6df7ad3e.jpeg',
  '/a4e9f742-f222-49eb-a4d9-97c4035277f4.jpeg',
  '/2c8652dd-5635-45d9-be3b-e2bca3e2a930.jpeg',
  '/8926d6f3-7bb0-4c08-ac60-a9184fd56b79.jpeg',
];

export const LandingPage: React.FC = () => {
  const { isAuthenticated, isInitialized, user, isLoading } = useAppSelector((state) => state.auth);
  const [currentImage, setCurrentImage] = useState(0);
  const [prevImage, setPrevImage] = useState(0);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => {
        setPrevImage(prev);
        return (prev + 1) % campusImages.length;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Loading Mini Placement Portal..." />
      </div>
    );
  }

  // Common login dropdown component
  const LoginDropdown = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`relative ${isMobile ? 'w-full' : 'inline-block text-left'}`}>
      <Button
        variant="outline"
        onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
        className={`${
          isMobile
            ? "w-full justify-between border-slate-300 text-slate-700 bg-white"
            : "border-slate-300 text-slate-700 hover:bg-slate-50 bg-white w-32 justify-between"
        } h-10 px-4 text-sm font-semibold shadow-sm`}
        onBlur={() => setTimeout(() => setIsLoginDropdownOpen(false), 200)}
      >
        Login
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>

      {isLoginDropdownOpen && (
        <div className={`absolute ${isMobile ? 'left-0 right-0' : 'right-0'} mt-2 w-full sm:w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden`}>
          <div className="py-1" role="menu">
            <Link
              to="/login"
              className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 font-medium border-b border-slate-50"
              role="menuitem"
            >
              Student Login
            </Link>
            <Link
              to="/tpo/login"
              className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 font-medium"
              role="menuitem"
            >
              TPO Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      {/* 1. Header/Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/images/ldce-logo.png" alt="LDCE Logo" className="h-10 w-10 object-contain" />
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-[#1a365d] leading-tight tracking-wide">LDCE Placement Cell</span>
                <span className="text-[11px] font-semibold text-slate-500 leading-tight">Mini Placement Portal</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-sm font-semibold text-slate-600 hover:text-[#1a365d] transition-colors">Home</a>
              <a href="#about" className="text-sm font-semibold text-slate-600 hover:text-[#1a365d] transition-colors">About</a>
              <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-[#1a365d] transition-colors">How It Works</a>
              <a href="#contact" className="text-sm font-semibold text-slate-600 hover:text-[#1a365d] transition-colors">Contact</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Link to={user?.role === 'TPO' ? "/tpo/dashboard" : "/student/dashboard"}>
                  <Button className="bg-[#1a365d] hover:bg-[#122540] text-white text-xs px-4 h-10 shadow-sm">
                    Go to Dashboard
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <LoginDropdown />
                  <Link to="/register">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-10 shadow-sm font-semibold px-5">
                      Student Registration
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-[#1a365d] focus:outline-none p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-4 shadow-lg absolute w-full left-0">
            <div className="flex flex-col space-y-3">
              <a href="#" className="text-sm font-semibold text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
              <a href="#about" className="text-sm font-semibold text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>About</a>
              <a href="#how-it-works" className="text-sm font-semibold text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>How It Works</a>
              <a href="#contact" className="text-sm font-semibold text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
            </div>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              {isAuthenticated ? (
                <Link to={user?.role === 'TPO' ? "/tpo/dashboard" : "/student/dashboard"} className="w-full">
                  <Button className="w-full bg-[#1a365d] hover:bg-[#122540] text-white">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <LoginDropdown isMobile />
                  <Link to="/register" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                      Student Registration
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 2 & 3. Hero Carousel Section */}
      <section className="relative w-full overflow-hidden flex items-center justify-center bg-slate-900" style={{ minHeight: '75vh', height: '80vh' }}>
        {/* Background Images Carousel */}
        {campusImages.map((img, index) => {
          let visibilityClasses = 'opacity-0 -z-20';
          if (index === currentImage) {
            visibilityClasses = 'opacity-100 z-0 transition-opacity duration-1000 ease-in-out';
          } else if (index === prevImage) {
            visibilityClasses = 'opacity-100 -z-10'; // Stay fully visible underneath the fading new image
          }

          return (
            <img
              key={img}
              src={img}
              alt="LDCE Campus"
              className={`absolute inset-0 w-full h-full object-cover ${visibilityClasses}`}
            />
          );
        })}

        {/* Subtle dark blue overlay */}
        <div className="absolute inset-0 bg-slate-950/35 z-10" />

        {/* Carousel Arrows */}
        <div className="absolute inset-0 z-20 flex items-center justify-between px-4">
          <button
            onClick={() => {
              setPrevImage(currentImage);
              setCurrentImage((currentImage - 1 + campusImages.length) % campusImages.length);
            }}
            className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
            aria-label="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button
            onClick={() => {
              setPrevImage(currentImage);
              setCurrentImage((currentImage + 1) % campusImages.length);
            }}
            className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
            aria-label="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
          {campusImages.map((_, index) => (
            <button
              key={index}
              aria-label={`Show slide ${index + 1}`}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImage ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/80'
              }`}
              onClick={() => {
                setPrevImage(currentImage);
                setCurrentImage(index);
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold mb-6 backdrop-blur-sm shadow-sm tracking-wider uppercase">
            LDCE PLACEMENT CELL
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4 drop-shadow-lg">
            Connecting LDCE Students<br className="hidden sm:block" /> with Career Opportunities
          </h1>
          
          <h2 className="text-xl md:text-2xl text-blue-200 font-semibold mb-6 tracking-wide drop-shadow-md">
            Mini Placement Portal
          </h2>
          
          <p className="text-base md:text-lg text-slate-200 max-w-2xl drop-shadow-md font-medium">
            Manage student profiles, recruitment drives and campus placement applications in one place.
          </p>
        </div>
      </section>

      {/* 4. Below Hero - About Portal Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Campus Placement, Simplified</h2>
            <p className="text-slate-600 text-base md:text-lg">
              One centralized platform for students and the placement cell to manage campus recruitment efficiently.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Student Profiles</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Manage and maintain placement-ready student information.</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Recruitment Drives</h3>
              <p className="text-sm text-slate-500 leading-relaxed">View upcoming companies and campus recruitment opportunities.</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Eligibility</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Automatically identify students eligible for recruitment drives.</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="bg-amber-50 text-amber-600 w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Applications</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Track student applications and recruitment progress.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">How It Works</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* Student Flow */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 z-0"></div>
              <div className="relative z-10">
                <h3 className="text-sm font-black text-blue-600 tracking-widest uppercase mb-8 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Student
                </h3>
                
                <div className="space-y-6">
                  {[
                    { num: "01", text: "Register" },
                    { num: "02", text: "Complete Profile" },
                    { num: "03", text: "Profile Verification" },
                    { num: "04", text: "View Eligible Drives" },
                    { num: "05", text: "Apply" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="text-2xl font-black text-slate-200 group-hover:text-blue-200 transition-colors">
                        {item.num}
                      </div>
                      <div className="font-semibold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TPO Flow */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 opacity-50 z-0"></div>
              <div className="relative z-10">
                <h3 className="text-sm font-black text-indigo-600 tracking-widest uppercase mb-8 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  TPO
                </h3>
                
                <div className="space-y-6">
                  {[
                    { num: "01", text: "Login" },
                    { num: "02", text: "Manage Students" },
                    { num: "03", text: "Add Company" },
                    { num: "04", text: "Create Recruitment Drive" },
                    { num: "05", text: "Manage Eligible Students" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="text-2xl font-black text-slate-200 group-hover:text-indigo-200 transition-colors">
                        {item.num}
                      </div>
                      <div className="font-semibold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors">
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer id="contact" className="bg-white text-slate-600 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-4 mb-6 md:mb-0">
            <img src="/images/ldce-logo.png" alt="LDCE Logo" className="h-12 w-12 object-contain" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 leading-tight">LDCE Placement Cell</span>
              <span className="text-xs font-medium text-slate-500 leading-tight">Mini Placement Portal</span>
            </div>
          </div>
          
          <div className="text-sm text-slate-500 text-center md:text-right font-medium">
            © 2026 Mini Placement Portal
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
