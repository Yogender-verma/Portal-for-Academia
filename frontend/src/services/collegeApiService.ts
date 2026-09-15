import { auth } from '../lib/firebase';

const rawEnv = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const cleanBase = rawEnv.replace(/\/+$/, '');
const API_BASE_URL = cleanBase.endsWith('/api/v1') ? cleanBase : `${cleanBase}/api/v1`;

async function getAuthToken(uid?: string): Promise<string> {
  try {
    if (auth && auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      if (token) return token;
    }
  } catch (err) {
    console.warn('[collegeApiService] Could not get Firebase ID token:', err);
  }
  return uid ? `mock-token-${uid}` : 'mock-token-college_demo_nit_01';
}

// Interfaces
export interface CollegeDashboardKPIs {
  total_students: number;
  profile_completion_pct: number;
  avg_skill_score: number;
  avg_readiness_pct: number;
  internship_participation_pct: number;
  students_placement_ready: number;
  students_placed: number;
  placement_rate_pct: number;
  active_internship_opportunities: number;
  active_job_opportunities: number;
}

export interface ReadinessOverviewTiers {
  ready: number;
  nearly_ready: number;
  needs_improvement: number;
  high_priority: number;
}

export interface DepartmentOverviewItem {
  department: string;
  student_count: number;
  avg_skill_score: number;
  avg_readiness_pct: number;
  internship_participation_pct: number;
  placement_rate_pct: number;
  top_skill_gap: string;
  is_legacy?: boolean;
}

export interface IndustrySkillDemandItem {
  skill: string;
  student_coverage_pct: number;
  industry_demand_pct: number;
  gap_pct: number;
}

export interface RecentActivityItem {
  id: string;
  type: string;
  title: string;
  time: string;
}

export interface CollegeDashboardData {
  status: string;
  kpis: CollegeDashboardKPIs;
  readiness_overview: ReadinessOverviewTiers;
  department_overview: DepartmentOverviewItem[];
  industry_skill_demand: IndustrySkillDemandItem[];
  recent_activity: RecentActivityItem[];
}

export interface CollegeStudentItem {
  uid: string;
  name: string;
  avatar_url?: string;
  department: string;
  year: string;
  year_label?: string;
  semester?: string;
  graduation_year?: string;
  target_role: string;
  cgpa: string;
  skill_score: number;
  industry_readiness: number;
  roadmap_progress: number;
  assessment_score: number;
  skills: string[];
  internship_status: string;
  placement_status: string;
  readiness_category: string;
  is_demo: boolean;
}

export interface StudentFilters {
  department?: string;
  year?: string;
  target_role?: string;
  readiness_category?: string;
  skill?: string;
  placement_status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PlacementHistoryItem {
  id: string;
  student_name: string;
  department: string;
  company_name: string;
  role_title: string;
  package_lpa: number;
  offer_date: string;
  status: string;
}

export interface PlacementOverviewData {
  eligible_students: number;
  participating_students: number;
  students_selected: number;
  placement_rate_pct: number;
  avg_package_lpa: number;
  highest_package_lpa: number;
  total_companies: number;
  total_offers: number;
}

export interface CollegePlacementsData {
  status: string;
  overview: PlacementOverviewData;
  by_department: { department: string; eligible: number; selected: number; placement_pct: number; avg_package_lpa: number; highest_package_lpa: number }[];
  history: PlacementHistoryItem[];
}

export interface PriorityStudentItem {
  uid: string;
  name: string;
  department: string;
  target_role: string;
  readiness: number;
  missing_skills: string[];
  recommended_action: string;
}

export interface AITrainingRecommendation {
  id: string;
  title: string;
  target_department: string;
  affected_students_count: number;
  gap_summary: string;
  action: string;
}

export interface CollegeCareerReadinessData {
  status: string;
  priority_students: PriorityStudentItem[];
  ai_recommendations: AITrainingRecommendation[];
  total_priority: number;
}

export interface CollegeReportItem {
  id: string;
  title: string;
  category: string;
  format: string;
  description: string;
}

// API functions
export async function fetchCollegeDashboard(uid?: string): Promise<CollegeDashboardData> {
  const token = await getAuthToken(uid);
  const response = await fetch(`${API_BASE_URL}/college/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error(`Dashboard API error: ${response.status}`);
  return response.json();
}

export async function fetchCollegeStudents(
  filters: StudentFilters = {}, 
  uid?: string
): Promise<{ status: string; students: CollegeStudentItem[]; total: number; page?: number; limit?: number; total_pages?: number; available_departments?: string[]; active_departments?: string[] }> {
  const token = await getAuthToken(uid);
  const params = new URLSearchParams();
  if (filters.department) params.set('department', filters.department);
  if (filters.year) params.set('year', filters.year);
  if (filters.target_role) params.set('target_role', filters.target_role);
  if (filters.readiness_category) params.set('readiness_category', filters.readiness_category);
  if (filters.skill) params.set('skill', filters.skill);
  if (filters.placement_status) params.set('placement_status', filters.placement_status);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());

  const response = await fetch(`${API_BASE_URL}/college/students?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error(`Students API error: ${response.status}`);
  return response.json();
}


export async function fetchCollegeSkillAnalytics(department?: string, uid?: string): Promise<any> {
  const token = await getAuthToken(uid);
  const url = `${API_BASE_URL}/college/skill-analytics${department ? `?department=${encodeURIComponent(department)}` : ''}`;
  const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Skill Analytics API error: ${response.status}`);
  return response.json();
}

export interface CollegeInternship {
  id: string;
  title: string;
  company: string;
  company_name?: string;
  location: string;
  mode: string;
  work_mode?: string;
  stipend: string;
  duration: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  deadline?: string;
  applicantsCount?: number;
  applicants_count?: number;
  skills?: string[];
  requiredSkills?: string[];
  required_skills?: string[];
  eligibility?: string;
  description?: string;
  companyInfo?: string;
  company_info?: string;
  applicationUrl?: string;
  application_url?: string;
  postedDate?: string;
  posted_date?: string;
}

export async function fetchCollegeInternships(uid?: string): Promise<any> {
  const token = await getAuthToken(uid);
  const response = await fetch(`${API_BASE_URL}/college/internships`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Internships API error: ${response.status}`);
  return response.json();
}

export async function fetchCollegeInternshipById(id: string, uid?: string): Promise<{ status: string; internship: CollegeInternship }> {
  const token = await getAuthToken(uid);
  const response = await fetch(`${API_BASE_URL}/college/internships/${encodeURIComponent(id)}`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Internship Details API error: ${response.status}`);
  return response.json();
}

export async function fetchCollegePlacements(uid?: string): Promise<CollegePlacementsData> {
  const token = await getAuthToken(uid);
  const response = await fetch(`${API_BASE_URL}/college/placements`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Placements API error: ${response.status}`);
  return response.json();
}

export interface CollegeJobOpportunity {
  id: string;
  title: string;
  company: string;
  company_name?: string;
  companyName?: string;
  department: string;
  eligible_branches?: string[];
  eligibleBranches?: string[];
  location: string;
  work_mode?: string;
  workMode?: string;
  package_lpa?: number;
  packageLpa?: number;
  package?: string;
  package_text?: string;
  required_skills?: string[];
  requiredSkills?: string[];
  eligibility?: string;
  openings_count?: number;
  openingsCount?: number;
  deadline?: string;
  posted_date?: string;
  postedDate?: string;
  description?: string;
  company_info?: string;
  companyInfo?: string;
  application_url?: string;
  applicationUrl?: string;
  is_demo?: boolean;
  isDemo?: boolean;
}

export interface CollegeIndustryPartner {
  id: string;
  name: string;
  industry: string;
  domain?: string;
  location: string;
  hiring_status?: string;
  hiringStatus?: string;
  partnership_status?: string;
  partnershipStatus?: string;
  open_jobs_count?: number;
  openJobsCount?: number;
  open_opportunities_count?: number;
  open_internships_count?: number;
  openInternshipsCount?: number;
  skills_hired?: string[];
  skillsHired?: string[];
  company_info?: string;
  companyInfo?: string;
  is_demo?: boolean;
  isDemo?: boolean;
}

export async function fetchCollegeCompanies(uid?: string): Promise<{ status: string; total_partners: number; total_jobs: number; companies: CollegeIndustryPartner[]; jobs: CollegeJobOpportunity[]; active_departments?: string[] }> {
  const token = await getAuthToken(uid);
  const response = await fetch(`${API_BASE_URL}/college/companies`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Companies API error: ${response.status}`);
  return response.json();
}

export async function fetchCollegeJobById(jobId: string, uid?: string): Promise<{ status: string; job: CollegeJobOpportunity }> {
  const token = await getAuthToken(uid);
  const response = await fetch(`${API_BASE_URL}/college/companies/jobs/${encodeURIComponent(jobId)}`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Job Details API error: ${response.status}`);
  return response.json();
}

export async function fetchCollegePartnerById(partnerId: string, uid?: string): Promise<{ status: string; partner: CollegeIndustryPartner; associated_jobs?: CollegeJobOpportunity[]; associated_internships?: CollegeInternship[] }> {
  const token = await getAuthToken(uid);
  const response = await fetch(`${API_BASE_URL}/college/companies/${encodeURIComponent(partnerId)}`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Partner Details API error: ${response.status}`);
  return response.json();
}

export async function fetchCollegeCareerReadiness(uid?: string): Promise<CollegeCareerReadinessData> {
  const token = await getAuthToken(uid);
  const response = await fetch(`${API_BASE_URL}/college/career-readiness`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Career Readiness API error: ${response.status}`);
  return response.json();
}

export async function fetchCollegeReports(uid?: string): Promise<{ status: string; reports: CollegeReportItem[] }> {
  const token = await getAuthToken(uid);
  const response = await fetch(`${API_BASE_URL}/college/reports`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Reports API error: ${response.status}`);
  return response.json();
}

export async function fetchCollegeStudentsBySkill(
  skill: string,
  department?: string,
  uid?: string
): Promise<{ status: string; skill: string; department_filter: string; total: number; students: CollegeStudentItem[] }> {
  const token = await getAuthToken(uid);
  const params = new URLSearchParams();
  if (department && department !== 'all') params.set('department', department);
  const url = `${API_BASE_URL}/college/skills/${encodeURIComponent(skill)}/students?${params.toString()}`;
  const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Skill Students API error: ${response.status}`);
  return response.json();
}

export async function fetchCollegeStudentsByDepartment(
  department: string,
  uid?: string
): Promise<{ status: string; department: string; total: number; students: CollegeStudentItem[] }> {
  const token = await getAuthToken(uid);
  const url = `${API_BASE_URL}/college/departments/${encodeURIComponent(department)}/students`;
  const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Department Students API error: ${response.status}`);
  return response.json();
}
