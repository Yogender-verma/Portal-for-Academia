import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  User, 
  LogOut, 
  Menu, 
  Target,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentProfile } from '../../context/StudentProfileContext';

interface StudentHeaderProps {
  onMobileMenuToggle?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({ 
  onMobileMenuToggle,
  onNavigateTab
}) => {
  const { user, logout } = useAuth();
  const { profile } = useStudentProfile();
  
  const displayName = profile.personalInfo.fullName || user?.displayName || 'Student Profile';
  const targetRole = profile.careerPreferences.targetRole || 'Not Selected';
  const college = profile.academicInfo.college || 'College Not Set';
  const avatarUrl = profile.personalInfo.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = [
    {
      id: 'n1',
      title: 'Interview Scheduled',
      time: 'Company XYZ • 15 Sep 2026',
      icon: Calendar,
      color: 'text-indigo-400 bg-indigo-500/10'
    },
    {
      id: 'n2',
      title: 'Skill Gap Priority Alert',
      time: 'Testing skill needs boost for target match',
      icon: AlertCircle,
      color: 'text-amber-400 bg-amber-500/10'
    },
    {
      id: 'n3',
      title: 'Application Shortlisted',
      time: 'Frontend Developer Intern at Company XYZ',
      icon: CheckCircle2,
      color: 'text-emerald-400 bg-emerald-500/10'
    }
  ];

  return (
    <header className="bg-slate-950/80 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
      
      {/* Left: Mobile Burger & Greeting */}
      <div className="flex items-center gap-4">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Welcome back{displayName ? `, ${displayName.split(' ')[0]}` : ''} 👋
          </h1>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-indigo-400 font-medium">
              <Target className="w-3.5 h-3.5" />
              Target Role: <strong className="text-white font-semibold">{targetRole}</strong>
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-400">{college}</span>
          </div>
        </div>
      </div>

      {/* Right: Notifications & Profile Menu */}
      <div className="flex items-center gap-3">
        
        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="relative p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded-full font-bold">3 New</span>
              </div>

              <div className="space-y-3">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-colors">
                      <div className={`p-2 rounded-lg ${n.color} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-white leading-snug">{n.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-normal mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800 text-center">
                <button 
                  onClick={() => {
                    setNotificationsOpen(false);
                    if (onNavigateTab) onNavigateTab('dashboard');
                  }}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  View All Activity →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all focus:outline-none"
          >
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="w-8 h-8 rounded-lg object-cover border border-indigo-500/30"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">{displayName}</span>
              <span className="text-[10px] text-slate-400">Student</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-slate-800/80 mb-1">
                <p className="text-xs font-bold text-white">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{profile.personalInfo.email || user?.email}</p>
                <span className="inline-block mt-1.5 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  {targetRole} Track
                </span>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onNavigateTab) onNavigateTab('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>View Student Profile</span>
                </button>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-800/80">
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
