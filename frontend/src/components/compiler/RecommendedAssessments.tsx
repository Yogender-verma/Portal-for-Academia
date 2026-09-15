import React from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { calculateDetailedSkillGaps } from '../../utils/skillGapCalculator';
import type { CodingQuestion } from '../../types/assessment';
import { Target, ArrowRight, Zap } from 'lucide-react';

interface RecommendedAssessmentsProps {
  onSelectAssessment: (question: CodingQuestion) => void;
  questions: CodingQuestion[];
}

export const RecommendedAssessments: React.FC<RecommendedAssessmentsProps> = ({
  onSelectAssessment,
  questions,
}) => {
  const { profile } = useStudentProfile();
  const gapAnalysis = calculateDetailedSkillGaps(profile);

  const targetRole = profile.careerPreferences?.targetRole;

  if (!targetRole) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
        <Target className="w-8 h-8 text-amber-400 mx-auto" />
        <h3 className="text-sm font-bold text-white">No Career Role Selected</h3>
        <p className="text-xs text-slate-400">
          Select a career goal in <strong>Profile → Career Preferences</strong> to receive personalized coding assessments.
        </p>
      </div>
    );
  }

  // Get gap skills for target role
  const allSkills = gapAnalysis.allSkillItems;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Recommended for You</h3>
            <p className="text-[11px] text-slate-400">
              Personalized for target role: <strong className="text-indigo-300">{targetRole}</strong>
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-bold">
          Skill Gap Intelligence
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {questions.map((q) => {
          const matchingGap = allSkills.find((g: any) => g.skillName.toLowerCase() === q.skill.toLowerCase());
          const priority = matchingGap ? matchingGap.importance : 'Recommended';

          return (
            <div
              key={q.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3.5 space-y-2.5 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {q.skill}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    priority === 'Critical'
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  }`}>
                    {priority === 'Critical' ? 'High Priority Gap' : 'Practice Target'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {q.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">{q.description}</p>
              </div>

              <button
                onClick={() => onSelectAssessment(q)}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-400 text-slate-200 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <span>Start Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
