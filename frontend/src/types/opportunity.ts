export interface Opportunity {
  id: string;
  title: string;
  company: string;
  opportunityType: 'internship' | 'job';
  source: string;
  applyUrl: string;
  location: string;
  workMode: 'remote' | 'onsite' | 'hybrid';
  salaryStipend: string;
  duration?: string;
  eligibility?: string;
  experienceRequired?: string;
  employmentType?: string;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  missingSkillsWithGaps: { name: string; gap: number }[];
  matchScore: number;
  postedDate: string;
  deadline?: string;
  status?: 'Top Matched' | 'Applied' | 'Selected & Worked' | 'Rejected';
  appliedDate?: string;
  workedDuration?: string;
  rejectionReason?: string;
}

export interface OpportunitySearchRequest {
  targetRole?: string;
  skills?: string[];
  locations?: string[];
  workMode?: string;
  opportunityType?: 'all' | 'internship' | 'job';
}

export interface OpportunitySearchResponse {
  status: 'success' | 'no_target_role' | 'error';
  message?: string;
  targetRole: string;
  searchingSources: string[];
  sourcesStatus: Record<string, string>;
  totalFound: number;
  duplicatesRemoved: number;
  finalMatched: number;
  opportunities: Opportunity[];
}
