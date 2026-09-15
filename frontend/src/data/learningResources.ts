// SkillBridge Learning Resources & Direct External Links Registry (SIH 26044)

export interface LearningResource {
  title: string;
  type: 'docs' | 'course' | 'practice' | 'certification' | 'video';
  platform: string;
  url: string;
  isFree: boolean;
  description: string;
}

export interface SkillLearningPlan {
  skillName: string;
  category: string;
  estimatedHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  youtubeUrl: string;
  youtubeTitle: string;
  resources: LearningResource[];
}

export const SKILL_LEARNING_RESOURCES: Record<string, SkillLearningPlan> = {
  JavaScript: {
    skillName: 'JavaScript',
    category: 'Frontend & Programming',
    estimatedHours: 40,
    difficulty: 'Intermediate',
    summary: 'Master core ES6+, async/await, closures, DOM manipulation, promises, and event loop.',
    youtubeUrl: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
    youtubeTitle: 'JavaScript Full Course for Beginners (freeCodeCamp)',
    resources: [
      {
        title: 'YouTube - JavaScript Full Course for Beginners',
        type: 'video',
        platform: 'YouTube / freeCodeCamp',
        url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
        isFree: true,
        description: 'Complete 3.5 hour video tutorial covering JS variables, functions, objects, DOM & ES6.',
      },
      {
        title: 'MDN Web Docs - JavaScript Complete Reference',
        type: 'docs',
        platform: 'Mozilla Developer Network',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        isFree: true,
        description: 'The authoritative reference documentation for JavaScript language standards.',
      },
      {
        title: 'JavaScript.info - The Modern JavaScript Tutorial',
        type: 'course',
        platform: 'JavaScript.info',
        url: 'https://javascript.info/',
        isFree: true,
        description: 'Comprehensive, deep-dive lessons from basic fundamentals to advanced async patterns.',
      },
      {
        title: 'freeCodeCamp JavaScript Algorithms & Data Structures',
        type: 'certification',
        platform: 'freeCodeCamp',
        url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
        isFree: true,
        description: '300-hour interactive coding curriculum with verified completion certification.',
      },
      {
        title: 'LeetCode JavaScript Problem Set & 30 Days of JS',
        type: 'practice',
        platform: 'LeetCode',
        url: 'https://leetcode.com/problemset/all/?search=javascript',
        isFree: true,
        description: 'Hands-on problem solving covering functional JS, closures, and async handlers.',
      },
    ],
  },
  React: {
    skillName: 'React',
    category: 'Frontend Framework',
    estimatedHours: 35,
    difficulty: 'Intermediate',
    summary: 'Learn components, JSX, custom hooks, Virtual DOM, state management, and useEffect lifecycle.',
    youtubeUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    youtubeTitle: 'React Course 2024 for Beginners (freeCodeCamp)',
    resources: [
      {
        title: 'YouTube - React Course 2024 for Beginners',
        type: 'video',
        platform: 'YouTube / freeCodeCamp',
        url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
        isFree: true,
        description: 'Full 12-hour comprehensive React tutorial with hands-on projects & hooks.',
      },
      {
        title: 'React.dev Official Interactive Documentation',
        type: 'docs',
        platform: 'Meta / React Core Team',
        url: 'https://react.dev/learn',
        isFree: true,
        description: 'Modern official guide with interactive code sandboxes and diagram explanations.',
      },
      {
        title: 'Scrimba - Learn React for Free Interactive Course',
        type: 'course',
        platform: 'Scrimba',
        url: 'https://scrimba.com/learn/learnreact',
        isFree: true,
        description: 'Interactive video tutorials where you can pause and edit code inside the player.',
      },
      {
        title: 'Meta Front-End Developer Professional Certificate (React)',
        type: 'certification',
        platform: 'Coursera / Meta',
        url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
        isFree: false,
        description: 'Industry-recognized professional credential from Meta frontend engineers.',
      },
    ],
  },
  TypeScript: {
    skillName: 'TypeScript',
    category: 'Programming & Tooling',
    estimatedHours: 25,
    difficulty: 'Intermediate',
    summary: 'Master static typing, interfaces, generics, utility types, union types, and compiler configs.',
    youtubeUrl: 'https://www.youtube.com/watch?v=d56mG7DezGs',
    youtubeTitle: 'TypeScript Course for Beginners (freeCodeCamp)',
    resources: [
      {
        title: 'YouTube - TypeScript Full Tutorial for Beginners',
        type: 'video',
        platform: 'YouTube / freeCodeCamp',
        url: 'https://www.youtube.com/watch?v=d56mG7DezGs',
        isFree: true,
        description: 'Learn TypeScript fundamentals, static types, interfaces & compiler in 5 hours.',
      },
      {
        title: 'TypeScript Official Documentation & Handbook',
        type: 'docs',
        platform: 'Microsoft',
        url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
        isFree: true,
        description: 'Official handbook covering type inference, interfaces, and compiler options.',
      },
      {
        title: 'Total TypeScript Beginner & Advanced Tutorials',
        type: 'course',
        platform: 'Total TypeScript (Matt Pocock)',
        url: 'https://www.totaltypescript.com/tutorials',
        isFree: true,
        description: 'Industry-leading interactive TypeScript problem sets and video walkthroughs.',
      },
    ],
  },
  'Node.js': {
    skillName: 'Node.js',
    category: 'Backend Runtime',
    estimatedHours: 35,
    difficulty: 'Intermediate',
    summary: 'Understand asynchronous event loop, file system, streams, npm modules, and server creation.',
    youtubeUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
    youtubeTitle: 'Node.js and Express.js Full Course (freeCodeCamp)',
    resources: [
      {
        title: 'YouTube - Node.js and Express.js Full Course',
        type: 'video',
        platform: 'YouTube / freeCodeCamp',
        url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
        isFree: true,
        description: 'Comprehensive 10-hour full stack backend video tutorial with projects.',
      },
      {
        title: 'Node.js Official Documentation & API Reference',
        type: 'docs',
        platform: 'Node.js Foundation',
        url: 'https://nodejs.org/en/docs/',
        isFree: true,
        description: 'Official API documentation for HTTP, FS, Path, Events, and Buffer modules.',
      },
      {
        title: 'Exercism Node.js & JavaScript Practice Track',
        type: 'practice',
        platform: 'Exercism.org',
        url: 'https://exercism.org/tracks/javascript',
        isFree: true,
        description: 'Free automated test-driven exercises with community mentor feedback.',
      },
    ],
  },
  'Express.js': {
    skillName: 'Express.js',
    category: 'Backend Framework',
    estimatedHours: 20,
    difficulty: 'Intermediate',
    summary: 'Build REST APIs, middleware pipelines, error handling handlers, and CORS integration.',
    youtubeUrl: 'https://www.youtube.com/watch?v=7H_XBNFZUwc',
    youtubeTitle: 'Express JS Crash Course (Traversy Media)',
    resources: [
      {
        title: 'YouTube - Express JS Crash Course',
        type: 'video',
        platform: 'YouTube / Traversy Media',
        url: 'https://www.youtube.com/watch?v=7H_XBNFZUwc',
        isFree: true,
        description: 'Learn Express routing, middleware, JSON API endpoints, and server setup in 1.5 hours.',
      },
      {
        title: 'Express.js Official Guide & Starter Docs',
        type: 'docs',
        platform: 'ExpressJS',
        url: 'https://expressjs.com/en/starter/installing.html',
        isFree: true,
        description: 'Official guide for routing, middleware, request/response processing, and security.',
      },
      {
        title: 'MDN Express Web Framework Tutorial',
        type: 'course',
        platform: 'MDN Web Docs',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs',
        isFree: true,
        description: 'Step-by-step tutorial building a complete library database backend API.',
      },
    ],
  },
  'REST APIs': {
    skillName: 'REST APIs',
    category: 'Backend Architecture',
    estimatedHours: 15,
    difficulty: 'Beginner',
    summary: 'Learn HTTP verbs (GET, POST, PUT, DELETE), status codes, JSON payloads, headers, and authentication.',
    youtubeUrl: 'https://www.youtube.com/watch?v=-MTSQjw51V4',
    youtubeTitle: 'REST APIs & RESTful Web Services Full Course',
    resources: [
      {
        title: 'YouTube - REST APIs & RESTful Web Services Tutorial',
        type: 'video',
        platform: 'YouTube / freeCodeCamp',
        url: 'https://www.youtube.com/watch?v=-MTSQjw51V4',
        isFree: true,
        description: 'Understand HTTP methods, status codes, JSON API design, and authentication.',
      },
      {
        title: 'RESTful API Designing & Best Practices Guide',
        type: 'docs',
        platform: 'RESTfulAPI.net',
        url: 'https://restfulapi.net/',
        isFree: true,
        description: 'Complete architectural constraints, design standards, and URI formatting rules.',
      },
      {
        title: 'Postman Student API Network & Interactive Labs',
        type: 'practice',
        platform: 'Postman',
        url: 'https://www.postman.com/explore',
        isFree: true,
        description: 'Test, build, and document REST endpoints using Postman workspace.',
      },
    ],
  },
  SQL: {
    skillName: 'SQL',
    category: 'Database Management',
    estimatedHours: 30,
    difficulty: 'Intermediate',
    summary: 'Master relational database design, normalization, SELECT queries, JOINs, indexing, and transactions.',
    youtubeUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    youtubeTitle: 'SQL Tutorial - Full Database Course for Beginners (freeCodeCamp)',
    resources: [
      {
        title: 'YouTube - SQL Tutorial - Full Database Course for Beginners',
        type: 'video',
        platform: 'YouTube / freeCodeCamp',
        url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
        isFree: true,
        description: '4-hour database design course covering SELECT, JOINs, Group By, and schema design.',
      },
      {
        title: 'PostgreSQL Official Documentation',
        type: 'docs',
        platform: 'PostgreSQL Global Development Group',
        url: 'https://www.postgresql.org/docs/',
        isFree: true,
        description: 'Official manual for relational tables, queries, indexes, and triggers.',
      },
      {
        title: 'SQLZoo Interactive SQL Tutorial & Exercises',
        type: 'practice',
        platform: 'SQLZoo',
        url: 'https://sqlzoo.net/',
        isFree: true,
        description: 'Browser-based SQL queries executor with immediate result verification.',
      },
    ],
  },
  MongoDB: {
    skillName: 'MongoDB',
    category: 'NoSQL Database',
    estimatedHours: 25,
    difficulty: 'Intermediate',
    summary: 'Learn document databases, Mongoose ORM/ODM, aggregation pipelines, and schema modeling.',
    youtubeUrl: 'https://www.youtube.com/watch?v=c2M-rlkkT5o',
    youtubeTitle: 'MongoDB Complete Course for Beginners (freeCodeCamp)',
    resources: [
      {
        title: 'YouTube - MongoDB Complete Course for Beginners',
        type: 'video',
        platform: 'YouTube / freeCodeCamp',
        url: 'https://www.youtube.com/watch?v=c2M-rlkkT5o',
        isFree: true,
        description: 'Learn NoSQL document databases, Mongoose ORM, and Atlas cloud database setup.',
      },
      {
        title: 'MongoDB University - Free Official Courses',
        type: 'course',
        platform: 'MongoDB.com',
        url: 'https://learn.mongodb.com/',
        isFree: true,
        description: 'Official courses covering CRUD operations, indexing, and aggregation framework.',
      },
    ],
  },
  HTML: {
    skillName: 'HTML',
    category: 'Frontend Basics',
    estimatedHours: 15,
    difficulty: 'Beginner',
    summary: 'Master semantic tags, accessibility (ARIA), form validation, SEO structure, and media elements.',
    youtubeUrl: 'https://www.youtube.com/watch?v=kUMe1FH4CHE',
    youtubeTitle: 'HTML Full Course for Beginners (freeCodeCamp)',
    resources: [
      {
        title: 'YouTube - HTML Full Course for Beginners',
        type: 'video',
        platform: 'YouTube / freeCodeCamp',
        url: 'https://www.youtube.com/watch?v=kUMe1FH4CHE',
        isFree: true,
        description: 'Learn HTML5 markup, semantic tags, forms, tables, and accessibility standards.',
      },
      {
        title: 'MDN HTML Developer Guide',
        type: 'docs',
        platform: 'MDN Web Docs',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
        isFree: true,
        description: 'Semantic markup, attributes, forms, and accessibility best practices.',
      },
    ],
  },
  CSS: {
    skillName: 'CSS',
    category: 'Frontend Styling',
    estimatedHours: 25,
    difficulty: 'Intermediate',
    summary: 'Master Flexbox, CSS Grid, animations, responsive media queries, TailwindCSS, and variables.',
    youtubeUrl: 'https://www.youtube.com/watch?v=OXGznpKZ_sA',
    youtubeTitle: 'CSS Full Course for Beginners (freeCodeCamp)',
    resources: [
      {
        title: 'YouTube - CSS Full Course (Flexbox & Grid)',
        type: 'video',
        platform: 'YouTube / freeCodeCamp',
        url: 'https://www.youtube.com/watch?v=OXGznpKZ_sA',
        isFree: true,
        description: 'Complete 6-hour CSS tutorial covering layouts, Flexbox, CSS Grid, and responsiveness.',
      },
      {
        title: 'CSS Tricks Complete Guide to Flexbox & Grid',
        type: 'docs',
        platform: 'CSS-Tricks',
        url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
        isFree: true,
        description: 'Visual reference guide for CSS layout specifications.',
      },
    ],
  },
  Git: {
    skillName: 'Git',
    category: 'Version Control',
    estimatedHours: 15,
    difficulty: 'Beginner',
    summary: 'Learn commits, branching, merging, rebasing, pull requests, resolving conflicts, and GitHub workflows.',
    youtubeUrl: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
    youtubeTitle: 'Git and GitHub for Beginners - Full Course (freeCodeCamp)',
    resources: [
      {
        title: 'YouTube - Git and GitHub for Beginners',
        type: 'video',
        platform: 'YouTube / freeCodeCamp',
        url: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
        isFree: true,
        description: 'Learn version control, commits, branching, pull requests, and GitHub workflow.',
      },
      {
        title: 'Pro Git Official Book (Free Online Edition)',
        type: 'docs',
        platform: 'Git-SCM',
        url: 'https://git-scm.com/book/en/v2',
        isFree: true,
        description: 'The definitive guide to Git architecture and command line tools.',
      },
    ],
  },
  Docker: {
    skillName: 'Docker',
    category: 'DevOps & Containerization',
    estimatedHours: 25,
    difficulty: 'Intermediate',
    summary: 'Understand containers, Dockerfiles, images, Docker Compose multi-container setups, and networking.',
    youtubeUrl: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
    youtubeTitle: 'Docker Tutorial for Beginners (TechWorld with Nana)',
    resources: [
      {
        title: 'YouTube - Docker Tutorial for Beginners',
        type: 'video',
        platform: 'YouTube / TechWorld with Nana',
        url: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
        isFree: true,
        description: 'Top-rated 3-hour Docker tutorial covering containers, images, and Docker Compose.',
      },
      {
        title: 'Docker Official Get Started Guide',
        type: 'docs',
        platform: 'Docker Docs',
        url: 'https://docs.docker.com/get-started/',
        isFree: true,
        description: 'Official tutorial to containerize Node, React, and Python applications.',
      },
    ],
  },
  Python: {
    skillName: 'Python',
    category: 'Programming & Data',
    estimatedHours: 35,
    difficulty: 'Beginner',
    summary: 'Master data structures, OOP, file handling, libraries, virtual environments, and automation.',
    youtubeUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    youtubeTitle: 'Python for Beginners - Full Course (freeCodeCamp)',
    resources: [
      {
        title: 'YouTube - Python for Beginners - Full Course',
        type: 'video',
        platform: 'YouTube / freeCodeCamp',
        url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
        isFree: true,
        description: 'Learn Python programming syntax, functions, modules, and OOP concepts in 4.5 hours.',
      },
      {
        title: 'Python 3 Official Documentation',
        type: 'docs',
        platform: 'Python Software Foundation',
        url: 'https://docs.python.org/3/',
        isFree: true,
        description: 'Official tutorial and standard library documentation.',
      },
    ],
  },
  'Machine Learning': {
    skillName: 'Machine Learning',
    category: 'AI & Data Science',
    estimatedHours: 50,
    difficulty: 'Advanced',
    summary: 'Learn supervised & unsupervised learning, regression, classification, Scikit-Learn, and neural nets.',
    youtubeUrl: 'https://www.youtube.com/watch?v=i_LwzRVP7bg',
    youtubeTitle: 'Machine Learning Course for Beginners (freeCodeCamp)',
    resources: [
      {
        title: 'YouTube - Machine Learning Course for Beginners',
        type: 'video',
        platform: 'YouTube / freeCodeCamp',
        url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg',
        isFree: true,
        description: 'Intro to Machine Learning in Python with Scikit-Learn and data science libraries.',
      },
      {
        title: 'Scikit-Learn Official User Guide',
        type: 'docs',
        platform: 'Scikit-Learn.org',
        url: 'https://scikit-learn.org/stable/',
        isFree: true,
        description: 'Python machine learning library documentation and examples.',
      },
    ],
  },
};

/**
 * Returns learning plan & verified external resource links for a given skill.
 */
export function getSkillLearningPlan(skillName: string): SkillLearningPlan {
  // Normalize lookup
  const keys = Object.keys(SKILL_LEARNING_RESOURCES);
  const matchKey = keys.find((k) => k.toLowerCase() === skillName.toLowerCase().trim());

  if (matchKey && SKILL_LEARNING_RESOURCES[matchKey]) {
    return SKILL_LEARNING_RESOURCES[matchKey];
  }

  const query = encodeURIComponent(`${skillName} full course tutorial`);

  // Fallback template for any custom skill
  return {
    skillName: skillName,
    category: 'Technical Skill',
    estimatedHours: 20,
    difficulty: 'Intermediate',
    summary: `Master essential ${skillName} concepts, industry best practices, and real-world implementation.`,
    youtubeUrl: `https://www.youtube.com/results?search_query=${query}`,
    youtubeTitle: `Watch ${skillName} Full Course & Tutorials on YouTube`,
    resources: [
      {
        title: `YouTube - Watch ${skillName} Full Course & Tutorials`,
        type: 'video',
        platform: 'YouTube',
        url: `https://www.youtube.com/results?search_query=${query}`,
        isFree: true,
        description: `Top-rated free YouTube video tutorials and full courses for ${skillName}.`,
      },
      {
        title: `MDN / Official Documentation for ${skillName}`,
        type: 'docs',
        platform: 'Official Docs / MDN',
        url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(skillName)}`,
        isFree: true,
        description: `Authoritative guide and documentation reference for ${skillName}.`,
      },
      {
        title: `freeCodeCamp ${skillName} Free Tutorial & Lessons`,
        type: 'course',
        platform: 'freeCodeCamp',
        url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(skillName)}`,
        isFree: true,
        description: `Comprehensive video and article tutorials for ${skillName}.`,
      },
    ],
  };
}
