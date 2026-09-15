import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle,
  Search,
  ArrowRight,
  GraduationCap,
  Award,
  ChevronRight,
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  Star,
  MessageSquare,
  Clock
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { companyApplicantsData, initialOpportunities } from '../data/companyApplicantsData';
import type { CompanyApplicant } from '../data/companyApplicantsData';
import { CandidateProfileModal } from '../components/company/CandidateProfileModal';
import { TalentStudentProfileModal } from '../components/company/TalentStudentProfileModal';
import { InterviewFeedbackModal } from '../components/company/InterviewFeedbackModal';
import { fetchTopTalent } from '../services/topTalentApiService';
import type { TalentProfile } from '../services/topTalentApiService';
import { fetchInterviewBatches } from '../services/interviewApiService';
import type { InterviewItem, InterviewBatch } from '../services/interviewApiService';


// 1. Post Opportunity Page
export const PostOpportunityPage: React.FC = () => {
  const [type, setType] = useState<'internship' | 'job'>('internship');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Post New Opportunity</h1>
          <p className="text-xs text-slate-400">Create a new internship or job listing for industry-ready candidates.</p>
        </div>
        <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setType('internship')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              type === 'internship' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Post Internship
          </button>
          <button
            onClick={() => setType('job')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              type === 'job' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Post Job
          </button>
        </div>
      </div>

      {submitted ? (
        <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Opportunity Published Successfully!</h3>
          <p className="text-xs text-slate-300">Candidates will be automatically matched based on your required skill metrics.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold"
          >
            Post Another Opportunity
          </button>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Role Title *
              </label>
              <input
                type="text"
                placeholder={type === 'internship' ? 'e.g. Frontend Developer Intern' : 'e.g. Full Stack Engineer'}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:border-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Stipend / Salary Range *
              </label>
              <input
                type="text"
                placeholder={type === 'internship' ? 'e.g. â‚¹25,000 / month' : 'e.g. â‚¹12 - â‚¹18 LPA'}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Required Skills (Comma Separated) *
            </label>
            <input
              type="text"
              placeholder="e.g. React, TypeScript, Node.js, Tailwind CSS"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:border-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Role Description & Key Responsibilities
            </label>
            <textarea
              rows={4}
              placeholder="Describe candidate responsibilities, expectations & deliverables..."
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:border-sky-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setSubmitted(true)}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-600/30 transition-all"
            >
              Publish Opportunity
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. My Opportunities Page
export const MyOpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [subTab, setSubTab] = useState<'active' | 'drafts' | 'closed'>('active');

  const opportunities = initialOpportunities;

  const filtered = opportunities.filter(o => subTab === 'active' ? o.status === 'active' : subTab === 'drafts' ? o.status === 'drafts' : o.status === 'closed');

  const handleOpenApplicants = (title: string) => {
    navigate(`/company/applicants?opportunity=${encodeURIComponent(title)}`, {
      state: { selectedOpportunity: title }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Posted Opportunities</h1>
          <p className="text-xs text-slate-400">Click any opportunity card below to view its candidate applicants pipeline.</p>
        </div>
        <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSubTab('active')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${subTab === 'active' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Active Listings (3)
          </button>
          <button
            onClick={() => setSubTab('drafts')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${subTab === 'drafts' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Drafts (1)
          </button>
          <button
            onClick={() => setSubTab('closed')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${subTab === 'closed' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Closed (0)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((opp) => (
          <div 
            key={opp.id} 
            onClick={() => handleOpenApplicants(opp.title)}
            className="group relative p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900 shadow-xl transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.01]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                  opp.type === 'Internship' 
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}>
                  {opp.type}
                </span>
                <span className="text-[11px] font-medium text-slate-500">{opp.posted}</span>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors flex items-center justify-between">
                  <span>{opp.title}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-slate-300">
                    {opp.applicantsCount > 0 ? `${opp.applicantsCount} Total Applicants Matched` : '0 Applicants (Draft)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" /> Receiving Applications
              </span>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenApplicants(opp.title);
                }}
                className="px-3 py-1.5 bg-sky-600/20 group-hover:bg-sky-600 text-sky-300 group-hover:text-white border border-sky-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
              >
                <span>View Applicants</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Applicants Page (Application Flow â€” students who explicitly applied)
export const ApplicantsPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialOppFilter = (location.state as any)?.selectedOpportunity || searchParams.get('opportunity') || 'all';

  const [selectedOpportunity, setSelectedOpportunity] = useState<string>(initialOppFilter);
  const [statusFilter, setStatusFilter] = useState<string>('Applied');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [applicants, setApplicants] = useState<CompanyApplicant[]>(companyApplicantsData);
  const [selectedApplicantModal, setSelectedApplicantModal] = useState<CompanyApplicant | null>(null);

  useEffect(() => {
    const oppParam = (location.state as any)?.selectedOpportunity || searchParams.get('opportunity');
    if (oppParam) {
      setSelectedOpportunity(oppParam);
    }
  }, [location]);

  const handleStatusChange = (applicantId: string, newStatus: CompanyApplicant['status']) => {
    setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, status: newStatus } : a));
    if (selectedApplicantModal && selectedApplicantModal.id === applicantId) {
      setSelectedApplicantModal(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const filteredApplicants = applicants.filter(applicant => {
    if (selectedOpportunity !== 'all' && applicant.opportunityTitle !== selectedOpportunity) {
      return false;
    }
    if (applicant.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = applicant.name.toLowerCase().includes(q);
      const matchCollege = applicant.college.toLowerCase().includes(q);
      const matchSkills = applicant.skills.some(s => s.name.toLowerCase().includes(q));
      const matchRole = applicant.opportunityTitle.toLowerCase().includes(q);
      return matchName || matchCollege || matchSkills || matchRole;
    }
    return true;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'Candidates';
      case 'Shortlisted':
        return 'Shortlisted';
      case 'Assessment Pending':
        return 'Pending Test';
      case 'Interview':
        return 'Interviewing';
      case 'Selected':
        return 'Selected';
      case 'Rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'Shortlisted':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Assessment Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Interview':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'Selected':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      <CandidateProfileModal 
        applicant={selectedApplicantModal}
        onClose={() => setSelectedApplicantModal(null)}
        onStatusChange={handleStatusChange}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-400" />
            Candidate Applications Pipeline
          </h1>
          <p className="text-xs text-slate-400">
            Select a stage below to view candidates. Click any candidate row to review their resume, project portfolio & compiler scores.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium pl-2 hidden sm:inline">Role Filter:</span>
          <select
            value={selectedOpportunity}
            onChange={(e) => setSelectedOpportunity(e.target.value)}
            className="bg-slate-950 text-white font-semibold py-1.5 px-3 rounded-lg border border-slate-800 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Opportunities</option>
            <option value="Frontend Developer Intern">Frontend Developer Intern</option>
            <option value="Full Stack Engineer">Full Stack Engineer</option>
            <option value="Backend Node.js Intern">Backend Node.js Intern</option>
          </select>
        </div>
      </div>

      {selectedOpportunity !== 'all' && (
        <div className="p-4 rounded-xl bg-sky-950/60 border border-sky-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="font-bold text-white">Filtered Applications for: {selectedOpportunity}</span>
          </div>
          <button
            onClick={() => setSelectedOpportunity('all')}
            className="text-sky-400 hover:text-sky-300 font-semibold hover:underline"
          >
            Clear Filter (Show All)
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 text-xs p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          {[
            { id: 'Applied', label: 'Candidates', count: applicants.filter(a => (selectedOpportunity === 'all' || a.opportunityTitle === selectedOpportunity) && a.status === 'Applied').length },
            { id: 'Shortlisted', label: 'Shortlisted', count: applicants.filter(a => (selectedOpportunity === 'all' || a.opportunityTitle === selectedOpportunity) && a.status === 'Shortlisted').length },
            { id: 'Assessment Pending', label: 'Pending Test', count: applicants.filter(a => (selectedOpportunity === 'all' || a.opportunityTitle === selectedOpportunity) && a.status === 'Assessment Pending').length },
            { id: 'Interview', label: 'Interviewing', count: applicants.filter(a => (selectedOpportunity === 'all' || a.opportunityTitle === selectedOpportunity) && a.status === 'Interview').length },
            { id: 'Selected', label: 'Selected', count: applicants.filter(a => (selectedOpportunity === 'all' || a.opportunityTitle === selectedOpportunity) && a.status === 'Selected').length },
            { id: 'Rejected', label: 'Rejected', count: applicants.filter(a => (selectedOpportunity === 'all' || a.opportunityTitle === selectedOpportunity) && a.status === 'Rejected').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                statusFilter === tab.id 
                  ? 'bg-sky-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label} <span className="opacity-75 font-mono text-[11px] ml-1">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, college, skills..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Applicant Name</th>
                <th className="py-3.5 px-4">Applied Opportunity</th>
                <th className="py-3.5 px-4">Skill Match</th>
                <th className="py-3.5 px-4">Verified Tech Stack</th>
                <th className="py-3.5 px-4">Assessment Evidence</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredApplicants.map((applicant) => (
                <tr 
                  key={applicant.id} 
                  onClick={() => setSelectedApplicantModal(applicant)}
                  className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white group-hover:text-sky-300 text-sm block transition-colors">{applicant.name}</span>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <GraduationCap className="w-3 h-3 text-sky-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{applicant.college}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block">{applicant.degree}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-slate-200 block">{applicant.opportunityTitle}</span>
                    <span className="text-[10px] font-medium text-slate-500 uppercase">{applicant.opportunityType} â€¢ {applicant.appliedDate}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs inline-block">
                      {applicant.matchScore}% Match
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {applicant.skills.map((s, idx) => (
                        <span 
                          key={idx}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            s.match 
                              ? 'bg-sky-500/10 text-sky-300 border-sky-500/20' 
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-200 block">{applicant.assessmentScore}/100 Compiler Score</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1 max-w-[180px]">{applicant.experience}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(applicant.status)}`}>
                      {getStatusLabel(applicant.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        type="button"
                        onClick={() => setSelectedApplicantModal(applicant)}
                        title="View Resume & Profile"
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                      >
                        View Profile
                      </button>

                      {applicant.status === 'Applied' && (
                        <button 
                          type="button"
                          onClick={() => handleStatusChange(applicant.id, 'Shortlisted')}
                          title="Shortlist Candidate after reviewing resume"
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all"
                        >
                          Shortlist
                        </button>
                      )}

                      {applicant.status === 'Shortlisted' && (
                        <button 
                          type="button"
                          onClick={() => handleStatusChange(applicant.id, 'Assessment Pending')}
                          title="Move candidate to Pending Test stage"
                          className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 rounded-lg text-xs font-semibold transition-all"
                        >
                          Send Test
                        </button>
                      )}

                      {applicant.status === 'Assessment Pending' && (
                        <button 
                          type="button"
                          onClick={() => handleStatusChange(applicant.id, 'Interview')}
                          title="Move candidate to Interview stage"
                          className="px-2.5 py-1 bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 rounded-lg text-xs font-semibold transition-all"
                        >
                          Interview
                        </button>
                      )}

                      {applicant.status === 'Interview' && (
                        <button 
                          type="button"
                          onClick={() => handleStatusChange(applicant.id, 'Selected')}
                          title="Offer Selection to Candidate"
                          className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-semibold transition-all"
                        >
                          Offer Selection
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}

              {filteredApplicants.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                    <Users className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-sm font-semibold">No candidates found matching the selected filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 4. Top Talent â€“ Internships Page (Talent Discovery Flow â€” NOT Applications)
export const TopTalentInternshipsPage: React.FC = () => {
  const [talent, setTalent] = useState<TalentProfile[]>([]);
  const [factorLabels, setFactorLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<TalentProfile | null>(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTalent();
  }, [roleFilter]);

  const loadTalent = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTopTalent('internship', roleFilter || undefined);
      setTalent(result.talent || []);
      setFactorLabels(result.factor_labels || {});
    } catch (err: any) {
      setError(err.message || 'Failed to load talent data');
      setTalent([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTalent = talent.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return t.name.toLowerCase().includes(q) ||
      t.college.toLowerCase().includes(q) ||
      t.target_role.toLowerCase().includes(q) ||
      t.technical_skills.some(s => s.name.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">

      <TalentStudentProfileModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        factorLabels={factorLabels}
        onSendInterviewRequest={(uid) => {
          console.log('Interview request sent for:', uid);
        }}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Top Talent â€“ Internships
          </h1>
          <p className="text-xs text-slate-400">
            Discovered talent ranked by multi-factor scoring from real profile data. <strong>These students have not applied.</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, skills..."
              className="pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 w-48"
            />
          </div>
          <input
            type="text"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            placeholder="Filter by role..."
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 w-40"
          />
        </div>
      </div>

      {/* Discovery Notice Banner */}
      <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/30 flex items-center gap-3 text-xs">
        <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
        <span className="text-violet-200">
          <strong>Talent Discovery Flow</strong> â€” Students below are ranked from profile data. They have not applied to your opportunities.
          Use "Send Interview Request" to connect.
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-violet-400 mx-auto animate-spin" />
          <p className="text-sm text-slate-400">Scoring talent from database...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-950/30 border border-red-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-red-300">{error}</p>
          <p className="text-xs text-slate-400">Make sure the backend is running and demo students are seeded.</p>
          <button onClick={loadTalent} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold">
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Target Role</th>
                  <th className="py-3.5 px-4">Talent Score</th>
                  <th className="py-3.5 px-4">Key Skills</th>
                  <th className="py-3.5 px-4">Assessment</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTalent.map((student) => (
                  <tr key={student.uid} onClick={() => setSelectedStudent(student)} className="hover:bg-slate-800/40 transition-colors cursor-pointer group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-white block text-sm group-hover:text-violet-300 transition-colors">{student.name}</span>
                          <span className="text-[11px] text-slate-400">{student.college}</span>
                          {student.is_demo && <span className="ml-1.5 text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded">Demo</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200">{student.target_role || 'Not specified'}</span>
                      <span className="text-[10px] text-slate-500 block">{student.graduation_year && `Grad: ${student.graduation_year}`}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold text-xs">
                        {student.overall_score}% Score
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {student.technical_skills.slice(0, 4).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded text-[10px] font-semibold">
                            {s.name}
                          </span>
                        ))}
                        {student.technical_skills.length > 4 && (
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px]">+{student.technical_skills.length - 4}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {student.assessment_details?.testScore ? (
                        <span className="font-semibold text-slate-200">{student.assessment_details.testScore}/100</span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No assessment</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="px-3 py-1.5 bg-violet-600/20 text-violet-300 hover:bg-violet-600 hover:text-white border border-violet-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <Send className="w-3 h-3" />
                        View & Request
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTalent.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                      <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="text-sm font-semibold">No talent profiles found.</p>
                      <p className="text-xs">Run <code className="px-2 py-0.5 bg-slate-800 rounded text-violet-400">python backend/seed_demo_students.py</code> to seed demo data.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. Top Talent â€“ Jobs Page (Talent Discovery Flow â€” NOT Applications)
export const TopTalentJobsPage: React.FC = () => {
  const [talent, setTalent] = useState<TalentProfile[]>([]);
  const [factorLabels, setFactorLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<TalentProfile | null>(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTalent();
  }, [roleFilter]);

  const loadTalent = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTopTalent('job', roleFilter || undefined);
      setTalent(result.talent || []);
      setFactorLabels(result.factor_labels || {});
    } catch (err: any) {
      setError(err.message || 'Failed to load talent data');
      setTalent([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTalent = talent.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return t.name.toLowerCase().includes(q) ||
      t.college.toLowerCase().includes(q) ||
      t.target_role.toLowerCase().includes(q) ||
      t.technical_skills.some(s => s.name.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">

      <TalentStudentProfileModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        factorLabels={factorLabels}
        onSendInterviewRequest={(uid) => {
          console.log('Interview request sent for:', uid);
        }}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-400" />
            Top Talent â€“ Jobs
          </h1>
          <p className="text-xs text-slate-400">
            Full-time job talent ranked by industry skill benchmarks. <strong>These students have not applied.</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, skills..."
              className="pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48"
            />
          </div>
          <input
            type="text"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            placeholder="Filter by role..."
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-40"
          />
        </div>
      </div>

      <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3 text-xs">
        <Award className="w-4 h-4 text-indigo-400 shrink-0" />
        <span className="text-indigo-200">
          <strong>Talent Discovery Flow</strong> â€” Students below are ranked from profile data. They have not applied.
          Use "Send Interview Request" to connect.
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-400 mx-auto animate-spin" />
          <p className="text-sm text-slate-400">Scoring talent from database...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-950/30 border border-red-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={loadTalent} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">Retry</button>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Target Role</th>
                  <th className="py-3.5 px-4">Talent Score</th>
                  <th className="py-3.5 px-4">Key Skills</th>
                  <th className="py-3.5 px-4">Assessment</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTalent.map((student) => (
                  <tr key={student.uid} onClick={() => setSelectedStudent(student)} className="hover:bg-slate-800/40 transition-colors cursor-pointer group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-white block text-sm group-hover:text-indigo-300 transition-colors">{student.name}</span>
                          <span className="text-[11px] text-slate-400">{student.college}</span>
                          {student.is_demo && <span className="ml-1.5 text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded">Demo</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200">{student.target_role || 'Not specified'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs">
                        {student.overall_score}% Score
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {student.technical_skills.slice(0, 4).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded text-[10px] font-semibold">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {student.assessment_details?.testScore ? (
                        <span className="font-semibold text-slate-200">{student.assessment_details.testScore}/100</span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No assessment</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <Send className="w-3 h-3" />
                        View & Request
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTalent.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                      <Award className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="text-sm font-semibold">No talent profiles found.</p>
                      <p className="text-xs">Run <code className="px-2 py-0.5 bg-slate-800 rounded text-indigo-400">python backend/seed_demo_students.py</code> to seed demo data.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Backward compatibility exports
export const TopApplicantsInternshipsPage = TopTalentInternshipsPage;
export const TopApplicantsJobsPage = TopTalentJobsPage;

// 6. Interviews Page (3 AI Role Batches backed by PostgreSQL demo records)
export const InterviewsPage: React.FC = () => {
  const [batches, setBatches] = useState<InterviewBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatchName, setSelectedBatchName] = useState<string>('');
  
  // Modals state
  const [selectedInterviewForFeedback, setSelectedInterviewForFeedback] = useState<InterviewItem | null>(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<TalentProfile | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchInterviewBatches('company_acme_corp');
      const fetchedBatches = res.batches || [];
      setBatches(fetchedBatches);
      if (fetchedBatches.length > 0) {
        setSelectedBatchName(fetchedBatches[0].batch_name);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load interview batches from PostgreSQL');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSaved = (updatedItem: InterviewItem) => {
    setBatches(prevBatches =>
      prevBatches.map(b => {
        const updateList = (list: InterviewItem[]) =>
          list.map(item => (item.id === updatedItem.id ? updatedItem : item));
        
        let completed = updateList(b.completed_interviews);
        let pending = updateList(b.pending_interviews);

        // If status changed to COMPLETED, move item from pending to completed
        if (updatedItem.status === 'COMPLETED') {
          const pendingItemIndex = pending.findIndex(i => i.id === updatedItem.id);
          if (pendingItemIndex !== -1) {
            pending.splice(pendingItemIndex, 1);
            if (!completed.some(i => i.id === updatedItem.id)) {
              completed.push(updatedItem);
            }
          }
        }

        return {
          ...b,
          completed_count: completed.length,
          pending_count: pending.length,
          total_count: completed.length + pending.length,
          completed_interviews: completed,
          pending_interviews: pending,
        };
      })
    );
  };

  const openCandidateProfile = (item: InterviewItem) => {
    const profileAdapter: TalentProfile = {
      uid: item.student_uid,
      name: item.student_name,
      avatar_url: item.avatar_url || '',
      about_me: `Candidate for ${item.role}. Skill match: ${item.skill_match}, Compiler score: ${item.assessment_score}.`,
      college: item.student_college,
      degree: item.student_degree,
      department: 'Computer Science & Engineering',
      graduation_year: '2025',
      cgpa: '9.2 / 10.0',
      target_role: item.role,
      preferred_locations: ['Bengaluru', 'Remote'],
      work_mode: 'remote',
      overall_score: parseInt(item.skill_match.replace('%', '')) || 95,
      factors: {},
      technical_skills: [
        { name: item.role.includes('Frontend') ? 'React' : item.role.includes('Node') ? 'Node.js' : 'Python', proficiency: 'Expert', score: 96 },
        { name: 'TypeScript', proficiency: 'Advanced', score: 92 },
        { name: 'PostgreSQL', proficiency: 'Advanced', score: 90 },
        { name: 'Tailwind CSS', proficiency: 'Expert', score: 95 }
      ],
      soft_skills: ['Problem Solving', 'Teamwork', 'Communication'],
      projects: [
        {
          projectName: `${item.role} Production System`,
          description: `High performance enterprise project aligned with ${item.role} requirements.`,
          technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
          role: 'Lead Developer',
          githubUrl: 'https://github.com/skillbridge/demo-project'
        }
      ],
      experiences: [
        {
          company: 'Tech Solutions Lab',
          role: 'Software Developer Intern',
          duration: '6 Months',
          description: 'Built scalable cloud features and UI components.'
        }
      ],
      certifications: ['SkillBridge Verified Candidate'],
      achievements: ['SIH Finalist Candidate'],
      assessment_details: {
        testScore: parseInt(item.assessment_score.split('/')[0]) || 95,
        testCasesPassed: '20 / 20 Passed',
        executionTimeMs: 15,
        timeComplexity: 'O(N log N)',
        codeQualityRating: 'A+ Production Grade'
      },
      industry_readiness: 95,
      roadmap_progress: 92,
      is_demo: item.is_demo,
    };
    setSelectedStudentForProfile(profileAdapter);
  };

  const activeBatch = batches.find(b => b.batch_name === selectedBatchName) || batches[0];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ACCEPTED':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'SCHEDULED':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Modals */}
      <InterviewFeedbackModal
        interview={selectedInterviewForFeedback}
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onFeedbackSaved={handleFeedbackSaved}
      />

      <TalentStudentProfileModal
        student={selectedStudentForProfile}
        onClose={() => setSelectedStudentForProfile(null)}
        onSendInterviewRequest={(uid) => {
          console.log('Interview request sent for:', uid);
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-sky-400" />
            Company Interview Batches & Evaluation
          </h1>
          <p className="text-xs text-slate-400">
            3 AI-generated role batches from company hiring roles. Stored in PostgreSQL with <code className="px-1.5 py-0.5 bg-slate-800 rounded text-sky-300 font-mono text-[10px]">is_demo=True</code>.
          </p>
        </div>

        <button
          onClick={loadBatches}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 self-start md:self-auto transition-all"
        >
          <Loader2 className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : 'text-slate-400'}`} />
          Refresh Batches
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-sky-400 mx-auto animate-spin" />
          <p className="text-sm text-slate-400">Loading AI role-based interview batches from PostgreSQL...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-950/30 border border-red-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={loadBatches} className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold">
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* 1. TOP BAR: 3 AI-Generated Role-Based Batches */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {batches.map((batch, idx) => {
              const isActive = batch.batch_name === selectedBatchName;
              return (
                <div
                  key={batch.batch_id || idx}
                  onClick={() => setSelectedBatchName(batch.batch_name)}
                  className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isActive
                      ? 'bg-slate-900 border-sky-500 shadow-xl shadow-sky-500/10 ring-1 ring-sky-500/50 scale-[1.02]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        AI Role Batch #{idx + 1}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded uppercase">
                        {batch.opportunity_type}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                        {batch.role_title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {batch.ai_summary}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px]">
                        {batch.completed_count} Completed
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[11px]">
                        {batch.pending_count} Pending
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Total: {batch.total_count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Batch Summary Banner */}
          {activeBatch && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                <div>
                  <span className="font-bold text-white text-sm block">Selected: {activeBatch.batch_name}</span>
                  <span className="text-slate-400 text-[11px]">{activeBatch.ai_summary}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold">
                  {activeBatch.completed_count} Completed Interviews
                </span>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-bold">
                  {activeBatch.pending_count} Pending Interviews
                </span>
              </div>
            </div>
          )}

          {/* 2. DUAL LISTS: Completed Interviews & Pending Interviews */}
          {activeBatch && (
            <div className="space-y-8">
              {/* SECTION A: Completed Interviews */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    Completed Interviews ({activeBatch.completed_interviews.length})
                  </h2>
                  <span className="text-xs text-slate-400">Past candidate interview sessions & recruiter evaluations</span>
                </div>

                {activeBatch.completed_interviews.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                    No completed interviews in this batch yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {activeBatch.completed_interviews.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white text-base font-bold shrink-0 shadow-md">
                            {item.student_name.charAt(0)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                                {item.student_name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                {item.status}
                              </span>
                              {item.is_demo && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-mono">
                                  is_demo=True
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-400 font-medium">
                              {item.student_college} • {item.student_degree}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                              <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                                {item.skill_match} Skill Match
                              </span>
                              <span className="px-2.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold">
                                {item.assessment_score} Code Score
                              </span>
                              <span className="text-slate-400 flex items-center gap-1 ml-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                {item.proposed_date} at {item.proposed_time}
                              </span>
                            </div>

                            {/* Recruiter Feedback Preview */}
                            {item.feedback && (
                              <div className="mt-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                                  <span className="flex items-center gap-1 text-emerald-400">
                                    <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                                    Recruiter Rating: {item.rating}
                                  </span>
                                  <span className="text-[10px] text-slate-500 uppercase font-mono">Stored in PostgreSQL</span>
                                </div>
                                <p className="italic text-slate-300 line-clamp-2">"{item.feedback}"</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <button
                            onClick={() => openCandidateProfile(item)}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInterviewForFeedback(item);
                              setFeedbackModalOpen(true);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Feedback & Evaluation
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION B: Pending Interviews */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    Pending Interviews ({activeBatch.pending_interviews.length})
                  </h2>
                  <span className="text-xs text-slate-400">Upcoming scheduled interview slots awaiting recruiter evaluation</span>
                </div>

                {activeBatch.pending_interviews.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                    No pending interviews in this batch.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {activeBatch.pending_interviews.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center text-white text-base font-bold shrink-0 shadow-md">
                            {item.student_name.charAt(0)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                                {item.student_name}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(item.status)}`}>
                                {item.status}
                              </span>
                              {item.is_demo && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-mono">
                                  is_demo=True
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-400 font-medium">
                              {item.student_college} • {item.student_degree}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                              <span className="px-2.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold">
                                {item.skill_match} Skill Match
                              </span>
                              <span className="px-2.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold">
                                {item.assessment_score} Code Score
                              </span>
                              <span className="text-amber-300 font-semibold flex items-center gap-1 ml-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                <Clock className="w-3 h-3 text-amber-400" />
                                {item.proposed_date} at {item.proposed_time}
                              </span>
                            </div>

                            {item.message && (
                              <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
                                Note: "{item.message}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <button
                            onClick={() => openCandidateProfile(item)}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInterviewForFeedback(item);
                              setFeedbackModalOpen(true);
                            }}
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Evaluate & Feedback
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// 7. Company Profile Page
export { CompanyProfilePage } from './CompanyProfilePage';

