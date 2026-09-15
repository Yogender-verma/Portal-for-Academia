import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Globe,
  Award,
  CheckCircle,
  Code,
  ExternalLink,
  Cpu,
  Sparkles,
  CheckCircle2,
  MapPin,
  Briefcase,
  Send,
  Calendar,
  Clock,
  Video,
  User
} from 'lucide-react';
import type { TalentProfile } from '../../services/topTalentApiService';

interface TalentStudentProfileModalProps {
  student: TalentProfile | null;
  onClose: () => void;
  onSendInterviewRequest?: (studentUid: string) => void;
  factorLabels?: Record<string, string>;
}

export const TalentStudentProfileModal: React.FC<TalentStudentProfileModalProps> = ({
  student,
  onClose,
  onSendInterviewRequest,
  factorLabels = {}
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'assessment' | 'scores'>('overview');
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewSent, setInterviewSent] = useState(false);

  if (!student) return null;

  const proficiencyMap: Record<string, number> = {
    'expert': 95, 'advanced': 85, 'intermediate': 70,
    'beginner': 45, 'basic': 40, 'novice': 30
  };

  const getFactorLabel = (key: string) => factorLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const getFactorColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-sky-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getFactorBarColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-emerald-400';
    if (score >= 70) return 'from-sky-500 to-sky-400';
    if (score >= 50) return 'from-amber-500 to-amber-400';
    return 'from-red-500 to-red-400';
  };

  const handleSendRequest = () => {
    if (onSendInterviewRequest) {
      onSendInterviewRequest(student.uid);
    }
    setInterviewSent(true);
    setShowInterviewForm(false);
  };

  const projects = student.projects || [];
  const experiences = student.experiences || [];
  const certifications = student.certifications || [];
  const achievements = student.achievements || [];
  const assessmentDetails = student.assessment_details || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">

      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-200 my-8">

        {/* Header Banner */}
        <div className="h-32 bg-gradient-to-r from-violet-900 via-slate-900 to-indigo-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.15),transparent_70%)]" />

          {/* Discovery Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full text-[11px] font-bold text-violet-300">
            <Sparkles className="w-3.5 h-3.5" />
            Discovered Talent — Not an Applicant
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="px-6 sm:px-8 pb-6 -mt-14 relative space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

            <div className="flex items-end gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 p-1 shadow-2xl">
                  {student.avatar_url ? (
                    <img
                      src={student.avatar_url}
                      alt={student.name}
                      className="w-full h-full rounded-xl object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full rounded-xl bg-slate-950 flex items-center justify-center text-3xl font-black text-white uppercase ${student.avatar_url ? 'hidden' : ''}`}>
                    {student.name.charAt(0)}
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-violet-500 border-2 border-slate-900 shadow-md" title="Discovered Talent" />
              </div>

              <div className="space-y-1 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{student.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-mono text-[11px] font-bold">
                    {student.overall_score}% Talent Score
                  </span>
                  {student.is_demo && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-semibold">
                      Demo
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
                    {student.college}
                  </span>
                  {student.degree && (
                    <>
                      <span>•</span>
                      <span>{student.degree} {student.department}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!interviewSent ? (
                <button
                  onClick={() => setShowInterviewForm(true)}
                  className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Interview Request
                </button>
              ) : (
                <span className="px-4 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Interview Request Sent
                </span>
              )}
            </div>
          </div>

          {/* Info Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              {student.target_role && (
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Briefcase className="w-3.5 h-3.5 text-violet-400" />
                  {student.target_role}
                </span>
              )}
              {student.college && (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-violet-400" />
                  {student.preferred_locations?.slice(0, 2).join(', ') || 'Not specified'}
                </span>
              )}
              {student.graduation_year && (
                <span className="text-slate-400">Grad: {student.graduation_year}</span>
              )}
              {student.cgpa && (
                <span className="text-emerald-400 font-semibold">CGPA: {student.cgpa}</span>
              )}
            </div>
            {student.about_me && (
              <p className="text-[11px] text-slate-400 max-w-md truncate">{student.about_me}</p>
            )}
          </div>
        </div>

        {/* Interview Request Form Modal */}
        {showInterviewForm && (
          <div className="px-6 sm:px-8 pb-4">
            <div className="p-5 rounded-2xl bg-violet-950/40 border border-violet-500/30 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-violet-400" />
                Send Interview Request to {student.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Interview Type</label>
                  <select className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-violet-500 outline-none">
                    <option>Technical Interview</option>
                    <option>Behavioral Interview</option>
                    <option>General Discussion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Proposed Date</label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="date" className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-violet-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Proposed Time</label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="time" className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-violet-500 outline-none" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Mode</label>
                  <select className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-violet-500 outline-none">
                    <option value="online">Online (Video Call)</option>
                    <option value="in-person">In-Person</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Meeting Link (optional)</label>
                  <div className="relative">
                    <Video className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="url" placeholder="https://meet.google.com/..." className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:border-violet-500 outline-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Message to Student</label>
                <textarea rows={2} placeholder="We'd love to discuss your projects and experience..." className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:border-violet-500 outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setShowInterviewForm(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all">
                  Cancel
                </button>
                <button onClick={handleSendRequest} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 sm:px-8 border-b border-slate-800 bg-slate-950/50">
          <div className="flex space-x-6 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Skills & Profile', icon: Sparkles },
              { id: 'projects', label: `Projects (${projects.length})`, icon: Code },
              { id: 'assessment', label: `Assessment Evidence`, icon: Cpu },
              { id: 'scores', label: 'Talent Score Breakdown', icon: Award },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`py-3.5 flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-violet-500 text-violet-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-6">

          {/* TAB: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* About Me */}
              {student.about_me && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-violet-400" /> About Me
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed">{student.about_me}</p>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400">Talent Score</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-violet-400">{student.overall_score}%</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400">Industry Readiness</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-400">{student.industry_readiness || 0}%</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400">Assessment Score</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-sky-400">{assessmentDetails.testScore || 'N/A'}</span>
                    {assessmentDetails.testScore && <span className="text-[10px] text-slate-500">/ 100</span>}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400">Roadmap Progress</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-indigo-400">{student.roadmap_progress || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Technical Skills */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-violet-400" />
                  Technical Skills & Proficiency
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {student.technical_skills.map((skill, index) => {
                    const prof = skill.score || proficiencyMap[String(skill.proficiency || '').toLowerCase()] || 60;
                    return (
                      <div key={index} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-violet-400 shadow-sm shadow-violet-400" />
                            <span className="font-bold text-white">{skill.name}</span>
                            {skill.proficiency && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-violet-500/10 text-violet-400 font-semibold rounded border border-violet-500/20">
                                {skill.proficiency}
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-violet-300">{prof}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-violet-500 to-indigo-400"
                            style={{ width: `${prof}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Soft Skills */}
              {student.soft_skills && student.soft_skills.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Soft Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {student.soft_skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800 text-[11px] font-semibold">
                        {typeof skill === 'string' ? skill : skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {experiences.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-violet-400" /> Experience
                  </h3>
                  {experiences.map((exp, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{exp.role}</span>
                        {exp.duration && <span className="text-[11px] text-slate-400">{exp.duration}</span>}
                      </div>
                      <span className="text-xs text-violet-400 font-semibold">{exp.company || exp.organization}</span>
                      {exp.description && <p className="text-xs text-slate-300 pt-1">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications & Achievements */}
              {(certifications.length > 0 || achievements.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certifications.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> Certifications
                      </h3>
                      {certifications.map((cert, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs">
                          <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-semibold text-white">{typeof cert === 'string' ? cert : cert.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {achievements.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Achievements
                      </h3>
                      {achievements.map((ach, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-semibold text-white">{typeof ach === 'string' ? ach : ach.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-violet-400" />
                Project Portfolio
              </h3>
              {projects.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Code className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-semibold">No projects listed in profile.</p>
                </div>
              ) : (
                projects.map((proj, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 hover:border-slate-700 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-white">{proj.projectName}</h4>
                        {proj.role && <span className="text-xs font-medium text-violet-400">{proj.role}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {proj.githubUrl && (
                          <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                            Code Repo <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        )}
                        {proj.liveDemoUrl && (
                          <a href={proj.liveDemoUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white rounded-lg border border-violet-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                            <Globe className="w-3.5 h-3.5" /> Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                    <div className="pt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-semibold mr-1">Tech:</span>
                      {proj.technologies.map((tech, tIdx) => (
                        <span key={tIdx} className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-mono text-[10px]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: Assessment */}
          {activeTab === 'assessment' && (
            <div className="space-y-6">
              {assessmentDetails.testScore ? (
                <>
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-violet-950/40 to-slate-950 border border-violet-800/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-violet-400" />
                          Compiler Assessment Report
                        </h3>
                        <p className="text-xs text-slate-400">Automated code evaluation results.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-emerald-400">{assessmentDetails.testScore}</span>
                        <span className="text-xs font-bold text-slate-400 block">/ 100</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                        <span className="text-slate-400 block text-[10px]">Test Cases</span>
                        <span className="font-bold text-white text-sm">{assessmentDetails.testCasesPassed || 'N/A'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                        <span className="text-slate-400 block text-[10px]">Execution Time</span>
                        <span className="font-bold text-sky-400 text-sm">{assessmentDetails.executionTimeMs || 'N/A'} ms</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                        <span className="text-slate-400 block text-[10px]">Time Complexity</span>
                        <span className="font-bold text-indigo-400 font-mono text-sm">{assessmentDetails.timeComplexity || 'N/A'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                        <span className="text-slate-400 block text-[10px]">Code Quality</span>
                        <span className="font-bold text-emerald-400 text-sm">{assessmentDetails.codeQualityRating || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  {assessmentDetails.solvedTopics && assessmentDetails.solvedTopics.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Evaluated Competencies</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {assessmentDetails.solvedTopics.map((topic, i) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                            <span className="font-semibold text-white">{topic}</span>
                            <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <Cpu className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-semibold">No assessment data available for this student.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Score Breakdown */}
          {activeTab === 'scores' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-violet-400" />
                  Transparent Talent Score Breakdown
                </h3>
                <span className="text-2xl font-black text-violet-400">{student.overall_score}%</span>
              </div>
              <p className="text-xs text-slate-400">
                Each factor is computed from actual stored profile data. No hardcoded values.
              </p>
              <div className="space-y-3">
                {Object.entries(student.factors || {}).map(([key, factor]) => (
                  <div key={key} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{getFactorLabel(key)}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          (weight: {Math.round(factor.weight * 100)}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-bold ${getFactorColor(factor.score)}`}>
                          {factor.score}%
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono w-12 text-right">
                          +{factor.weighted}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${getFactorBarColor(factor.score)}`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>SkillBridge Talent Discovery — <strong>This student has not applied</strong></span>
          </div>
          <div className="flex items-center gap-2">
            {!interviewSent && (
              <button
                onClick={() => setShowInterviewForm(true)}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Send Interview Request
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
            >
              Close Profile
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
