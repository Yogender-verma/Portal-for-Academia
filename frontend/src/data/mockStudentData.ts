export interface StudentSkill {
  name: string;
  category: 'frontend' | 'backend' | 'tool' | 'testing';
  level: number; // percentage
  status: 'good' | 'improving' | 'gap';
}

export interface SkillGap {
  id: string;
  skillName: string;
  priority: 'high' | 'medium' | 'low';
  currentLevel: number;
  requiredLevel: number;
  gapDelta: number;
  category: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  actionText: string;
  actionType: 'learn' | 'resources' | 'project' | 'assessment';
  targetSkill: string;
  priority: 'high' | 'medium';
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'locked';
  stepNumber: number;
}

export interface Opportunity {
  id: string;
  roleTitle: string;
  companyName: string;
  matchScore: number;
  location: string;
  type: 'internship' | 'job';
  durationOrSalary: string;
  matchingSkills: string[];
  missingSkills: string[];
  postedDate: string;
}

export interface ApplicationItem {
  id: string;
  companyName: string;
  roleTitle: string;
  appliedDate: string;
  status: 'Applied' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
  type: 'internship' | 'job';
}

export interface UpcomingEvent {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  type: 'interview' | 'assessment' | 'deadline';
}

export interface ProgressDelta {
  skillName: string;
  previousLevel: number;
  currentLevel: number;
  delta: number;
}

export interface StudentData {
  name: string;
  email: string;
  avatarUrl: string;
  college: string;
  branch: string;
  year: string;
  targetRole: string;
  currentSkillScore: number;
  skillScoreDelta: number;
  industryMatchScore: number;
  skillsToImproveCount: number;
  skillsToImproveList: string[];
  roadmapProgress: number;
  activeApplicationsCount: number;
  internshipsCount: number;
  jobsCount: number;
  profileCompletion: number;
  missingProfileItems: string[];
  skills: StudentSkill[];
  skillGaps: SkillGap[];
  recommendations: Recommendation[];
  roadmapSteps: RoadmapStep[];
  matchedInternships: Opportunity[];
  matchedJobs: Opportunity[];
  upcomingEvents: UpcomingEvent[];
  recentProgress: ProgressDelta[];
  applications: ApplicationItem[];
}

export const mockStudentData: StudentData = {
  name: 'Mahesh Kumar',
  email: 'mahesh.k@abc.edu.in',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  college: 'ABC Institute of Technology',
  branch: 'Computer Science & Engineering',
  year: '3rd Year',
  targetRole: 'Frontend Developer',
  currentSkillScore: 78,
  skillScoreDelta: 8,
  industryMatchScore: 82,
  skillsToImproveCount: 4,
  skillsToImproveList: ['Testing', 'TypeScript', 'Git Workflows', 'Docker'],
  roadmapProgress: 65,
  activeApplicationsCount: 8,
  internshipsCount: 3,
  jobsCount: 5,
  profileCompletion: 85,
  missingProfileItems: [
    'Add GitHub profile link',
    'Add 1 featured frontend project',
    'Upload latest PDF resume'
  ],

  skills: [
    { name: 'JavaScript', category: 'frontend', level: 90, status: 'good' },
    { name: 'HTML/CSS', category: 'frontend', level: 95, status: 'good' },
    { name: 'React', category: 'frontend', level: 82, status: 'good' },
    { name: 'Python', category: 'backend', level: 70, status: 'good' },
    { name: 'Git', category: 'tool', level: 60, status: 'improving' },
    { name: 'TypeScript', category: 'frontend', level: 50, status: 'gap' },
    { name: 'Testing', category: 'testing', level: 30, status: 'gap' },
  ],

  skillGaps: [
    {
      id: 'gap-1',
      skillName: 'Testing',
      priority: 'high',
      currentLevel: 30,
      requiredLevel: 70,
      gapDelta: -40,
      category: 'Unit Testing & Jest / React Testing Library'
    },
    {
      id: 'gap-2',
      skillName: 'TypeScript',
      priority: 'medium',
      currentLevel: 50,
      requiredLevel: 75,
      gapDelta: -25,
      category: 'Generics, Interfaces & Strict Typing'
    },
    {
      id: 'gap-3',
      skillName: 'Git Workflows',
      priority: 'medium',
      currentLevel: 60,
      requiredLevel: 75,
      gapDelta: -15,
      category: 'Interactive Rebase, PR Reviews & Merge Conflict Resolution'
    }
  ],

  recommendations: [
    {
      id: 'rec-1',
      title: 'Learn TypeScript Fundamentals',
      description: 'Your current level is 50%. Required level for Frontend Developer is 75%.',
      actionText: 'Start Learning',
      actionType: 'learn',
      targetSkill: 'TypeScript',
      priority: 'high'
    },
    {
      id: 'rec-2',
      title: 'Improve Testing Skills',
      description: 'Testing is your biggest skill gap (30% vs 70% required). Learn Vitest & RTL.',
      actionText: 'View Resources',
      actionType: 'resources',
      targetSkill: 'Testing',
      priority: 'high'
    },
    {
      id: 'rec-3',
      title: 'Complete a Full-Stack React Project',
      description: 'Build a production-grade application to demonstrate practical state management.',
      actionText: 'View Project Ideas',
      actionType: 'project',
      targetSkill: 'React',
      priority: 'medium'
    },
    {
      id: 'rec-4',
      title: 'Take Frontend Skill Assessment',
      description: 'Validate your current JavaScript & React skills to unlock verified badges.',
      actionText: 'Take Assessment',
      actionType: 'assessment',
      targetSkill: 'JavaScript',
      priority: 'medium'
    }
  ],

  roadmapSteps: [
    {
      id: 'step-1',
      title: 'JavaScript Mastery',
      description: 'ES6+, Async/Await, Closures, DOM Manipulation',
      status: 'completed',
      stepNumber: 1
    },
    {
      id: 'step-2',
      title: 'React Core & Hooks',
      description: 'Component architecture, Context API, Redux Toolkit',
      status: 'completed',
      stepNumber: 2
    },
    {
      id: 'step-3',
      title: 'TypeScript Integration',
      description: 'Typing props, generics, API contracts',
      status: 'in_progress',
      stepNumber: 3
    },
    {
      id: 'step-4',
      title: 'Unit & E2E Testing',
      description: 'Vitest, React Testing Library & Cypress',
      status: 'locked',
      stepNumber: 4
    },
    {
      id: 'step-5',
      title: 'Build Production Capstone Project',
      description: 'Deploy real-world SaaS frontend application',
      status: 'locked',
      stepNumber: 5
    },
    {
      id: 'step-6',
      title: 'Frontend Verification Assessment',
      description: 'Official SkillBridge skill badge test',
      status: 'locked',
      stepNumber: 6
    },
    {
      id: 'step-7',
      title: 'Apply for Top Matched Opportunities',
      description: 'Submit verified profile to target employers',
      status: 'locked',
      stepNumber: 7
    }
  ],

  matchedInternships: [
    {
      id: 'intern-1',
      roleTitle: 'Frontend Developer Intern',
      companyName: 'Company XYZ',
      matchScore: 92,
      location: 'Hyderabad (Hybrid)',
      type: 'internship',
      durationOrSalary: '6 Months • ₹20,000 / month',
      matchingSkills: ['JavaScript', 'React', 'HTML/CSS'],
      missingSkills: ['TypeScript', 'Testing'],
      postedDate: '2 days ago'
    },
    {
      id: 'intern-2',
      roleTitle: 'UI / React Engineer Intern',
      companyName: 'TechCorp Labs',
      matchScore: 88,
      location: 'Remote',
      type: 'internship',
      durationOrSalary: '3 Months • ₹25,000 / month',
      matchingSkills: ['React', 'JavaScript', 'Git'],
      missingSkills: ['Testing'],
      postedDate: '1 day ago'
    },
    {
      id: 'intern-3',
      roleTitle: 'Web Development Intern',
      companyName: 'CloudScale Systems',
      matchScore: 84,
      location: 'Bengaluru (On-site)',
      type: 'internship',
      durationOrSalary: '6 Months • ₹18,000 / month',
      matchingSkills: ['HTML/CSS', 'JavaScript'],
      missingSkills: ['TypeScript'],
      postedDate: '3 days ago'
    }
  ],

  matchedJobs: [
    {
      id: 'job-1',
      roleTitle: 'Junior Frontend Developer',
      companyName: 'Company ABC',
      matchScore: 87,
      location: 'Remote',
      type: 'job',
      durationOrSalary: 'Full-time • ₹6.5 LPA',
      matchingSkills: ['JavaScript', 'React', 'HTML/CSS'],
      missingSkills: ['TypeScript'],
      postedDate: '1 day ago'
    },
    {
      id: 'job-2',
      roleTitle: 'React Software Engineer',
      companyName: 'Innovate AI',
      matchScore: 85,
      location: 'Pune (Hybrid)',
      type: 'job',
      durationOrSalary: 'Full-time • ₹7.0 LPA',
      matchingSkills: ['React', 'JavaScript', 'HTML/CSS'],
      missingSkills: ['Testing'],
      postedDate: '4 days ago'
    },
    {
      id: 'job-3',
      roleTitle: 'Frontend Web Engineer',
      companyName: 'DevDynamics',
      matchScore: 82,
      location: 'Hyderabad',
      type: 'job',
      durationOrSalary: 'Full-time • ₹6.0 LPA',
      matchingSkills: ['JavaScript', 'HTML/CSS', 'Git'],
      missingSkills: ['TypeScript'],
      postedDate: '5 days ago'
    }
  ],

  upcomingEvents: [
    {
      id: 'event-1',
      title: 'Interview — Frontend Developer Intern',
      subtitle: 'Company XYZ (Technical Round 1)',
      date: '15 Sep 2026 • 2:00 PM',
      type: 'interview'
    },
    {
      id: 'event-2',
      title: 'Skill Assessment — JavaScript',
      subtitle: 'SkillBridge Proctored Test',
      date: '17 Sep 2026 • 4:00 PM',
      type: 'assessment'
    },
    {
      id: 'event-3',
      title: 'Application Deadline — Company XYZ',
      subtitle: 'Frontend Internship Batch 2026',
      date: '20 Sep 2026 • 11:59 PM',
      type: 'deadline'
    }
  ],

  recentProgress: [
    { skillName: 'React', previousLevel: 65, currentLevel: 82, delta: 17 },
    { skillName: 'JavaScript', previousLevel: 75, currentLevel: 90, delta: 15 },
    { skillName: 'Testing', previousLevel: 20, currentLevel: 30, delta: 10 }
  ],

  applications: [
    {
      id: 'app-1',
      companyName: 'Company XYZ',
      roleTitle: 'Frontend Intern',
      appliedDate: '05 Sep 2026',
      status: 'Shortlisted',
      type: 'internship'
    },
    {
      id: 'app-2',
      companyName: 'Company ABC',
      roleTitle: 'Web Developer',
      appliedDate: '03 Sep 2026',
      status: 'Applied',
      type: 'job'
    },
    {
      id: 'app-3',
      companyName: 'TechCorp Labs',
      roleTitle: 'React Intern',
      appliedDate: '01 Sep 2026',
      status: 'Interview',
      type: 'internship'
    },
    {
      id: 'app-4',
      companyName: 'CloudScale Systems',
      roleTitle: 'Web Dev Intern',
      appliedDate: '28 Aug 2026',
      status: 'Applied',
      type: 'internship'
    },
    {
      id: 'app-5',
      companyName: 'Innovate AI',
      roleTitle: 'React Engineer',
      appliedDate: '25 Aug 2026',
      status: 'Applied',
      type: 'job'
    }
  ]
};
