import type { SavedCodeSnippet, CodingAssessmentResult } from './assessment';

export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface TechnicalSkill {
  id: string;
  name: string;
  category: 'Programming' | 'Web Development' | 'Database' | 'Cloud & DevOps' | 'Tools';
  proficiency: ProficiencyLevel;
}

export interface SoftSkill {
  id: string;
  name: string;
  proficiency: ProficiencyLevel;
}

export interface ProjectItem {
  id: string;
  projectName: string;
  description: string;
  technologies: string[];
  role: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  skillsDemonstrated: string[];
  thumbnailUrl?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  certificateFileName?: string;
  certificateFileData?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  organizationOrEvent: string;
  date?: string;
  description: string;
  proofFileName?: string;
  proofUrl?: string;
}

export interface ExperienceItem {
  id: string;
  organization: string;
  role: string;
  employmentType: 'Full-time' | 'Internship' | 'Part-time' | 'Freelance';
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
  location: string;
  responsibilities: string;
  skillsGained: string[];
  certificateFileName?: string;
}

export interface ResumeInfo {
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  lastUpdated: string;
  fileData?: string;
}

export interface CareerPreferences {
  targetRole: string;
  preferredRoles: string[];
  preferredDomains: string[];
  opportunityType: ('Internship' | 'Full-time' | 'Part-time')[];
  workMode: ('On-site' | 'Hybrid' | 'Remote')[];
  preferredLocations: string[];
  minExpectedStipend?: string;
  minExpectedSalary?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  readingLevel?: 'Basic' | 'Intermediate' | 'Advanced' | 'Native';
  writingLevel?: 'Basic' | 'Intermediate' | 'Advanced' | 'Native';
  speakingLevel?: 'Basic' | 'Intermediate' | 'Advanced' | 'Native';
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  city: string;
  state: string;
  country: string;
  avatarUrl: string;
  linkedInUrl?: string;
  gitHubUrl?: string;
  portfolioUrl?: string;
  aboutMe?: string;
}

export interface AcademicInfo {
  college: string;
  degree: string;
  branch: string;
  currentYear: string;
  currentSemester: string;
  cgpa: string;
  tenthPercentage: string;
  twelfthPercentage: string;
  graduationYear: string;
}

export interface AwardItem {
  id: string;
  title: string;
  issuer?: string;
  year?: string;
}

export interface PublicationItem {
  id: string;
  title: string;
  publisher?: string;
  date?: string;
  link?: string;
  description?: string;
}

export interface StudentProfile {
  personalInfo: PersonalInfo;
  academicInfo: AcademicInfo;
  technicalSkills: TechnicalSkill[];
  softSkills: SoftSkill[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  experience: ExperienceItem[];
  resume: ResumeInfo | null;
  careerPreferences: CareerPreferences;
  languages: LanguageItem[];
  aboutMe?: string;
  coursework?: string[];
  publications?: PublicationItem[];
  awards?: AwardItem[];
  savedCodeSnippets?: SavedCodeSnippet[];
  assessmentHistory?: CodingAssessmentResult[];
  appliedOpportunities?: Record<string, { appliedDate: string; company: string; title: string; opportunityType: string }>;
}
