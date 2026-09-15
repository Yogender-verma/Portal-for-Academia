import React from 'react';
import { Target, ArrowRight, TrendingDown } from 'lucide-react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { calculateDetailedSkillGaps } from '../../utils/skillGapCalculator';

interface SkillGapsCardProps {
  onNavigateTab?: (tab: string) => void;
}

export const SkillGapsCard: React.FC<SkillGapsCardProps> = ({ onNavigateTab }) => {
  const { profile } = useStudentProfile();
  const detailedAnalysis = calculateDetailedSkillGaps(profile);
  const actionGaps = detailedAnalysis.topPriorityGaps.slice(0, 4);

  if (!detailedAnalysis.hasRoleSaved) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-amber-950/10 space-y-4 flex flex-col justify-between h-full text-center">
        <div className="space-y-3 py-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">🎯 Target Role Not Set</h3>
          <p className="text-xs text-slate-300 max-w-xs mx-auto">
            Select a target career role in your Profile to view industry skill requirements and your skill gap analysis.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab && onNavigateTab('profile')}
          className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          Go to Career Preferences →
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 flex flex-col justify-between h-full">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Your Top Skill Gaps</h3>
              <p className="text-xs text-slate-400">Target Role: <strong className="text-cyan-400">{detailedAnalysis.role}</strong></p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-semibold">
            {detailedAnalysis.gapCount} Priority Gaps
          </span>
        </div>

        {/* Skill Gap Cards List */}
        <div className="space-y-3 pt-5">
          {actionGaps.length === 0 ? (
            <div className="text-center py-6 text-xs text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              🎉 Outstanding! You have met or exceeded all benchmark requirements for {detailedAnalysis.role}.
            </div>
          ) : (
            actionGaps.map((gap, idx) => {
              const isHigh = gap.severity === 'High Gap';

              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isHigh 
                      ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/50' 
                      : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isHigh 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {isHigh ? '🔴 High Priority' : '🟡 Medium Priority'}
                      </span>
                      <h4 className="text-sm font-bold text-white">{gap.skillName}</h4>
                    </div>
                    <span className="text-xs font-mono font-semibold text-red-400 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      -{gap.gap}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Current: <strong className="text-slate-200">{gap.studentLevel}%</strong></span>
                    <span>Required: <strong className="text-indigo-400">{gap.requiredLevel}%</strong></span>
                  </div>

                  {/* Progress Visual Delta Bar */}
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full ${isHigh ? 'bg-red-500' : 'bg-amber-500'}`} 
                      style={{ width: `${gap.studentLevel}%` }}
                    />
                    <div 
                      className="h-full bg-slate-800 border-l border-dashed border-white/20 opacity-60" 
                      style={{ width: `${gap.gap}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Button Footer */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          onClick={() => onNavigateTab && onNavigateTab('skill-gaps')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-amber-400 hover:text-amber-300 rounded-xl transition-all"
        >
          <span>View Skill Gap Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
