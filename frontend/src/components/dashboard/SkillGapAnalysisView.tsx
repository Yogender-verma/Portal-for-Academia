import React, { useState } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { calculateDetailedSkillGaps } from '../../utils/skillGapCalculator';
import { 
  Target, 
  Sparkles, 
  ArrowRight, 
  Info, 
  CheckCircle2, 
  TrendingDown, 
  Compass, 
  Zap, 
  ChevronDown, 
  Building2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface SkillGapAnalysisViewProps {
  onNavigateTab?: (tab: string, skill?: string) => void;
}

export const SkillGapAnalysisView: React.FC<SkillGapAnalysisViewProps> = ({ onNavigateTab }) => {
  const { profile } = useStudentProfile();
  
  // Available saved roles from profile
  const savedRoles = [
    profile.careerPreferences?.targetRole,
    ...(profile.careerPreferences?.preferredRoles || [])
  ].filter((r): r is string => Boolean(r && r.trim()));

  const uniqueSavedRoles = Array.from(new Set(savedRoles));
  
  const [selectedRole, setSelectedRole] = useState<string>(
    profile.careerPreferences?.targetRole || uniqueSavedRoles[0] || ''
  );

  // Compute detailed skill gap analysis
  const gapAnalysis = calculateDetailedSkillGaps(profile, selectedRole);

  // IF NO ROLE IS SAVED IN PROFILE
  if (!gapAnalysis.hasRoleSaved || uniqueSavedRoles.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 max-w-3xl mx-auto shadow-2xl my-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
          <Target className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">🎯 Select Your Career Goal</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            You haven't selected a target job role yet. Choose a target role in your Profile to unlock:
          </p>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-left max-w-md mx-auto space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Industry-required skills & proficiency levels</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Your current preparation vs SkillBridge Benchmark</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Top skill gaps & high-priority learning items</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Weighted Industry Readiness score</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Personalized Career Roadmap recommendations</span>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab && onNavigateTab('profile')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <span>Go to Career Preferences →</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* 1. HEADER & SAVED ROLE SELECTOR CARD */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>SkillBridge Industry Benchmark System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              ⭐ Skill Gap Analysis
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Comparing student preparation against SkillBridge Industry Benchmarks.
            </p>
          </div>

          {/* Saved Job Roles Only Dropdown / Selector */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1.5 min-w-[280px] shadow-lg">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
              <span>Target Career Role</span>
            </label>

            {uniqueSavedRoles.length === 1 ? (
              <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 font-bold text-sm flex items-center justify-between">
                <span>{uniqueSavedRoles[0]}</span>
                <span className="text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-400 font-semibold">Saved Goal</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-bold appearance-none focus:outline-none focus:border-cyan-400 pr-9 cursor-pointer"
                >
                  {uniqueSavedRoles.map((role) => (
                    <option key={role} value={role} className="bg-slate-900 text-white font-semibold">
                      {role} {role === profile.careerPreferences?.targetRole ? ' (Primary Target)' : ' (Preferred)'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {/* Industry Readiness Banner Card */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-center flex flex-col justify-center space-y-1 shadow-inner">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Industry Readiness</span>
            <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 font-mono">
              {gapAnalysis.overallReadiness}%
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Weighted Readiness Benchmark</p>
          </div>

          <div className="md:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-slate-200">
                {gapAnalysis.totalIndustrySkills} Industry Skills Evaluated
              </span>
              <div className="flex items-center gap-3 font-semibold">
                <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {gapAnalysis.readyCount} Ready
                </span>
                <span className="text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                  {gapAnalysis.nearlyReadyCount} Nearly Ready
                </span>
                <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  {gapAnalysis.gapCount} Gaps Identified
                </span>
              </div>
            </div>

            {/* Overall Readiness Bar */}
            <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-amber-500 via-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out shadow-lg"
                style={{ width: `${gapAnalysis.overallReadiness}%` }}
              />
            </div>

            {/* Tooltip Disclaimer */}
            <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>SkillBridge Industry Benchmark:</strong> Industry requirements are benchmarked from current job-role expectations and may vary by company, technology stack, location and experience level.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. COMPLETE INDUSTRY SKILLS VS YOUR PREPARATION TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">🏢 Industry Skills vs Your Preparation</h2>
              <p className="text-xs text-slate-400">Complete breakdown for target role: <strong className="text-cyan-400">{gapAnalysis.role}</strong></p>
            </div>
          </div>
        </div>

        {/* Category-by-Category Skill List */}
        <div className="space-y-6">
          {gapAnalysis.categoryGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  {group.categoryName}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {group.readyCount} / {group.totalCount} Skills Ready
                </span>
              </div>

              {/* Skills Table Grid */}
              <div className="space-y-3">
                {group.skills.map((item, idx) => {
                  const isReady = item.status === 'Ready';
                  const isNearlyReady = item.status === 'Nearly Ready';
                  const isNotStarted = item.status === 'Not Started';

                  return (
                    <div
                      key={idx}
                      onClick={() => onNavigateTab && onNavigateTab('career-roadmap', item.skillName)}
                      className="bg-slate-900 border border-slate-800/80 hover:border-cyan-500/50 rounded-xl p-4 transition-all space-y-3 cursor-pointer group hover:bg-slate-850"
                      title={`Click to view learning links & resources for ${item.skillName}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">{item.skillName}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              item.importance === 'Critical'
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                : item.importance === 'High'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {item.importance}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-cyan-400 group-hover:underline font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            View Resources <ArrowRight className="w-3 h-3" />
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 border ${
                              isReady
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : isNearlyReady
                                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                : isNotStarted
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {isReady && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {item.status}
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress Bars Comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-center pt-1">
                        <div className="sm:col-span-5 space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                            <span>Industry Requirement</span>
                            <span className="text-indigo-400 font-bold">{item.requiredLevel}%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${item.requiredLevel}%` }} />
                          </div>
                        </div>

                        <div className="sm:col-span-5 space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                            <span>Your Preparation</span>
                            <span className={item.studentLevel > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                              {item.studentLevel > 0 ? `${item.studentLevel}%` : '0% (Not Added)'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full rounded-full ${
                                item.studentLevel >= item.requiredLevel ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                              style={{ width: `${item.studentLevel}%` }}
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2 text-right sm:text-center pt-1 sm:pt-0">
                          {item.gap > 0 ? (
                            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md">
                              Gap: {item.gap}%
                            </span>
                          ) : (
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                              0% Gap
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. YOUR TOP SKILL GAPS SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">🎯 Your Top Skill Gaps</h2>
              <p className="text-xs text-slate-400">Prioritized by industry importance and readiness delta</p>
            </div>
          </div>

          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-bold">
            {gapAnalysis.gapCount === 0 ? "0 Skill Gaps Identified" : `${gapAnalysis.gapCount} Skill Gaps Identified`}
          </span>
        </div>

        {gapAnalysis.topPriorityGaps.length === 0 ? (
          <div className="text-center py-10 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-emerald-300">
              🎉 You're meeting the current SkillBridge benchmark for {gapAnalysis.role}!
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Great job! All industry-required skills are satisfied. Take proctored assessments to earn verified badges.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gapAnalysis.topPriorityGaps.map((gap, idx) => {
              const isHighPriority = gap.importance === 'Critical' || gap.gap > 35;

              return (
                <div
                  key={idx}
                  className={`bg-slate-950/90 border rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all ${
                    isHighPriority
                      ? 'border-rose-500/30 hover:border-rose-500/50 shadow-md shadow-rose-950/20'
                      : 'border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isHighPriority
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {isHighPriority ? '🔴 High Priority' : '🟡 Medium Priority'}
                      </span>

                      <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        -{gap.gap}%
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{gap.skillName}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Category: {gap.category}</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                      <div className="flex justify-between">
                        <span>Your Preparation:</span>
                        <strong className={gap.studentLevel > 0 ? 'text-slate-200' : 'text-rose-400'}>
                          {gap.studentLevel > 0 ? `${gap.studentLevel}%` : '0% (Not Started)'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Industry Benchmark:</span>
                        <strong className="text-indigo-400">{gap.requiredLevel}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Skill Gap:</span>
                        <strong className="text-amber-400">{gap.gap}%</strong>
                      </div>
                    </div>

                    {/* Progress Bar Visual Delta */}
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
                      <div
                        className={isHighPriority ? 'bg-rose-500' : 'bg-amber-500'}
                        style={{ width: `${gap.studentLevel}%` }}
                      />
                      <div
                        className="bg-slate-800 border-l border-dashed border-white/20 opacity-60"
                        style={{ width: `${gap.gap}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateTab && onNavigateTab('career-roadmap', gap.skillName)}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-bold text-cyan-400 hover:text-cyan-300 rounded-xl flex items-center justify-center gap-1.5 transition-all mt-2 cursor-pointer shadow-sm"
                  >
                    <span>{gap.studentLevel === 0 ? `Learn ${gap.skillName}` : `Improve ${gap.skillName}`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. WHAT SHOULD I LEARN NEXT? (CAREER ROADMAP CONNECTION) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-indigo-950/20 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-500/20 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">🧭 What Should I Learn Next?</h2>
              <p className="text-xs text-slate-300">Recommended learning sequence generated from identified skill gaps</p>
            </div>
          </div>
        </div>

        {gapAnalysis.nextLearningRoadmap.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {gapAnalysis.nextLearningRoadmap.map((skill, index) => (
              <div
                key={index}
                onClick={() => onNavigateTab && onNavigateTab('career-roadmap', skill)}
                className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative group hover:border-cyan-400 cursor-pointer transition-all hover:bg-slate-900 shadow-md"
                title={`Click to view learning resources for ${skill}`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center font-mono">
                    {index + 1}
                  </span>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">{skill}</h4>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  View Links <ArrowRight className="w-3 h-3 text-cyan-400" />
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-emerald-400 font-medium">All prerequisite skills met for {gapAnalysis.role}!</p>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onNavigateTab && onNavigateTab('career-roadmap')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Generate Career Roadmap →</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
