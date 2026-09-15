import type { StudentProfile } from '../types/profile';

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    city: '',
    state: '',
    country: '',
    avatarUrl: '',
    linkedInUrl: '',
    gitHubUrl: '',
    portfolioUrl: '',
  },

  academicInfo: {
    college: '',
    degree: '',
    branch: '',
    currentYear: '',
    currentSemester: '',
    cgpa: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    graduationYear: '',
  },

  technicalSkills: [],

  softSkills: [],

  projects: [],

  certifications: [],

  achievements: [],

  experience: [],

  resume: null,

  careerPreferences: {
    targetRole: '',
    preferredRoles: [],
    preferredDomains: [],
    opportunityType: [],
    workMode: [],
    preferredLocations: [],
    minExpectedStipend: '',
    minExpectedSalary: '',
  },

  languages: [],
  coursework: [],
  publications: [],
  awards: [],
};
