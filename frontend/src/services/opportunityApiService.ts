import { auth } from '../lib/firebase';
import type { OpportunitySearchRequest, OpportunitySearchResponse } from '../types/opportunity';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function getAuthToken(): Promise<string> {
  try {
    if (auth && auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      if (token) return token;
    }
  } catch (err) {
    console.warn('[opportunityApiService] Could not get Firebase ID token:', err);
  }
  return 'mock-token-student';
}

export async function searchOpportunitiesFromAgent(
  reqPayload: OpportunitySearchRequest = {}
): Promise<OpportunitySearchResponse> {
  const token = await getAuthToken();
  const endpoint = API_BASE_URL.endsWith('/api/v1') 
    ? `${API_BASE_URL}/opportunities/search` 
    : `${API_BASE_URL}/api/v1/opportunities/search`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(reqPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Server returned status ${response.status}`);
  }

  const data: OpportunitySearchResponse = await response.json();
  return data;
}
