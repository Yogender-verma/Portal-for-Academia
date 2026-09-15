import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  StudentProfile,
  PersonalInfo,
  AcademicInfo,
  TechnicalSkill,
  SoftSkill,
  ProjectItem,
  CertificationItem,
  AchievementItem,
  ExperienceItem,
  ResumeInfo,
  CareerPreferences,
  LanguageItem,
} from '../types/profile';
import { DEFAULT_STUDENT_PROFILE } from '../data/defaultStudentProfile';
import { calculateProfileCompletion } from '../utils/profileCompletion';
import type { ProfileCompletionResult } from '../utils/profileCompletion';
import type { SavedCodeSnippet, CodingAssessmentResult } from '../types/assessment';
import { normalizeSkillName } from '../utils/skillNormalization';
import { useAuth } from './AuthContext';
import { fetchProfileFromBackend, saveProfileToBackend } from '../services/profileApiService';

const getStorageKey = (uid?: string) => `skillbridge_student_profile_${uid || 'guest'}`;

interface StudentProfileContextType {
  profile: StudentProfile;
  completion: ProfileCompletionResult;
  saveMessage: { text: string; type: 'success' | 'error' | 'saving' } | null;
  // Personal Info & About Me
  updatePersonalInfo: (data: Partial<PersonalInfo>) => Promise<boolean>;
  updateAboutMe: (aboutMe: string) => Promise<boolean>;
  // Academic Info
  updateAcademicInfo: (data: Partial<AcademicInfo>) => Promise<boolean>;
  // Technical Skills
  addTechnicalSkill: (skill: Omit<TechnicalSkill, 'id'>) => Promise<boolean>;
  updateTechnicalSkill: (id: string, skill: Partial<TechnicalSkill>) => Promise<boolean>;
  deleteTechnicalSkill: (id: string) => Promise<boolean>;
  // Soft Skills
  addSoftSkill: (skill: Omit<SoftSkill, 'id'>) => Promise<boolean>;
  updateSoftSkill: (id: string, skill: Partial<SoftSkill>) => Promise<boolean>;
  deleteSoftSkill: (id: string) => Promise<boolean>;
  // Projects
  addProject: (project: Omit<ProjectItem, 'id'>) => Promise<boolean>;
  updateProject: (id: string, project: Partial<ProjectItem>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  // Certifications
  addCertification: (cert: Omit<CertificationItem, 'id'>) => Promise<boolean>;
  updateCertification: (id: string, cert: Partial<CertificationItem>) => Promise<boolean>;
  deleteCertification: (id: string) => Promise<boolean>;
  // Achievements
  addAchievement: (achieve: Omit<AchievementItem, 'id'>) => Promise<boolean>;
  updateAchievement: (id: string, achieve: Partial<AchievementItem>) => Promise<boolean>;
  deleteAchievement: (id: string) => Promise<boolean>;
  // Experience
  addExperience: (exp: Omit<ExperienceItem, 'id'>) => Promise<boolean>;
  updateExperience: (id: string, exp: Partial<ExperienceItem>) => Promise<boolean>;
  deleteExperience: (id: string) => Promise<boolean>;
  // Resume
  updateResume: (resume: ResumeInfo) => Promise<boolean>;
  deleteResume: () => Promise<boolean>;
  // Career Preferences
  updateCareerPreferences: (prefs: Partial<CareerPreferences>) => Promise<boolean>;
  // Languages
  addLanguage: (lang: Omit<LanguageItem, 'id'>) => Promise<boolean>;
  updateLanguage: (id: string, lang: Partial<LanguageItem>) => Promise<boolean>;
  deleteLanguage: (id: string) => Promise<boolean>;
  // Safe Merging of Resume Extracted Data
  mergeExtractedProfileData: (extracted: Partial<StudentProfile>) => Promise<boolean>;
  // Code Snippets & Assessment History
  saveCodeSnippet: (snippet: Omit<SavedCodeSnippet, 'id' | 'lastEditedAt'>) => Promise<boolean>;
  deleteCodeSnippet: (id: string) => Promise<boolean>;
  recordAssessmentResult: (result: CodingAssessmentResult) => Promise<boolean>;
  recordApplication: (opp: { id: string; company: string; title: string; opportunityType: string }) => Promise<boolean>;
  recordApplicationsBatch: (opps: { id: string; company: string; title: string; opportunityType: string }[]) => Promise<boolean>;
  // Reset
  resetProfileToDemo: () => Promise<boolean>;
}

const StudentProfileContext = createContext<StudentProfileContextType | undefined>(undefined);

export const StudentProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentKey = getStorageKey(user?.uid);

  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      // Fallback order: user UID key -> guest key -> global latest cache key
      const saved = localStorage.getItem(currentKey) || 
                    localStorage.getItem('skillbridge_student_profile_guest') || 
                    localStorage.getItem('skillbridge_student_profile_latest');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STUDENT_PROFILE,
          ...parsed,
          personalInfo: {
            ...DEFAULT_STUDENT_PROFILE.personalInfo,
            ...(parsed.personalInfo || {}),
            fullName: parsed.personalInfo?.fullName || user?.displayName || '',
            email: parsed.personalInfo?.email || user?.email || '',
          },
          academicInfo: { ...DEFAULT_STUDENT_PROFILE.academicInfo, ...(parsed.academicInfo || {}) },
          careerPreferences: { ...DEFAULT_STUDENT_PROFILE.careerPreferences, ...(parsed.careerPreferences || {}) },
        };
      }
    } catch (err) {
      console.error('Failed to load profile from localStorage:', err);
    }
    return {
      ...DEFAULT_STUDENT_PROFILE,
      personalInfo: {
        ...DEFAULT_STUDENT_PROFILE.personalInfo,
        fullName: user?.displayName || '',
        email: user?.email || '',
      },
    };
  });

  // Keep a ref to the latest profile so sequential async saves don't read stale closures
  const profileRef = React.useRef(profile);
  React.useEffect(() => { profileRef.current = profile; }, [profile]);

  // Re-load profile when user account changes (PostgreSQL authoritative source, localStorage fallback)
  useEffect(() => {
    if (!user?.uid) return;
    let isMounted = true;

    const loadAuthoritativeProfile = async () => {
      try {
        console.log('[StudentProfileContext] Fetching authoritative profile from PostgreSQL for UID:', user.uid);
        const res = await fetchProfileFromBackend(user.uid);
        if (!isMounted) return;

        if (res.status === 'success' && res.profile) {
          console.log('[StudentProfileContext] Successfully loaded authoritative profile from PostgreSQL for UID:', user.uid);
          
          // Preserve local offline/guest applications if present
          const latestLocalStr = localStorage.getItem('skillbridge_student_profile_latest');
          let mergedLocalApplications = res.profile.appliedOpportunities || {};
          if (latestLocalStr) {
            try {
              const parsedLocal = JSON.parse(latestLocalStr);
              if (parsedLocal.appliedOpportunities) {
                mergedLocalApplications = { ...parsedLocal.appliedOpportunities, ...mergedLocalApplications };
              }
            } catch (e) { /* ignore */ }
          }

          const authoritative: StudentProfile = {
            ...DEFAULT_STUDENT_PROFILE,
            ...res.profile,
            appliedOpportunities: mergedLocalApplications,
            personalInfo: {
              ...DEFAULT_STUDENT_PROFILE.personalInfo,
              ...(res.profile.personalInfo || {}),
              fullName: res.profile.personalInfo?.fullName || user.displayName || '',
              email: res.profile.personalInfo?.email || user.email || '',
            },
            academicInfo: { ...DEFAULT_STUDENT_PROFILE.academicInfo, ...(res.profile.academicInfo || {}) },
            careerPreferences: { ...DEFAULT_STUDENT_PROFILE.careerPreferences, ...(res.profile.careerPreferences || {}) },
          };
          setProfile(authoritative);
          profileRef.current = authoritative;
          const key = getStorageKey(user.uid);
          localStorage.setItem(key, JSON.stringify(authoritative));
          localStorage.setItem('skillbridge_student_profile_latest', JSON.stringify(authoritative));

          // Sync merged data back to PostgreSQL
          saveProfileToBackend(user.uid, authoritative).catch((err) => {
            console.warn('[StudentProfileContext] Auto-sync warning:', err);
          });
        } else if (res.status === 'not_found') {
          console.log('[StudentProfileContext] No PostgreSQL record found for UID:', user.uid, '— preserving local cache and seeding DB');
          const key = getStorageKey(user.uid);
          const saved = localStorage.getItem(key) || localStorage.getItem('skillbridge_student_profile_latest');
          let currentData = profileRef.current;
          if (saved) {
            try {
              currentData = JSON.parse(saved);
            } catch (e) { /* ignore */ }
          }
          // Seed database with current data
          saveProfileToBackend(user.uid, currentData).catch((err) => {
            console.warn('[StudentProfileContext] Initial DB seed warning:', err);
          });
        }
      } catch (err) {
        console.warn('[StudentProfileContext] Backend unavailable — using localStorage fallback for UID:', user.uid, err);
        // LocalStorage fallback already initialized in useState
      }
    };

    loadAuthoritativeProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' | 'saving' } | null>(null);

  const completion = calculateProfileCompletion(profile);

  // Helper to persist updated profile to state, localStorage cache, AND PostgreSQL authoritative DB
  const saveProfile = async (newProfile: StudentProfile): Promise<boolean> => {
    try {
      setSaveMessage({ text: 'Saving changes...', type: 'saving' });
      
      // Update local state and localStorage cache immediately for fast UI feedback
      setProfile(newProfile);
      profileRef.current = newProfile;
      const key = getStorageKey(user?.uid);
      
      // Dual-Persistence: ALWAYS write to latest global cache key AND user-specific key
      localStorage.setItem(key, JSON.stringify(newProfile));
      localStorage.setItem('skillbridge_student_profile_latest', JSON.stringify(newProfile));
      if (!user?.uid) {
        localStorage.setItem('skillbridge_student_profile_guest', JSON.stringify(newProfile));
      }

      // Persist to PostgreSQL if user is authenticated
      if (user?.uid) {
        try {
          await saveProfileToBackend(user.uid, newProfile);
          setSaveMessage({ text: '✓ Changes saved to database successfully', type: 'success' });
          setTimeout(() => setSaveMessage(null), 3000);
          return true;
        } catch (backendErr: any) {
          console.error('[StudentProfileContext] PostgreSQL persistence error:', backendErr);
          const errMsg = backendErr?.message || 'Database error';
          setSaveMessage({
            text: `⚠ Saved to persistent local storage (${errMsg})`,
            type: 'error',
          });
          setTimeout(() => setSaveMessage(null), 6000);
          return false;
        }
      } else {
        setSaveMessage({ text: '✓ Saved to persistent local storage (Guest mode)', type: 'success' });
        setTimeout(() => setSaveMessage(null), 3000);
        return true;
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage({ text: 'Unable to save changes. Please try again.', type: 'error' });
      setTimeout(() => setSaveMessage(null), 4000);
      return false;
    }
  };

  // Personal Info & About Me
  const updatePersonalInfo = async (data: Partial<PersonalInfo>) => {
    const updated: StudentProfile = {
      ...profile,
      personalInfo: { ...profile.personalInfo, ...data },
    };
    return saveProfile(updated);
  };

  const updateAboutMe = async (aboutMe: string) => {
    const updated: StudentProfile = {
      ...profile,
      aboutMe,
      personalInfo: { ...profile.personalInfo, aboutMe },
    };
    return saveProfile(updated);
  };

  // Academic Info
  const updateAcademicInfo = async (data: Partial<AcademicInfo>) => {
    const updated: StudentProfile = {
      ...profile,
      academicInfo: { ...profile.academicInfo, ...data },
    };
    return saveProfile(updated);
  };

  // Technical Skills
  const addTechnicalSkill = async (skill: Omit<TechnicalSkill, 'id'>) => {
    const normalizedName = normalizeSkillName(skill.name);
    const newSkill: TechnicalSkill = {
      ...skill,
      name: normalizedName,
      id: `skill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated: StudentProfile = {
      ...profile,
      technicalSkills: [...profile.technicalSkills, newSkill],
    };
    return saveProfile(updated);
  };

  const updateTechnicalSkill = async (id: string, skill: Partial<TechnicalSkill>) => {
    const updatedSkills = profile.technicalSkills.map((s) => (s.id === id ? { ...s, ...skill } : s));
    const updated: StudentProfile = { ...profile, technicalSkills: updatedSkills };
    return saveProfile(updated);
  };

  const deleteTechnicalSkill = async (id: string) => {
    const updatedSkills = profile.technicalSkills.filter((s) => s.id !== id);
    const updated: StudentProfile = { ...profile, technicalSkills: updatedSkills };
    return saveProfile(updated);
  };

  // Soft Skills
  const addSoftSkill = async (skill: Omit<SoftSkill, 'id'>) => {
    const newSkill: SoftSkill = { ...skill, id: `soft-${Date.now()}` };
    const updated: StudentProfile = {
      ...profile,
      softSkills: [...profile.softSkills, newSkill],
    };
    return saveProfile(updated);
  };

  const updateSoftSkill = async (id: string, skill: Partial<SoftSkill>) => {
    const updatedSkills = profile.softSkills.map((s) => (s.id === id ? { ...s, ...skill } : s));
    const updated: StudentProfile = { ...profile, softSkills: updatedSkills };
    return saveProfile(updated);
  };

  const deleteSoftSkill = async (id: string) => {
    const updatedSkills = profile.softSkills.filter((s) => s.id !== id);
    const updated: StudentProfile = { ...profile, softSkills: updatedSkills };
    return saveProfile(updated);
  };

  // Projects
  const addProject = async (proj: Omit<ProjectItem, 'id'>) => {
    const newProj: ProjectItem = { ...proj, id: `proj-${Date.now()}` };
    const updated: StudentProfile = {
      ...profile,
      projects: [newProj, ...profile.projects],
    };
    return saveProfile(updated);
  };

  const updateProject = async (id: string, proj: Partial<ProjectItem>) => {
    const updatedProjects = profile.projects.map((p) => (p.id === id ? { ...p, ...proj } : p));
    const updated: StudentProfile = { ...profile, projects: updatedProjects };
    return saveProfile(updated);
  };

  const deleteProject = async (id: string) => {
    const updatedProjects = profile.projects.filter((p) => p.id !== id);
    const updated: StudentProfile = { ...profile, projects: updatedProjects };
    return saveProfile(updated);
  };

  // Certifications
  const addCertification = async (cert: Omit<CertificationItem, 'id'>) => {
    const newCert: CertificationItem = { ...cert, id: `cert-${Date.now()}` };
    const updated: StudentProfile = {
      ...profile,
      certifications: [newCert, ...profile.certifications],
    };
    return saveProfile(updated);
  };

  const updateCertification = async (id: string, cert: Partial<CertificationItem>) => {
    const updatedCerts = profile.certifications.map((c) => (c.id === id ? { ...c, ...cert } : c));
    const updated: StudentProfile = { ...profile, certifications: updatedCerts };
    return saveProfile(updated);
  };

  const deleteCertification = async (id: string) => {
    const updatedCerts = profile.certifications.filter((c) => c.id !== id);
    const updated: StudentProfile = { ...profile, certifications: updatedCerts };
    return saveProfile(updated);
  };

  // Achievements
  const addAchievement = async (achieve: Omit<AchievementItem, 'id'>) => {
    const newAchieve: AchievementItem = { ...achieve, id: `achieve-${Date.now()}` };
    const updated: StudentProfile = {
      ...profile,
      achievements: [newAchieve, ...profile.achievements],
    };
    return saveProfile(updated);
  };

  const updateAchievement = async (id: string, achieve: Partial<AchievementItem>) => {
    const updatedList = profile.achievements.map((a) => (a.id === id ? { ...a, ...achieve } : a));
    const updated: StudentProfile = { ...profile, achievements: updatedList };
    return saveProfile(updated);
  };

  const deleteAchievement = async (id: string) => {
    const updatedList = profile.achievements.filter((a) => a.id !== id);
    const updated: StudentProfile = { ...profile, achievements: updatedList };
    return saveProfile(updated);
  };

  // Experience
  const addExperience = async (exp: Omit<ExperienceItem, 'id'>) => {
    const newExp: ExperienceItem = { ...exp, id: `exp-${Date.now()}` };
    const updated: StudentProfile = {
      ...profile,
      experience: [newExp, ...profile.experience],
    };
    return saveProfile(updated);
  };

  const updateExperience = async (id: string, exp: Partial<ExperienceItem>) => {
    const updatedList = profile.experience.map((e) => (e.id === id ? { ...e, ...exp } : e));
    const updated: StudentProfile = { ...profile, experience: updatedList };
    return saveProfile(updated);
  };

  const deleteExperience = async (id: string) => {
    const updatedList = profile.experience.filter((e) => e.id !== id);
    const updated: StudentProfile = { ...profile, experience: updatedList };
    return saveProfile(updated);
  };

  // Resume
  const updateResume = async (resumeInfo: ResumeInfo) => {
    const updated: StudentProfile = {
      ...profile,
      resume: resumeInfo,
    };
    return saveProfile(updated);
  };

  const deleteResume = async () => {
    const updated: StudentProfile = {
      ...profile,
      resume: null,
    };
    return saveProfile(updated);
  };

  // Career Preferences
  const updateCareerPreferences = async (prefs: Partial<CareerPreferences>) => {
    const updated: StudentProfile = {
      ...profile,
      careerPreferences: { ...profile.careerPreferences, ...prefs },
    };
    return saveProfile(updated);
  };

  // Languages
  const addLanguage = async (lang: Omit<LanguageItem, 'id'>) => {
    const newLang: LanguageItem = { ...lang, id: `lang-${Date.now()}` };
    const updated: StudentProfile = {
      ...profile,
      languages: [...profile.languages, newLang],
    };
    return saveProfile(updated);
  };

  const updateLanguage = async (id: string, lang: Partial<LanguageItem>) => {
    const updatedList = profile.languages.map((l) => (l.id === id ? { ...l, ...lang } : l));
    const updated: StudentProfile = { ...profile, languages: updatedList };
    return saveProfile(updated);
  };

  const deleteLanguage = async (id: string) => {
    const updatedList = profile.languages.filter((l) => l.id !== id);
    const updated: StudentProfile = { ...profile, languages: updatedList };
    return saveProfile(updated);
  };

  // Merge Extracted Profile Data from Resume without overwriting non-empty data or deleting items
  const mergeExtractedProfileData = async (extracted: Partial<StudentProfile>): Promise<boolean> => {
    const current = { ...profileRef.current };

    // 1. Personal Info merge (fill blank or default fields)
    const mergedPersonalInfo: PersonalInfo = { ...current.personalInfo };
    if (extracted.personalInfo) {
      (Object.keys(extracted.personalInfo) as (keyof PersonalInfo)[]).forEach((key) => {
        const val = extracted.personalInfo![key];
        if (val && typeof val === 'string' && val.trim() !== '') {
          const curVal = mergedPersonalInfo[key];
          if (!curVal || curVal.trim() === '' || curVal === 'Guest Student' || curVal === 'Student') {
            (mergedPersonalInfo as any)[key] = val.trim();
          }
        }
      });
    }

    // 2. Academic Info merge (fill blank fields)
    const mergedAcademicInfo: AcademicInfo = { ...current.academicInfo };
    if (extracted.academicInfo) {
      (Object.keys(extracted.academicInfo) as (keyof AcademicInfo)[]).forEach((key) => {
        const val = extracted.academicInfo![key];
        if (val && typeof val === 'string' && val.trim() !== '') {
          const curVal = mergedAcademicInfo[key];
          if (!curVal || curVal.trim() === '') {
            (mergedAcademicInfo as any)[key] = val.trim();
          }
        }
      });
    }

    // 3. Technical Skills merge (avoid duplicates by normalized name)
    const mergedTechSkills = [...current.technicalSkills];
    if (extracted.technicalSkills && Array.isArray(extracted.technicalSkills)) {
      extracted.technicalSkills.forEach((extSkill) => {
        if (!extSkill.name) return;
        const normalizedName = normalizeSkillName(extSkill.name);
        const existingIdx = mergedTechSkills.findIndex(
          (s) => normalizeSkillName(s.name).toLowerCase() === normalizedName.toLowerCase()
        );
        if (existingIdx === -1) {
          mergedTechSkills.push({
            id: extSkill.id || `skill-ext-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: normalizedName,
            category: extSkill.category || 'Programming',
            proficiency: extSkill.proficiency || 'Intermediate',
          });
        }
      });
    }

    // 4. Soft Skills merge
    const mergedSoftSkills = [...current.softSkills];
    if (extracted.softSkills && Array.isArray(extracted.softSkills)) {
      extracted.softSkills.forEach((extSoft) => {
        const existingIdx = mergedSoftSkills.findIndex(
          (s) => s.name.toLowerCase() === extSoft.name.toLowerCase()
        );
        if (existingIdx === -1) {
          mergedSoftSkills.push({
            id: extSoft.id || `soft-ext-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: extSoft.name,
            proficiency: extSoft.proficiency || 'Intermediate',
          });
        }
      });
    }

    // 5. Projects merge
    const mergedProjects = [...current.projects];
    if (extracted.projects && Array.isArray(extracted.projects)) {
      extracted.projects.forEach((extProj) => {
        const existing = mergedProjects.find(
          (p) => p.projectName.toLowerCase() === extProj.projectName.toLowerCase()
        );
        if (!existing) {
          mergedProjects.push({
            ...extProj,
            id: extProj.id || `proj-ext-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          });
        }
      });
    }

    // 6. Experience merge
    const mergedExperience = [...current.experience];
    if (extracted.experience && Array.isArray(extracted.experience)) {
      extracted.experience.forEach((extExp) => {
        const existing = mergedExperience.find(
          (e) =>
            e.organization.toLowerCase() === extExp.organization.toLowerCase() &&
            e.role.toLowerCase() === extExp.role.toLowerCase()
        );
        if (!existing) {
          mergedExperience.push({
            ...extExp,
            id: extExp.id || `exp-ext-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          });
        }
      });
    }

    // 7. Certifications merge
    const mergedCerts = [...current.certifications];
    if (extracted.certifications && Array.isArray(extracted.certifications)) {
      extracted.certifications.forEach((extCert) => {
        const existing = mergedCerts.find((c) => c.name.toLowerCase() === extCert.name.toLowerCase());
        if (!existing) {
          mergedCerts.push({
            ...extCert,
            id: extCert.id || `cert-ext-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          });
        }
      });
    }

    // 8. Achievements merge
    const mergedAchievements = [...current.achievements];
    if (extracted.achievements && Array.isArray(extracted.achievements)) {
      extracted.achievements.forEach((extAch) => {
        const existing = mergedAchievements.find((a) => a.title.toLowerCase() === extAch.title.toLowerCase());
        if (!existing) {
          mergedAchievements.push({
            ...extAch,
            id: extAch.id || `achieve-ext-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          });
        }
      });
    }

    // 9. Languages merge
    const mergedLanguages = [...current.languages];
    if (extracted.languages && Array.isArray(extracted.languages)) {
      extracted.languages.forEach((extLang) => {
        const existing = mergedLanguages.find((l) => l.language.toLowerCase() === extLang.language.toLowerCase());
        if (!existing) {
          mergedLanguages.push({
            ...extLang,
            id: extLang.id || `lang-ext-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          });
        }
      });
    }

    // 10. Coursework merge
    const mergedCoursework = [...(current.coursework || [])];
    if (extracted.coursework && Array.isArray(extracted.coursework)) {
      extracted.coursework.forEach((item) => {
        if (item && !mergedCoursework.some((c) => c.toLowerCase() === item.toLowerCase())) {
          mergedCoursework.push(item);
        }
      });
    }

    // 11. Publications merge
    const mergedPublications = [...(current.publications || [])];
    if (extracted.publications && Array.isArray(extracted.publications)) {
      extracted.publications.forEach((extPub) => {
        const existing = mergedPublications.find((p) => p.title.toLowerCase() === extPub.title.toLowerCase());
        if (!existing) {
          mergedPublications.push({
            ...extPub,
            id: extPub.id || `pub-ext-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          });
        }
      });
    }

    // 12. Awards merge
    const mergedAwards = [...(current.awards || [])];
    if (extracted.awards && Array.isArray(extracted.awards)) {
      extracted.awards.forEach((extAward) => {
        const existing = mergedAwards.find((a) => a.title.toLowerCase() === extAward.title.toLowerCase());
        if (!existing) {
          mergedAwards.push({
            ...extAward,
            id: extAward.id || `award-ext-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          });
        }
      });
    }

    // 13. About Me merge
    const mergedAboutMe = current.aboutMe || extracted.aboutMe || extracted.personalInfo?.aboutMe || '';

    const newProfile: StudentProfile = {
      ...current,
      personalInfo: mergedPersonalInfo,
      academicInfo: mergedAcademicInfo,
      technicalSkills: mergedTechSkills,
      softSkills: mergedSoftSkills,
      projects: mergedProjects,
      experience: mergedExperience,
      certifications: mergedCerts,
      achievements: mergedAchievements,
      languages: mergedLanguages,
      coursework: mergedCoursework,
      publications: mergedPublications,
      awards: mergedAwards,
      aboutMe: mergedAboutMe,
    };

    return saveProfile(newProfile);
  };

  // Code Snippets Management
  const saveCodeSnippet = async (snippetData: Omit<SavedCodeSnippet, 'id' | 'lastEditedAt'>) => {
    const existingIndex = (profile.savedCodeSnippets || []).findIndex(
      (s) => s.title === snippetData.title && s.language === snippetData.language
    );

    const newSnippet: SavedCodeSnippet = {
      ...snippetData,
      id: existingIndex >= 0 ? profile.savedCodeSnippets![existingIndex].id : `snippet_${Date.now()}`,
      lastEditedAt: new Date().toISOString(),
    };

    let updatedSnippets = [...(profile.savedCodeSnippets || [])];
    if (existingIndex >= 0) {
      updatedSnippets[existingIndex] = newSnippet;
    } else {
      updatedSnippets.unshift(newSnippet);
    }

    const updated: StudentProfile = { ...profile, savedCodeSnippets: updatedSnippets };
    return saveProfile(updated);
  };

  const deleteCodeSnippet = async (id: string) => {
    const updatedSnippets = (profile.savedCodeSnippets || []).filter((s) => s.id !== id);
    const updated: StudentProfile = { ...profile, savedCodeSnippets: updatedSnippets };
    return saveProfile(updated);
  };

  // Record Assessment Result & Update Skill Evidence Level
  const recordAssessmentResult = async (result: CodingAssessmentResult) => {
    const currentHistory = profile.assessmentHistory || [];
    const updatedHistory = [result, ...currentHistory];

    let updatedTechnicalSkills = [...profile.technicalSkills];
    const existingSkillIdx = updatedTechnicalSkills.findIndex(
      (s) => s.name.toLowerCase() === result.skill.toLowerCase()
    );

    const proficiencyFromScore = 
      result.score >= 85 ? 'Expert' : result.score >= 70 ? 'Advanced' : result.score >= 50 ? 'Intermediate' : 'Beginner';

    if (existingSkillIdx >= 0) {
      updatedTechnicalSkills[existingSkillIdx] = {
        ...updatedTechnicalSkills[existingSkillIdx],
        proficiency: proficiencyFromScore,
      };
    } else {
      updatedTechnicalSkills.push({
        id: `skill_assessed_${Date.now()}`,
        name: result.skill,
        category: 'Programming',
        proficiency: proficiencyFromScore,
      });
    }

    const updated: StudentProfile = {
      ...profile,
      technicalSkills: updatedTechnicalSkills,
      assessmentHistory: updatedHistory,
    };

    return saveProfile(updated);
  };

  // Record 1-Click Applications & Sync to Database / Local Cache
  const recordApplication = async (opp: { id: string; company: string; title: string; opportunityType: string }) => {
    const existing = profile.appliedOpportunities || {};
    const updatedApplied = {
      ...existing,
      [opp.id]: {
        appliedDate: 'Just Now',
        company: opp.company,
        title: opp.title,
        opportunityType: opp.opportunityType,
      }
    };
    const updated: StudentProfile = {
      ...profile,
      appliedOpportunities: updatedApplied,
    };
    return saveProfile(updated);
  };

  const recordApplicationsBatch = async (opps: { id: string; company: string; title: string; opportunityType: string }[]) => {
    const existing = profile.appliedOpportunities || {};
    const updatedApplied = { ...existing };
    opps.forEach((opp) => {
      updatedApplied[opp.id] = {
        appliedDate: 'Just Now',
        company: opp.company,
        title: opp.title,
        opportunityType: opp.opportunityType,
      };
    });
    const updated: StudentProfile = {
      ...profile,
      appliedOpportunities: updatedApplied,
    };
    return saveProfile(updated);
  };

  // Clear & Reset Profile to Empty logged-in account state
  const resetProfileToDemo = async () => {
    const fresh: StudentProfile = {
      ...DEFAULT_STUDENT_PROFILE,
      personalInfo: {
        ...DEFAULT_STUDENT_PROFILE.personalInfo,
        fullName: user?.displayName || '',
        email: user?.email || '',
      },
    };
    return saveProfile(fresh);
  };

  return (
    <StudentProfileContext.Provider
      value={{
        profile,
        completion,
        saveMessage,
        updatePersonalInfo,
        updateAboutMe,
        updateAcademicInfo,
        addTechnicalSkill,
        updateTechnicalSkill,
        deleteTechnicalSkill,
        addSoftSkill,
        updateSoftSkill,
        deleteSoftSkill,
        addProject,
        updateProject,
        deleteProject,
        addCertification,
        updateCertification,
        deleteCertification,
        addAchievement,
        updateAchievement,
        deleteAchievement,
        addExperience,
        updateExperience,
        deleteExperience,
        updateResume,
        deleteResume,
        updateCareerPreferences,
        addLanguage,
        updateLanguage,
        deleteLanguage,
        mergeExtractedProfileData,
        saveCodeSnippet,
        deleteCodeSnippet,
        recordAssessmentResult,
        recordApplication,
        recordApplicationsBatch,
        resetProfileToDemo,
      }}
    >
      {children}
    </StudentProfileContext.Provider>
  );
};

export const useStudentProfile = () => {
  const context = useContext(StudentProfileContext);
  if (!context) {
    throw new Error('useStudentProfile must be used within a StudentProfileProvider');
  }
  return context;
};
