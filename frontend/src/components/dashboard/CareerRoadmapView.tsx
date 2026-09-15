import React, { useState, useEffect } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { getSkillLearningPlan } from '../../data/learningResources';
import { calculateDetailedSkillGaps } from '../../utils/skillGapCalculator';
import { RecommendationsCard } from './RecommendationsCard';
import { 
  Route, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  ExternalLink, 
  BookOpen, 
  Sparkles, 
  Code2, 
  Award, 
  Zap, 
  Target, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface CareerRoadmapViewProps {
  onNavigateTab?: (tab: string, skill?: string) => void;
  initialFocusedSkill?: string;
}

export const CareerRoadmapView: React.FC<CareerRoadmapViewProps> = ({ onNavigateTab, initialFocusedSkill }) => {
  const { profile } = useStudentProfile();
  const gapAnalysis = calculateDetailedSkillGaps(profile);

  const targetRole = gapAnalysis.role || profile.careerPreferences?.targetRole || 'Frontend Developer';
  
  const [activeFocusedSkill, setActiveFocusedSkill] = useState<string | undefined>(initialFocusedSkill);
  const [expandedSkill, setExpandedSkill] = useState<string | undefined>(initialFocusedSkill);

  useEffect(() => {
    if (initialFocusedSkill) {
      setActiveFocusedSkill(initialFocusedSkill);
      setExpandedSkill(initialFocusedSkill);
      
      // Auto-scroll to focused skill card
      setTimeout(() => {
        const element = document.getElementById(`roadmap-skill-${initialFocusedSkill.toLowerCase().replace(/[^a-z0-0]/g, '')}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-slate-950');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-slate-950');
          }, 3000);
        }
      }, 200);
    }
  }, [initialFocusedSkill]);

  const toggleExpand = (skillName: string) => {
    setExpandedSkill(expandedSkill === skillName ? undefined : skillName);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return YoutubeIcon;
      case 'docs': return BookOpen;
      case 'course': return Sparkles;
      case 'practice': return Code2;
      case 'certification': return Award;
      default: return ExternalLink;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. ROADMAP HEADER BANNER */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-indigo-950/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Route className="w-4 h-4" />
              <span>SkillBridge Career Pathway Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Your Career Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 font-medium">
              Sequence tailored for <strong className="text-white bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">{targetRole}</strong>
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 text-xs font-semibold">
            <div className="text-center">
              <span className="block text-slate-400 text-[10px] uppercase font-bold">Overall Readiness</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{gapAnalysis.overallReadiness}%</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center">
              <span className="block text-slate-400 text-[10px] uppercase font-bold">Skills Mastered</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">{gapAnalysis.readyCount} / {gapAnalysis.totalIndustrySkills}</span>
            </div>
          </div>
        </div>

        {/* Focused Skill Alert Banner if redirected from Skill Gap Analysis */}
        {activeFocusedSkill && (
          <div className="mt-6 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="text-xs">
                <strong className="text-white font-bold">Targeted Skill Redirect: {activeFocusedSkill}</strong>
                <p className="text-[11px] text-cyan-200 mt-0.5">
                  Showing tailored learning resources, official documentation links, courses & practice platforms for {activeFocusedSkill}.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveFocusedSkill(undefined);
                setExpandedSkill(undefined);
              }}
              className="text-cyan-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Clear focus"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. TAILORED ROADMAP SEQUENCE STEPS & LEARNING RESOURCES */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Recommended Learning Sequence</h2>
              <p className="text-xs text-slate-400">Step-by-step roadmap tailored for <strong className="text-indigo-400">{targetRole}</strong></p>
            </div>
          </div>

          <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full font-bold">
            {gapAnalysis.allSkillItems.length} Step Sequence
          </span>
        </div>

        {/* Step-by-Step Interactive Cards */}
        <div className="space-y-4">
          {gapAnalysis.allSkillItems.map((item, index) => {
            const isCompleted = item.status === 'Ready';
            const isNearlyReady = item.status === 'Nearly Ready';
            const isFocused = activeFocusedSkill && item.skillName.toLowerCase().includes(activeFocusedSkill.toLowerCase());
            const isExpanded = expandedSkill === item.skillName || isFocused;

            const learningPlan = getSkillLearningPlan(item.skillName);

            const cardId = `roadmap-skill-${item.skillName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

            return (
              <div
                key={index}
                id={cardId}
                className={`bg-slate-950/80 border rounded-2xl p-5 space-y-4 transition-all ${
                  isFocused
                    ? 'border-cyan-400 ring-2 ring-cyan-400/40 bg-cyan-950/10 shadow-xl'
                    : isCompleted
                    ? 'border-emerald-500/30 hover:border-emerald-500/50'
                    : isNearlyReady
                    ? 'border-sky-500/30 hover:border-sky-500/50'
                    : 'border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                {/* Step Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 text-indigo-300 font-bold text-xs flex items-center justify-center font-mono shrink-0 shadow-inner">
                      0{index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white hover:text-cyan-300 transition-colors">
                          {item.skillName}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          item.importance === 'Critical' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {item.importance}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{learningPlan.summary}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <span className={`text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 border ${
                      isCompleted 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isNearlyReady
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {!isCompleted && isNearlyReady && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      {!isCompleted && !isNearlyReady && <Lock className="w-3.5 h-3.5" />}
                      {item.status}
                    </span>

                    {/* Direct YouTube Tutorial Button */}
                    <a
                      href={learningPlan.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-red-600/15 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm group"
                      title={`Watch YouTube tutorial: ${learningPlan.youtubeTitle}`}
                    >
                      <YoutubeIcon className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform shrink-0" />
                      <span>YouTube Course</span>
                      <ExternalLink className="w-3 h-3 text-red-400 opacity-70 group-hover:opacity-100" />
                    </a>

                    <button
                      onClick={() => toggleExpand(item.skillName)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Resources' : 'All Links'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-center pt-2 border-t border-slate-900">
                  <div className="sm:col-span-5 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Your Preparation</span>
                      <strong className={item.studentLevel > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                        {item.studentLevel}%
                      </strong>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-emerald-400 h-full" style={{ width: `${item.studentLevel}%` }} />
                    </div>
                  </div>

                  <div className="sm:col-span-5 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Industry Required ({targetRole})</span>
                      <strong className="text-indigo-400">{item.requiredLevel}%</strong>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-indigo-500 h-full" style={{ width: `${item.requiredLevel}%` }} />
                    </div>
                  </div>

                  <div className="sm:col-span-2 text-right sm:text-center">
                    {item.gap > 0 ? (
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        Gap: {item.gap}%
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Ready ✓
                      </span>
                    )}
                  </div>
                </div>

                {/* EXPANDABLE VERIFIED LEARNING LINKS & RESOURCES */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-800 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Verified Learning Resources & Links for {item.skillName}</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">Estimated Effort: ~{learningPlan.estimatedHours} Hours</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {learningPlan.resources.map((res, resIdx) => {
                        const IconComponent = getResourceIcon(res.type);
                        const isVideo = res.type === 'video' || res.url.includes('youtube.com');

                        return (
                          <a
                            key={resIdx}
                            href={res.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`rounded-xl p-3.5 flex items-start justify-between gap-3 group transition-all shadow-md ${
                              isVideo
                                ? 'bg-red-950/20 border border-red-500/30 hover:border-red-500/70 hover:bg-red-950/40'
                                : 'bg-slate-900 border border-slate-800 hover:border-cyan-400/60 hover:bg-slate-850'
                            }`}
                          >
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  isVideo
                                    ? 'text-red-300 bg-red-500/20 border-red-500/30'
                                    : 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20'
                                }`}>
                                  {res.platform}
                                </span>
                                {res.isFree ? (
                                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Free</span>
                                ) : (
                                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">Certificate</span>
                                )}
                              </div>

                              <h5 className={`text-xs font-bold text-white transition-colors truncate ${
                                isVideo ? 'group-hover:text-red-300' : 'group-hover:text-cyan-300'
                              }`}>
                                {res.title}
                              </h5>
                              <p className="text-[11px] text-slate-400 leading-tight line-clamp-2">{res.description}</p>
                            </div>

                            <div className={`p-2 rounded-lg shrink-0 transition-all ${
                              isVideo
                                ? 'bg-red-950 border border-red-500/40 text-red-400 group-hover:text-white group-hover:bg-red-600'
                                : 'bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/40'
                            }`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. RECOMMENDATIONS & ACTION PLAN */}
      <RecommendationsCard onNavigateTab={onNavigateTab} />

    </div>
  );
};
