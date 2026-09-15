/**
 * Skill Name Normalization Engine for SkillBridge
 * Maps common technology aliases and typos to canonical skill names
 */

const SKILL_ALIAS_MAP: Record<string, string> = {
  // JavaScript & Frontend
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'es6': 'JavaScript',
  'es6+': 'JavaScript',
  'js6': 'JavaScript',
  'react': 'React',
  'reactjs': 'React',
  'react.js': 'React',
  'react js': 'React',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'html': 'HTML',
  'html5': 'HTML',
  'css': 'CSS',
  'css3': 'CSS',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'tailwind css': 'Tailwind CSS',
  'vue': 'Vue.js',
  'vuejs': 'Vue.js',
  'vue.js': 'Vue.js',
  'angular': 'Angular',
  'angularjs': 'Angular',
  'next': 'Next.js',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',

  // Backend & Databases
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'node js': 'Node.js',
  'express': 'Express.js',
  'expressjs': 'Express.js',
  'express.js': 'Express.js',
  'express js': 'Express.js',
  'py': 'Python',
  'python': 'Python',
  'python3': 'Python',
  'dj': 'Django',
  'django': 'Django',
  'fastapi': 'FastAPI',
  'fast api': 'FastAPI',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'mongo': 'MongoDB',
  'mongodb': 'MongoDB',
  'sql': 'SQL',
  'mysql': 'MySQL',
  'redis': 'Redis',

  // Languages & Tools
  'c++': 'C++',
  'cpp': 'C++',
  'c#': 'C#',
  'csharp': 'C#',
  'cs': 'C#',
  'java': 'Java',
  'git': 'Git',
  'github': 'Git',
  'docker': 'Docker',
  'k8s': 'Kubernetes',
  'kubernetes': 'Kubernetes',
  'aws': 'AWS',
  'amazon web services': 'AWS',
};

/**
 * Normalizes a raw skill string to its canonical SkillBridge name
 */
export function normalizeSkillName(rawName: string): string {
  if (!rawName || typeof rawName !== 'string') return '';
  const trimmed = rawName.trim();
  const lower = trimmed.toLowerCase();
  
  if (SKILL_ALIAS_MAP[lower]) {
    return SKILL_ALIAS_MAP[lower];
  }

  // Capitalize word boundaries nicely if unknown
  return trimmed
    .split(' ')
    .map((word) => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ');
}
