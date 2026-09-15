// SkillBridge Code Compiler & Skill Assessment Data Models (SIH 26044)

export type SupportedLanguage = 
  | 'html'
  | 'css'
  | 'javascript'
  | 'react'
  | 'nodejs'
  | 'java'
  | 'python'
  | 'php'
  | 'r'
  | 'c'
  | 'cpp'
  | 'csharp';

export interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  extension: string;
  mode: 'web-iframe' | 'client-js' | 'react-sandbox' | 'backend-service';
  mimeType: string;
  defaultFilename: string;
  category: 'Web' | 'Programming';
  description: string;
}

export interface SavedCodeSnippet {
  id: string;
  title: string;
  language: SupportedLanguage;
  code: string;
  questionId?: string;
  lastEditedAt: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  description?: string;
}

export interface TestResultItem {
  testId: string;
  passed: boolean;
  input: string;
  output?: string;
  expected?: string;
  error?: string;
  isPublic: boolean;
}

export interface CodingQuestion {
  id: string;
  title: string;
  skill: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  supportedLanguages: SupportedLanguage[];
  defaultCode: Partial<Record<SupportedLanguage, string>>;
  testCases: TestCase[];
}

export interface CodingAssessmentResult {
  id: string;
  questionId: string;
  questionTitle: string;
  skill: string;
  language: SupportedLanguage;
  score: number; // 0 - 100%
  passedTests: number;
  totalTests: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  code: string;
  submittedAt: string;
  executionTimeMs?: number;
  status: 'passed' | 'failed' | 'error';
  testResults?: TestResultItem[];
}

export interface ExecutionResponse {
  success: boolean;
  output: string;
  error?: string;
  executionTimeMs: number;
  status: 'success' | 'error' | 'unavailable' | 'timeout';
}
