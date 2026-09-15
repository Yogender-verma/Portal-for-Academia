import { auth } from '../lib/firebase';
import type { StudentProfile } from '../types/profile';

const rawEnv = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
const API_BASE_URL = rawEnv.endsWith('/api/v1') ? rawEnv : `${rawEnv}/api/v1`;

async function getAuthToken(uid?: string): Promise<string> {
  try {
    if (auth && auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      if (token) return token;
    }
  } catch (err) {
    console.warn('[profileApiService] Could not get Firebase ID token:', err);
  }
  return uid ? `mock-token-${uid}` : 'mock-token-guest';
}

export interface ProfileApiResponse {
  status: 'success' | 'not_found' | 'error';
  profile?: StudentProfile | null;
  message?: string;
  updated_at?: string;
}

export async function fetchProfileFromBackend(uid: string): Promise<ProfileApiResponse> {
  if (!uid) {
    return { status: 'error', message: 'No user UID provided' };
  }

  const token = await getAuthToken(uid);
  const response = await fetch(`${API_BASE_URL}/profiles/${encodeURIComponent(uid)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return { status: 'not_found', message: 'Profile not found in database' };
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Server returned status ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export async function saveProfileToBackend(uid: string, profile: StudentProfile): Promise<ProfileApiResponse> {
  if (!uid) {
    throw new Error('Cannot save profile without authenticated user UID');
  }

  const token = await getAuthToken(uid);
  const response = await fetch(`${API_BASE_URL}/profiles/${encodeURIComponent(uid)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ profile }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Failed to persist profile to PostgreSQL (${response.status})`);
  }

  const data = await response.json();
  return data;
}

export async function deleteProfileFromBackend(uid: string): Promise<ProfileApiResponse> {
  if (!uid) {
    throw new Error('Cannot delete profile without authenticated user UID');
  }

  const token = await getAuthToken(uid);
  const response = await fetch(`${API_BASE_URL}/profiles/${encodeURIComponent(uid)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Failed to delete profile (${response.status})`);
  }

  const data = await response.json();
  return data;
}
