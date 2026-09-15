import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Menu, X, ArrowRight, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRoleDashboard } from '../auth/ProtectedRoute';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    // If on landing page, scroll to element
    if (window.location.pathname === '/') {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${targetId}`);
    }
  };

  const dashboardUrl = getRoleDashboard(user?.role);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 py-3 shadow-lg shadow-black/40' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                SkillBridge
                <span className="text-[10px] font-semibold tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-full uppercase">
                  SIH 2026
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              onClick={(e) => handleNavClick(e, 'features')}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a 
              href="#why-skillbridge" 
              onClick={(e) => handleNavClick(e, 'why-skillbridge')}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Why SkillBridge
            </a>
            <a 
              href="#faq" 
              onClick={(e) => handleNavClick(e, 'faq')}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={dashboardUrl}
                  className="flex items-center gap-2 text-sm font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 px-4 py-2 rounded-lg transition-all"
                >
                  <UserCircle className="w-4 h-4 text-indigo-400" />
                  Portal Dashboard
                </Link>
                <button
                  onClick={() => logout()}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 px-4 py-2 rounded-lg shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign Up
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-900 border border-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 px-4 pt-4 pb-6 mt-3 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3">
            <a
              href="#features"
              onClick={(e) => handleNavClick(e, 'features')}
              className="text-base font-medium text-slate-200 hover:text-indigo-400 px-3 py-2 rounded-md hover:bg-slate-900"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className="text-base font-medium text-slate-200 hover:text-indigo-400 px-3 py-2 rounded-md hover:bg-slate-900"
            >
              How It Works
            </a>
            <a
              href="#why-skillbridge"
              onClick={(e) => handleNavClick(e, 'why-skillbridge')}
              className="text-base font-medium text-slate-200 hover:text-indigo-400 px-3 py-2 rounded-md hover:bg-slate-900"
            >
              Why SkillBridge
            </a>
            <a
              href="#faq"
              onClick={(e) => handleNavClick(e, 'faq')}
              className="text-base font-medium text-slate-200 hover:text-indigo-400 px-3 py-2 rounded-md hover:bg-slate-900"
            >
              FAQ
            </a>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
            {user ? (
              <Link
                to={dashboardUrl}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 text-center text-sm font-semibold text-white bg-indigo-600 px-4 py-2.5 rounded-lg"
              >
                Go to Portal Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-sm font-medium text-slate-200 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-sm font-semibold text-white bg-indigo-600 px-4 py-2.5 rounded-lg shadow-lg shadow-indigo-600/30"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
