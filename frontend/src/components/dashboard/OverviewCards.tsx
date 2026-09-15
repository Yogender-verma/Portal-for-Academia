import React from 'react';
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  Route, 
  Briefcase, 
  UserCheck, 
  ArrowUpRight
} from 'lucide-react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { calculateDetailedSkillGaps, calculateOverallSkillScore } from '../../utils/skillGapCalculator';

interface OverviewCardsProps {
  onNavigateTab?: (tab: string) => void;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ onNavigateTab }) => {
  const { profile, completion } = useStudentProfile();

  const skillScore = calculateOverallSkillScore(profile.technicalSkills);
  const detailedAnalysis = calculateDetailedSkillGaps(profile);

  const matchPercentage = detailedAnalysis.hasRoleSaved ? detailedAnalysis.overallReadiness : 0;
  const skillsToImprove = detailedAnalysis.topPriorityGaps;
  const skillsToImproveNames = skillsToImprove.map((g) => g.skillName);

  return (
    <div className="space-y-6">
      
      {/* 5 Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1 — Current Skill Score */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('skills')}
          className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Skill Score</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {skillScore}%
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              ↑ 8%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            Calculated from {profile.technicalSkills.length} Technical Skills
          </p>
        </div>

        {/* Card 2 — Industry Skill Match */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('skill-gaps')}
          className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-sky-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Industry Match</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {matchPercentage}%
            </span>
            <span className="text-[11px] text-sky-400 font-semibold">Matched</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium truncate">
            Target: {detailedAnalysis.role || 'Not Set'}
          </p>
        </div>

        {/* Card 3 — Skills Missing / To Improve */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('skill-gaps')}
          className="glass-card p-5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer group bg-amber-950/10"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">Skills to Improve</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {skillsToImprove.length}
            </span>
            <span className="text-xs font-semibold text-amber-400">Gaps Identified</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate font-medium">
            {skillsToImproveNames.length > 0 ? skillsToImproveNames.slice(0, 3).join(', ') : 'All role skills met!'}
          </p>
        </div>

        {/* Card 4 — Career Roadmap Progress */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('career-roadmap')}
          className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Roadmap Progress</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Route className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              65%
            </span>
            <span className="text-xs font-semibold text-indigo-400 font-sans">Completed</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full transition-all duration-500"
              style={{ width: '65%' }}
            />
          </div>
        </div>

        {/* Card 5 — Active Applications */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('progress')}
          className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Applications</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              4
            </span>
            <span className="text-xs font-semibold text-emerald-400">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            3 Internships • 1 Job
          </p>
        </div>

      </div>

      {/* Dynamic Profile Completion Bar Banner Card */}
      <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Dynamic Profile Completion Status</h3>
              <span className="text-xs font-mono font-extrabold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                {completion.totalPercentage}%
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {completion.missingItems.length > 0 ? (
                <>
                  Complete your profile items: <span className="text-amber-300 font-semibold">{completion.missingItems.slice(0, 2).join(' • ')}</span>
                </>
              ) : (
                <span className="text-emerald-400 font-semibold">Your profile is 100% complete!</span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab && onNavigateTab('profile')}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all shrink-0"
        >
          Manage Profile
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
