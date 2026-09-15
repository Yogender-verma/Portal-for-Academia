import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Home, 
  GraduationCap, 
  BarChart3, 
  Briefcase, 
  Award, 
  Handshake, 
  FileSpreadsheet, 
  School, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchCollegeProfileFromBackend } from '../../services/collegeProfileApiService';

interface CollegeSidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const CollegeSidebar: React.FC<CollegeSidebarProps> = ({ 
  mobileOpen = false,
  setMobileOpen
}) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = user?.id || user?.uid;

  const [collegeName, setCollegeName] = useState<string>(() => {
    if (userId) {
      const saved = localStorage.getItem(`sb_college_profile_${userId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.institutionName) return parsed.institutionName;
        } catch (e) {}
      }
    }
    return user?.name || 'Placement Cell';
  });

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    fetchCollegeProfileFromBackend(userId).then(res => {
      if (isMounted && res.status === 'success' && res.profile?.institutionName) {
        setCollegeName(res.profile.institutionName);
      }
    }).catch(() => {});

    const handleProfileUpdate = (e: Event) => {
      const customEv = e as CustomEvent;
      if (customEv.detail?.institutionName) {
        setCollegeName(customEv.detail.institutionName);
      }
    };

    window.addEventListener('college-profile-updated', handleProfileUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('college-profile-updated', handleProfileUpdate);
    };
  }, [userId, user]);

  const currentPath = location.pathname;

  const handleNavigate = (path: string) => {
    navigate(path);
    if (setMobileOpen) setMobileOpen(false);
  };

  const navItemClass = (path: string) => `
    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer group
    ${currentPath === path || (path !== '/college/dashboard' && currentPath.startsWith(path))
      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 border border-emerald-400/30' 
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight block">SkillBridge</span>
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <School className="w-3 h-3" /> College Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-170px)] custom-scrollbar">
          
          {/* Dashboard */}
          <div 
            onClick={() => handleNavigate('/college/dashboard')} 
            className={navItemClass('/college/dashboard')}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </div>

          {/* Students */}
          <div 
            onClick={() => handleNavigate('/college/students')} 
            className={navItemClass('/college/students')}
          >
            <GraduationCap className="w-4 h-4 shrink-0 text-cyan-400" />
            <span className="flex-1">Students</span>
          </div>

          {/* Skill Analytics */}
          <div 
            onClick={() => handleNavigate('/college/skills')} 
            className={navItemClass('/college/skills')}
          >
            <BarChart3 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="flex-1">Skill Analytics</span>
          </div>

          {/* Internships */}
          <div 
            onClick={() => handleNavigate('/college/internships')} 
            className={navItemClass('/college/internships')}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span className="flex-1">Internships</span>
          </div>

          {/* Placements */}
          <div 
            onClick={() => handleNavigate('/college/placements')} 
            className={navItemClass('/college/placements')}
          >
            <Award className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="flex-1">Placements</span>
          </div>

          {/* Industry Collaboration */}
          <div 
            onClick={() => handleNavigate('/college/industry')} 
            className={navItemClass('/college/industry')}
          >
            <Handshake className="w-4 h-4 shrink-0 text-sky-400" />
            <span className="flex-1">Industry Collaboration</span>
          </div>

          {/* Career Readiness */}
          <div 
            onClick={() => handleNavigate('/college/readiness')} 
            className={navItemClass('/college/readiness')}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-violet-400" />
            <span className="flex-1">Career Readiness</span>
          </div>

          {/* Reports */}
          <div 
            onClick={() => handleNavigate('/college/reports')} 
            className={navItemClass('/college/reports')}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0 text-indigo-400" />
            <span className="flex-1">Reports</span>
          </div>

          {/* College Profile */}
          <div 
            onClick={() => handleNavigate('/college/profile')} 
            className={navItemClass('/college/profile')}
          >
            <School className="w-4 h-4 shrink-0" />
            <span>College Profile</span>
          </div>

        </nav>
      </div>

      {/* Bottom Footer Logout */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-medium text-slate-300 truncate max-w-[130px]" title={collegeName}>
              {collegeName}
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
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
