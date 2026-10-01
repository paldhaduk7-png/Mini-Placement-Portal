import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, GraduationCap, Building, Building2, Briefcase, FileText, FileCheck, CheckCircle, BadgeCheck, ArrowRight, Menu, X } from 'lucide-react';
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

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.login-dropdown-container')) {
        setIsLoginDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <div className={`relative login-dropdown-container ${isMobile ? 'w-full' : 'inline-block text-left'}`}>
      <Button
        variant="outline"
        onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
        className={`${
          isMobile
            ? "w-full justify-between border-slate-300 text-slate-700 bg-white"
            : "border-slate-300 text-slate-700 hover:bg-slate-50 bg-white w-32 justify-between"
        } h-10 px-4 text-sm font-semibold shadow-sm`}
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
      <section id="about" className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Campus Placement, Simplified</h2>
            <p className="text-slate-600 text-base md:text-lg">
              One centralized platform for students and the placement cell to manage campus recruitment efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-[20px] p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Student Profiles</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Manage and maintain placement-ready student information.</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-[20px] p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Recruitment Drives</h3>
              <p className="text-sm text-slate-600 leading-relaxed">View upcoming companies and campus recruitment opportunities.</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-[20px] p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Eligibility</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Automatically identify students eligible for recruitment drives.</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-[20px] p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Applications</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Track student applications and recruitment progress.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">How It Works</h2>
            <p className="text-slate-600 text-base md:text-lg mb-4">
              Simple workflows for students and the placement cell.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Student Flow */}
            <div className="bg-white p-10 lg:p-12 rounded-[24px] shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full -mr-16 -mt-16 opacity-50 z-0"></div>
              <div className="relative z-10">
                <h3 className="text-sm font-black text-blue-600 tracking-widest uppercase mb-10 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Student
                </h3>
                
                <div className="relative border-l-2 border-slate-100 ml-4 space-y-10">
                  {[
                    { num: "01", text: "Register" },
                    { num: "02", text: "Complete Profile" },
                    { num: "03", text: "Profile Verification" },
                    { num: "04", text: "View Eligible Drives" },
                    { num: "05", text: "Apply" }
                  ].map((item, idx) => (
                    <div key={idx} className="relative flex items-center pl-8 group">
                      <div className="absolute -left-[17px] w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:border-blue-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors z-10">
                        {item.num}
                      </div>
                      <div className="font-semibold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TPO Flow */}
            <div className="bg-white p-10 lg:p-12 rounded-[24px] shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/70 rounded-bl-full -mr-16 -mt-16 opacity-50 z-0"></div>
              <div className="relative z-10">
                <h3 className="text-sm font-black text-indigo-600 tracking-widest uppercase mb-10 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  TPO
                </h3>
                
                <div className="relative border-l-2 border-slate-100 ml-4 space-y-10">
                  {[
                    { num: "01", text: "Login" },
                    { num: "02", text: "Manage Students" },
                    { num: "03", text: "Add Company" },
                    { num: "04", text: "Create Recruitment Drive" },
                    { num: "05", text: "Manage Eligible Students" }
                  ].map((item, idx) => (
                    <div key={idx} className="relative flex items-center pl-8 group">
                      <div className="absolute -left-[17px] w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors z-10">
                        {item.num}
                      </div>
                      <div className="font-semibold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">
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
      <footer id="contact" className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Left */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-lg inline-flex">
                  <img src="/images/ldce-logo.png" alt="LDCE Logo" className="h-10 w-10 object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-white leading-tight">LDCE Placement Cell</span>
                  <span className="text-sm font-medium text-blue-400 leading-tight">Mini Placement Portal</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 max-w-xs mt-2 leading-relaxed">
                Connecting students with career opportunities through streamlined campus recruitment.
              </p>
            </div>
            
            {/* Middle */}
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Quick Links</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><a href="/" className="hover:text-blue-400 transition-colors">Home</a></li>
                <li><a href="#about" className="hover:text-blue-400 transition-colors">About</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a></li>
                <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Right */}
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Portal</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Student Login</Link></li>
                <li><Link to="/register" className="hover:text-blue-400 transition-colors">Student Registration</Link></li>
                <li><Link to="/tpo/login" className="hover:text-blue-400 transition-colors">TPO Login</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <div>© 2026 Mini Placement Portal</div>
            <div>LDCE Placement Cell</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
