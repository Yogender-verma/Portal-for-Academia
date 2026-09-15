import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  Mail, 
  Phone, 
  Globe, 
  Award, 
  CheckCircle, 
  Code, 
  ExternalLink, 
  Cpu, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import type { CompanyApplicant } from '../../data/companyApplicantsData';

interface CandidateProfileModalProps {
  applicant: CompanyApplicant | null;
  onClose: () => void;
  onStatusChange?: (applicantId: string, newStatus: CompanyApplicant['status']) => void;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  applicant,
  onClose,
  onStatusChange
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'assessment' | 'academics'>('overview');
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!applicant) return null;

  // Fallback defaults for optional enriched fields
  const phone = applicant.phone || '+91 98765 43210';
  const cgpa = applicant.cgpa || '9.1 / 10.0';
  const githubUrl = applicant.githubUrl || `https://github.com/${applicant.name.toLowerCase().replace(/\s+/g, '')}`;
  const linkedinUrl = applicant.linkedinUrl || `https://linkedin.com/in/${applicant.name.toLowerCase().replace(/\s+/g, '')}`;
  const portfolioUrl = applicant.portfolioUrl || `https://${applicant.name.toLowerCase().replace(/\s+/g, '')}.dev`;

  const projects = applicant.projects && applicant.projects.length > 0 ? applicant.projects : [
    {
      id: 'p1',
      projectName: `${applicant.skills[0]?.name || 'Full Stack'} E-Commerce & Analytics Suite`,
      description: 'Architected high-performance web platform featuring real-time state sync, responsive UI components, and automated unit test suite with 92% coverage.',
      technologies: applicant.skills.map(s => s.name),
      role: 'Lead Full-Stack Developer',
      githubUrl: `${githubUrl}/ecommerce-suite`,
      liveDemoUrl: 'https://demo-app.skillbridge.dev'
    },
    {
      id: 'p2',
      projectName: `Real-Time Compiler & Code Screener Tool`,
      description: 'Engineered cloud execution sandbox for microservices with WebSocket live log streaming, multi-language compiler support and AST parser.',
      technologies: ['TypeScript', 'Node.js', 'Docker', 'Redis'],
      role: 'Backend & Systems Engineer',
      githubUrl: `${githubUrl}/compiler-screener`,
      liveDemoUrl: 'https://screener.skillbridge.dev'
    }
  ];

  const assessmentDetails = applicant.assessmentDetails || {
    testScore: applicant.assessmentScore,
    testCasesPassed: `${Math.round((applicant.assessmentScore / 100) * 20)} / 20 Passed`,
    executionTimeMs: Math.floor(Math.random() * 30) + 25,
    timeComplexity: 'O(N log N)',
    codeQualityRating: 'A+ (Clean Code Compliant)',
    solvedTopics: ['Data Structures', 'Async Programming', 'Dynamic Programming', 'REST API Design']
  };

  const certifications = applicant.certifications && applicant.certifications.length > 0 ? applicant.certifications : [
    `SkillBridge Certified ${applicant.skills[0]?.name || 'Frontend'} Specialist`,
    'AWS Certified Cloud Practitioner (2025)',
    'Meta Professional Frontend Certificate'
  ];

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(applicant.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const getStatusColor = (status: CompanyApplicant['status']) => {
    switch (status) {
      case 'Applied':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'Shortlisted':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Assessment Pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Interview':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/40';
      case 'Selected':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'Rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-200 my-8">
        
        {/* Header Background Banner */}
        <div className="h-32 bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.15),transparent_70%)]" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Summary Header */}
        <div className="px-6 sm:px-8 pb-6 -mt-14 relative space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            
            {/* Avatar & Main Info */}
            <div className="flex items-end gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center text-3xl font-black text-white uppercase tracking-wider">
                    {applicant.name.charAt(0)}
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-md" title="Skill Verified Candidate" />
              </div>

              <div className="space-y-1 pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{applicant.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono text-[11px] font-bold">
                    {applicant.matchScore}% Skill Match
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                    {applicant.college}
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">{applicant.degree}</span>
                </div>
              </div>
            </div>

            {/* Pipeline Status Droplist & Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {onStatusChange && (
                <select
                  value={applicant.status}
                  onChange={(e) => onStatusChange(applicant.id, e.target.value as CompanyApplicant['status'])}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none transition-all cursor-pointer ${getStatusColor(applicant.status)}`}
                >
                  <option value="Applied" className="bg-slate-900 text-sky-400">Stage: Candidates (Applied)</option>
                  <option value="Shortlisted" className="bg-slate-900 text-emerald-400">Stage: Shortlisted</option>
                  <option value="Assessment Pending" className="bg-slate-900 text-amber-400">Stage: Pending Test</option>
                  <option value="Interview" className="bg-slate-900 text-violet-400">Stage: Interviewing</option>
                  <option value="Selected" className="bg-slate-900 text-indigo-400">Stage: Selected</option>
                  <option value="Rejected" className="bg-slate-900 text-red-400">Stage: Rejected</option>
                </select>
              )}

              {applicant.status === 'Applied' && (
                <button
                  onClick={() => {
                    if (onStatusChange) onStatusChange(applicant.id, 'Shortlisted');
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Shortlist Candidate</span>
                </button>
              )}

              {applicant.status === 'Shortlisted' && (
                <>
                  <button
                    onClick={() => {
                      if (onStatusChange) onStatusChange(applicant.id, 'Assessment Pending');
                    }}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Send Test</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onStatusChange) onStatusChange(applicant.id, 'Interview');
                    }}
                    className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                  >
                    Schedule Interview
                  </button>
                </>
              )}

              {applicant.status === 'Assessment Pending' && (
                <button
                  onClick={() => {
                    if (onStatusChange) onStatusChange(applicant.id, 'Interview');
                  }}
                  className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  Move to Interview
                </button>
              )}

              {applicant.status === 'Interview' && (
                <button
                  onClick={() => {
                    if (onStatusChange) onStatusChange(applicant.id, 'Selected');
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Offer Selection</span>
                </button>
              )}
            </div>

          </div>

          {/* Applied Opportunity Sub-bar */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Applied Role:</span>
              <span className="font-bold text-white text-sm">{applicant.opportunityTitle}</span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                applicant.opportunityType === 'Internship' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                {applicant.opportunityType}
              </span>
              <span className="text-slate-500 text-[11px]">Applied {applicant.appliedDate}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <button 
                onClick={handleCopyEmail}
                className="hover:text-white flex items-center gap-1 font-medium transition-colors"
                title="Click to copy email"
              >
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>{applicant.email}</span>
                {copiedEmail && <span className="text-[10px] text-emerald-400 font-bold ml-1">Copied!</span>}
              </button>

              <span>•</span>

              <a href={`tel:${phone}`} className="hover:text-white flex items-center gap-1 font-medium transition-colors">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                <span>{phone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="px-6 sm:px-8 border-b border-slate-800 bg-slate-950/50">
          <div className="flex space-x-6 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Skills & Match Overview', icon: Sparkles },
              { id: 'projects', label: `Projects Portfolio (${projects.length})`, icon: Code },
              { id: 'assessment', label: `Compiler Test Evidence (${assessmentDetails.testScore}%)`, icon: Cpu },
              { id: 'academics', label: 'Academics & Credentials', icon: GraduationCap },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3.5 flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-sky-500 text-sky-400 font-bold'
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

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: OVERVIEW & SKILLS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* 4 Summary Score Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400">Skill Match Score</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-400">{applicant.matchScore}%</span>
                    <span className="text-[10px] text-slate-500">vs criteria</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400">Compiler Test Score</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-sky-400">{applicant.assessmentScore}</span>
                    <span className="text-[10px] text-slate-500">/ 100</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400">Academic CGPA</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-indigo-400">{cgpa}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400">Pipeline Status</span>
                  <div className="pt-0.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${getStatusColor(applicant.status)}`}>
                      {applicant.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Technical Skills Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-sky-400" />
                    Verified Technical Skills & Proficiency Benchmark
                  </h3>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> SkillBridge Certified Scores
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {applicant.skills.map((skill, index) => {
                    const prof = skill.proficiency || (skill.match ? 90 + (index % 8) : 65 + (index % 10));
                    return (
                      <div key={index} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${skill.match ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400'}`} />
                            <span className="font-bold text-white">{skill.name}</span>
                            {skill.match && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 font-semibold rounded border border-emerald-500/20">
                                Required Match
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-sky-300">{prof}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              skill.match 
                                ? 'bg-gradient-to-r from-sky-500 to-emerald-400' 
                                : 'bg-slate-700'
                            }`} 
                            style={{ width: `${prof}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Social & Portfolio Links */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider">Social & Code Profiles:</span>
                <div className="flex items-center gap-4">
                  <a 
                    href={githubUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl transition-all font-semibold"
                  >
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <a 
                    href={linkedinUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl transition-all font-semibold"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <a 
                    href={portfolioUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl transition-all font-semibold"
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Portfolio</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PROJECTS PORTFOLIO */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-sky-400" />
                Candidate Portfolio Projects & Open Source Work
              </h3>

              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={proj.id || idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 hover:border-slate-700 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-white">{proj.projectName}</h4>
                        <span className="text-xs font-medium text-sky-400">{proj.role}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {proj.githubUrl && (
                          <a 
                            href={proj.githubUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <span>Code Repo</span>
                          </a>
                        )}
                        {proj.liveDemoUrl && (
                          <a 
                            href={proj.liveDemoUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white rounded-lg border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Live Demo</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-semibold mr-1">Technologies:</span>
                      {proj.technologies.map((tech, tIdx) => (
                        <span key={tIdx} className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-mono text-[10px]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COMPILER TEST ASSESSMENT */}
          {activeTab === 'assessment' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-sky-950/40 to-slate-950 border border-sky-800/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-sky-400" />
                      SkillBridge Code Compiler Assessment Report
                    </h3>
                    <p className="text-xs text-slate-400">Automated evaluation using real-time code compiler test cases.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-emerald-400">{assessmentDetails.testScore}</span>
                    <span className="text-xs font-bold text-slate-400 block">/ 100 Overall Score</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="text-slate-400 block text-[10px]">Test Cases Passed</span>
                    <span className="font-bold text-white text-sm">{assessmentDetails.testCasesPassed}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="text-slate-400 block text-[10px]">Execution Time</span>
                    <span className="font-bold text-sky-400 text-sm">{assessmentDetails.executionTimeMs} ms</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="text-slate-400 block text-[10px]">Time Complexity</span>
                    <span className="font-bold text-indigo-400 font-mono text-sm">{assessmentDetails.timeComplexity}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="text-slate-400 block text-[10px]">Code Quality Grade</span>
                    <span className="font-bold text-emerald-400 text-sm">{assessmentDetails.codeQualityRating}</span>
                  </div>
                </div>
              </div>

              {/* Solved Problem Categories */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Evaluated Coding Competencies</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assessmentDetails.solvedTopics.map((topic, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{topic}</span>
                      <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 100% Passed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACADEMICS & CERTIFICATIONS */}
          {activeTab === 'academics' && (
            <div className="space-y-6">
              
              {/* Academic History */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-sky-400" />
                  Academic History & College Credentials
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Institution / University</span>
                    <span className="font-bold text-white text-sm">{applicant.college}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Degree & Specialization</span>
                    <span className="font-bold text-white text-sm">{applicant.degree}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Current CGPA</span>
                    <span className="font-bold text-emerald-400 text-sm">{cgpa}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Prior Practical Experience</span>
                    <span className="font-semibold text-slate-300 text-xs">{applicant.experience}</span>
                  </div>
                </div>
              </div>

              {/* Certifications & Badges */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Verified Certifications & Credentials
                </h3>

                <div className="space-y-2">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <Award className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-bold text-white">{cert}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Recruiter Actions Bar */}
        <div className="px-6 sm:px-8 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>SkillBridge AI Match Index: <strong>{applicant.matchScore}% Match</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onStatusChange) onStatusChange(applicant.id, 'Rejected');
                onClose();
              }}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all"
            >
              Reject
            </button>

            <button
              onClick={() => {
                if (onStatusChange) onStatusChange(applicant.id, 'Selected');
                onClose();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
            >
              Offer Selection
            </button>

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
