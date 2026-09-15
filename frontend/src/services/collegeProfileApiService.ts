import { auth } from '../lib/firebase';
import type { CollegeProfile } from '../types/collegeProfile';

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
    console.warn('[collegeProfileApiService] Could not get Firebase ID token:', err);
  }
  return uid ? `mock-token-${uid}` : 'mock-token-college';
}

export interface CollegeProfileApiResponse {
  status: 'success' | 'not_found' | 'error';
  profile?: CollegeProfile | null;
  message?: string;
  updated_at?: string;
}

export async function fetchCollegeProfileFromBackend(uid: string): Promise<CollegeProfileApiResponse> {
  if (!uid) {
    return { status: 'error', message: 'No user UID provided' };
  }

  const token = await getAuthToken(uid);
  const response = await fetch(`${API_BASE_URL}/college-profiles/${encodeURIComponent(uid)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return { status: 'not_found', message: 'College profile not found in database' };
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Server returned status ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export async function saveCollegeProfileToBackend(uid: string, profile: CollegeProfile): Promise<CollegeProfileApiResponse> {
  if (!uid) {
    throw new Error('Cannot save college profile without authenticated user UID');
  }

  const token = await getAuthToken(uid);
  const response = await fetch(`${API_BASE_URL}/college-profiles/${encodeURIComponent(uid)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ profile }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Failed to persist college profile to PostgreSQL (${response.status})`);
  }

  const data = await response.json();
  return data;
}

export async function deleteCollegeProfileFromBackend(uid: string): Promise<CollegeProfileApiResponse> {
  if (!uid) {
    throw new Error('Cannot delete college profile without authenticated user UID');
  }

  const token = await getAuthToken(uid);
  const response = await fetch(`${API_BASE_URL}/college-profiles/${encodeURIComponent(uid)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Failed to delete college profile (${response.status})`);
  }

  const data = await response.json();
  return data;
}
