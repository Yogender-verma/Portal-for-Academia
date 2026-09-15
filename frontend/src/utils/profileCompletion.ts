import type { StudentProfile } from '../types/profile';

export interface CompletionSectionBreakdown {
  label: string;
  weight: number;
  completed: boolean;
  score: number;
  missingAction?: string;
}

export interface ProfileCompletionResult {
  totalPercentage: number;
  breakdown: CompletionSectionBreakdown[];
  missingItems: string[];
}

export function calculateProfileCompletion(profile: StudentProfile): ProfileCompletionResult {
  const breakdown: CompletionSectionBreakdown[] = [
    {
      label: 'Personal Information',
      weight: 10,
      completed: Boolean(profile.personalInfo?.fullName && profile.personalInfo?.email && profile.personalInfo?.phone && profile.personalInfo?.city),
      score: 0,
      missingAction: 'Complete Personal Information',
    },
    {
      label: 'Academic Information',
      weight: 10,
      completed: Boolean(profile.academicInfo?.college && profile.academicInfo?.degree && profile.academicInfo?.branch && profile.academicInfo?.cgpa),
      score: 0,
      missingAction: 'Add Academic Details',
    },
    {
      label: 'Technical Skills',
      weight: 15,
      completed: Boolean(profile.technicalSkills && profile.technicalSkills.length > 0),
      score: 0,
      missingAction: 'Add Technical Skills',
    },
    {
      label: 'Soft Skills',
      weight: 5,
      completed: Boolean(profile.softSkills && profile.softSkills.length > 0),
      score: 0,
      missingAction: 'Add Soft Skills',
    },
    {
      label: 'Projects',
      weight: 15,
      completed: Boolean(profile.projects && profile.projects.length > 0),
      score: 0,
      missingAction: 'Add at least 1 Project',
    },
    {
      label: 'Certifications',
      weight: 10,
      completed: Boolean(profile.certifications && profile.certifications.length > 0),
      score: 0,
      missingAction: 'Add a Certification',
    },
    {
      label: 'Achievements',
      weight: 5,
      completed: Boolean(profile.achievements && profile.achievements.length > 0),
      score: 0,
      missingAction: 'Add Achievements or Awards',
    },
    {
      label: 'Work Experience',
      weight: 10,
      completed: Boolean(profile.experience && profile.experience.length > 0),
      score: 0,
      missingAction: 'Add Internship or Work Experience',
    },
    {
      label: 'Resume',
      weight: 10,
      completed: Boolean(profile.resume && profile.resume.fileName),
      score: 0,
      missingAction: 'Upload Resume',
    },
    {
      label: 'Career Preferences',
      weight: 5,
      completed: Boolean(profile.careerPreferences?.targetRole && profile.careerPreferences?.preferredLocations?.length > 0),
      score: 0,
      missingAction: 'Set Career Preferences',
    },
    {
      label: 'Languages',
      weight: 5,
      completed: Boolean(profile.languages && profile.languages.length > 0),
      score: 0,
      missingAction: 'Add Languages Known',
    },
  ];

  let totalPercentage = 0;
  const missingItems: string[] = [];

  breakdown.forEach((item) => {
    if (item.completed) {
      item.score = item.weight;
      totalPercentage += item.weight;
    } else {
      item.score = 0;
      if (item.missingAction) {
        missingItems.push(item.missingAction);
      }
    }
  });

  return {
    totalPercentage: Math.min(100, Math.max(0, totalPercentage)),
    breakdown,
    missingItems,
  };
}
