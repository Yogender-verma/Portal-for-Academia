import React from 'react';
import type { Opportunity } from '../../types/opportunity';
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  ExternalLink, 
  Zap
} from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onNavigateTab?: (tab: string, skill?: string) => void;
  onApplySingle?: (opportunityId: string) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ 
  opportunity, 
  onNavigateTab,
  onApplySingle 
}) => {
  const isSelected = opportunity.status === 'Selected & Worked';
  const isRejected = opportunity.status === 'Rejected';
  const isApplied = opportunity.status === 'Applied';
  const isInternship = opportunity.opportunityType === 'internship';

  // Badge color for Skill Match %
  const getMatchBadgeStyle = (pct: number) => {
    if (pct >= 90) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (pct >= 70) return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    if (pct >= 50) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const getSourceBadgeStyle = (src: string) => {
    const s = src.toLowerCase();
    if (s.includes('linkedin')) return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
    if (s.includes('internshala')) return 'bg-sky-600/20 text-sky-300 border-sky-500/30';
    if (s.includes('indeed')) return 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30';
    if (s.includes('naukri')) return 'bg-amber-600/20 text-amber-300 border-amber-500/30';
    if (s.includes('wellfound')) return 'bg-red-600/20 text-red-300 border-red-500/30';
    return 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30';
  };

  return (
    <div className={`p-5 rounded-2xl bg-slate-900/90 border transition-all flex flex-col justify-between space-y-4 group shadow-xl hover:scale-[1.01] ${
      isSelected 
        ? 'border-indigo-500/40 bg-indigo-950/10'
        : isRejected
        ? 'border-rose-500/30 bg-rose-950/10'
        : isApplied
        ? 'border-emerald-500/40 bg-emerald-950/10'
        : opportunity.matchScore === 100
        ? 'border-emerald-500/40 hover:border-emerald-500/70 bg-emerald-950/10'
        : 'border-slate-800 hover:border-sky-500/50'
    }`}>
      <div>
        {/* Header: Company Name, Source Badge & Skill Match % */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
              {opportunity.company}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSourceBadgeStyle(opportunity.source)}`}>
              {opportunity.source}
            </span>
            <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${getMatchBadgeStyle(opportunity.matchScore)}`}>
              {opportunity.matchScore}% Match
            </span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-sky-300 transition-colors">
          {opportunity.title}
        </h4>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-slate-400 mb-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">{opportunity.location}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="capitalize font-semibold text-emerald-400">{opportunity.workMode}</span>
          </div>

          <div className="col-span-2 flex items-center justify-between text-slate-200 font-semibold pt-1 border-t border-slate-800/60">
            <span>💰 {opportunity.salaryStipend}</span>
            <span className="text-[11px] font-normal text-slate-400">{opportunity.postedDate}</span>
          </div>

          {/* Type-specific Fields */}
          {isInternship ? (
            <>
              {opportunity.duration && opportunity.duration !== 'Not specified' && (
                <div className="text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Duration:</span> {opportunity.duration}
                </div>
              )}
              {opportunity.eligibility && opportunity.eligibility !== 'Not specified' && (
                <div className="text-[11px] text-slate-400 col-span-2">
                  <span className="font-semibold text-slate-300">Eligibility:</span> {opportunity.eligibility}
                </div>
              )}
            </>
          ) : (
            <>
              {opportunity.experienceRequired && opportunity.experienceRequired !== 'Not specified' && (
                <div className="text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Exp Req:</span> {opportunity.experienceRequired}
                </div>
              )}
              {opportunity.employmentType && opportunity.employmentType !== 'Not specified' && (
                <div className="text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Type:</span> {opportunity.employmentType}
                </div>
              )}
            </>
          )}
        </div>

        {/* Matched Skills */}
        {opportunity.matchedSkills && opportunity.matchedSkills.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Matched Verified Skills ({opportunity.matchedSkills.length}):</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {opportunity.matchedSkills.map((s) => (
                <span key={s} className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {opportunity.missingSkills && opportunity.missingSkills.length > 0 && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
            <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Missing Skills ({opportunity.missingSkills.length}):</span>
            </div>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {opportunity.missingSkills.map((ms) => (
                <button
                  key={ms}
                  onClick={() => onNavigateTab && onNavigateTab('career-roadmap', ms)}
                  className="text-[10px] font-bold bg-amber-950/90 hover:bg-amber-900 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  title={`Learn ${ms} in Career Roadmap`}
                >
                  + {ms}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Apply Actions */}
      {isApplied ? (
        <div className="pt-3 border-t border-slate-800">
          <div className="w-full py-2.5 px-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Applied ({opportunity.appliedDate || 'Just Now'})</span>
          </div>
        </div>
      ) : (
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
          <button
            onClick={() => onApplySingle && onApplySingle(opportunity.id)}
            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>1-Click Apply</span>
          </button>

          <a
            href={opportunity.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open external portal"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all flex items-center justify-center shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};
