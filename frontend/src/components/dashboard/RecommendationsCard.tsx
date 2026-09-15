import React from 'react';
import { Compass, BookOpen, Sparkles, Code2, FileCheck2, ArrowRight } from 'lucide-react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { calculateDetailedSkillGaps } from '../../utils/skillGapCalculator';

interface RecommendationsCardProps {
  onNavigateTab?: (tab: string) => void;
}

export const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ onNavigateTab }) => {
  const { profile } = useStudentProfile();
  const gapAnalysis = calculateDetailedSkillGaps(profile);

  const topGaps = gapAnalysis.topPriorityGaps.slice(0, 4);

  const recommendations = topGaps.length > 0 ? topGaps.map((gap, idx) => ({
    id: `rec-${gap.skillName}`,
    targetSkill: gap.skillName,
    title: `Boost ${gap.skillName} Proficiency`,
    description: `Your level is ${gap.studentLevel}% vs target ${gap.requiredLevel}%. Complete interactive coding & learning modules.`,
    actionText: `Practice ${gap.skillName}`,
    actionType: idx % 2 === 0 ? 'learn' : 'assessment',
  })) : [
    {
      id: 'rec-complete-profile',
      targetSkill: 'Profile Setup',
      title: 'Complete Target Role & Skill Profile',
      description: 'Select your target role and add technical skills to generate AI recommendations.',
      actionText: 'Update Profile',
      actionType: 'learn',
    }
  ];

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'learn': return BookOpen;
      case 'resources': return Sparkles;
      case 'project': return Code2;
      case 'assessment': return FileCheck2;
      default: return Compass;
    }
  };

  const handleAction = (type: string) => {
    if (!onNavigateTab) return;
    if (type === 'assessment') onNavigateTab('compiler');
    else if (type === 'learn' || type === 'resources') onNavigateTab('career-roadmap');
    else onNavigateTab('skill-gaps');
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">What Should You Do Next?</h3>
            <p className="text-xs text-slate-400">AI-recommended action plan to bridge your skill gaps</p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold">
          High Priority Actions
        </span>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, idx) => {
          const Icon = getActionIcon(rec.actionType);

          return (
            <div 
              key={rec.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      0{idx + 1}
                    </div>
                    <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {rec.targetSkill}
                    </span>
                  </div>
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {rec.title}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleAction(rec.actionType)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3.5 bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all group-hover:scale-[1.01] cursor-pointer"
                >
                  <span>{rec.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
