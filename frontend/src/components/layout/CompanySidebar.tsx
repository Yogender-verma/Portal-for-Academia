import React from 'react';
import { 
  Compass, 
  Home, 
  PlusSquare, 
  Briefcase, 
  Users, 
  Award, 
  Calendar, 
  Building, 
  LogOut, 
  Building2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface CompanySidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const CompanySidebar: React.FC<CompanySidebarProps> = ({ 
  mobileOpen = false,
  setMobileOpen
}) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const handleNavigate = (path: string) => {
    navigate(path);
    if (setMobileOpen) setMobileOpen(false);
  };

  const navItemClass = (path: string) => `
    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer group
    ${currentPath === path || (path !== '/company/dashboard' && currentPath.startsWith(path))
      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25 border border-sky-400/30' 
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
    }
  `;

  return (
    <aside 
      className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-xl z-50 flex flex-col justify-between transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      
      {/* Top Brand & Header */}
      <div>
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight block">SkillBridge</span>
              <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Company Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-170px)] custom-scrollbar">
          
          {/* Dashboard */}
          <div 
            onClick={() => handleNavigate('/company/dashboard')} 
            className={navItemClass('/company/dashboard')}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </div>

          {/* Post Opportunity */}
          <div 
            onClick={() => handleNavigate('/company/post-opportunity')} 
            className={navItemClass('/company/post-opportunity')}
          >
            <PlusSquare className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="flex-1">Post Opportunity</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 opacity-60 group-hover:opacity-100" />
          </div>

          {/* My Opportunities */}
          <div 
            onClick={() => handleNavigate('/company/opportunities')} 
            className={navItemClass('/company/opportunities')}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span className="flex-1">My Opportunities</span>
          </div>

          {/* Applicants */}
          <div 
            onClick={() => handleNavigate('/company/applicants')} 
            className={navItemClass('/company/applicants')}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="flex-1">Applicants</span>
          </div>

          {/* Top Talent – Internships */}
          <div 
            onClick={() => handleNavigate('/company/top-talent/internships')} 
            className={navItemClass('/company/top-talent/internships')}
          >
            <Award className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="flex-1">Top Talent – Internships</span>
          </div>

          {/* Top Talent – Jobs */}
          <div 
            onClick={() => handleNavigate('/company/top-talent/jobs')} 
            className={navItemClass('/company/top-talent/jobs')}
          >
            <Award className="w-4 h-4 shrink-0 text-indigo-400" />
            <span className="flex-1">Top Talent – Jobs</span>
          </div>

          {/* Interviews */}
          <div 
            onClick={() => handleNavigate('/company/interviews')} 
            className={navItemClass('/company/interviews')}
          >
            <Calendar className="w-4 h-4 shrink-0 text-sky-400" />
            <span className="flex-1">Interviews</span>
          </div>

          {/* Company Profile */}
          <div 
            onClick={() => handleNavigate('/company/profile')} 
            className={navItemClass('/company/profile')}
          >
            <Building className="w-4 h-4 shrink-0" />
            <span>Company Profile</span>
          </div>

        </nav>
      </div>

      {/* Bottom Footer Logout */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] font-medium text-slate-300 truncate max-w-[130px]">
              {user?.name || 'Recruiter Portal'}
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-red-400 bg-slate-900/80 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
};
