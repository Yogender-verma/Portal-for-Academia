import React from 'react';
import { Route, CheckCircle2, RefreshCw, Lock, ArrowRight } from 'lucide-react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { calculateDetailedSkillGaps } from '../../utils/skillGapCalculator';

interface RoadmapPreviewCardProps {
  onNavigateTab?: (tab: string) => void;
}

export const RoadmapPreviewCard: React.FC<RoadmapPreviewCardProps> = ({ onNavigateTab }) => {
  const { profile } = useStudentProfile();
  const gapAnalysis = calculateDetailedSkillGaps(profile);

  const targetRole = profile.careerPreferences.targetRole || 'Not Selected';
  const progressPercent = gapAnalysis.overallReadiness;
  const steps = gapAnalysis.allSkillItems.slice(0, 7);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Your Career Roadmap</h3>
            <p className="text-xs text-slate-400">Sequence tailored for {targetRole}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            {progressPercent}% Completed
          </span>
        </div>
      </div>

      {/* Connected Timeline Steps */}
      <div className="relative">
        
        {/* Desktop Horizontal Line */}
        <div className="hidden lg:block absolute top-6 left-6 right-6 h-0.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-slate-800 z-0" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 relative z-10">
          {steps.map((step, idx) => {
            const isCompleted = step.gap === 0 && step.studentLevel > 0;
            const isInProgress = step.gap > 0 && step.studentLevel > 0;
            const isLocked = step.studentLevel === 0;

            return (
              <div 
                key={step.skillName}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isCompleted 
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                    : isInProgress 
                    ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300 ring-2 ring-indigo-500/30' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase opacity-80">
                      Step {idx + 1}
                    </span>
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {isInProgress && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />}
                    {isLocked && <Lock className="w-4 h-4 text-slate-500" />}
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1 line-clamp-1">
                    {step.skillName}
                  </h4>

                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                    {step.category} • Target {step.requiredLevel}%
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] font-semibold tracking-wider uppercase">
                  {isCompleted && <span className="text-emerald-400">✓ Mastered</span>}
                  {isInProgress && <span className="text-indigo-400">🔄 In Progress</span>}
                  {isLocked && <span className="text-slate-500">🔒 To Learn</span>}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Footer CTA */}
      <div className="pt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <span>Target Role: <strong className="text-white font-semibold">{targetRole}</strong></span>
        </div>

        <button
          onClick={() => onNavigateTab && onNavigateTab('career-roadmap')}
          className="inline-flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <span>Continue Roadmap</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
