import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, School, LogOut, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchCollegeProfileFromBackend } from '../../services/collegeProfileApiService';

interface CollegeHeaderProps {
  onMenuClick?: () => void;
}

export const CollegeHeader: React.FC<CollegeHeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
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
    return user?.name || 'Academic Institution';
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

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      
      {/* Left Menu Toggle & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students, roll numbers, skills, placements..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        
        {/* Quick Report Download */}
        <button className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export Report</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
        </button>

        {/* Profile Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
            <School className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <span className="text-xs font-bold text-white block leading-tight max-w-[180px] truncate" title={collegeName}>
              {collegeName}
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
              Placement Cell
            </span>
          </div>

          <button
            onClick={() => logout()}
            title="Sign Out"
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

    </header>
  );
};
