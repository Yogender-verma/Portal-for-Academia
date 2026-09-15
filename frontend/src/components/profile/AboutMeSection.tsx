import React, { useState } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { FileText, Edit3, Save, X, Sparkles, MessageSquare } from 'lucide-react';

export const AboutMeSection: React.FC = () => {
  const { profile, updateAboutMe } = useStudentProfile();
  const currentAbout = profile.aboutMe || profile.personalInfo.aboutMe || '';

  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(currentAbout);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setText(currentAbout);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setText(currentAbout);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await updateAboutMe(text);
    setIsSaving(false);
    if (ok) {
      setIsEditing(false);
    }
  };

  const generatePreset = (role: string) => {
    const skillsList = profile.technicalSkills.map((s) => s.name).slice(0, 4).join(', ') || 'modern software engineering tools';
    const degree = profile.academicInfo.degree || 'Computer Science';
    const college = profile.academicInfo.college || 'university';

    const preset = `Ambitious ${degree} student at ${college} specializing in ${role.toLowerCase() || 'full-stack development'}. Proficient in ${skillsList} with hands-on experience building scalable applications, solving complex algorithmic problems, and collaborating on high-impact projects. Dedicated to writing clean, maintainable code and eager to contribute to innovative tech teams.`;
    setText(preset);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">About Me / Professional Summary</h2>
            <p className="text-xs text-slate-400">Personal bio, career focus, and summary for recruiter profiles & resumes</p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" /> {currentAbout ? 'Edit Bio' : 'Add Bio'}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 min-h-[100px]">
          {currentAbout ? (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{currentAbout}</p>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500">
              <MessageSquare className="w-8 h-8 mb-2 text-slate-600 opacity-60" />
              <p className="text-xs font-medium">No professional summary added yet.</p>
              <p className="text-[11px] text-slate-600">Click "Add Bio" or parse your resume to generate a summary.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              Write or refine your bio <span className="text-slate-500 font-normal">(Recommended 100-300 characters)</span>
            </label>
            <span className="text-xs text-slate-400 font-mono">{text.length} chars</span>
          </div>

          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Introduce yourself, your academic background, core technical strengths, and career aspirations..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
          />

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Auto-generate draft:
            </span>
            <button
              type="button"
              onClick={() => generatePreset(profile.careerPreferences.targetRole || 'Full Stack Engineer')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 rounded-lg border border-slate-700 transition-colors"
            >
              Draft for {profile.careerPreferences.targetRole || 'Software Developer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
