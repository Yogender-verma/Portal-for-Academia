import React, { useState } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { Award, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Building, GraduationCap, Target, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';

export const ProfileHeaderCard: React.FC = () => {
  const { profile, completion, saveMessage, resetProfileToDemo } = useStudentProfile();
  const [showAllMissing, setShowAllMissing] = useState<boolean>(false);

  const nameDisplay = profile.personalInfo.fullName || 'Student Profile';
  const degreeDisplay = profile.academicInfo.degree || profile.academicInfo.branch
    ? `${profile.academicInfo.degree || ''} ${profile.academicInfo.branch || ''} (${profile.academicInfo.currentYear || 'Year not set'})`
    : 'Academic Details Not Set';

  const getSectionIdForMissingItem = (missingItem: string): string => {
    const text = missingItem.toLowerCase();
    if (text.includes('personal')) return 'personal';
    if (text.includes('academic')) return 'academic';
    if (text.includes('tech')) return 'skills';
    if (text.includes('soft')) return 'skills';
    if (text.includes('project')) return 'projects';
    if (text.includes('certif')) return 'certifications';
    if (text.includes('achiev') || text.includes('award')) return 'achievements';
    if (text.includes('intern') || text.includes('work') || text.includes('exp')) return 'experience';
    if (text.includes('resume')) return 'resume';
    if (text.includes('career') || text.includes('prefer')) return 'preferences';
    if (text.includes('lang')) return 'languages';
    return 'personal';
  };

  const handleMissingItemClick = (missingItem: string) => {
    const sectionId = getSectionIdForMissingItem(missingItem);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      element.classList.add('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-slate-950', 'rounded-2xl', 'transition-all', 'duration-300');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-slate-950');
      }, 2500);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
      {/* Save status toast/banner */}
      {saveMessage && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center justify-between transition-all duration-300 ${
            saveMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : saveMessage.type === 'saving'
              ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-3">
            {saveMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {saveMessage.type === 'saving' && <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />}
            {saveMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            <span className="font-medium text-sm">{saveMessage.text}</span>
          </div>
        </div>
      )}

      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Student Avatar + Main Info */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="relative group">
            <img
              src={profile.personalInfo.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
              alt={nameDisplay}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-cyan-500/30 shadow-lg group-hover:border-cyan-400 transition-colors"
            />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 font-bold text-xs px-2 py-0.5 rounded-full border-2 border-slate-900 flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" /> Active
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start gap-3">
                {nameDisplay}
              </h1>
              <p className="text-slate-400 text-sm flex items-center justify-center sm:justify-start gap-2 mt-1">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                {degreeDisplay}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 px-3 py-1 rounded-lg">
                <Building className="w-3.5 h-3.5 text-cyan-400" />
                {profile.academicInfo.college || 'College Not Set'}
              </span>
              <span className="flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 font-semibold px-3 py-1 rounded-lg">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                Target Role: {profile.careerPreferences.targetRole || 'Not Set'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Profile Completion Box */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Profile Completion</h3>
            </div>
            <span className="text-xl font-black text-cyan-400">{completion.totalPercentage}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${completion.totalPercentage}%` }}
            />
          </div>

          {/* Missing Profile Items checklist */}
          {completion.missingItems.length > 0 ? (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Complete your profile ({completion.missingItems.length} remaining):
                </span>
                {completion.missingItems.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllMissing(!showAllMissing)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 font-medium transition-colors"
                  >
                    {showAllMissing ? (
                      <>Show less <ChevronUp className="w-3 h-3" /></>
                    ) : (
                      <>{completion.missingItems.length - 3} more <ChevronDown className="w-3 h-3" /></>
                    )}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(showAllMissing ? completion.missingItems : completion.missingItems.slice(0, 3)).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleMissingItemClick(item)}
                    className="text-xs bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                    title={`Click to jump to ${item}`}
                  >
                    <PlusCircle className="w-3 h-3 text-amber-400" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Your profile is 100% complete! Ready for top internship matching.
            </div>
          )}

          <div className="pt-2 border-t border-slate-800/80 flex justify-end">
            <button
              onClick={resetProfileToDemo}
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
              title="Clear form inputs and reset profile"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear / Reset Profile Inputs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
