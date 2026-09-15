import React from 'react';
import { 
  Briefcase, 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Building2, 
  Star,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Candidate {
  id: string;
  name: string;
  roleTitle: string;
  type: 'internship' | 'job';
  matchScore: number;
  skills: { name: string; match: boolean }[];
  college: string;
  experience: string;
  assessmentScore: number;
  status: 'Applied' | 'Shortlisted' | 'Assessment Pending' | 'Interview' | 'Selected' | 'Rejected';
}

export const CompanyDashboardPage: React.FC = () => {
  const navigate = useNavigate();


  const candidates: Candidate[] = [
    {
      id: 'c1',
      name: 'Aarav Sharma',
      roleTitle: 'Frontend Developer Intern',
      type: 'internship',
      matchScore: 95,
      skills: [{ name: 'React', match: true }, { name: 'TypeScript', match: true }, { name: 'Tailwind CSS', match: true }, { name: 'Node.js', match: true }],
      college: 'Indian Institute of Technology, Delhi',
      experience: '2 Personal Projects, 1 Open Source Contribution',
      assessmentScore: 92,
      status: 'Shortlisted'
    },
    {
      id: 'c2',
      name: 'Priya Patel',
      roleTitle: 'Full Stack Engineer',
      type: 'job',
      matchScore: 91,
      skills: [{ name: 'React', match: true }, { name: 'Python', match: true }, { name: 'PostgreSQL', match: true }, { name: 'Docker', match: true }],
      college: 'National Institute of Technology, Surathkal',
      experience: '1 year Junior Developer Experience',
      assessmentScore: 88,
      status: 'Interview'
    },
    {
      id: 'c3',
      name: 'Rohan Gupta',
      roleTitle: 'Backend Developer Intern',
      type: 'internship',
      matchScore: 87,
      skills: [{ name: 'Node.js', match: true }, { name: 'Express', match: true }, { name: 'MongoDB', match: true }, { name: 'Redis', match: false }],
      college: 'Bits Pilani',
      experience: 'REST API Portfolio, Compiler Project',
      assessmentScore: 85,
      status: 'Assessment Pending'
    },
    {
      id: 'c4',
      name: 'Ananya Verma',
      roleTitle: 'Data Analyst Associate',
      type: 'job',
      matchScore: 94,
      skills: [{ name: 'Python', match: true }, { name: 'R', match: true }, { name: 'SQL', match: true }, { name: 'PowerBI', match: true }],
      college: 'Delhi Technological University',
      experience: 'Data Cleaning & Visualization Dashboard',
      assessmentScore: 96,
      status: 'Selected'
    },
    {
      id: 'c5',
      name: 'Vikram Singh',
      roleTitle: 'React Native Mobile Developer',
      type: 'job',
      matchScore: 84,
      skills: [{ name: 'React Native', match: true }, { name: 'JavaScript', match: true }, { name: 'Redux', match: true }, { name: 'GraphQL', match: false }],
      college: 'Vellore Institute of Technology',
      experience: '2 Published Play Store Apps',
      assessmentScore: 81,
      status: 'Interview'
    }
  ];

  const topInternshipApplicants = candidates.filter(c => c.type === 'internship').sort((a, b) => b.matchScore - a.matchScore);
  const topJobApplicants = candidates.filter(c => c.type === 'job').sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-800/40 rounded-2xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Company Recruiter Dashboard</h1>
          </div>
          <p className="text-xs text-slate-400">
            Review top candidates ranked by skill match, track active postings & schedule interviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/company/post-opportunity')}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Opportunity</span>
          </button>
        </div>
      </div>

      {/* 7 Core KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Active Internships</span>
            <Briefcase className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-xl font-extrabold text-white block">6</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Active Jobs</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-xl font-extrabold text-white block">4</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Total Applicants</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-xl font-extrabold text-white block">142</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Shortlisted</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl font-extrabold text-white block">28</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Pending Test</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl font-extrabold text-white block">19</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Interviews</span>
            <Calendar className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-xl font-extrabold text-white block">12</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Selected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl font-extrabold text-white block">8</span>
        </div>

      </div>

      {/* Top Talent – Internships Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Top Talent – Internships
            </h2>
            <p className="text-xs text-slate-400">
              Discovered talent ranked by multi-factor scoring from real profile data — <strong>not applicants</strong>.
            </p>
          </div>

          <button
            onClick={() => navigate('/company/top-talent/internships')}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <span>Explore Top Talent – Internships</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Candidate Name</th>
                  <th className="py-3 px-4">Target Internship</th>
                  <th className="py-3 px-4">Skill Match Score</th>
                  <th className="py-3 px-4">Verified Skills</th>
                  <th className="py-3 px-4">Assessment Evidence</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {topInternshipApplicants.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block text-sm">{applicant.name}</span>
                      <span className="text-[11px] text-slate-400">{applicant.college}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {applicant.roleTitle}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs">
                          {applicant.matchScore}% Match
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {applicant.skills.map((s, i) => (
                          <span 
                            key={i}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
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
                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-semibold">{applicant.assessmentScore}/100 Code Score</span>
                      <span className="text-[10px] text-slate-500 block">{applicant.experience}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => navigate('/company/top-talent/internships')}
                        className="px-3 py-1.5 bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 rounded-lg text-xs font-semibold transition-all"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Talent – Jobs Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Top Talent – Jobs
            </h2>
            <p className="text-xs text-slate-400">
              Full-time job talent ranked by industry skill benchmarks — <strong>not applicants</strong>.
            </p>
          </div>

          <button
            onClick={() => navigate('/company/top-talent/jobs')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Explore Top Talent – Jobs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Candidate Name</th>
                  <th className="py-3 px-4">Position Applied</th>
                  <th className="py-3 px-4">Skill Match Score</th>
                  <th className="py-3 px-4">Required Skills</th>
                  <th className="py-3 px-4">Experience & Assessment</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {topJobApplicants.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block text-sm">{applicant.name}</span>
                      <span className="text-[11px] text-slate-400">{applicant.college}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {applicant.roleTitle}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs">
                        {applicant.matchScore}% Match
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {applicant.skills.map((s, i) => (
                          <span 
                            key={i}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              s.match 
                                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-semibold">{applicant.assessmentScore}/100 Exam Score</span>
                      <span className="text-[10px] text-slate-500 block">{applicant.experience}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => navigate('/company/applicants')}
                        className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-semibold transition-all"
                      >
                        Schedule Interview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
