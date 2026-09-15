import { auth } from '../lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function getAuthToken(uid?: string): Promise<string> {
  try {
    if (auth && auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      if (token) return token;
    }
  } catch (err) {
    console.warn('[interviewApiService] Could not get Firebase ID token:', err);
  }
  return uid ? `mock-token-${uid}` : 'mock-token-company_acme_corp';
}

export interface InterviewItem {
  id: string;
  company_uid: string;
  company_name: string;
  student_uid: string;
  student_name: string;
  student_college: string;
  student_degree: string;
  avatar_url?: string;
  role: string;
  opportunity_type: string;
  interview_type: string;
  proposed_date: string;
  proposed_time: string;
  mode: string;
  meeting_link?: string;
  message?: string;
  status: string; // 'COMPLETED' | 'PENDING' | 'ACCEPTED' | 'SCHEDULED' | 'REJECTED'
  feedback: string;
  rating: string;
  skill_match: string;
  assessment_score: string;
  is_demo: boolean;
  created_at?: string;
}

export interface InterviewBatch {
  batch_id: string;
  batch_name: string;
  role_title: string;
  opportunity_type: string;
  total_count: number;
  completed_count: number;
  pending_count: number;
  ai_summary: string;
  completed_interviews: InterviewItem[];
  pending_interviews: InterviewItem[];
}

export interface InterviewBatchesResponse {
  status: string;
  company_uid: string;
  batches: InterviewBatch[];
  total_batches: number;
}

export async function fetchInterviewBatches(companyUid: string = 'company_acme_corp'): Promise<InterviewBatchesResponse> {
  const url = `${API_BASE_URL}/company-interviews/batches?company_uid=${encodeURIComponent(companyUid)}`;
  const response = await fetch(url);

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || `Interview Batches API error: ${response.status}`);
  }

  return response.json();
}

export async function updateInterviewFeedback(
  interviewId: string,
  feedback: string,
  rating: string,
  status?: string,
  companyUid: string = 'company_acme_corp'
): Promise<{ status: string; interview_id: string; feedback: string; rating: string; interview_status: string; message: string }> {
  const token = await getAuthToken(companyUid);
  const url = `${API_BASE_URL}/company-interviews/${encodeURIComponent(interviewId)}/feedback`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      feedback,
      rating,
      ...(status ? { status } : {}),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || `Interview Feedback API error: ${response.status}`);
  }

  return response.json();
}
