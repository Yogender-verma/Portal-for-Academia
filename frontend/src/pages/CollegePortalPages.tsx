import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Award, 
  FileSpreadsheet, 
  Search,
  Download,
  School,
  Mail,
  CheckCircle,
  Edit3,
  X,
  Plus,
  Save,
  Sparkles,
  Briefcase,
  Handshake,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  User,
  Layers,
  MapPin,
  Share2,
  Copy,
  ExternalLink,
  Calendar,
  Clock,
  Building,
  Users,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { CollegeProfile } from '../types/collegeProfile';
import { fetchCollegeProfileFromBackend, saveCollegeProfileToBackend } from '../services/collegeProfileApiService';
import { 
  fetchCollegeStudents, 
  fetchCollegeSkillAnalytics, 
  fetchCollegeInternships, 
  fetchCollegeInternshipById,
  fetchCollegePlacements, 
  fetchCollegeCompanies, 
  fetchCollegeJobById,
  fetchCollegePartnerById,
  fetchCollegeCareerReadiness, 
  fetchCollegeReports,
  fetchCollegeStudentsBySkill,
  fetchCollegeStudentsByDepartment,
  type CollegeStudentItem,
  type CollegeInternship,
  type CollegeJobOpportunity,
  type CollegeIndustryPartner,
  type CollegePlacementsData,
  type CollegeCareerReadinessData,
  type CollegeReportItem,
  type StudentFilters
} from '../services/collegeApiService';
import { TalentStudentProfileModal } from '../components/company/TalentStudentProfileModal';
import type { TalentProfile } from '../services/topTalentApiService';
import { getMockStudentsBySkill, getMockStudentsByDepartment } from '../data/mockCollegeSkillDrilldownData';

// Helper to convert CollegeStudentItem to TalentProfile for read-only modal viewing
const mapCollegeStudentToTalentProfile = (s: CollegeStudentItem): TalentProfile => ({
  uid: s.uid,
  name: s.name,
  avatar_url: s.avatar_url || '',
  college: 'National Institute of Technology',
  degree: 'B.Tech',
  department: s.department,
  graduation_year: s.year || '2026',
  cgpa: s.cgpa || '8.5',
  target_role: s.target_role || 'Software Engineer',
  preferred_locations: ['Pune', 'Bangalore', 'Remote'],
  work_mode: 'Hybrid',
  overall_score: s.skill_score,
  industry_readiness: s.industry_readiness,
  roadmap_progress: s.roadmap_progress,
  about_me: `Student in ${s.department} (${s.year}) targeting ${s.target_role}. Readiness Status: ${s.readiness_category}.`,
  is_demo: s.is_demo,
  technical_skills: (s.skills || []).map(skill => ({ name: skill, proficiency: 'Advanced', score: s.skill_score })),
  soft_skills: ['Problem Solving', 'Team Work', 'Technical Writing'],
  experiences: s.internship_status === 'Active Internship' ? [{ role: 'Intern', company: 'Industry Partner Corp', duration: '3 Months' }] : [],
  projects: [
    {
      projectName: `${s.target_role || 'Software'} Development Capstone`,
      role: 'Lead Architect',
      description: `Full stack production project implemented using ${(s.skills || ['React', 'Python']).slice(0, 3).join(', ')}.`,
      technologies: s.skills || ['React', 'Python'],
      githubUrl: 'https://github.com/example/student-project',
      liveDemoUrl: 'https://demo-app.example.com'
    }
  ],
  certifications: [{ name: 'Certified Software Developer' }],
  achievements: [{ title: 'Top Institutional Skill Index' }],
  assessment_details: {
    testScore: s.assessment_score || 85,
    testCasesPassed: '10 / 10',
    executionTimeMs: 120,
    timeComplexity: 'O(N log N)',
    codeQualityRating: 'A+',
    solvedTopics: s.skills || ['Data Structures', 'Algorithms']
  },
  factors: {
    skill_match: { weight: 0.35, score: s.skill_score, weighted: Math.round(s.skill_score * 0.35) },
    assessment: { weight: 0.30, score: s.assessment_score || 80, weighted: Math.round((s.assessment_score || 80) * 0.30) },
    readiness: { weight: 0.25, score: s.industry_readiness, weighted: Math.round(s.industry_readiness * 0.25) },
    roadmap: { weight: 0.10, score: s.roadmap_progress, weighted: Math.round(s.roadmap_progress * 0.10) }
  }
});


// 1. College Students Directory Page
export const CollegeStudentsPage: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<CollegeStudentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedReadiness, setSelectedReadiness] = useState('');
  const [selectedPlacement, setSelectedPlacement] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 50;

  // Selected student for read-only modal
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<TalentProfile | null>(null);

  const [availableDepts, setAvailableDepts] = useState<string[]>([]);

  const loadStudents = async (pageToFetch: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters: StudentFilters = {
        department: selectedDept || undefined,
        year: selectedYear || undefined,
        readiness_category: selectedReadiness || undefined,
        placement_status: selectedPlacement || undefined,
        search: searchTerm || undefined,
        page: pageToFetch,
        limit: pageSize
      };
      const res = await fetchCollegeStudents(activeFilters, user?.uid);
      setStudents(res.students || []);
      setTotalCount(res.total || 0);
      setTotalPages(res.total_pages || Math.ceil((res.total || 0) / pageSize) || 1);
      setCurrentPage(pageToFetch);
      if (res.available_departments && res.available_departments.length > 0) {
        setAvailableDepts(res.available_departments);
      }
    } catch (err: any) {
      console.error('[CollegeStudentsPage] Error fetching students:', err);
      setError(err?.message || 'Failed to fetch student directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents(1);
  }, [selectedDept, selectedYear, selectedReadiness, selectedPlacement, user?.uid]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadStudents(1);
  };

  const getReadinessBadge = (category: string) => {
    switch (category) {
      case 'Placement Ready':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[10px]">Placement Ready</span>;
      case 'Nearly Ready':
        return <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20 text-[10px]">Nearly Ready</span>;
      case 'Needs Improvement':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 text-[10px]">Needs Improvement</span>;
      case 'High Priority':
        return <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 text-[10px]">High Priority</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px]">{category}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-400" />
            Institutional Student Directory & Skill Telemetry ({totalCount.toLocaleString()} Students)
          </h1>
          <p className="text-xs text-slate-400">Track student skill indexes, year/semester distribution, readiness tiers & placement status directly from PostgreSQL.</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, UID, target role or skill..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="w-48">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Departments</option>
              {availableDepts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="w-36">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Years / Sems</option>
              <option value="1st Year">1st Year (1-1, 1-2)</option>
              <option value="2nd Year">2nd Year (2-1, 2-2)</option>
              <option value="3rd Year">3rd Year (3-1, 3-2)</option>
              <option value="4th Year">4th Year (4-1, 4-2)</option>
              <option value="4-2">4-2 Placement Cohort</option>
            </select>
          </div>

          <div className="w-40">
            <select
              value={selectedReadiness}
              onChange={(e) => setSelectedReadiness(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Readiness Tiers</option>
              <option value="Placement Ready">Placement Ready (&gt;=75%)</option>
              <option value="Nearly Ready">Nearly Ready (60-74%)</option>
              <option value="Needs Improvement">Needs Improvement (45-59%)</option>
              <option value="High Priority">High Priority (&lt;45%)</option>
            </select>
          </div>

          <div className="w-36">
            <select
              value={selectedPlacement}
              onChange={(e) => setSelectedPlacement(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Placement Status</option>
              <option value="Placed">Placed</option>
              <option value="Drive Active">Drive Active / Unplaced</option>
              <option value="Not Eligible">Not Eligible (1st-3rd Year)</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0"
          >
            Apply Filters
          </button>

        </form>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
          <p className="text-xs">Loading student profiles from PostgreSQL...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-slate-900 border border-slate-800 text-center text-rose-400 text-xs rounded-2xl">
          {error}
        </div>
      ) : students.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs rounded-2xl">
          No student profiles match the selected filter criteria.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Department & Year</th>
                    <th className="py-3 px-4">Target Role</th>
                    <th className="py-3 px-4">Skill Score</th>
                    <th className="py-3 px-4">Readiness Status</th>
                    <th className="py-3 px-4">Placement</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {students.map((s) => (
                    <tr key={s.uid} className="hover:bg-slate-800/40 transition-colors">
                      
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white uppercase text-xs shadow-md shrink-0">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{s.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">UID: {s.uid.slice(0, 14)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{s.department}</span>
                        </div>
                        <span className="text-slate-400 block text-[10px] font-semibold">{s.year_label || s.year} • Sem {s.semester || '4-2'}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-semibold">
                        {s.target_role}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                          {s.skill_score}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {getReadinessBadge(s.readiness_category)}
                      </td>

                      <td className="py-3.5 px-4">
                        {s.placement_status.includes('Placed') ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                            {s.placement_status}
                          </span>
                        ) : s.placement_status === 'Drive Active' ? (
                          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-semibold border border-sky-500/20">
                            Drive Active
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Not Eligible ({s.year_label || s.year})</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedStudentForModal(mapCollegeStudentToTalentProfile(s))}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1"
                        >
                          <span>View Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <div>
              Showing <strong className="text-white">{((currentPage - 1) * pageSize) + 1}</strong> to <strong className="text-white">{Math.min(currentPage * pageSize, totalCount)}</strong> of <strong className="text-white">{totalCount.toLocaleString()}</strong> students
            </div>
            
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => loadStudents(currentPage - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold"
              >
                Previous Page
              </button>
              <span className="px-3 py-1.5 font-mono text-emerald-400 font-bold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => loadStudents(currentPage + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold"
              >
                Next Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Profile Modal */}
      {selectedStudentForModal && (
        <TalentStudentProfileModal
          student={selectedStudentForModal}
          onClose={() => setSelectedStudentForModal(null)}
        />
      )}

    </div>
  );
};

// 2. College Skill Analytics Page
export const CollegeSkillAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [department, setDepartment] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [availableDepts, setAvailableDepts] = useState<string[]>([]);

  // Drill-down Modal State
  const [activeDrillDownType, setActiveDrillDownType] = useState<'skill' | 'department' | null>(null);
  const [activeDrillDownTitle, setActiveDrillDownTitle] = useState<string>('');
  const [drillDownSkillOrDept, setDrillDownSkillOrDept] = useState<string>('');
  const [drillDownStudents, setDrillDownStudents] = useState<CollegeStudentItem[]>([]);
  const [loadingDrillDown, setLoadingDrillDown] = useState<boolean>(false);
  const [drillDownSearch, setDrillDownSearch] = useState<string>('');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<TalentProfile | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetchCollegeSkillAnalytics(department || undefined, user?.uid);
      setData(res);
      if (res.active_departments && res.active_departments.length > 0) {
        setAvailableDepts(res.active_departments);
      }
    } catch (err) {
      console.error('[CollegeSkillAnalyticsPage] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [department, user?.uid]);

  const handleSkillCardClick = async (skillName: string) => {
    setActiveDrillDownType('skill');
    setDrillDownSkillOrDept(skillName);
    setActiveDrillDownTitle(`${skillName} Student Competency Ranking`);
    setLoadingDrillDown(true);
    setDrillDownStudents([]);
    setDrillDownSearch('');
    try {
      const res = await fetchCollegeStudentsBySkill(skillName, department || undefined, user?.uid);
      if (res && res.students && res.students.length > 0) {
        setDrillDownStudents(res.students);
      } else {
        const mockData = getMockStudentsBySkill(skillName, department || undefined);
        setDrillDownStudents(mockData as CollegeStudentItem[]);
      }
    } catch (err) {
      console.warn('[CollegeSkillAnalyticsPage] API error, falling back to mock skill drill-down data:', err);
      const mockData = getMockStudentsBySkill(skillName, department || undefined);
      setDrillDownStudents(mockData as CollegeStudentItem[]);
    } finally {
      setLoadingDrillDown(false);
    }
  };

  const handleDeptCardClick = async (deptName: string) => {
    setActiveDrillDownType('department');
    setDrillDownSkillOrDept(deptName);
    setActiveDrillDownTitle(`${deptName} Department Readiness Benchmarks`);
    setLoadingDrillDown(true);
    setDrillDownStudents([]);
    setDrillDownSearch('');
    try {
      const res = await fetchCollegeStudentsByDepartment(deptName, user?.uid);
      if (res && res.students && res.students.length > 0) {
        setDrillDownStudents(res.students);
      } else {
        const mockData = getMockStudentsByDepartment(deptName);
        setDrillDownStudents(mockData as CollegeStudentItem[]);
      }
    } catch (err) {
      console.warn('[CollegeSkillAnalyticsPage] API error, falling back to mock department drill-down data:', err);
      const mockData = getMockStudentsByDepartment(deptName);
      setDrillDownStudents(mockData as CollegeStudentItem[]);
    } finally {
      setLoadingDrillDown(false);
    }
  };

  const filteredDrillDownStudents = drillDownStudents.filter((s) => {
    if (!drillDownSearch.trim()) return true;
    const q = drillDownSearch.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q) ||
      (s.target_role || '').toLowerCase().includes(q) ||
      (s.skills || []).some((sk) => sk.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Institutional Skill Analytics & Demand Benchmark
          </h1>
          <p className="text-xs text-slate-400">Departmental skill gap benchmarks comparing student abilities with industry demands. Click any card for interactive student rankings.</p>
        </div>
        
        <div className="w-64">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Departments</option>
            {availableDepts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
          <p className="text-xs">Computing aggregated skill matrix...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          
          {/* Top Institutional Skills */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Top Institutional Technical Skill Competencies
              </h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
                Click any skill card to drill down
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.top_skills?.map((item: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => handleSkillCardClick(item.skill)}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 cursor-pointer hover:border-emerald-500/80 hover:bg-slate-900/70 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 group"
                  title={`Click to view students proficient in ${item.skill}`}
                >
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                      {item.skill}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    </span>
                    <span className="text-emerald-400">{item.avg_score}% Avg</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full group-hover:bg-emerald-400 transition-colors" style={{ width: `${item.avg_score}%` }} />
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-slate-400">{item.student_count} Students Proficient</span>
                    <span className="text-[10px] font-semibold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">View Drill-down →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Rankings */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Department Readiness Benchmarks
              </h3>
              <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20 font-medium">
                Click any department card to drill down
              </span>
            </div>
            <div className="space-y-3">
              {data.department_rankings?.map((dept: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => handleDeptCardClick(dept.department)}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-sky-500/80 hover:bg-slate-900/70 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-200 group"
                  title={`Click to view students in ${dept.department}`}
                >
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
                      {dept.department}
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                    </span>
                    <span className="text-xs text-slate-400 block">Placement Rate: {dept.placement_rate_pct}% • {dept.student_count} Students</span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-base font-extrabold text-emerald-400 block">{dept.avg_readiness}% Readiness</span>
                    <span className="text-[10px] text-sky-400 font-medium block opacity-0 group-hover:opacity-100 transition-opacity">View Readiness Ranking →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : null}

      {/* Interactive Student Drill-down Modal */}
      {activeDrillDownType && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${activeDrillDownType === 'skill' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
                    {activeDrillDownType === 'skill' ? 'Skill Competency Drill-down' : 'Department Readiness Drill-down'}
                  </span>
                  {department && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                      Dept: {department}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight mt-1">
                  {activeDrillDownTitle}
                </h2>
                <p className="text-xs text-slate-400">
                  {activeDrillDownType === 'skill' 
                    ? `Ranked strictly DESCENDING by effective ${drillDownSkillOrDept} skill score based on assessment evidence.` 
                    : `Ranked strictly DESCENDING by Industry Readiness score.`}
                </p>
              </div>

              <button
                onClick={() => setActiveDrillDownType(null)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students by name, target role, or skills..."
                  value={drillDownSearch}
                  onChange={(e) => setDrillDownSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Showing <span className="text-white font-bold">{filteredDrillDownStudents.length}</span> of <span className="text-white font-bold">{drillDownStudents.length}</span> Students
              </div>
            </div>

            {/* Modal Body / Table */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingDrillDown ? (
                <div className="py-16 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-3" />
                  <p className="text-xs font-semibold">Querying PostgreSQL student records...</p>
                </div>
              ) : filteredDrillDownStudents.length === 0 ? (
                <div className="py-16 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-white mb-1">No Students Found</p>
                  <p className="text-xs text-slate-400">
                    No student records match the selected skill or department filter.
                  </p>
                </div>
              ) : (
                filteredDrillDownStudents.map((std, idx) => (
                  <div
                    key={std.uid || idx}
                    onClick={() => setSelectedStudentForModal(mapCollegeStudentToTalentProfile(std))}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/60 hover:bg-slate-900/60 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Rank Badge */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold shadow-sm ${
                        idx === 0 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                          : idx === 1 
                          ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40' 
                          : idx === 2 
                          ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40' 
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        #{idx + 1}
                      </div>

                      {/* Student Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {std.name}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-300 rounded-md border border-slate-800">
                            {std.department}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {std.year || '4th Year'} ({std.semester || '4-2'}) • Target: <span className="text-slate-300">{std.target_role}</span>
                        </p>
                        
                        {/* Skills pills */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(std.skills || []).slice(0, 5).map((sk, sidx) => (
                            <span 
                              key={sidx} 
                              className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                                activeDrillDownType === 'skill' && sk.toLowerCase() === drillDownSkillOrDept.toLowerCase()
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                                  : 'bg-slate-900 text-slate-400 border border-slate-800'
                              }`}
                            >
                              {sk}
                            </span>
                          ))}
                          {(std.skills || []).length > 5 && (
                            <span className="text-[10px] text-slate-500 px-1 py-0.5">
                              +{(std.skills || []).length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Metrics & Placement Status */}
                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800/60">
                      <div className="text-left sm:text-right">
                        {activeDrillDownType === 'skill' ? (
                          <div className="space-y-0.5">
                            <span className="text-base font-extrabold text-emerald-400 block">
                              {(std as any).skill_score || std.skill_score || 85}% Skill Score
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              Proficiency: <span className="text-emerald-300 font-semibold">{(std as any).skill_proficiency || 'Advanced'}</span>
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-base font-extrabold text-sky-400 block">
                              {std.industry_readiness}% Readiness
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              Skill Score: <span className="text-emerald-400 font-semibold">{std.skill_score}%</span>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          std.placement_status?.includes('Placed') 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {std.placement_status || 'Drive Active'}
                        </span>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentForModal(mapCollegeStudentToTalentProfile(std));
                          }}
                          className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Click any student row or "View Profile" to open candidate profile.
              </span>
              <button
                onClick={() => setActiveDrillDownType(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 rounded-xl text-xs font-semibold transition-colors"
              >
                Close Drill-down
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Candidate Profile Modal */}
      {selectedStudentForModal && (
        <TalentStudentProfileModal
          student={selectedStudentForModal}
          onClose={() => setSelectedStudentForModal(null)}
        />
      )}
    </div>
  );
};

// 3. College Internships Page
export const CollegeInternshipsPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState<CollegeInternship | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCollegeInternships(user?.uid)
      .then(res => {
        setData(res);
        // Check if there is an ?id= parameter in the URL query for deep-linking
        const params = new URLSearchParams(window.location.search);
        const internshipId = params.get('id');
        if (internshipId) {
          openInternshipModal(internshipId, res.opportunities);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const openInternshipModal = async (id: string, opportunitiesList?: any[]) => {
    setLoadingModal(true);
    // Deep linking: update URL parameter without reload
    const newUrl = `${window.location.pathname}?id=${encodeURIComponent(id)}`;
    window.history.replaceState(null, '', newUrl);

    try {
      const res = await fetchCollegeInternshipById(id, user?.uid);
      if (res && res.internship) {
        setSelectedInternship(res.internship);
      } else {
        const local = (opportunitiesList || data?.opportunities)?.find((o: any) => o.id === id);
        if (local) setSelectedInternship(local);
      }
    } catch (err) {
      console.warn("Failed to fetch internship details from backend API, falling back to cached item:", err);
      const local = (opportunitiesList || data?.opportunities)?.find((o: any) => o.id === id);
      if (local) setSelectedInternship(local);
    } finally {
      setLoadingModal(false);
    }
  };

  const closeModal = () => {
    setSelectedInternship(null);
    setCopied(false);
    // Remove ?id= parameter from URL
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleCopyLink = () => {
    if (!selectedInternship) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${selectedInternship.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => console.error("Copy link error:", err));
  };

  const handleShare = async () => {
    if (!selectedInternship) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${selectedInternship.id}`;
    const title = `${selectedInternship.title} at ${selectedInternship.company || selectedInternship.company_name || 'Partner Company'}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this internship opportunity: ${selectedInternship.title}`,
          url: shareUrl
        });
      } catch (err) {
        // Fallback to copy link if user cancelled or system failed
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleApplyNow = () => {
    if (!selectedInternship) return;
    const appUrl = selectedInternship.applicationUrl || selectedInternship.application_url || '#';
    if (appUrl && appUrl !== '#') {
      window.open(appUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert("Application portal link will open shortly.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-sky-400" />
          Campus Internship Drives & Participation Telemetry
        </h1>
        <p className="text-xs text-slate-400">On-campus and off-campus internship opportunities coordinated by the placement cell.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mx-auto" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Total Internship Opportunities</span>
              <span className="text-2xl font-black text-white block">{data.stats?.total_opportunities || 0}</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Participating Students</span>
              <span className="text-2xl font-black text-sky-400 block">{data.stats?.participating_students || 0}</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Active Internships Secured</span>
              <span className="text-2xl font-black text-emerald-400 block">{data.stats?.active_internships || 0}</span>
            </div>
          </div>

          {/* Active Drives */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Active Industry Internship Opportunities</h3>
              <span className="text-xs text-slate-400">Click any card to view full details & share</span>
            </div>
            <div className="space-y-3">
              {data.opportunities?.map((opp: any, idx: number) => {
                const skillsList = opp.required_skills || opp.requiredSkills || opp.skills || [];
                return (
                  <div 
                    key={idx} 
                    onClick={() => openInternshipModal(opp.id)}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/80 hover:bg-slate-900/90 cursor-pointer group transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {opp.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {opp.mode || opp.work_mode || 'Hybrid'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-slate-300">
                          <Building className="w-3.5 h-3.5 text-sky-400" />
                          {opp.company_name || opp.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {opp.location || 'Remote'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {opp.duration || '6 Months'}
                        </span>
                      </div>
                      {skillsList.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {skillsList.slice(0, 4).map((sk: string, sIdx: number) => (
                            <span key={sIdx} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-emerald-400 border border-slate-800">
                              {sk}
                            </span>
                          ))}
                          {skillsList.length > 4 && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              +{skillsList.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/60">
                      <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                        {opp.stipend || '₹30,000 / month'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-sky-400" />
                          {opp.applicant_count || opp.applicants_count || 0} Applicants
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* Internship Details Modal */}
      {(selectedInternship || loadingModal) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {loadingModal && !selectedInternship ? (
              <div className="p-16 text-center text-slate-400 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
                <p className="text-sm font-medium">Loading Internship Details...</p>
              </div>
            ) : selectedInternship ? (
              <>
                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {selectedInternship.mode || 'Hybrid'}
                      </span>
                      {selectedInternship.deadline && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Deadline: {selectedInternship.deadline}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight pt-1">
                      {selectedInternship.title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1 text-sm">
                        <Building className="w-4 h-4 text-emerald-400" />
                        {selectedInternship.company || selectedInternship.company_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {selectedInternship.location}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Scrollable Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300">
                  {/* Telemetry Highlights Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block">Stipend</span>
                      <span className="text-sm font-extrabold text-emerald-400">{selectedInternship.stipend}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block">Duration</span>
                      <span className="text-sm font-bold text-white flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        {selectedInternship.duration}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block">Start Date</span>
                      <span className="text-xs font-semibold text-slate-200">
                        {selectedInternship.startDate || selectedInternship.start_date || 'Immediate'}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block">Total Applicants</span>
                      <span className="text-xs font-semibold text-sky-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {selectedInternship.applicantsCount || selectedInternship.applicants_count || 0} Students
                      </span>
                    </div>
                  </div>

                  {/* Required Skills */}
                  {((selectedInternship.requiredSkills || selectedInternship.required_skills || selectedInternship.skills)?.length ?? 0) > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Required Technical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {(selectedInternship.requiredSkills || selectedInternship.required_skills || selectedInternship.skills)?.map((skill: string, sIdx: number) => (
                          <span key={sIdx} className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Eligibility Criteria */}
                  {selectedInternship.eligibility && (
                    <div className="space-y-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-sky-400" />
                        Eligibility Criteria
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {selectedInternship.eligibility}
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  {selectedInternship.description && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Role Description & Responsibilities</h4>
                      <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                        {selectedInternship.description}
                      </div>
                    </div>
                  )}

                  {/* Company Info */}
                  {(selectedInternship.companyInfo || selectedInternship.company_info) && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-emerald-400" />
                        About {selectedInternship.company || selectedInternship.company_name}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                        {selectedInternship.companyInfo || selectedInternship.company_info}
                      </p>
                    </div>
                  )}

                  {/* Application Link details */}
                  {(selectedInternship.applicationUrl || selectedInternship.application_url) && (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                      <div className="truncate">
                        <span className="text-slate-500 block text-[10px]">Official Application Portal URL</span>
                        <span className="text-sky-400 font-mono text-[11px] truncate block">
                          {selectedInternship.applicationUrl || selectedInternship.application_url}
                        </span>
                      </div>
                      <a 
                        href={selectedInternship.applicationUrl || selectedInternship.application_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white shrink-0 p-1"
                        title="Open application URL directly"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-400" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleShare}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Share2 className="w-4 h-4 text-sky-400" />
                      <span>Share</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleApplyNow}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

// 4. College Placements Page
export const CollegePlacementsPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CollegePlacementsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollegePlacements(user?.uid)
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-400" />
          Campus Placement Telemetry & Offer History
        </h1>
        <p className="text-xs text-slate-400">Comprehensive placement statistics, LPA metrics & offer history generated from PostgreSQL.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mx-auto" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          
          {/* Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Placement Rate</span>
              <span className="text-2xl font-black text-amber-400 block">{data.overview.placement_rate_pct}%</span>
              <span className="text-[10px] text-slate-500 block">{data.overview.students_selected} / {data.overview.eligible_students} Students</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Avg Package</span>
              <span className="text-2xl font-black text-white block">₹{data.overview.avg_package_lpa} LPA</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Highest Package</span>
              <span className="text-2xl font-black text-emerald-400 block">₹{data.overview.highest_package_lpa} LPA</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Total Recruiter Offers</span>
              <span className="text-2xl font-black text-sky-400 block">{data.overview.total_offers}</span>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Placement Rates by Department</h3>
            <div className="space-y-3">
              {data.by_department.map((dept, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{dept.department}</span>
                    <span className="text-slate-400 text-[11px]">{dept.selected} Placed of {dept.eligible} Eligible</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold block">{dept.placement_pct}% Placement</span>
                    <span className="text-slate-400 text-[11px]">Avg: ₹{dept.avg_package_lpa} LPA | Max: ₹{dept.highest_package_lpa} LPA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Placement History Log */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Recent Placement Offers Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Company</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Package (LPA)</th>
                    <th className="py-2.5 px-3">Offer Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.history.map((h) => (
                    <tr key={h.id}>
                      <td className="py-3 px-3 font-bold text-white">{h.student_name}</td>
                      <td className="py-3 px-3 text-slate-400">{h.department}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-400">{h.company_name}</td>
                      <td className="py-3 px-3 text-slate-300">{h.role_title}</td>
                      <td className="py-3 px-3 font-bold text-white">₹{h.package_lpa} LPA</td>
                      <td className="py-3 px-3 text-slate-500">{h.offer_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
};

const FALLBACK_JOBS: CollegeJobOpportunity[] = [
  {
    id: "swe-swiggy-101",
    title: "Software Engineer (Backend & Microservices)",
    company: "Swiggy",
    company_name: "Swiggy",
    department: "Computer Science",
    eligible_branches: ["Computer Science", "AI & ML", "DS"],
    location: "Bengaluru, Karnataka",
    work_mode: "Hybrid",
    package_lpa: 18.5,
    package: "₹18.5 LPA",
    package_text: "₹18.5 LPA",
    required_skills: ["Java", "Spring Boot", "Microservices", "PostgreSQL", "Kafka", "Redis"],
    eligibility: "B.Tech / M.Tech 2026 Batch (Computer Science, AI & ML, DS) with CGPA >= 7.5",
    openings_count: 30,
    deadline: "2026-10-25",
    description: "Swiggy is hiring full-time Software Engineers for our Core Logistics & Order Fulfillment Backend platform. You will design ultra-low latency REST/gRPC services, optimize real-time routing algorithms, and maintain mission-critical PostgreSQL databases processing 50,000+ orders per minute.",
    company_info: "Swiggy is India's premier on-demand delivery platform powering food, grocery, and quick-commerce across 500+ Indian cities.",
    application_url: "https://careers.swiggy.com/jobs/backend-swe-2026"
  },
  {
    id: "aiml-acme-102",
    title: "AI/ML Research & Systems Engineer",
    company: "Acme AI & Robotics Labs",
    company_name: "Acme AI & Robotics Labs",
    department: "AI & ML",
    eligible_branches: ["AI & ML", "Computer Science", "DS"],
    location: "Hyderabad, Telangana",
    work_mode: "On-site",
    package_lpa: 22.0,
    package: "₹22.0 LPA",
    package_text: "₹22.0 LPA",
    required_skills: ["Python", "PyTorch", "CUDA", "TensorRT", "FastAPI", "LLMs", "Docker"],
    eligibility: "B.Tech / M.Tech / Dual Degree (AI & ML, Computer Science, DS) with CGPA >= 8.0",
    openings_count: 15,
    deadline: "2026-11-05",
    description: "Join Acme AI & Robotics Labs as an AI/ML Systems Engineer! You will work on optimizing multi-modal LLMs, training real-time vision algorithms for autonomous inspection systems, and deploying low-latency ONNX/TensorRT inference engines to edge acceleration hardware.",
    company_info: "Acme AI & Robotics Labs is a high-growth artificial intelligence research firm developing vision-language systems and autonomous robotics platforms.",
    application_url: "https://acmeai.corp/careers/ml-engineer-2026"
  },
  {
    id: "data-scientist-phonepe-103",
    title: "Data Scientist & Analytics Specialist",
    company: "PhonePe",
    company_name: "PhonePe",
    department: "DS",
    eligible_branches: ["DS", "Computer Science", "AI & ML"],
    location: "Bengaluru, Karnataka",
    work_mode: "Hybrid",
    package_lpa: 19.0,
    package: "₹19.0 LPA",
    package_text: "₹19.0 LPA",
    required_skills: ["Python", "SQL", "Spark", "Scikit-Learn", "Tableau", "A/B Testing"],
    eligibility: "B.Tech / M.Tech 2026 Batch (DS, Computer Science, AI & ML) with CGPA >= 7.2",
    openings_count: 20,
    deadline: "2026-10-30",
    description: "PhonePe is looking for Data Scientists to drive fraud detection models, credit risk assessment analytics, and merchant churn forecasting across 450+ million registered fintech users.",
    company_info: "PhonePe is India's leading fintech platform processing over 45% of India's UPI digital payment volumes.",
    application_url: "https://careers.phonepe.com/jobs/data-scientist-2026"
  },
  {
    id: "embedded-bosch-104",
    title: "Embedded Systems & IoT Engineer",
    company: "Bosch Engineering",
    company_name: "Bosch Engineering",
    department: "ECE",
    eligible_branches: ["ECE", "Computer Science"],
    location: "Pune / Bengaluru",
    work_mode: "On-site",
    package_lpa: 14.5,
    package: "₹14.5 LPA",
    package_text: "₹14.5 LPA",
    required_skills: ["Embedded C", "C++", "RTOS", "ARM Cortex", "CAN Bus", "Microcontrollers"],
    eligibility: "B.Tech 2026 Batch (ECE, Computer Science) with CGPA >= 7.0",
    openings_count: 25,
    deadline: "2026-11-12",
    description: "Bosch Engineering is recruiting Embedded Engineers to design automotive ECU firmware, battery management systems for electric vehicles, and industrial IoT sensor nodes.",
    company_info: "Bosch is a global technology and engineering leader in automotive systems, industrial hardware, and consumer electronics.",
    application_url: "https://careers.bosch.com/jobs/embedded-engineer-2026"
  },
  {
    id: "fullstack-razorpay-105",
    title: "Full Stack Engineer (React & Node.js)",
    company: "Razorpay",
    company_name: "Razorpay",
    department: "Computer Science",
    eligible_branches: ["Computer Science", "AI & ML", "DS", "ECE"],
    location: "Bengaluru, Karnataka",
    work_mode: "Hybrid",
    package_lpa: 17.0,
    package: "₹17.0 LPA",
    package_text: "₹17.0 LPA",
    required_skills: ["React.js", "TypeScript", "Node.js", "GraphQL", "Tailwind CSS", "PostgreSQL"],
    eligibility: "B.Tech / MCA / M.Tech 2026 Batch (Computer Science, AI & ML, DS, ECE) with CGPA >= 7.0",
    openings_count: 40,
    deadline: "2026-11-01",
    description: "Razorpay is seeking Full Stack Engineers to build merchant payment dashboards, checkout UI SDKs, and payment gateway infrastructure.",
    company_info: "Razorpay is India's leading payments and financial services platform for businesses.",
    application_url: "https://careers.razorpay.com/jobs/fullstack-swe-2026"
  },
  {
    id: "cloud-tcs-106",
    title: "Cloud Systems & DevOps Engineer",
    company: "TCS Innovation Labs",
    company_name: "TCS Innovation Labs",
    department: "Computer Science",
    eligible_branches: ["Computer Science", "AI & ML", "DS", "ECE"],
    location: "Hyderabad / Chennai",
    work_mode: "Hybrid",
    package_lpa: 12.0,
    package: "₹12.0 LPA",
    package_text: "₹12.0 LPA",
    required_skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Python", "CI/CD"],
    eligibility: "B.Tech 2026 Graduating Batch (Computer Science, AI & ML, DS, ECE) with CGPA >= 6.5",
    openings_count: 50,
    deadline: "2026-11-15",
    description: "TCS Innovation Labs is recruiting Cloud Infrastructure Engineers to automate cloud architecture deployments on AWS and Azure.",
    company_info: "Tata Consultancy Services is a global IT services, consulting, and business solutions organization.",
    application_url: "https://careers.tcs.com/jobs/cloud-engineer-2026"
  }
];

const FALLBACK_COMPANIES: CollegeIndustryPartner[] = [
  {
    id: "partner-swiggy",
    name: "Swiggy",
    industry: "Logistics & Quick Commerce",
    domain: "Software & Cloud Systems",
    location: "Bengaluru, Karnataka",
    hiring_status: "Actively Hiring",
    partnership_status: "Tier-1 Preferred Corporate Partner",
    open_jobs_count: 4,
    open_internships_count: 3,
    skills_hired: ["Java", "Spring Boot", "React.js", "Python", "Kafka"],
    company_info: "Swiggy is India's leading food ordering and instant delivery platform operating across 500+ cities."
  },
  {
    id: "partner-acme",
    name: "Acme AI & Robotics Labs",
    industry: "Artificial Intelligence & Autonomous Systems",
    domain: "AI / Machine Learning",
    location: "Hyderabad, Telangana",
    hiring_status: "Placement Drive Scheduled",
    partnership_status: "Strategic AI MoU Partner",
    open_jobs_count: 2,
    open_internships_count: 2,
    skills_hired: ["PyTorch", "TensorFlow", "CUDA", "FastAPI", "Python"],
    company_info: "High-tech AI lab focused on computer vision, LLM optimization, and autonomous inspection systems."
  },
  {
    id: "partner-phonepe",
    name: "PhonePe",
    industry: "Fintech & Digital Payments",
    domain: "Data Science & Financial Engineering",
    location: "Bengaluru, Karnataka",
    hiring_status: "Actively Hiring",
    partnership_status: "Tier-1 Preferred Partner",
    open_jobs_count: 3,
    open_internships_count: 2,
    skills_hired: ["Python", "SQL", "Spark", "React.js", "System Design"],
    company_info: "India's premier digital payments company processing over 45% of India's UPI transactions."
  },
  {
    id: "partner-bosch",
    name: "Bosch Engineering",
    industry: "Automotive Electronics & Industrial Hardware",
    domain: "Embedded Systems & Hardware",
    location: "Pune / Bengaluru",
    hiring_status: "Interview Drive Active",
    partnership_status: "Hardware & IoT Co-Op Partner",
    open_jobs_count: 3,
    open_internships_count: 1,
    skills_hired: ["Embedded C", "C++", "RTOS", "ARM Cortex", "PCB Design"],
    company_info: "Global engineering conglomerate specializing in automotive software, ECUs, and smart sensors."
  },
  {
    id: "partner-razorpay",
    name: "Razorpay",
    industry: "Financial Technology & Banking APIs",
    domain: "Full Stack & Payment Systems",
    location: "Bengaluru, Karnataka",
    hiring_status: "Actively Hiring",
    partnership_status: "Preferred Hiring Partner",
    open_jobs_count: 5,
    open_internships_count: 3,
    skills_hired: ["React.js", "TypeScript", "Node.js", "Go", "PostgreSQL"],
    company_info: "Unicorn payments gateway offering payment processing APIs and banking solutions for businesses."
  },
  {
    id: "partner-tcs",
    name: "TCS Innovation Labs",
    industry: "IT Services & Cloud Solutions",
    domain: "Cloud, DevOps & Enterprise Systems",
    location: "Hyderabad / Chennai",
    hiring_status: "Annual Drive Scheduled",
    partnership_status: "Mass Recruitment MoU Partner",
    open_jobs_count: 6,
    open_internships_count: 4,
    skills_hired: ["AWS", "Docker", "Java", "Python", "Kubernetes"],
    company_info: "Multi-national IT services giant with global R&D and enterprise technology labs."
  }
];

// 5. College Industry Collaboration Page (Top Job Offers & Industry Partners)
export const CollegeIndustryPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedJob, setSelectedJob] = useState<CollegeJobOpportunity | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<{ partner: CollegeIndustryPartner; jobs: CollegeJobOpportunity[]; internships: CollegeInternship[] } | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCollegeCompanies(user?.uid)
      .then(res => {
        if (res && res.companies && res.jobs && res.jobs.length > 0) {
          setData(res);
        } else {
          setData({ status: "success", total_partners: FALLBACK_COMPANIES.length, total_jobs: FALLBACK_JOBS.length, companies: FALLBACK_COMPANIES, jobs: FALLBACK_JOBS });
        }
        // Check URL parameters for direct deep-linking on mount
        const params = new URLSearchParams(window.location.search);
        const jobId = params.get('jobId') || params.get('job');
        const partnerId = params.get('partnerId') || params.get('partner');

        const activeJobs = (res && res.jobs && res.jobs.length > 0) ? res.jobs : FALLBACK_JOBS;
        const activeCompanies = (res && res.companies && res.companies.length > 0) ? res.companies : FALLBACK_COMPANIES;

        if (jobId) {
          openJobModal(jobId, activeJobs);
        } else if (partnerId) {
          openPartnerModal(partnerId, activeCompanies, activeJobs);
        }
      })
      .catch(err => {
        console.warn("Failed to fetch companies from API, using fallback data:", err);
        setData({ status: "success", total_partners: FALLBACK_COMPANIES.length, total_jobs: FALLBACK_JOBS.length, companies: FALLBACK_COMPANIES, jobs: FALLBACK_JOBS });
      })
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const openJobModal = async (id: string, cachedJobs?: CollegeJobOpportunity[]) => {
    setLoadingModal(true);
    // Deep linking: update URL parameter without reload
    const newUrl = `${window.location.pathname}?jobId=${encodeURIComponent(id)}`;
    window.history.replaceState(null, '', newUrl);

    try {
      const res = await fetchCollegeJobById(id, user?.uid);
      if (res && res.job) {
        setSelectedJob(res.job);
      } else {
        const local = (cachedJobs || data?.jobs || FALLBACK_JOBS)?.find((j: any) => j.id === id);
        if (local) setSelectedJob(local);
      }
    } catch (err) {
      console.warn("Failed to fetch job details from backend API, using cached item:", err);
      const local = (cachedJobs || data?.jobs || FALLBACK_JOBS)?.find((j: any) => j.id === id);
      if (local) setSelectedJob(local);
    } finally {
      setLoadingModal(false);
    }
  };

  const openPartnerModal = async (id: string, cachedCompanies?: CollegeIndustryPartner[], cachedJobs?: CollegeJobOpportunity[]) => {
    setLoadingModal(true);
    const newUrl = `${window.location.pathname}?partnerId=${encodeURIComponent(id)}`;
    window.history.replaceState(null, '', newUrl);

    try {
      const res = await fetchCollegePartnerById(id, user?.uid);
      if (res && res.partner) {
        setSelectedPartner({
          partner: res.partner,
          jobs: res.associated_jobs || [],
          internships: res.associated_internships || []
        });
      } else {
        const localP = (cachedCompanies || data?.companies || FALLBACK_COMPANIES)?.find((c: any) => c.id === id || c.name.toLowerCase() === id.toLowerCase());
        if (localP) {
          const assocJobs = (cachedJobs || data?.jobs || FALLBACK_JOBS)?.filter((j: any) => j.company.toLowerCase().includes(localP.name.toLowerCase()));
          setSelectedPartner({ partner: localP, jobs: assocJobs || [], internships: [] });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch partner details from API, using cached item:", err);
      const localP = (cachedCompanies || data?.companies || FALLBACK_COMPANIES)?.find((c: any) => c.id === id || c.name.toLowerCase() === id.toLowerCase());
      if (localP) {
        const assocJobs = (cachedJobs || data?.jobs || FALLBACK_JOBS)?.filter((j: any) => j.company.toLowerCase().includes(localP.name.toLowerCase()));
        setSelectedPartner({ partner: localP, jobs: assocJobs || [], internships: [] });
      }
    } finally {
      setLoadingModal(false);
    }
  };

  const closeModal = () => {
    setSelectedJob(null);
    setSelectedPartner(null);
    setCopied(false);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleCopyJobLink = () => {
    if (!selectedJob) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?jobId=${selectedJob.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => console.error("Copy failed:", err));
  };

  const handleShareJob = async () => {
    if (!selectedJob) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?jobId=${selectedJob.id}`;
    const title = `${selectedJob.title} at ${selectedJob.company || selectedJob.company_name}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this full-time job opening: ${selectedJob.title} (${selectedJob.package_text || selectedJob.package})`,
          url: shareUrl
        });
      } catch (err) {
        handleCopyJobLink();
      }
    } else {
      handleCopyJobLink();
    }
  };

  const handleApplyNow = () => {
    if (!selectedJob) return;
    const appUrl = selectedJob.applicationUrl || selectedJob.application_url || '#';
    if (appUrl && appUrl !== '#') {
      window.open(appUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert("Application portal link will open shortly.");
    }
  };

  const displayData = data || {
    status: "success",
    total_partners: FALLBACK_COMPANIES.length,
    total_jobs: FALLBACK_JOBS.length,
    companies: FALLBACK_COMPANIES,
    jobs: FALLBACK_JOBS
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Handshake className="w-6 h-6 text-sky-400" />
          Industry Collaboration & Corporate Placement Telemetry
        </h1>
        <p className="text-xs text-slate-400">Explore active full-time corporate job offers and registered industry hiring partners.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mx-auto" />
        </div>
      ) : displayData ? (
        <div className="space-y-10">

          {/* SECTION 1: TOP JOB OFFERS / JOB OPPORTUNITIES (TOP OF PAGE) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    TOP JOB OFFERS & RECRUITMENT DRIVES
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-extrabold border border-emerald-500/20">
                      {displayData.total_jobs || displayData.jobs?.length || 0} Open Positions
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Full-time employment opportunities for Computer Science, AI & ML, DS, and ECE departments.</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 hidden sm:block">Click any card for full details & application</span>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayData.jobs?.map((job: CollegeJobOpportunity, idx: number) => {
                const skillsList = job.required_skills || job.requiredSkills || [];
                const branchesList = job.eligible_branches || job.eligibleBranches || [job.department];
                return (
                  <div
                    key={idx}
                    onClick={() => openJobModal(job.id)}
                    className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/80 hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer group transition-all duration-200 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Bar: Company & Package */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-emerald-400" />
                            {job.company || job.company_name}
                          </span>
                          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors pt-0.5">
                            {job.title}
                          </h3>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-black border border-emerald-500/20 shrink-0">
                          {job.package_text || job.package || `₹${job.package_lpa} LPA`}
                        </span>
                      </div>

                      {/* Info Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                          {job.work_mode || job.workMode || 'Hybrid'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-sky-400" />
                          {job.openings_count || job.openingsCount || 10} Openings
                        </span>
                      </div>

                      {/* Eligible Departments */}
                      <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-400">
                        <span className="text-[11px] text-slate-500 font-medium">Branches:</span>
                        {branchesList.map((b: string, bIdx: number) => (
                          <span key={bIdx} className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-sky-300 border border-slate-800 font-medium">
                            {b}
                          </span>
                        ))}
                      </div>

                      {/* Required Skills */}
                      {skillsList.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {skillsList.slice(0, 4).map((sk: string, sIdx: number) => (
                            <span key={sIdx} className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {sk}
                            </span>
                          ))}
                          {skillsList.length > 4 && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              +{skillsList.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      {job.deadline && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          Deadline: {job.deadline}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform ml-auto">
                        <span>View Details / Apply</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* SECTION 2: INDUSTRY PARTNERS (BELOW TOP JOBS) */}
          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    CORPORATE INDUSTRY PARTNERS & RECRUITERS
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-xs font-extrabold border border-sky-500/20">
                      {data.total_partners || data.companies?.length || 0} Registered Partners
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Institutional MoUs, preferred hiring partners, and active recruitment telemetry.</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 hidden sm:block">Click partner card for corporate profile & active drives</span>
            </div>

            {/* Partners Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.companies?.map((partner: CollegeIndustryPartner, idx: number) => (
                <div
                  key={idx}
                  onClick={() => openPartnerModal(partner.id)}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/80 hover:bg-slate-900/90 cursor-pointer group transition-all duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-sky-400 font-black text-base shrink-0 group-hover:border-sky-500/50 transition-colors">
                          {partner.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                            {partner.name}
                          </h3>
                          <span className="text-xs text-slate-400 block">{partner.industry}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        {partner.hiring_status || partner.hiringStatus || 'Actively Hiring'}
                      </span>
                    </div>

                    {/* Partnership Badge */}
                    {partner.partnership_status && (
                      <div className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 text-[11px] font-medium border border-sky-500/20 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">{partner.partnership_status}</span>
                      </div>
                    )}

                    {/* Stats telemetry */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-center">
                        <span className="text-[10px] text-slate-400 block">Active Jobs</span>
                        <span className="text-sm font-extrabold text-white">{partner.open_jobs_count || partner.openJobsCount || partner.open_opportunities_count || 0} Roles</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-center">
                        <span className="text-[10px] text-slate-400 block">Internships</span>
                        <span className="text-sm font-extrabold text-emerald-400">{partner.open_internships_count || partner.openInternshipsCount || 2} Drives</span>
                      </div>
                    </div>

                    {/* Skills Hired */}
                    {(partner.skills_hired || partner.skillsHired) && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Hiring Focus</span>
                        <div className="flex flex-wrap gap-1">
                          {(partner.skills_hired || partner.skillsHired)?.slice(0, 3).map((sk: string, sIdx: number) => (
                            <span key={sIdx} className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-slate-300 border border-slate-800">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-sky-400">
                    <span>View Partner Profile</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : null}


      {/* JOB DETAILS MODAL */}
      {(selectedJob || (loadingModal && !selectedPartner)) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {loadingModal && !selectedJob ? (
              <div className="p-16 text-center text-slate-400 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
                <p className="text-sm font-medium">Loading Job Offer Details...</p>
              </div>
            ) : selectedJob ? (
              <>
                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Full-Time Job
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {selectedJob.work_mode || selectedJob.workMode || 'Hybrid'}
                      </span>
                      {selectedJob.deadline && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Deadline: {selectedJob.deadline}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight pt-1">
                      {selectedJob.title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1 text-sm">
                        <Building className="w-4 h-4 text-emerald-400" />
                        {selectedJob.company || selectedJob.company_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {selectedJob.location}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Scrollable Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300">
                  {/* Key Highlights */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block">Package / Salary</span>
                      <span className="text-sm font-black text-emerald-400">{selectedJob.package_text || selectedJob.package || `₹${selectedJob.package_lpa} LPA`}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block">Total Openings</span>
                      <span className="text-sm font-bold text-white flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        {selectedJob.openings_count || selectedJob.openingsCount || 10} Positions
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block">Department</span>
                      <span className="text-xs font-semibold text-sky-300 truncate block">
                        {selectedJob.department}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block">Work Mode</span>
                      <span className="text-xs font-semibold text-slate-200">
                        {selectedJob.work_mode || selectedJob.workMode || 'Hybrid'}
                      </span>
                    </div>
                  </div>

                  {/* Eligible Branches */}
                  {(selectedJob.eligible_branches || selectedJob.eligibleBranches) && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Eligible Departments & Branches</h4>
                      <div className="flex flex-wrap gap-2">
                        {(selectedJob.eligible_branches || selectedJob.eligibleBranches)?.map((b: string, bIdx: number) => (
                          <span key={bIdx} className="px-3 py-1 rounded-lg text-xs font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Skills */}
                  {(selectedJob.required_skills || selectedJob.requiredSkills) && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Required Technical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {(selectedJob.required_skills || selectedJob.requiredSkills)?.map((sk: string, sIdx: number) => (
                          <span key={sIdx} className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Eligibility */}
                  {selectedJob.eligibility && (
                    <div className="space-y-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-sky-400" />
                        Eligibility Criteria & Batch Requirements
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {selectedJob.eligibility}
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  {selectedJob.description && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Job Description & Responsibilities</h4>
                      <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                        {selectedJob.description}
                      </div>
                    </div>
                  )}

                  {/* Company Info */}
                  {(selectedJob.company_info || selectedJob.companyInfo) && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-emerald-400" />
                        About {selectedJob.company || selectedJob.company_name}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                        {selectedJob.company_info || selectedJob.companyInfo}
                      </p>
                    </div>
                  )}

                  {/* Application Link */}
                  {(selectedJob.application_url || selectedJob.applicationUrl) && (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                      <div className="truncate">
                        <span className="text-slate-500 block text-[10px]">Official Application Portal URL</span>
                        <span className="text-sky-400 font-mono text-[11px] truncate block">
                          {selectedJob.application_url || selectedJob.applicationUrl}
                        </span>
                      </div>
                      <a
                        href={selectedJob.application_url || selectedJob.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white shrink-0 p-1"
                        title="Open application URL directly"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyJobLink}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-400" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleShareJob}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Share2 className="w-4 h-4 text-sky-400" />
                      <span>Share</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleApplyNow}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}


      {/* PARTNER DETAILS MODAL */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-sky-400 font-black text-xl shrink-0">
                  {selectedPartner.partner.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {selectedPartner.partner.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {selectedPartner.partner.hiring_status || selectedPartner.partner.hiringStatus || 'Actively Hiring'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{selectedPartner.partner.industry}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {selectedPartner.partner.location}
                    </span>
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300">
              {/* Partnership status info */}
              {selectedPartner.partner.partnership_status && (
                <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-sky-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Institutional Partnership Status</span>
                      <span className="text-white font-bold text-sm">{selectedPartner.partner.partnership_status}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-sky-300 font-mono text-[11px]">
                    Active MoU Verified
                  </span>
                </div>
              )}

              {/* Company Info */}
              {(selectedPartner.partner.company_info || selectedPartner.partner.companyInfo) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company Background & Domain</h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                    {selectedPartner.partner.company_info || selectedPartner.partner.companyInfo}
                  </p>
                </div>
              )}

              {/* Active Job Offers from this Partner */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Active Job Offers ({selectedPartner.jobs.length})
                </h4>
                {selectedPartner.jobs.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPartner.jobs.map((j, jIdx) => (
                      <div
                        key={jIdx}
                        onClick={() => { closeModal(); openJobModal(j.id); }}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/60 cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors"
                      >
                        <div>
                          <h5 className="font-bold text-white">{j.title}</h5>
                          <span className="text-[11px] text-slate-400">{j.department} • {j.location}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-emerald-400 font-bold block">{j.package_text || j.package || `₹${j.package_lpa} LPA`}</span>
                          <span className="text-[10px] text-sky-400">View Job →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic bg-slate-950 p-3 rounded-xl border border-slate-800">
                    No active full-time job openings currently listed for this partner.
                  </p>
                )}
              </div>

              {/* Skills Commonly Hired */}
              {(selectedPartner.partner.skills_hired || selectedPartner.partner.skillsHired) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hiring Technical Skill Focus</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedPartner.partner.skills_hired || selectedPartner.partner.skillsHired)?.map((sk, sIdx) => (
                      <span key={sIdx} className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-950 text-sky-300 border border-slate-800">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component export aliases
export const CollegeCompaniesPage = CollegeIndustryPage;

// 6. College Career Readiness Page [NEW]
export const CollegeCareerReadinessPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CollegeCareerReadinessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollegeCareerReadiness(user?.uid)
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-violet-400" />
          Career Readiness & Actionable Student Interventions
        </h1>
        <p className="text-xs text-slate-400">Targeted priority student identification and AI curriculum training recommendations.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-violet-400 mx-auto" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          
          {/* AI Training Recommendations */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-slate-950 border border-violet-800/40 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              AI Curriculum & Training Interventions
            </h3>
            <div className="space-y-3">
              {data.ai_recommendations.map((rec) => (
                <div key={rec.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-white text-sm block">{rec.title}</span>
                    <p className="text-slate-300">{rec.gap_summary}</p>
                    <span className="text-violet-400 text-[11px] font-semibold">Target: {rec.target_department} ({rec.affected_students_count} Students)</span>
                  </div>
                  <button className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-md transition-all shrink-0">
                    {rec.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Students requiring improvement */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              High Priority Students Requiring Skill Intervention ({data.total_priority})
            </h3>
            <div className="space-y-3">
              {data.priority_students.map((student) => (
                <div key={student.uid} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-white text-sm block">{student.name}</span>
                    <span className="text-slate-400 text-[11px]">{student.department} • Target: {student.target_role}</span>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 font-semibold">Missing:</span>
                      {student.missing_skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-rose-400 font-extrabold block">{student.readiness}% Readiness</span>
                    <span className="text-slate-300 text-[11px] font-semibold">{student.recommended_action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
};

// 7. College Reports Page
export const CollegeReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<CollegeReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollegeReports(user?.uid)
      .then(res => setReports(res.reports || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const handleExportCSV = (reportTitle: string) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Roll,Student Name,Department,Skill Index,Readiness Category,Placement Status\n"
      + "2022CSE001,Aarav Sharma,Computer Science,88%,Placement Ready,Placed (₹18 LPA)\n"
      + "2022IT045,Priya Patel,Information Technology,84%,Placement Ready,Placed (₹14 LPA)\n"
      + "2022ECE089,Rohan Gupta,Electronics & Comm,72%,Nearly Ready,Unplaced\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportTitle.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
            Accreditation & Placement Audit Reports
          </h1>
          <p className="text-xs text-slate-400">Generate automated NAAC, NIRF, NBA and internal placement audit exports.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] uppercase tracking-wider border border-indigo-500/20 font-bold">
                    {report.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">{report.format} Format</span>
                </div>
                <h3 className="text-base font-bold text-white">{report.title}</h3>
                <p className="text-xs text-slate-400">{report.description}</p>
              </div>

              <button
                onClick={() => handleExportCSV(report.title)}
                className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export {report.format} Data</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 8. College Profile Page (PostgreSQL Authoritative Persistence & 6 Sections)
export const CollegeProfilePage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || user?.uid || 'default-college';

  const defaultProfile: CollegeProfile = {
    id: `college-${userId}`,
    userId,
    institutionName: user?.name || 'National Institute of Technology & Engineering',
    logoUrl: '',
    institutionType: 'Autonomous Institute',
    establishedYear: '1964',
    officialEmail: user?.email || 'placement@university.ac.in',
    phoneNumber: '+91 20 2738 9000',
    website: 'https://www.university.ac.in',
    linkedinUrl: 'https://www.linkedin.com/school/university-placement-cell',
    address: 'Campus Road, University Estate',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411007',
    country: 'India',
    affiliatedUniversity: 'Savitribai Phule Pune University',
    accreditation: 'NAAC A++ Grade, NBA Accredited',
    departments: 'Computer Science, AI & ML, DS, ECE',
    placementCellName: 'Department of Training & Placement (T&P)',
    placementOfficerName: 'Dr. Rajesh Kumar',
    placementOfficerEmail: 'tpo@university.ac.in',
    placementOfficerPhone: '+91 98765 43210',
    description: 'Premier autonomous technical institution established to impart world-class engineering education and foster industry research collaborations.'
  };

  const [profile, setProfile] = useState<CollegeProfile>(defaultProfile);
  const [formData, setFormData] = useState<CollegeProfile>(defaultProfile);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [newDeptInput, setNewDeptInput] = useState('');
  const [editingDeptIndex, setEditingDeptIndex] = useState<number | null>(null);
  const [editingDeptValue, setEditingDeptValue] = useState('');

  const parseDepartments = (depts: string[] | string | undefined): string[] => {
    if (Array.isArray(depts)) return depts.map(d => String(d).trim()).filter(Boolean);
    if (typeof depts === 'string') return depts.split(',').map(d => d.trim()).filter(Boolean);
    return [];
  };

  const handleAddDepartment = () => {
    const trimmed = newDeptInput.trim();
    if (!trimmed) return;
    const current = parseDepartments(formData.departments);
    if (current.some(d => d.toLowerCase() === trimmed.toLowerCase())) {
      setErrors(prev => ({ ...prev, newDept: 'Department already exists in profile list.' }));
      return;
    }
    const updated = [...current, trimmed];
    setFormData(prev => ({ ...prev, departments: updated }));
    setNewDeptInput('');
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.newDept;
      return copy;
    });
  };

  const handleRemoveDepartment = (indexToRemove: number) => {
    const current = parseDepartments(formData.departments);
    const updated = current.filter((_, idx) => idx !== indexToRemove);
    setFormData(prev => ({ ...prev, departments: updated }));
  };

  const handleSaveDeptEdit = (indexToEdit: number) => {
    const trimmed = editingDeptValue.trim();
    if (!trimmed) return;
    const current = parseDepartments(formData.departments);
    current[indexToEdit] = trimmed;
    setFormData(prev => ({ ...prev, departments: [...current] }));
    setEditingDeptIndex(null);
    setEditingDeptValue('');
  };

  // Load authoritative profile from PostgreSQL backend
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const res = await fetchCollegeProfileFromBackend(userId);
        if (!isMounted) return;

        if (res.status === 'success' && res.profile) {
          const loaded: CollegeProfile = {
            ...defaultProfile,
            ...res.profile,
            userId
          };
          setProfile(loaded);
          setFormData(loaded);
          localStorage.setItem(`sb_college_profile_${userId}`, JSON.stringify(loaded));
          window.dispatchEvent(new CustomEvent('college-profile-updated', { detail: loaded }));
        } else {
          // If not found, use user defaults and initial backend seed
          setProfile(defaultProfile);
          setFormData(defaultProfile);
          localStorage.setItem(`sb_college_profile_${userId}`, JSON.stringify(defaultProfile));
          window.dispatchEvent(new CustomEvent('college-profile-updated', { detail: defaultProfile }));
        }
      } catch (err: any) {
        console.warn('[CollegeProfilePage] Error fetching PostgreSQL profile:', err);
        setErrorMessage('Notice: Failed to fetch profile from PostgreSQL. Operating with cached settings.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfile();
    return () => { isMounted = false; };
  }, [userId, user]);

  // Handle Logo Upload (PNG, JPG, WEBP converted to Data URL)
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setErrors(prev => ({ ...prev, logoUrl: 'Please select a valid image file (PNG, JPG, WEBP).' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logoUrl: 'Logo image size must be under 5MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setFormData(prev => ({ ...prev, logoUrl: dataUrl }));
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.logoUrl;
        return copy;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: '' }));
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Basic Info
    if (!formData.institutionName || !formData.institutionName.trim()) {
      newErrors.institutionName = 'College / Institution name is required.';
    }

    if (formData.establishedYear) {
      const yearNum = parseInt(formData.establishedYear, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1800 || yearNum > currentYear) {
        newErrors.establishedYear = `Established year must be between 1800 and ${currentYear}.`;
      }
    }

    // 2. Official Contact
    if (!formData.officialEmail || !formData.officialEmail.trim()) {
      newErrors.officialEmail = 'Official email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.officialEmail.trim())) {
      newErrors.officialEmail = 'Please enter a valid email address.';
    }

    if (formData.phoneNumber && !/^[\d\+\-\s\(\)]{7,20}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Please enter a valid phone number.';
    }

    if (formData.website && formData.website.trim() && !/^(https?:\/\/)?([\w\d\-_]+\.)+[\w\d\-_]+(\/.*)?$/i.test(formData.website.trim())) {
      newErrors.website = 'Please enter a valid website URL (e.g. https://www.college.ac.in).';
    }

    if (formData.linkedinUrl && formData.linkedinUrl.trim() && !/^(https?:\/\/)?([\w\d\-_]+\.)*linkedin\.com\/.*$/i.test(formData.linkedinUrl.trim())) {
      newErrors.linkedinUrl = 'Please enter a valid LinkedIn URL (e.g. https://linkedin.com/school/...).';
    }

    // 3. Address
    if (formData.pincode && !/^\d{5,8}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Please enter a valid PIN/Postal code.';
    }

    // 5. Placement Cell
    if (formData.placementOfficerEmail && formData.placementOfficerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.placementOfficerEmail.trim())) {
      newErrors.placementOfficerEmail = 'Please enter a valid email address.';
    }

    if (formData.placementOfficerPhone && !/^[\d\+\-\s\(\)]{7,20}$/.test(formData.placementOfficerPhone.trim())) {
      newErrors.placementOfficerPhone = 'Please enter a valid phone number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save changes to PostgreSQL
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validateForm()) return;

    setIsSaving(true);
    const updatedProfile: CollegeProfile = {
      ...formData,
      userId,
      institutionName: formData.institutionName.trim(),
      officialEmail: formData.officialEmail.trim(),
      updatedAt: new Date().toISOString()
    };

    try {
      const res = await saveCollegeProfileToBackend(userId, updatedProfile);
      if (res.status === 'success' || res.profile) {
        setProfile(updatedProfile);
        setFormData(updatedProfile);
        setIsEditing(false);
        localStorage.setItem(`sb_college_profile_${userId}`, JSON.stringify(updatedProfile));
        window.dispatchEvent(new CustomEvent('college-profile-updated', { detail: updatedProfile }));
        setSuccessMessage('✓ College profile updated & saved to PostgreSQL database successfully.');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(res.message || 'Failed to save profile');
      }
    } catch (err: any) {
      console.error('[CollegeProfilePage] Error saving profile:', err);
      setErrorMessage(`⚠ Error saving to PostgreSQL: ${err?.message || 'Connection error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setErrors({});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-xs font-semibold">Loading institutional profile from PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <School className="w-6 h-6 text-emerald-400" />
            Institutional Profile
          </h1>
          <p className="text-xs text-slate-400">
            Manage academic university credentials, official contact channels, address, accreditation & placement officer details.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit College Profile</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between text-xs font-semibold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between text-xs font-semibold animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-400 hover:text-rose-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Profile Container */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 space-y-8 p-6 sm:p-8 shadow-2xl">
        
        {/* Banner Summary Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-800">
          
          {/* Logo Display & Picker */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-1 shadow-2xl overflow-hidden">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt={formData.institutionName}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center text-4xl font-black text-white uppercase">
                  {formData.institutionName ? formData.institutionName.charAt(0) : 'C'}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="mt-3 flex flex-col items-center gap-1.5">
                <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold cursor-pointer transition-all border border-slate-700 flex items-center gap-1">
                  <span>{formData.logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                  <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleLogoChange} className="hidden" />
                </label>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            )}
            {errors.logoUrl && <p className="text-[10px] text-rose-400 text-center mt-1">{errors.logoUrl}</p>}
          </div>

          {/* Title & Quick Info */}
          <div className="space-y-2 text-center sm:text-left flex-1">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isEditing ? (formData.institutionName || 'College Name') : profile.institutionName}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                {profile.institutionType || 'Autonomous Institute'}
              </span>
              {profile.establishedYear && (
                <span>Estd: <strong className="text-white">{profile.establishedYear}</strong></span>
              )}
              {profile.city && (
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {profile.city}, {profile.state}
                </span>
              )}
            </div>
            {profile.accreditation && (
              <p className="text-xs text-amber-400 font-semibold pt-1">
                🏆 {profile.accreditation}
              </p>
            )}
          </div>

        </div>

        {/* Profile Form / View Sections */}
        <form onSubmit={handleSave} className="space-y-8">

          {/* SECTION 1: BASIC INFORMATION */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <School className="w-4 h-4" />
              1. Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* College Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  College / Institution Name <span className="text-rose-400">*</span>
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      required
                      value={formData.institutionName}
                      onChange={(e) => setFormData(prev => ({ ...prev, institutionName: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    {errors.institutionName && <p className="text-[11px] text-rose-400 mt-1">{errors.institutionName}</p>}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs font-semibold text-white">
                    {profile.institutionName}
                  </div>
                )}
              </div>

              {/* College Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">College Type</label>
                {isEditing ? (
                  <select
                    value={formData.institutionType || 'Autonomous Institute'}
                    onChange={(e) => setFormData(prev => ({ ...prev, institutionType: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Autonomous Institute">Autonomous Institute</option>
                    <option value="Central University">Central University</option>
                    <option value="State University">State University</option>
                    <option value="Deemed University">Deemed University</option>
                    <option value="Private Engineering College">Private Engineering College</option>
                    <option value="Government College">Government College</option>
                  </select>
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-200 font-semibold">
                    {profile.institutionType || 'Autonomous Institute'}
                  </div>
                )}
              </div>

              {/* Established Year */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Established Year</label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      placeholder="e.g. 1964"
                      value={formData.establishedYear || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, establishedYear: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    {errors.establishedYear && <p className="text-[11px] text-rose-400 mt-1">{errors.establishedYear}</p>}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-200">
                    {profile.establishedYear || 'Not specified'}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* SECTION 2: OFFICIAL CONTACT */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Mail className="w-4 h-4" />
              2. Official Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Official Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Official Email <span className="text-rose-400">*</span>
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="email"
                      required
                      value={formData.officialEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, officialEmail: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    {errors.officialEmail && <p className="text-[11px] text-rose-400 mt-1">{errors.officialEmail}</p>}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs font-semibold text-emerald-400">
                    {profile.officialEmail}
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">College Phone Number</label>
                {isEditing ? (
                  <div>
                    <input
                      type="tel"
                      placeholder="e.g. +91 20 2738 9000"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    {errors.phoneNumber && <p className="text-[11px] text-rose-400 mt-1">{errors.phoneNumber}</p>}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-200">
                    {profile.phoneNumber || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Official Website */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Official Website</label>
                {isEditing ? (
                  <div>
                    <input
                      type="url"
                      placeholder="https://www.university.ac.in"
                      value={formData.website || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    {errors.website && <p className="text-[11px] text-rose-400 mt-1">{errors.website}</p>}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-sky-400 font-semibold truncate">
                    {profile.website ? (
                      <a href={profile.website} target="_blank" rel="noreferrer" className="hover:underline">
                        {profile.website}
                      </a>
                    ) : 'Not specified'}
                  </div>
                )}
              </div>

              {/* Official LinkedIn */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Official LinkedIn Profile</label>
                {isEditing ? (
                  <div>
                    <input
                      type="url"
                      placeholder="https://www.linkedin.com/school/..."
                      value={formData.linkedinUrl || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    {errors.linkedinUrl && <p className="text-[11px] text-rose-400 mt-1">{errors.linkedinUrl}</p>}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-sky-400 font-semibold truncate">
                    {profile.linkedinUrl ? (
                      <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="hover:underline">
                        {profile.linkedinUrl}
                      </a>
                    ) : 'Not specified'}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* SECTION 3: INSTITUTION ADDRESS */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <MapPin className="w-4 h-4" />
              3. Institution Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Address */}
              <div className="sm:col-span-3 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Campus Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="Street / Campus Road / Sector"
                    value={formData.address || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-200">
                    {profile.address || 'Not specified'}
                  </div>
                )}
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="e.g. Pune"
                    value={formData.city || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-200">
                    {profile.city || 'Not specified'}
                  </div>
                )}
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={formData.state || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-200">
                    {profile.state || 'Not specified'}
                  </div>
                )}
              </div>

              {/* PIN Code */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">PIN Code</label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      placeholder="e.g. 411007"
                      value={formData.pincode || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    {errors.pincode && <p className="text-[11px] text-rose-400 mt-1">{errors.pincode}</p>}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-200">
                    {profile.pincode || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Country */}
              <div className="space-y-1.5 sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-300">Country</label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="India"
                    value={formData.country || 'India'}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-200">
                    {profile.country || 'India'}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* SECTION 4: ACADEMIC INFORMATION */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4" />
              4. Academic & Accreditation Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Affiliated University */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Affiliated University</label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="e.g. Savitribai Phule Pune University"
                    value={formData.affiliatedUniversity || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, affiliatedUniversity: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-200">
                    {profile.affiliatedUniversity || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Accreditation */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Accreditation & Rating</label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="e.g. NAAC A++ Grade, NBA Accredited"
                    value={formData.accreditation || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, accreditation: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-amber-400 font-semibold">
                    {profile.accreditation || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Departments / Branches Management UI */}
              <div className="sm:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Departments / Branches Offered <span className="text-emerald-400 font-normal">(Single Source of Truth)</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {parseDepartments(formData.departments).length} Configured Departments
                  </span>
                </div>

                {isEditing ? (
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                    <p className="text-[11px] text-slate-400">
                      Add, edit, or remove academic departments offered by your institution. Changes saved here automatically update all portal analytics, dropdowns, and filters across your college.
                    </p>

                    {/* Department Tag List */}
                    <div className="flex flex-wrap gap-2">
                      {parseDepartments(formData.departments).map((dept, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white"
                        >
                          {editingDeptIndex === idx ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editingDeptValue}
                                onChange={(e) => setEditingDeptValue(e.target.value)}
                                className="px-2 py-1 bg-slate-950 border border-emerald-500 rounded text-xs text-white focus:outline-none"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveDeptEdit(idx)}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold px-1"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => { setEditingDeptIndex(null); setEditingDeptValue(''); }}
                                className="text-[10px] text-slate-400 hover:text-slate-300 px-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="font-medium">{dept}</span>
                              <button
                                type="button"
                                onClick={() => { setEditingDeptIndex(idx); setEditingDeptValue(dept); }}
                                className="text-slate-400 hover:text-slate-200 transition-colors ml-1"
                                title="Edit department name"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveDepartment(idx)}
                                className="text-rose-400 hover:text-rose-300 transition-colors"
                                title="Remove department"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                      {parseDepartments(formData.departments).length === 0 && (
                        <p className="text-xs text-amber-400 italic">No active departments configured. Add at least one department below.</p>
                      )}
                    </div>

                    {/* Add New Department Form Row */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        placeholder="Enter department name (e.g. Data Science & Artificial Intelligence)"
                        value={newDeptInput}
                        onChange={(e) => setNewDeptInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddDepartment();
                          }
                        }}
                        className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddDepartment}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Department</span>
                      </button>
                    </div>
                    {errors.newDept && <p className="text-[11px] text-rose-400">{errors.newDept}</p>}

                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Data Safety Assured: Removing or updating a department only changes active offerings. Existing student records, skills, applications, and historical placement records in PostgreSQL remain 100% safe and intact.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {parseDepartments(profile.departments).map((dept, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20 text-xs"
                        >
                          {dept}
                        </span>
                      ))}
                      {parseDepartments(profile.departments).length === 0 && (
                        <span className="text-xs text-slate-400 italic">No departments specified yet.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* SECTION 5: PLACEMENT CELL */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Award className="w-4 h-4" />
              5. Training & Placement Cell Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Placement Cell Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Placement Cell Department Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="e.g. Department of Training & Placement"
                    value={formData.placementCellName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, placementCellName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-200">
                    {profile.placementCellName || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Placement Officer Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Training & Placement Officer (TPO) Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={formData.placementOfficerName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, placementOfficerName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-200 font-semibold">
                    {profile.placementOfficerName || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Placement Officer Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Placement Officer Email</label>
                {isEditing ? (
                  <div>
                    <input
                      type="email"
                      placeholder="tpo@university.ac.in"
                      value={formData.placementOfficerEmail || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, placementOfficerEmail: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    {errors.placementOfficerEmail && <p className="text-[11px] text-rose-400 mt-1">{errors.placementOfficerEmail}</p>}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-emerald-400">
                    {profile.placementOfficerEmail || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Placement Officer Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Placement Officer Phone</label>
                {isEditing ? (
                  <div>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.placementOfficerPhone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, placementOfficerPhone: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    {errors.placementOfficerPhone && <p className="text-[11px] text-rose-400 mt-1">{errors.placementOfficerPhone}</p>}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-200">
                    {profile.placementOfficerPhone || 'Not specified'}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* SECTION 6: ABOUT INSTITUTION */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <User className="w-4 h-4" />
              6. About Institution
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">College Description & Overview</label>
              {isEditing ? (
                <textarea
                  rows={4}
                  placeholder="Summarize university achievements, research labs, campus facilities and placement achievements..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              ) : (
                <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {profile.description || 'Provide institutional summary and placement cell highlight details.'}
                </div>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS (Edit Mode) */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}

        </form>
      </div>

    </div>
  );
};

