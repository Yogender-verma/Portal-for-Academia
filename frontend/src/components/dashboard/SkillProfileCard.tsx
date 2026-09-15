import React from 'react';
import { BrainCircuit, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { PROFICIENCY_NUMERIC_MAP } from '../../utils/skillGapCalculator';

interface SkillProfileCardProps {
  onNavigateTab?: (tab: string) => void;
}

export const SkillProfileCard: React.FC<SkillProfileCardProps> = ({ onNavigateTab }) => {
  const { profile } = useStudentProfile();
  const skills = profile.technicalSkills;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 flex flex-col justify-between h-full">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Current Skill Profile</h3>
              <p className="text-xs text-slate-400">Extracted & verified technical capabilities</p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold">
            {skills.length} Skills Added
          </span>
        </div>

        {/* Skill Progress Bars List */}
        <div className="space-y-4 pt-5">
          {skills.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">No skills added to profile yet.</div>
          ) : (
            skills.slice(0, 6).map((skill) => {
              const numericLevel = PROFICIENCY_NUMERIC_MAP[skill.proficiency] || 25;
              let barColor = 'bg-indigo-500';
              let textColor = 'text-indigo-400';

              if (numericLevel >= 75) {
                barColor = 'bg-emerald-500';
                textColor = 'text-emerald-400';
              } else if (numericLevel >= 50) {
                barColor = 'bg-indigo-500';
                textColor = 'text-indigo-400';
              } else {
                barColor = 'bg-amber-500';
                textColor = 'text-amber-400';
              }

              return (
                <div key={skill.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      {skill.name}
                      {numericLevel >= 75 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {numericLevel < 50 && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                    </span>
                    <span className={`font-mono font-bold ${textColor}`}>
                      {skill.proficiency} ({numericLevel}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${numericLevel}%` }}
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
          onClick={() => onNavigateTab && onNavigateTab('profile')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-indigo-400 hover:text-indigo-300 rounded-xl transition-all"
        >
          <span>Manage Technical Skills in Profile</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
