// TEMPORARY MOCK DATA — replace with PostgreSQL drill-down API when backend is fixed.

import type { CollegeStudentItem } from '../services/collegeApiService';

export interface ExtendedSkillStudentItem extends CollegeStudentItem {
  selected_skill?: string;
  skill_proficiency?: string;
  placement_eligibility?: string;
}

const MOCK_DRILLDOWN_STUDENTS: ExtendedSkillStudentItem[] = [
  // Computer Science Students
  {
    uid: 'demo_mock_cs_01',
    name: 'Aarav Sharma',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AaravSharma',
    department: 'Computer Science',
    year: '4th Year',
    year_label: '4th Year',
    semester: '4-2',
    graduation_year: '2026',
    target_role: 'Full Stack Developer',
    cgpa: '9.4 / 10.0',
    skill_score: 98,
    industry_readiness: 96,
    roadmap_progress: 95,
    assessment_score: 98,
    skills: ['Python', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'FastAPI', 'Docker', 'Tailwind CSS'],
    internship_status: 'Completed (Microsoft India)',
    placement_status: 'Placed (Microsoft India - ₹24 LPA)',
    placement_eligibility: 'Placed',
    readiness_category: 'Placement Ready',
    is_demo: true
  },
  {
    uid: 'demo_mock_cs_02',
    name: 'Priya Patel',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaPatel',
    department: 'Computer Science',
    year: '4th Year',
    year_label: '4th Year',
    semester: '4-2',
    graduation_year: '2026',
    target_role: 'Backend Engineer',
    cgpa: '9.2 / 10.0',
    skill_score: 95,
    industry_readiness: 94,
    roadmap_progress: 92,
    assessment_score: 95,
    skills: ['FastAPI', 'Python', 'PostgreSQL', 'C++', 'Docker', 'React', 'SQL', 'TypeScript'],
    internship_status: 'Completed (Flipkart)',
    placement_status: 'Placed (Flipkart - ₹19 LPA)',
    placement_eligibility: 'Placed',
    readiness_category: 'Placement Ready',
    is_demo: true
  },
  {
    uid: 'demo_mock_cs_03',
    name: 'Rohan Gupta',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RohanGupta',
    department: 'Computer Science',
    year: '4th Year',
    year_label: '4th Year',
    semester: '4-2',
    graduation_year: '2026',
    target_role: 'Software Engineer',
    cgpa: '8.9 / 10.0',
    skill_score: 92,
    industry_readiness: 91,
    roadmap_progress: 88,
    assessment_score: 92,
    skills: ['C++', 'Java', 'Python', 'SQL', 'React', 'TypeScript', 'Docker', 'Tailwind CSS'],
    internship_status: 'Completed (Amazon India)',
    placement_status: 'Placed (Amazon India - ₹22 LPA)',
    placement_eligibility: 'Placed',
    readiness_category: 'Placement Ready',
    is_demo: true
  },
  {
    uid: 'demo_mock_cs_04',
    name: 'Ananya Singh',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaSingh',
    department: 'Computer Science',
    year: '4th Year',
    year_label: '4th Year',
    semester: '4-1',
    graduation_year: '2026',
    target_role: 'Frontend Developer',
    cgpa: '8.8 / 10.0',
    skill_score: 90,
    industry_readiness: 88,
    roadmap_progress: 86,
    assessment_score: 90,
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'JavaScript', 'Python', 'FastAPI', 'Node.js', 'SQL'],
    internship_status: 'Active',
    placement_status: 'Drive Active',
    placement_eligibility: 'Eligible (4-1 Cohort)',
    readiness_category: 'Placement Ready',
    is_demo: true
  },
  {
    uid: 'demo_mock_cs_05',
    name: 'Vikram Bose',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikramBose',
    department: 'Computer Science',
    year: '3rd Year',
    year_label: '3rd Year',
    semester: '3-2',
    graduation_year: '2027',
    target_role: 'DevOps Engineer',
    cgpa: '8.6 / 10.0',
    skill_score: 87,
    industry_readiness: 85,
    roadmap_progress: 82,
    assessment_score: 87,
    skills: ['Docker', 'Python', 'PostgreSQL', 'Node.js', 'C++', 'SQL', 'FastAPI', 'TypeScript'],
    internship_status: 'Active',
    placement_status: 'Not Eligible',
    placement_eligibility: 'Not Eligible (3rd Year)',
    readiness_category: 'Placement Ready',
    is_demo: true
  },
  {
    uid: 'demo_mock_cs_06',
    name: 'Meera Kapoor',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MeeraKapoor',
    department: 'Computer Science',
    year: '3rd Year',
    year_label: '3rd Year',
    semester: '3-1',
    graduation_year: '2027',
    target_role: 'Full Stack Developer',
    cgpa: '8.4 / 10.0',
    skill_score: 84,
    industry_readiness: 82,
    roadmap_progress: 78,
    assessment_score: 84,
    skills: ['Java', 'React', 'Python', 'SQL', 'Tailwind CSS', 'FastAPI', 'TypeScript', 'PostgreSQL'],
    internship_status: 'Applied',
    placement_status: 'Not Eligible',
    placement_eligibility: 'Not Eligible (3rd Year)',
    readiness_category: 'Nearly Ready',
    is_demo: true
  },

  // AI & ML Students
  {
    uid: 'demo_mock_aiml_01',
    name: 'Arjun Deshmukh',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunDeshmukh',
    department: 'AI & ML',
    year: '4th Year',
    year_label: '4th Year',
    semester: '4-2',
    graduation_year: '2026',
    target_role: 'AI/ML Engineer',
    cgpa: '9.6 / 10.0',
    skill_score: 99,
    industry_readiness: 97,
    roadmap_progress: 96,
    assessment_score: 99,
    skills: ['Python', 'PyTorch', 'TensorFlow', 'FastAPI', 'OpenCV', 'SQL', 'Pandas', 'Scikit-Learn'],
    internship_status: 'Completed (Adobe Systems)',
    placement_status: 'Placed (Adobe Systems - ₹28.5 LPA)',
    placement_eligibility: 'Placed',
    readiness_category: 'Placement Ready',
    is_demo: true
  },
  {
    uid: 'demo_mock_aiml_02',
    name: 'Sneha Iyer',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaIyer',
    department: 'AI & ML',
    year: '4th Year',
    year_label: '4th Year',
    semester: '4-2',
    graduation_year: '2026',
    target_role: 'Computer Vision Engineer',
    cgpa: '9.3 / 10.0',
    skill_score: 96,
    industry_readiness: 95,
    roadmap_progress: 93,
    assessment_score: 96,
    skills: ['Python', 'TensorFlow', 'FastAPI', 'OpenCV', 'SQL', 'PyTorch', 'C++', 'Scikit-Learn'],
    internship_status: 'Completed (Acme AI Corp)',
    placement_status: 'Placed (Acme AI Corp - ₹18.5 LPA)',
    placement_eligibility: 'Placed',
    readiness_category: 'Placement Ready',
    is_demo: true
  },
  {
    uid: 'demo_mock_aiml_03',
    name: 'Karthik Rajan',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KarthikRajan',
    department: 'AI & ML',
    year: '4th Year',
    year_label: '4th Year',
    semester: '4-1',
    graduation_year: '2026',
    target_role: 'NLP Engineer',
    cgpa: '9.0 / 10.0',
    skill_score: 93,
    industry_readiness: 92,
    roadmap_progress: 90,
    assessment_score: 93,
    skills: ['Python', 'PyTorch', 'FastAPI', 'SQL', 'Pandas', 'TypeScript', 'React', 'Scikit-Learn'],
    internship_status: 'Active',
    placement_status: 'Drive Active',
    placement_eligibility: 'Eligible (4-1 Cohort)',
    readiness_category: 'Placement Ready',
    is_demo: true
  },
  {
    uid: 'demo_mock_aiml_04',
    name: 'Diya Banerjee',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DiyaBanerjee',
    department: 'AI & ML',
    year: '3rd Year',
    year_label: '3rd Year',
    semester: '3-2',
    graduation_year: '2027',
    target_role: 'Data Scientist',
    cgpa: '8.7 / 10.0',
    skill_score: 88,
    industry_readiness: 86,
    roadmap_progress: 84,
    assessment_score: 88,
    skills: ['Python', 'SQL', 'Pandas', 'Scikit-Learn', 'FastAPI', 'React', 'C++', 'TensorFlow'],
    internship_status: 'Active',
    placement_status: 'Not Eligible',
    placement_eligibility: 'Not Eligible (3rd Year)',
    readiness_category: 'Placement Ready',
    is_demo: true
  },

  // Data Science Students
  {
    uid: 'demo_mock_ds_01',
    name: 'Varun Saxena',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VarunSaxena',
    department: 'DS',
    year: '4th Year',
    year_label: '4th Year',
    semester: '4-2',
    graduation_year: '2026',
    target_role: 'Data Analyst',
    cgpa: '9.5 / 10.0',
    skill_score: 97,
    industry_readiness: 95,
    roadmap_progress: 94,
    assessment_score: 97,
    skills: ['SQL', 'Python', 'R', 'Pandas', 'Tableau', 'Power BI', 'NumPy', 'FastAPI'],
    internship_status: 'Completed (Razorpay)',
    placement_status: 'Placed (Razorpay - ₹21 LPA)',
    placement_eligibility: 'Placed',
    readiness_category: 'Placement Ready',
    is_demo: true
  },
  {
    uid: 'demo_mock_ds_02',
    name: 'Nisha Sundaram',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NishaSundaram',
    department: 'DS',
    year: '4th Year',
    year_label: '4th Year',
    semester: '4-2',
    graduation_year: '2026',
    target_role: 'Business Intelligence Analyst',
    cgpa: '9.1 / 10.0',
    skill_score: 94,
    industry_readiness: 93,
    roadmap_progress: 91,
    assessment_score: 94,
    skills: ['SQL', 'Power BI', 'Tableau', 'Python', 'R', 'Pandas', 'React', 'Tailwind CSS'],
    internship_status: 'Completed (PhonePe)',
    placement_status: 'Placed (PhonePe - ₹20 LPA)',
    placement_eligibility: 'Placed',
    readiness_category: 'Placement Ready',
    is_demo: true
  },
  {
    uid: 'demo_mock_ds_03',
    name: 'Sahil Bisht',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SahilBisht',
    department: 'DS',
    year: '4th Year',
    year_label: '4th Year',
    semester: '4-1',
    graduation_year: '2026',
    target_role: 'Data Engineer',
    cgpa: '8.8 / 10.0',
    skill_score: 91,
    industry_readiness: 89,
    roadmap_progress: 87,
    assessment_score: 91,
    skills: ['SQL', 'Python', 'PostgreSQL', 'Pandas', 'R', 'Docker', 'FastAPI', 'TypeScript'],
    internship_status: 'Active',
    placement_status: 'Drive Active',
    placement_eligibility: 'Eligible (4-1 Cohort)',
    readiness_category: 'Placement Ready',
    is_demo: true
  },
  {
    uid: 'demo_mock_ds_04',
    name: 'Ishani Bhagat',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IshaniBhagat',
    department: 'DS',
    year: '3rd Year',
    year_label: '3rd Year',
    semester: '3-2',
    graduation_year: '2027',
    target_role: 'Analytics Consultant',
    cgpa: '8.5 / 10.0',
    skill_score: 86,
    industry_readiness: 84,
    roadmap_progress: 81,
    assessment_score: 86,
    skills: ['SQL', 'Python', 'R', 'Tableau', 'Pandas', 'Power BI', 'Java', 'React'],
    internship_status: 'Applied',
    placement_status: 'Not Eligible',
    placement_eligibility: 'Not Eligible (3rd Year)',
    readiness_category: 'Nearly Ready',
    is_demo: true
  },

  // ECE Students
  {
    uid: 'demo_mock_ece_01',
    name: 'Hemant Verma',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HemantVerma',
    department: 'ECE',
    year: '4th Year',
    year_label: '4th Year',
    semester: '4-2',
    graduation_year: '2026',
    target_role: 'Embedded Systems Engineer',
    cgpa: '9.4 / 10.0',
    skill_score: 96,
    industry_readiness: 94,
    roadmap_progress: 93,
    assessment_score: 96,
    skills: ['Embedded C', 'C++', 'ARM Cortex', 'IoT', 'Python', 'Verilog', 'RTOS', 'MATLAB'],
    internship_status: 'Completed (Texas Instruments)',
    placement_status: 'Placed (Texas Instruments - ₹14.5 LPA)',
    placement_eligibility: 'Placed',
    readiness_category: 'Placement Ready',
    is_demo: true
  },
  {
    uid: 'demo_mock_ece_02',
    name: 'Chetan Joshi',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChetanJoshi',
    department: 'ECE',
    year: '4th Year',
    year_label: '4th Year',
    semester: '4-2',
    graduation_year: '2026',
    target_role: 'IoT Engineer',
    cgpa: '9.1 / 10.0',
    skill_score: 93,
    industry_readiness: 92,
    roadmap_progress: 90,
    assessment_score: 93,
    skills: ['IoT', 'Embedded C', 'Python', 'C++', 'RTOS', 'Verilog', 'SQL', 'FastAPI'],
    internship_status: 'Completed (Bosch India)',
    placement_status: 'Placed (Bosch India - ₹12.5 LPA)',
    placement_eligibility: 'Placed',
    readiness_category: 'Placement Ready',
    is_demo: true
  },
  {
    uid: 'demo_mock_ece_03',
    name: 'Aditya Nair',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdityaNair',
    department: 'ECE',
    year: '4th Year',
    year_label: '4th Year',
    semester: '4-1',
    graduation_year: '2026',
    target_role: 'VLSI Engineer',
    cgpa: '8.7 / 10.0',
    skill_score: 89,
    industry_readiness: 88,
    roadmap_progress: 86,
    assessment_score: 89,
    skills: ['Verilog', 'C++', 'Embedded C', 'MATLAB', 'Python', 'RTOS', 'IoT', 'SQL'],
    internship_status: 'Active',
    placement_status: 'Drive Active',
    placement_eligibility: 'Eligible (4-1 Cohort)',
    readiness_category: 'Placement Ready',
    is_demo: true
  },
  {
    uid: 'demo_mock_ece_04',
    name: 'Kavya Reddy',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KavyaReddy',
    department: 'ECE',
    year: '3rd Year',
    year_label: '3rd Year',
    semester: '3-2',
    graduation_year: '2027',
    target_role: 'Robotics Engineer',
    cgpa: '8.5 / 10.0',
    skill_score: 85,
    industry_readiness: 83,
    roadmap_progress: 80,
    assessment_score: 85,
    skills: ['Python', 'C++', 'Embedded C', 'MATLAB', 'IoT', 'RTOS', 'React', 'FastAPI'],
    internship_status: 'Applied',
    placement_status: 'Not Eligible',
    placement_eligibility: 'Not Eligible (3rd Year)',
    readiness_category: 'Nearly Ready',
    is_demo: true
  }
];

const SKILL_PROFICIENCY_MAP: Record<string, string> = {
  98: 'Expert',
  97: 'Expert',
  96: 'Expert',
  95: 'Expert',
  94: 'Expert',
  93: 'Advanced',
  92: 'Advanced',
  91: 'Advanced',
  90: 'Advanced',
  89: 'Advanced',
  88: 'Advanced',
  87: 'Advanced',
  86: 'Advanced',
  85: 'Advanced',
  84: 'Intermediate',
  82: 'Intermediate'
};

function normalizeDeptName(deptStr?: string): string {
  if (!deptStr) return 'Computer Science';
  const low = deptStr.trim().toLowerCase();
  if (low.includes('computer') || low.includes('cse') || low === 'cs') return 'Computer Science';
  if (low.includes('artificial') || low.includes('ai') || low.includes('aiml') || low.includes('machine')) return 'AI & ML';
  if (low.includes('data') || low === 'ds') return 'DS';
  if (low.includes('electronics') || low === 'ece') return 'ECE';
  return 'Computer Science';
}

/**
 * Returns mock students for a specific skill, sorted strictly DESCENDING by skill score.
 */
export function getMockStudentsBySkill(skill: string, department?: string): ExtendedSkillStudentItem[] {
  const targetSkillClean = skill.trim().toLowerCase();
  const targetDeptClean = department && department.trim() && department.trim().toLowerCase() !== 'all' 
    ? normalizeDeptName(department).toLowerCase() 
    : null;

  const matches = MOCK_DRILLDOWN_STUDENTS.filter(st => {
    // Check department filter
    if (targetDeptClean && normalizeDeptName(st.department).toLowerCase() !== targetDeptClean) {
      return false;
    }
    // Check skill match
    const hasSkill = (st.skills || []).some(sk => sk.toLowerCase().includes(targetSkillClean) || targetSkillClean.includes(sk.toLowerCase()));
    return hasSkill;
  }).map(st => {
    const score = st.skill_score || 85;
    return {
      ...st,
      selected_skill: skill,
      skill_proficiency: SKILL_PROFICIENCY_MAP[score] || 'Advanced'
    };
  });

  // Sort strictly DESCENDING by skill score (secondary by readiness)
  matches.sort((a, b) => {
    if (b.skill_score !== a.skill_score) return b.skill_score - a.skill_score;
    return b.industry_readiness - a.industry_readiness;
  });

  return matches;
}

/**
 * Returns mock students belonging ONLY to the specified department, sorted strictly DESCENDING by Industry Readiness.
 */
export function getMockStudentsByDepartment(department: string): ExtendedSkillStudentItem[] {
  const targetDeptClean = normalizeDeptName(department).toLowerCase();

  const matches = MOCK_DRILLDOWN_STUDENTS.filter(st => {
    return normalizeDeptName(st.department).toLowerCase() === targetDeptClean;
  }).map(st => ({
    ...st,
    department: normalizeDeptName(department)
  }));

  // Sort strictly DESCENDING by Industry Readiness (secondary by skill score)
  matches.sort((a, b) => {
    if (b.industry_readiness !== a.industry_readiness) return b.industry_readiness - a.industry_readiness;
    return b.skill_score - a.skill_score;
  });

  return matches;
}
