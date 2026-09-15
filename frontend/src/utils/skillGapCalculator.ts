import type { StudentProfile, TechnicalSkill, ProficiencyLevel } from '../types/profile';
import { INDUSTRY_SKILL_BENCHMARKS } from '../data/industrySkillRequirements';
import type { IndustrySkillRequirement } from '../data/industrySkillRequirements';
import { normalizeSkillName } from './skillNormalization';

export const PROFICIENCY_NUMERIC_MAP: Record<ProficiencyLevel, number> = {
  Beginner: 25,
  Intermediate: 50,
  Advanced: 75,
  Expert: 100,
};

export type GapStatus = 'Ready' | 'Nearly Ready' | 'Needs Improvement' | 'Not Started';
export type GapSeverity = 'No Gap' | 'Low Gap' | 'Medium Gap' | 'High Gap';

export interface DetailedSkillComparisonItem {
  skillName: string;
  category: string;
  requiredLevel: number; // Industry Benchmark %
  studentLevel: number;  // Student Preparation %
  gap: number;           // % Gap
  importance: 'Critical' | 'High' | 'Supporting';
  weight: number;
  status: GapStatus;
  severity: GapSeverity;
  assessmentEvidence?: number; // Score if assessment exists
}

export interface CategorySkillGroup {
  categoryName: string;
  skills: DetailedSkillComparisonItem[];
  readyCount: number;
  totalCount: number;
}

export interface DetailedSkillGapResult {
  role: string;
  hasRoleSaved: boolean;
  availableSavedRoles: string[];
  overallReadiness: number; // Weighted Industry Readiness %
  totalIndustrySkills: number;
  readyCount: number;
  nearlyReadyCount: number;
  gapCount: number;
  categoryGroups: CategorySkillGroup[];
  allSkillItems: DetailedSkillComparisonItem[];
  topPriorityGaps: DetailedSkillComparisonItem[];
  nextLearningRoadmap: string[];
}

/**
 * Returns ONLY job roles that the student has actually saved in Career Preferences.
 * (profile.careerPreferences.targetRole & profile.careerPreferences.preferredRoles[])
 */
export function getAvailableSavedRoles(profile: StudentProfile): string[] {
  const rolesSet = new Set<string>();
  
  if (profile.careerPreferences?.targetRole?.trim()) {
    rolesSet.add(profile.careerPreferences.targetRole.trim());
  }

  if (Array.isArray(profile.careerPreferences?.preferredRoles)) {
    profile.careerPreferences.preferredRoles.forEach((role) => {
      if (role?.trim()) rolesSet.add(role.trim());
    });
  }

  return Array.from(rolesSet);
}

/**
 * Normalizes and extracts student skill levels into a Map<normalizedName, numericPercentage>.
 */
export function getStudentSkillMap(studentSkills: TechnicalSkill[]): Map<string, number> {
  const map = new Map<string, number>();
  if (!Array.isArray(studentSkills)) return map;

  studentSkills.forEach((s) => {
    if (s.name) {
      const normalized = normalizeSkillName(s.name);
      const score = PROFICIENCY_NUMERIC_MAP[s.proficiency] || 25;
      // If multiple duplicate skill entries exist, pick highest proficiency
      const existing = map.get(normalized) || 0;
      map.set(normalized, Math.max(existing, score));
    }
  });

  return map;
}

/**
 * Main function: Evaluates Industry Skill Benchmark vs Student Preparation for a saved job role.
 */
export function calculateDetailedSkillGaps(
  profile: StudentProfile,
  selectedRole?: string
): DetailedSkillGapResult {
  const availableSavedRoles = getAvailableSavedRoles(profile);
  const hasRoleSaved = availableSavedRoles.length > 0;

  // Determine active role
  const activeRole = selectedRole && availableSavedRoles.includes(selectedRole)
    ? selectedRole
    : profile.careerPreferences?.targetRole || availableSavedRoles[0] || '';

  if (!hasRoleSaved || !activeRole) {
    return {
      role: '',
      hasRoleSaved: false,
      availableSavedRoles: [],
      overallReadiness: 0,
      totalIndustrySkills: 0,
      readyCount: 0,
      nearlyReadyCount: 0,
      gapCount: 0,
      categoryGroups: [],
      allSkillItems: [],
      topPriorityGaps: [],
      nextLearningRoadmap: [],
    };
  }

  // Get Benchmark skills for the selected role
  const benchmarkData = INDUSTRY_SKILL_BENCHMARKS[activeRole] || {
    role: activeRole,
    domain: 'Software & Technology',
    description: `Industry skill requirements for ${activeRole}`,
    skills: [
      { name: 'JavaScript', category: 'Frontend', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'React', category: 'Frontend', requiredLevel: 80, importance: 'Critical', weight: 1.5 },
      { name: 'Node.js', category: 'Backend', requiredLevel: 80, importance: 'Critical', weight: 1.5 },
      { name: 'SQL', category: 'Database', requiredLevel: 75, importance: 'High', weight: 1.2 },
      { name: 'Git', category: 'Tools', requiredLevel: 75, importance: 'High', weight: 1.2 },
    ] as IndustrySkillRequirement[],
  };

  const studentSkillMap = getStudentSkillMap(profile.technicalSkills || []);

  let totalWeightedRequired = 0;
  let totalWeightedStudent = 0;

  let readyCount = 0;
  let nearlyReadyCount = 0;
  let gapCount = 0;

  const categoryMap = new Map<string, DetailedSkillComparisonItem[]>();

  const allSkillItems: DetailedSkillComparisonItem[] = benchmarkData.skills.map((req) => {
    const normalizedReqName = normalizeSkillName(req.name);
    
    // Check student preparation
    let studentLevel = studentSkillMap.get(normalizedReqName) || 0;

    // Calculate gap
    const gap = Math.max(0, req.requiredLevel - studentLevel);

    // Determine status & severity
    let status: GapStatus = 'Ready';
    let severity: GapSeverity = 'No Gap';

    if (studentLevel === 0) {
      status = 'Not Started';
      severity = 'High Gap';
      gapCount++;
    } else if (gap === 0) {
      status = 'Ready';
      severity = 'No Gap';
      readyCount++;
    } else if (gap <= 15) {
      status = 'Nearly Ready';
      severity = 'Low Gap';
      nearlyReadyCount++;
    } else if (gap <= 35) {
      status = 'Needs Improvement';
      severity = 'Medium Gap';
      gapCount++;
    } else {
      status = 'Needs Improvement';
      severity = 'High Gap';
      gapCount++;
    }

    const item: DetailedSkillComparisonItem = {
      skillName: req.name,
      category: req.category,
      requiredLevel: req.requiredLevel,
      studentLevel,
      gap,
      importance: req.importance,
      weight: req.weight || 1.0,
      status,
      severity,
    };

    // Calculate weighted metrics for industry readiness
    totalWeightedRequired += req.requiredLevel * item.weight;
    totalWeightedStudent += Math.min(req.requiredLevel, studentLevel) * item.weight;

    // Group by category
    if (!categoryMap.has(req.category)) {
      categoryMap.set(req.category, []);
    }
    categoryMap.get(req.category)!.push(item);

    return item;
  });

  // Calculate Weighted Industry Readiness %
  const overallReadiness = totalWeightedRequired > 0
    ? Math.min(100, Math.round((totalWeightedStudent / totalWeightedRequired) * 100))
    : 0;

  // Build category groups
  const categoryGroups: CategorySkillGroup[] = Array.from(categoryMap.entries()).map(([catName, skills]) => ({
    categoryName: catName,
    skills,
    readyCount: skills.filter((s) => s.gap === 0).length,
    totalCount: skills.length,
  }));

  // Identify Top Skill Gaps (sorted by Importance, then largest Gap size)
  const topPriorityGaps = allSkillItems
    .filter((s) => s.gap > 0)
    .sort((a, b) => {
      const importanceWeight = { Critical: 3, High: 2, Supporting: 1 };
      const impDiff = importanceWeight[b.importance] - importanceWeight[a.importance];
      if (impDiff !== 0) return impDiff;
      return b.gap - a.gap;
    });

  // Generate Learning Roadmap sequence
  const nextLearningRoadmap = topPriorityGaps.slice(0, 5).map((g) => g.skillName);

  return {
    role: activeRole,
    hasRoleSaved: true,
    availableSavedRoles,
    overallReadiness,
    totalIndustrySkills: allSkillItems.length,
    readyCount,
    nearlyReadyCount,
    gapCount,
    categoryGroups,
    allSkillItems,
    topPriorityGaps,
    nextLearningRoadmap,
  };
}

/**
 * Legacy compatibility helper for simple gap list calls.
 */
export function calculateSkillGaps(
  studentSkills: TechnicalSkill[],
  targetRole: string
) {
  const dummyProfile: any = {
    careerPreferences: { targetRole, preferredRoles: [] },
    technicalSkills: studentSkills,
  };
  const result = calculateDetailedSkillGaps(dummyProfile, targetRole);
  return result.allSkillItems;
}

/**
 * Legacy helper for overall skill score.
 */
export function calculateOverallSkillScore(studentSkills: TechnicalSkill[]): number {
  if (!studentSkills || studentSkills.length === 0) return 0;
  const total = studentSkills.reduce(
    (acc, skill) => acc + (PROFICIENCY_NUMERIC_MAP[skill.proficiency] || 25),
    0
  );
  return Math.round(total / studentSkills.length);
}
