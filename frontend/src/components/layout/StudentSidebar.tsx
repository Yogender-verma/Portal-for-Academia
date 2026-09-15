import React from 'react';
import { 
  Compass, 
  Home, 
  Target, 
  Route, 
  Briefcase, 
  Building2, 
  TrendingUp, 
  User, 
  LogOut, 
  GraduationCap,
  Sparkles,
  Code2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StudentSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  mobileOpen = false,
  setMobileOpen
}) => {
  const { logout } = useAuth();

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (setMobileOpen) setMobileOpen(false);
  };

  const navItemClass = (tabId: string) => `
    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer
    ${activeTab === tabId || activeTab.startsWith(tabId)
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30' 
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight block">SkillBridge</span>
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> Student Portal
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
          
          {/* Dashboard */}
          <div 
            onClick={() => handleTabClick('dashboard')} 
            className={navItemClass('dashboard')}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </div>

          {/* Skill Gap Analysis */}
          <div 
            onClick={() => handleTabClick('skill-gaps')} 
            className={navItemClass('skill-gaps')}
          >
            <Target className="w-4 h-4 shrink-0" />
            <span className="flex-1">Skill Gap Analysis</span>
          </div>

          {/* Career Roadmap */}
          <div 
            onClick={() => handleTabClick('career-roadmap')} 
            className={navItemClass('career-roadmap')}
          >
            <Route className="w-4 h-4 shrink-0" />
            <span className="flex-1">Career Roadmap</span>
          </div>

          {/* Internships */}
          <div 
            onClick={() => handleTabClick('internships')} 
            className={navItemClass('internships')}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span className="flex-1">Internships</span>
          </div>

          {/* Jobs */}
          <div 
            onClick={() => handleTabClick('jobs')} 
            className={navItemClass('jobs')}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="flex-1">Jobs</span>
          </div>

          {/* Code Compiler / Skill Assessment Lab (Before Profile) */}
          <div 
            onClick={() => handleTabClick('compiler')} 
            className={navItemClass('compiler')}
          >
            <Code2 className="w-4 h-4 shrink-0 text-cyan-400" />
            <span className="flex-1">Code Compiler</span>
          </div>

          {/* My Progress */}
          <div 
            onClick={() => handleTabClick('progress')} 
            className={navItemClass('progress')}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>My Progress</span>
          </div>

          {/* Profile */}
          <div 
            onClick={() => handleTabClick('profile')} 
            className={navItemClass('profile')}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Profile</span>
          </div>

        </nav>
      </div>

      {/* Bottom Footer Logout */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-medium text-slate-300">SIH 26044 AI Engine</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
