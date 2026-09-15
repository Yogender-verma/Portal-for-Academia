import React from 'react';
import type { StudentProfile } from '../../types/profile';
import { Sparkles, CheckCircle2, AlertTriangle, X, Code, Briefcase, GraduationCap, User, FolderGit2, ShieldCheck, ExternalLink } from 'lucide-react';

interface ResumeParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedData: Partial<StudentProfile> | null;
  error: string | null;
  isLoading: boolean;
  onNavigateSection?: (sectionId: string) => void;
}

export const ResumeParserModal: React.FC<ResumeParserModalProps> = ({
  isOpen,
  onClose,
  extractedData,
  error,
  isLoading,
  onNavigateSection,
}) => {
  if (!isOpen) return null;

  const scrollTo = (id: string) => {
    onClose();
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-sm">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Automatic Profile Population Summary
              </h3>
              <p className="text-xs text-slate-400">All extracted information has been automatically populated into your profile.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-white">Extracting & Auto-Populating Profile...</p>
                <p className="text-xs text-slate-400">Parsing technical skills, education, projects & experience</p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                AI Resume Extraction Status
              </div>
              <p className="text-xs text-rose-300/90 leading-relaxed">{error}</p>
              <div className="pt-2 text-xs text-slate-400">
                You can manually add or edit any missing details directly in your profile sections anytime.
              </div>
            </div>
          )}

          {extractedData && !isLoading && (
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">✓ Profile Fields Automatically Populated!</h4>
                  <p className="text-xs text-emerald-200/90 mt-0.5 leading-relaxed">
                    Extracted details were merged with your existing saved data without overwriting or deleting any existing information. You can review or edit any section below.
                  </p>
                </div>
              </div>

              {/* Personal Info Summary */}
              {extractedData.personalInfo && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                      <User className="w-4 h-4" /> Personal Information
                    </div>
                    <button
                      onClick={() => scrollTo('personal')}
                      className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Edit Section <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Name:</span>
                      <span className="text-white font-medium">{extractedData.personalInfo.fullName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Email:</span>
                      <span className="text-white font-medium">{extractedData.personalInfo.email || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phone:</span>
                      <span className="text-white font-medium">{extractedData.personalInfo.phone || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Location:</span>
                      <span className="text-white font-medium">
                        {[extractedData.personalInfo.city, extractedData.personalInfo.state].filter(Boolean).join(', ') || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Credentials */}
              {extractedData.academicInfo && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                      <GraduationCap className="w-4 h-4" /> Academic Credentials
                    </div>
                    <button
                      onClick={() => scrollTo('academic')}
                      className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Edit Section <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">College:</span>
                      <span className="text-white font-medium">{extractedData.academicInfo.college || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Degree:</span>
                      <span className="text-white font-medium">{extractedData.academicInfo.degree || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Branch:</span>
                      <span className="text-white font-medium">{extractedData.academicInfo.branch || '—'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              {extractedData.technicalSkills && extractedData.technicalSkills.length > 0 && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                      <Code className="w-4 h-4" /> Technical Skills Populated ({extractedData.technicalSkills.length})
                    </div>
                    <button
                      onClick={() => scrollTo('skills')}
                      className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Edit Skills <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {extractedData.technicalSkills.map((sk) => (
                      <span
                        key={sk.name}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {sk.name} ({sk.proficiency || 'Intermediate'})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {extractedData.projects && extractedData.projects.length > 0 && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                      <FolderGit2 className="w-4 h-4" /> Projects Added ({extractedData.projects.length})
                    </div>
                    <button
                      onClick={() => scrollTo('projects')}
                      className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Edit Projects <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {extractedData.projects.map((p) => (
                      <div key={p.projectName} className="p-3 rounded-xl border border-slate-800 bg-slate-900 text-xs">
                        <div className="flex items-center justify-between font-semibold text-white">
                          <span>{p.projectName}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">Auto-Filled</span>
                        </div>
                        {p.description && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {extractedData.experience && extractedData.experience.length > 0 && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                      <Briefcase className="w-4 h-4" /> Work Experience Added ({extractedData.experience.length})
                    </div>
                    <button
                      onClick={() => scrollTo('experience')}
                      className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Edit Experience <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {extractedData.experience.map((e) => (
                      <div key={`${e.organization}-${e.role}`} className="p-3 rounded-xl border border-slate-800 bg-slate-900 text-xs">
                        <div className="flex items-center justify-between font-semibold text-white">
                          <span>{e.role} at {e.organization}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">Auto-Filled</span>
                        </div>
                        {e.responsibilities && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{e.responsibilities}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications & Achievements */}
              {((extractedData.certifications && extractedData.certifications.length > 0) ||
                (extractedData.achievements && extractedData.achievements.length > 0)) && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                      <ShieldCheck className="w-4 h-4" /> Certifications & Achievements
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {extractedData.certifications?.map((c) => (
                      <div key={c.name} className="p-2.5 rounded-lg border border-slate-800 bg-slate-900">
                        <span className="text-white font-semibold block">{c.name}</span>
                        <span className="text-slate-400 text-[11px]">{c.issuingOrganization}</span>
                      </div>
                    ))}
                    {extractedData.achievements?.map((a) => (
                      <div key={a.title} className="p-2.5 rounded-lg border border-slate-800 bg-slate-900">
                        <span className="text-white font-semibold block">{a.title}</span>
                        <span className="text-slate-400 text-[11px] line-clamp-1">{a.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages, Coursework, Publications & Awards */}
              {((extractedData.languages && extractedData.languages.length > 0) ||
                (extractedData.coursework && extractedData.coursework.length > 0) ||
                (extractedData.publications && extractedData.publications.length > 0) ||
                (extractedData.awards && extractedData.awards.length > 0)) && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                      Additional Resume Sections
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    {extractedData.languages && extractedData.languages.length > 0 && (
                      <div>
                        <span className="text-slate-400 font-semibold">Languages: </span>
                        <span className="text-white">{extractedData.languages.map((l) => l.language).join(', ')}</span>
                      </div>
                    )}
                    {extractedData.coursework && extractedData.coursework.length > 0 && (
                      <div>
                        <span className="text-slate-400 font-semibold">Coursework: </span>
                        <span className="text-white">{extractedData.coursework.join(', ')}</span>
                      </div>
                    )}
                    {extractedData.publications && extractedData.publications.length > 0 && (
                      <div>
                        <span className="text-slate-400 font-semibold">Publications: </span>
                        <span className="text-white">{extractedData.publications.map((p) => p.title).join('; ')}</span>
                      </div>
                    )}
                    {extractedData.awards && extractedData.awards.length > 0 && (
                      <div>
                        <span className="text-slate-400 font-semibold">Awards: </span>
                        <span className="text-white">{extractedData.awards.map((a) => a.title).join('; ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">
          <span className="text-xs text-slate-400">You can manually add or update any details anytime in your profile.</span>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Done & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
