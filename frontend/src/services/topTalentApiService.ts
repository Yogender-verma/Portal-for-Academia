import { auth } from '../lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function getAuthToken(uid?: string): Promise<string> {
  try {
    if (auth && auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      if (token) return token;
    }
  } catch (err) {
    console.warn('[topTalentApiService] Could not get Firebase ID token:', err);
  }
  return uid ? `mock-token-${uid}` : 'mock-token-guest';
}

export interface TalentFactor {
  score: number;
  weight: number;
  weighted: number;
}

export interface TalentProfile {
  uid: string;
  name: string;
  avatar_url: string;
  about_me: string;
  college: string;
  degree: string;
  department: string;
  graduation_year: string;
  cgpa: string;
  target_role: string;
  preferred_locations: string[];
  work_mode: string;
  overall_score: number;
  factors: Record<string, TalentFactor>;
  technical_skills: { id?: string; name: string; proficiency?: string; score?: number }[];
  soft_skills: string[] | { name: string }[];
  projects: {
    id?: string;
    projectName: string;
    description: string;
    technologies: string[];
    role?: string;
    githubUrl?: string;
    liveDemoUrl?: string;
  }[];
  experiences: {
    id?: string;
    company?: string;
    organization?: string;
    role: string;
    duration?: string;
    description?: string;
  }[];
  certifications: (string | { name: string })[];
  achievements: (string | { title: string })[];
  assessment_details: {
    testScore?: number;
    testCasesPassed?: string;
    executionTimeMs?: number;
    timeComplexity?: string;
    codeQualityRating?: string;
    solvedTopics?: string[];
  };
  industry_readiness: number;
  roadmap_progress: number;
  is_demo: boolean;
}

export interface TopTalentResponse {
  status: string;
  talent: TalentProfile[];
  total: number;
  factor_labels: Record<string, string>;
  message?: string;
}

export async function fetchTopTalent(
  type?: 'internship' | 'job',
  roleFilter?: string,
  skillFilter?: string[],
): Promise<TopTalentResponse> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (roleFilter) params.set('role_filter', roleFilter);
  if (skillFilter && skillFilter.length > 0) params.set('skill_filter', skillFilter.join(','));

  const url = `${API_BASE_URL}/top-talent?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || `Top Talent API error: ${response.status}`);
  }

  return response.json();
}

export interface StudentPublicProfile {
  uid: string;
  name: string;
  avatar_url: string;
  about_me: string;
  location: string;
  education: {
    institution: string;
    degree: string;
    department: string;
    graduation_year: string;
    cgpa: string;
  };
  technical_skills: { name: string; proficiency?: string; score?: number }[];
  soft_skills: string[] | { name: string }[];
  projects: {
    projectName: string;
    description: string;
    technologies: string[];
    role?: string;
    githubUrl?: string;
    liveDemoUrl?: string;
  }[];
  experiences: {
    company?: string;
    organization?: string;
    role: string;
    duration?: string;
    description?: string;
  }[];
  certifications: (string | { name: string })[];
  achievements: (string | { title: string })[];
  assessment_details: Record<string, unknown>;
  industry_readiness: number | null;
  roadmap_progress: number | null;
  career: {
    target_role: string;
    preferred_locations: string[];
    work_mode: string;
  };
  is_demo: boolean;
}

export async function fetchStudentPublicProfile(uid: string): Promise<StudentPublicProfile> {
  const url = `${API_BASE_URL}/student-public-profile/${encodeURIComponent(uid)}`;
  const response = await fetch(url);

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || `Public Profile API error: ${response.status}`);
  }

  const data = await response.json();
  return data.profile;
}

export interface InterviewRequestPayload {
  company_uid: string;
  company_name: string;
  company_email?: string;
  student_uid: string;
  opportunity_id?: string;
  opportunity_title: string;
  opportunity_type: string;
  interview_type: string;
  proposed_date: string;
  proposed_time: string;
  mode: string;
  meeting_link?: string;
  message?: string;
}

export async function sendInterviewRequest(payload: InterviewRequestPayload): Promise<{ status: string; interview_request_id: string; message: string }> {
  const token = await getAuthToken(payload.company_uid);
  const url = `${API_BASE_URL}/interview-requests`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || `Interview Request API error: ${response.status}`);
  }

  return response.json();
}
