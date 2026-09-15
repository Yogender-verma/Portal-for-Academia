import type { SupportedLanguage, ExecutionResponse, TestResultItem, CodingQuestion, CodingAssessmentResult } from '../types/assessment';

export const LANGUAGE_CONFIGS: Record<SupportedLanguage, {
  id: SupportedLanguage;
  name: string;
  extension: string;
  mimeType: string;
  defaultFilename: string;
  category: 'Web' | 'Programming';
  description: string;
}> = {
  html: {
    id: 'html',
    name: 'HTML',
    extension: '.html',
    mimeType: 'text/html',
    defaultFilename: 'index.html',
    category: 'Web',
    description: 'HyperText Markup Language for structured Web UI structure.',
  },
  css: {
    id: 'css',
    name: 'CSS',
    extension: '.css',
    mimeType: 'text/css',
    defaultFilename: 'styles.css',
    category: 'Web',
    description: 'Cascading Style Sheets for layout, themes, and animations.',
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    extension: '.js',
    mimeType: 'text/javascript',
    defaultFilename: 'solution.js',
    category: 'Web',
    description: 'Modern ES6+ JavaScript execution engine.',
  },
  react: {
    id: 'react',
    name: 'React',
    extension: '.jsx',
    mimeType: 'text/jsx',
    defaultFilename: 'App.jsx',
    category: 'Web',
    description: 'React JSX component environment with isolated state.',
  },
  nodejs: {
    id: 'nodejs',
    name: 'Node.js',
    extension: '.js',
    mimeType: 'text/javascript',
    defaultFilename: 'server.js',
    category: 'Web',
    description: 'Server-side asynchronous JavaScript runtime.',
  },
  python: {
    id: 'python',
    name: 'Python',
    extension: '.py',
    mimeType: 'text/x-python',
    defaultFilename: 'solution.py',
    category: 'Programming',
    description: 'Python 3 script execution environment.',
  },
  java: {
    id: 'java',
    name: 'Java',
    extension: '.java',
    mimeType: 'text/x-java',
    defaultFilename: 'Main.java',
    category: 'Programming',
    description: 'Object-oriented Java compiler and JVM executor.',
  },
  c: {
    id: 'c',
    name: 'C',
    extension: '.c',
    mimeType: 'text/x-c',
    defaultFilename: 'main.c',
    category: 'Programming',
    description: 'Procedural C language GCC compilation.',
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    extension: '.cpp',
    mimeType: 'text/x-c++',
    defaultFilename: 'main.cpp',
    category: 'Programming',
    description: 'High performance C++20 G++ compiler environment.',
  },
  csharp: {
    id: 'csharp',
    name: 'C#',
    extension: '.cs',
    mimeType: 'text/x-csharp',
    defaultFilename: 'Program.cs',
    category: 'Programming',
    description: '.NET C# program compiler and runtime.',
  },
  php: {
    id: 'php',
    name: 'PHP',
    extension: '.php',
    mimeType: 'text/x-php',
    defaultFilename: 'index.php',
    category: 'Programming',
    description: 'Server-side web script execution.',
  },
  r: {
    id: 'r',
    name: 'R',
    extension: '.r',
    mimeType: 'text/x-r',
    defaultFilename: 'script.r',
    category: 'Programming',
    description: 'Statistical computing and data graphics language.',
  },
};

/**
 * Client-Side Browser Download Helper
 * Downloads current editor code directly to user's machine with correct extension
 */
export const downloadSourceCode = (code: string, language: SupportedLanguage, customTitle?: string) => {
  const config = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.javascript;
  const baseName = customTitle 
    ? customTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')
    : config.defaultFilename.replace(/\.[^/.]+$/, '');
  const fileName = `${baseName}${config.extension}`;

  const blob = new Blob([code], { type: `${config.mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Sandboxed Execution Router
 * Handles HTML/CSS/JS/React client-side sandboxing, and handles backend execution API calls for server languages
 */
export const executeCode = async (
  language: SupportedLanguage,
  code: string,
  input?: string
): Promise<ExecutionResponse> => {
  const startTime = performance.now();

  try {
    // 1. WEB CLIENT-SIDE SANDBOXED EXECUTION (JS)
    if (language === 'javascript') {
      const logs: string[] = [];

      // Safe console interceptor
      const mockConsole = {
        log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        error: (...args: any[]) => logs.push(`[ERROR] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}`),
        info: (...args: any[]) => logs.push(args.join(' ')),
      };

      try {
        // Execute inside Function scope with intercepted console & input
        const runFn = new Function('console', 'input', code);
        runFn(mockConsole, input || '');
        
        const executionTimeMs = Math.round(performance.now() - startTime);
        return {
          success: true,
          output: logs.length > 0 ? logs.join('\n') : 'Code executed cleanly with 0 console output.',
          executionTimeMs,
          status: 'success',
        };
      } catch (err: any) {
        const executionTimeMs = Math.round(performance.now() - startTime);
        return {
          success: false,
          output: logs.join('\n'),
          error: `Runtime Error: ${err.message || String(err)}`,
          executionTimeMs,
          status: 'error',
        };
      }
    }

    // 2. HTML & CSS PREVIEW MODES
    if (language === 'html' || language === 'css') {
      const executionTimeMs = Math.round(performance.now() - startTime);
      return {
        success: true,
        output: 'HTML/CSS Sandboxed Preview Ready.',
        executionTimeMs,
        status: 'success',
      };
    }

    // 3. REACT PREVIEW MODE
    if (language === 'react') {
      const executionTimeMs = Math.round(performance.now() - startTime);
      return {
        success: true,
        output: 'React Component Transpiled & Mounted in Sandboxed Frame.',
        executionTimeMs,
        status: 'success',
      };
    }

    // 4. BACKEND / COMPILER SERVICE EXECUTION (Java, Python, C, C++, C#, PHP, R, Node.js)
    // Attempt backend execution API endpoint if configured
    try {
      const response = await fetch('/api/compiler/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, input }),
      });

      if (response.ok) {
        const data = await response.json();
        const executionTimeMs = Math.round(performance.now() - startTime);
        return {
          success: data.success,
          output: data.output || '',
          error: data.error,
          executionTimeMs: data.executionTimeMs || executionTimeMs,
          status: data.success ? 'success' : 'error',
        };
      }
    } catch {
      // Backend not running/unreachable
    }

    // Fallback if backend server is not running: DO NOT fake execution results!
    const executionTimeMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      output: '',
      error: `Compiler service unavailable for ${LANGUAGE_CONFIGS[language].name}. Please start the backend execution container to compile and run ${LANGUAGE_CONFIGS[language].name} code.`,
      executionTimeMs,
      status: 'unavailable',
    };
  } catch (err: any) {
    const executionTimeMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      output: '',
      error: `Execution Exception: ${err.message || String(err)}`,
      executionTimeMs,
      status: 'error',
    };
  }
};

/**
 * Automated Test Case Evaluator for Assessment Submissions
 */
export const runAssessmentEvaluation = async (
  question: CodingQuestion,
  language: SupportedLanguage,
  code: string
): Promise<CodingAssessmentResult> => {
  const startTime = performance.now();
  const testResults: TestResultItem[] = [];
  let passedCount = 0;

  for (const test of question.testCases) {
    let passed = false;
    let actualOutput = '';
    let errorMsg: string | undefined;

    if (language === 'javascript' || language === 'nodejs') {
      try {
        const logs: string[] = [];
        const mockConsole = {
          log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          error: (...args: any[]) => logs.push(args.join(' ')),
        };

        // Wrap code execution & return value or log output
        const evaluator = new Function('console', 'input', `
          ${code}
          if (typeof solution === 'function') {
            const parsedInput = input.startsWith('[') || input.startsWith('{') ? JSON.parse(input) : input;
            return solution(parsedInput);
          }
          if (typeof largest === 'function') {
            return largest(JSON.parse(input));
          }
          if (typeof reverseString === 'function') {
            return reverseString(input);
          }
          if (typeof isPalindrome === 'function') {
            return isPalindrome(input);
          }
          if (typeof twoSum === 'function') {
            const parts = JSON.parse(input);
            return twoSum(parts[0], parts[1]);
          }
          return undefined;
        `);

        const result = evaluator(mockConsole, test.input);
        actualOutput = result !== undefined 
          ? (typeof result === 'object' ? JSON.stringify(result) : String(result))
          : logs.join('\n').trim();

        const expectedClean = test.expectedOutput.trim();
        const actualClean = actualOutput.trim();

        passed = actualClean === expectedClean || actualClean === JSON.stringify(JSON.parse(expectedClean || '""'));
      } catch (err: any) {
        errorMsg = err.message || String(err);
        passed = false;
      }
    } else if (language === 'html' || language === 'css') {
      // Validate element tag presence or css selectors
      passed = code.includes(test.expectedOutput.trim()) || code.toLowerCase().includes(test.input.toLowerCase());
      actualOutput = passed ? test.expectedOutput : 'Element or style tag missing in code structure.';
    } else {
      // For compiled/server languages, attempt execution or check keyword structure
      const exec = await executeCode(language, code, test.input);
      if (exec.status === 'unavailable') {
        // Fallback for assessment mode if backend compiler service is unavailable
        passed = false;
        errorMsg = exec.error;
      } else {
        actualOutput = exec.output.trim();
        passed = actualOutput === test.expectedOutput.trim();
        if (exec.error) errorMsg = exec.error;
      }
    }

    if (passed) passedCount++;

    testResults.push({
      testId: test.id,
      passed,
      input: test.isPublic ? test.input : 'Hidden Input',
      output: test.isPublic ? actualOutput : (passed ? 'Output matched expected' : 'Output mismatch'),
      expected: test.isPublic ? test.expectedOutput : 'Hidden Output',
      error: errorMsg,
      isPublic: test.isPublic,
    });
  }

  const total = question.testCases.length;
  const score = total > 0 ? Math.round((passedCount / total) * 100) : 0;
  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    id: `assess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    questionId: question.id,
    questionTitle: question.title,
    skill: question.skill,
    language,
    score,
    passedTests: passedCount,
    totalTests: total,
    difficulty: question.difficulty,
    code,
    submittedAt: new Date().toISOString(),
    executionTimeMs,
    status: score === 100 ? 'passed' : score > 0 ? 'failed' : 'error',
    testResults,
  };
};
