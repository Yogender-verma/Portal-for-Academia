// SkillBridge Industry Benchmark Dataset (SIH 26044)
// Centralized Industry Requirements for Job Roles

export interface IndustrySkillRequirement {
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'Tools' | 'Testing' | 'DevOps' | 'Industry Practices' | 'Programming' | 'AI/ML' | 'Security' | 'Mobile';
  requiredLevel: number; // 0 - 100%
  importance: 'Critical' | 'High' | 'Supporting';
  weight: number; // Critical: 1.5, High: 1.2, Supporting: 0.8
  description?: string;
}

export interface IndustryRoleBenchmark {
  role: string;
  domain: string;
  description: string;
  skills: IndustrySkillRequirement[];
}

export const INDUSTRY_SKILL_BENCHMARKS: Record<string, IndustryRoleBenchmark> = {
  'Full Stack Developer': {
    role: 'Full Stack Developer',
    domain: 'Software Engineering',
    description: 'Build end-to-end web applications covering frontend UI, backend APIs, databases, and DevOps.',
    skills: [
      // Frontend
      { name: 'HTML', category: 'Frontend', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'CSS', category: 'Frontend', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'JavaScript', category: 'Frontend', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'TypeScript', category: 'Frontend', requiredLevel: 75, importance: 'High', weight: 1.2 },
      { name: 'React', category: 'Frontend', requiredLevel: 80, importance: 'Critical', weight: 1.5 },
      { name: 'State Management', category: 'Frontend', requiredLevel: 75, importance: 'Supporting', weight: 0.8 },
      
      // Backend
      { name: 'Node.js', category: 'Backend', requiredLevel: 80, importance: 'Critical', weight: 1.5 },
      { name: 'Express.js', category: 'Backend', requiredLevel: 75, importance: 'High', weight: 1.2 },
      { name: 'REST APIs', category: 'Backend', requiredLevel: 80, importance: 'Critical', weight: 1.5 },
      { name: 'Authentication', category: 'Backend', requiredLevel: 75, importance: 'High', weight: 1.2 },

      // Database
      { name: 'SQL', category: 'Database', requiredLevel: 75, importance: 'Critical', weight: 1.5 },
      { name: 'MongoDB', category: 'Database', requiredLevel: 70, importance: 'High', weight: 1.2 },

      // Tools & Testing
      { name: 'Git', category: 'Tools', requiredLevel: 75, importance: 'High', weight: 1.2 },
      { name: 'Unit Testing', category: 'Testing', requiredLevel: 65, importance: 'Supporting', weight: 0.8 },

      // DevOps & Industry Practices
      { name: 'Docker', category: 'DevOps', requiredLevel: 60, importance: 'Supporting', weight: 0.8 },
      { name: 'Security Fundamentals', category: 'Industry Practices', requiredLevel: 70, importance: 'Supporting', weight: 0.8 },
    ],
  },
  'Frontend Developer': {
    role: 'Frontend Developer',
    domain: 'Web Development',
    description: 'Design and create highly interactive, responsive user interfaces and client-side applications.',
    skills: [
      { name: 'HTML', category: 'Frontend', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'CSS', category: 'Frontend', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'JavaScript', category: 'Frontend', requiredLevel: 90, importance: 'Critical', weight: 1.5 },
      { name: 'TypeScript', category: 'Frontend', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'React', category: 'Frontend', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'State Management', category: 'Frontend', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'Responsive Design', category: 'Frontend', requiredLevel: 85, importance: 'High', weight: 1.2 },
      { name: 'Git', category: 'Tools', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'Unit Testing', category: 'Testing', requiredLevel: 70, importance: 'Supporting', weight: 0.8 },
      { name: 'Performance Optimization', category: 'Industry Practices', requiredLevel: 75, importance: 'Supporting', weight: 0.8 },
    ],
  },
  'Backend Developer': {
    role: 'Backend Developer',
    domain: 'Software Engineering',
    description: 'Architect scalable server-side systems, databases, microservices, and secure APIs.',
    skills: [
      { name: 'Node.js', category: 'Backend', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'Express.js', category: 'Backend', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'Python', category: 'Backend', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'REST APIs', category: 'Backend', requiredLevel: 90, importance: 'Critical', weight: 1.5 },
      { name: 'SQL', category: 'Database', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'MongoDB', category: 'Database', requiredLevel: 75, importance: 'High', weight: 1.2 },
      { name: 'Authentication', category: 'Backend', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'Docker', category: 'DevOps', requiredLevel: 70, importance: 'Supporting', weight: 0.8 },
      { name: 'Git', category: 'Tools', requiredLevel: 80, importance: 'High', weight: 1.2 },
    ],
  },
  'React Developer': {
    role: 'React Developer',
    domain: 'Web Development',
    description: 'Specialize in building modern single page apps with React ecosystem and state management.',
    skills: [
      { name: 'JavaScript', category: 'Frontend', requiredLevel: 90, importance: 'Critical', weight: 1.5 },
      { name: 'React', category: 'Frontend', requiredLevel: 90, importance: 'Critical', weight: 1.5 },
      { name: 'TypeScript', category: 'Frontend', requiredLevel: 85, importance: 'High', weight: 1.2 },
      { name: 'HTML', category: 'Frontend', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'CSS', category: 'Frontend', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'State Management', category: 'Frontend', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'Git', category: 'Tools', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'Unit Testing', category: 'Testing', requiredLevel: 70, importance: 'Supporting', weight: 0.8 },
    ],
  },
  'Data Scientist': {
    role: 'Data Scientist',
    domain: 'Data & Analytics',
    description: 'Extract insights from data, build predictive machine learning models, and analyze datasets.',
    skills: [
      { name: 'Python', category: 'Programming', requiredLevel: 90, importance: 'Critical', weight: 1.5 },
      { name: 'SQL', category: 'Database', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'Machine Learning', category: 'AI/ML', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'Statistics', category: 'Industry Practices', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'Data Visualization', category: 'Tools', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'Git', category: 'Tools', requiredLevel: 70, importance: 'Supporting', weight: 0.8 },
    ],
  },
  'AI / ML Engineer': {
    role: 'AI / ML Engineer',
    domain: 'Artificial Intelligence',
    description: 'Develop deep learning algorithms, natural language processing models, and AI solutions.',
    skills: [
      { name: 'Python', category: 'Programming', requiredLevel: 90, importance: 'Critical', weight: 1.5 },
      { name: 'Machine Learning', category: 'AI/ML', requiredLevel: 90, importance: 'Critical', weight: 1.5 },
      { name: 'Deep Learning', category: 'AI/ML', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'REST APIs', category: 'Backend', requiredLevel: 75, importance: 'High', weight: 1.2 },
      { name: 'SQL', category: 'Database', requiredLevel: 75, importance: 'High', weight: 1.2 },
      { name: 'Docker', category: 'DevOps', requiredLevel: 70, importance: 'Supporting', weight: 0.8 },
    ],
  },
  'DevOps Engineer': {
    role: 'DevOps Engineer',
    domain: 'Infrastructure & Cloud',
    description: 'Automate deployment pipelines, manage cloud infrastructure, containers, and server reliability.',
    skills: [
      { name: 'Linux', category: 'DevOps', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'Docker', category: 'DevOps', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'Kubernetes', category: 'DevOps', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'CI/CD', category: 'DevOps', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'Git', category: 'Tools', requiredLevel: 85, importance: 'High', weight: 1.2 },
      { name: 'Python', category: 'Programming', requiredLevel: 70, importance: 'Supporting', weight: 0.8 },
    ],
  },
  'Mobile App Developer': {
    role: 'Mobile App Developer',
    domain: 'Mobile Engineering',
    description: 'Build native or cross-platform mobile apps for iOS and Android devices.',
    skills: [
      { name: 'React Native', category: 'Mobile', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'JavaScript', category: 'Frontend', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'TypeScript', category: 'Frontend', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'REST APIs', category: 'Backend', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'Git', category: 'Tools', requiredLevel: 80, importance: 'High', weight: 1.2 },
    ],
  },
  'UI / UX Designer': {
    role: 'UI / UX Designer',
    domain: 'Design',
    description: 'Create user journeys, wireframes, visual design systems, and prototype user experiences.',
    skills: [
      { name: 'Figma', category: 'Tools', requiredLevel: 90, importance: 'Critical', weight: 1.5 },
      { name: 'User Research', category: 'Industry Practices', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'Prototyping', category: 'Tools', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'HTML & CSS Basics', category: 'Frontend', requiredLevel: 65, importance: 'Supporting', weight: 0.8 },
    ],
  },
  'Cyber Security Specialist': {
    role: 'Cyber Security Specialist',
    domain: 'Information Security',
    description: 'Protect network systems, perform vulnerability assessments, and secure web applications.',
    skills: [
      { name: 'Network Security', category: 'Security', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'Security Fundamentals', category: 'Security', requiredLevel: 90, importance: 'Critical', weight: 1.5 },
      { name: 'Linux', category: 'DevOps', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'Python', category: 'Programming', requiredLevel: 75, importance: 'High', weight: 1.2 },
    ],
  },
  'Cloud Engineer': {
    role: 'Cloud Engineer',
    domain: 'Cloud Computing',
    description: 'Design and operate cloud architectures on AWS, Azure, or Google Cloud.',
    skills: [
      { name: 'AWS / Cloud', category: 'DevOps', requiredLevel: 85, importance: 'Critical', weight: 1.5 },
      { name: 'Docker', category: 'DevOps', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'Linux', category: 'DevOps', requiredLevel: 80, importance: 'High', weight: 1.2 },
      { name: 'SQL', category: 'Database', requiredLevel: 75, importance: 'High', weight: 1.2 },
      { name: 'Git', category: 'Tools', requiredLevel: 80, importance: 'High', weight: 1.2 },
    ],
  },
};
