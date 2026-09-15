import type { StudentProfile } from '../types/profile';
import { parseResumeWithAI as parseWithAI, extractRawTextFromFile } from './resumeExtractorService';

/**
 * Extract readable text from uploaded resume files
 */
export async function readResumeFileText(file: File): Promise<string> {
  return extractRawTextFromFile(file);
}

/**
 * Parses resume using Backend / Gemini AI endpoint through FastAPI server.
 * Never exposes server-side Gemini API key in frontend.
 */
export async function parseResumeWithAI(file: File): Promise<Partial<StudentProfile>> {
  return parseWithAI(file);
}
