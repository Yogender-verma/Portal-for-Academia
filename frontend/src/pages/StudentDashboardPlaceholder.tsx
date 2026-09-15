import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, LogOut, UserCheck, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboardPlaceholder: React.FC = () => {
  const { user, logout, isDemoMode } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-600 flex flex-col">
      
      {/* Dashboard Sticky Header */}
      <header className="bg-slate-950/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">SkillBridge</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium text-white">{user?.displayName}</span>
              <span className="text-slate-500">({user?.email})</span>
            </div>

            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-red-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
          
          {/* Top banner pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Authentication Verified</span>
            </div>

            <span className="text-xs font-mono text-slate-400">
              Session UID: <span className="text-indigo-400">{user?.uid}</span>
            </span>
          </div>

          {/* Welcome Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome to your <span className="text-gradient-accent">Student Portal</span>
            </h1>
            <p className="text-slate-300 text-lg font-medium">
              Your personalized skill journey starts here.
            </p>
          </div>

          {/* Logged in Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block">Student Name</span>
              <p className="text-base font-bold text-white">{user?.displayName}</p>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block">Email Address</span>
              <p className="text-base font-bold text-white">{user?.email}</p>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block">Institution</span>
              <p className="text-base font-bold text-white">{user?.college || 'Not specified'}</p>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block">Degree / Course</span>
              <p className="text-base font-bold text-white">{user?.course || 'Not specified'}</p>
            </div>

          </div>

          {/* Upcoming Phase 2 Notice */}
          <div className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Phase 1 Milestone Accomplished
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Public Landing Page and Authentication infrastructure are fully active. Future modules (AI Resume Intelligence, Skill Gap Analysis, Personal Roadmap & Internship Matching) will be integrated in Phase 2.
            </p>
          </div>

          {/* Demo Mode Indicator */}
          {isDemoMode && (
            <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Running in Demo Auth Mode. To switch to production Firebase Auth, add your Firebase keys into <code className="font-mono text-amber-200">frontend/.env</code>.
              </span>
            </div>
          )}

        </div>

      </main>
    </div>
  );
};
