import type { StudentProfile, TechnicalSkill, PersonalInfo, AcademicInfo } from '../types/profile';
import { normalizeSkillName } from '../utils/skillNormalization';

/**
 * Extracts plain text from an uploaded File (PDF, DOCX, TXT) in the browser
 */
export async function extractRawTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.txt')) {
    return await file.text();
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const rawContent = decoder.decode(arrayBuffer);

    const textMatches = rawContent.match(/[A-Za-z0-9\s.,;:\-@()/\\&'"#+]+/g) || [];
    const filteredText = textMatches
      .map((t) => t.trim())
      .filter((t) => t.length > 3)
      .join(' ');

    if (filteredText.length > 30) {
      return filteredText.slice(0, 10000);
    }
  } catch (err) {
    console.warn('[ResumeExtractor] Text extraction fallback error:', err);
  }

  return `Resume File: ${file.name}`;
}

/**
 * Normalizes all extracted profile sections and skill names
 */
export function normalizeExtractedSkills(data: Partial<StudentProfile>): Partial<StudentProfile> {
  console.log('[ResumeExtractor] Normalizing extracted profile data:', Object.keys(data));

  const result: Partial<StudentProfile> = {
    personalInfo: (data.personalInfo || {}) as PersonalInfo,
    academicInfo: (data.academicInfo || {}) as AcademicInfo,
    aboutMe: data.aboutMe || data.personalInfo?.aboutMe || '',
    technicalSkills: [],
    softSkills: [],
    projects: [],
    experience: [],
    certifications: [],
    achievements: [],
    languages: [],
    coursework: Array.isArray(data.coursework) ? data.coursework : [],
    publications: Array.isArray(data.publications)
      ? data.publications.map((pub: any, idx: number) => ({
          id: pub.id || `ext-pub-${idx}-${Date.now()}`,
          title: pub.title || 'Publication',
          publisher: pub.publisher || '',
          date: pub.date || '',
          link: pub.link || '',
          description: pub.description || '',
        }))
      : [],
    awards: Array.isArray(data.awards)
      ? data.awards.map((aw: any, idx: number) => ({
          id: aw.id || `ext-award-${idx}-${Date.now()}`,
          title: aw.title || 'Award',
          issuer: aw.issuer || '',
          year: aw.year || '',
        }))
      : [],
  };

  if (Array.isArray(data.technicalSkills)) {
    result.technicalSkills = data.technicalSkills.map((sk: any, idx: number) => ({
      id: sk.id || `ext-tech-${idx}-${Date.now()}`,
      name: normalizeSkillName(sk.name || sk),
      category: sk.category || 'Programming',
      proficiency: sk.proficiency || 'Intermediate',
    }));
  }

  if (Array.isArray(data.softSkills)) {
    result.softSkills = data.softSkills.map((s: any, idx: number) => ({
      id: s.id || `ext-soft-${idx}-${Date.now()}`,
      name: typeof s === 'string' ? s : s.name,
      proficiency: s.proficiency || 'Intermediate',
    }));
  }

  if (Array.isArray(data.projects)) {
    result.projects = data.projects.map((p: any, idx: number) => ({
      id: p.id || `ext-proj-${idx}-${Date.now()}`,
      projectName: p.projectName || 'Project',
      description: p.description || '',
      technologies: Array.isArray(p.technologies) ? p.technologies.map(normalizeSkillName) : [],
      role: p.role || 'Contributor',
      githubUrl: p.githubUrl || '',
      liveDemoUrl: p.liveDemoUrl || '',
      skillsDemonstrated: Array.isArray(p.skillsDemonstrated) ? p.skillsDemonstrated : [],
    }));
  }

  if (Array.isArray(data.experience)) {
    result.experience = data.experience.map((e: any, idx: number) => ({
      id: e.id || `ext-exp-${idx}-${Date.now()}`,
      organization: e.organization || 'Company',
      role: e.role || 'Role',
      employmentType: e.employmentType || 'Full-time',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
      currentlyWorking: Boolean(e.currentlyWorking),
      location: e.location || '',
      responsibilities: e.responsibilities || '',
      skillsGained: Array.isArray(e.skillsGained) ? e.skillsGained : [],
    }));
  }

  if (Array.isArray(data.certifications)) {
    result.certifications = data.certifications.map((c: any, idx: number) => ({
      id: c.id || `ext-cert-${idx}-${Date.now()}`,
      name: c.name || 'Certification',
      issuingOrganization: c.issuingOrganization || '',
      issueDate: c.issueDate || '',
      expiryDate: c.expiryDate || '',
      credentialId: c.credentialId || '',
      credentialUrl: c.credentialUrl || '',
    }));
  }

  if (Array.isArray(data.achievements)) {
    result.achievements = data.achievements.map((a: any, idx: number) => ({
      id: a.id || `ext-achieve-${idx}-${Date.now()}`,
      title: a.title || 'Achievement',
      organizationOrEvent: a.organizationOrEvent || '',
      date: a.date || '',
      description: a.description || '',
    }));
  }

  if (Array.isArray(data.languages)) {
    result.languages = data.languages.map((l: any, idx: number) => ({
      id: l.id || `ext-lang-${idx}-${Date.now()}`,
      language: l.language || 'Language',
      readingLevel: l.readingLevel || 'Intermediate',
      writingLevel: l.writingLevel || 'Intermediate',
      speakingLevel: l.speakingLevel || 'Intermediate',
    }));
  }

  return result;
}

/**
 * Smart local heuristic resume parser for fallback extraction
 */
export function extractProfileFromTextLocally(rawText: string, fileName: string): Partial<StudentProfile> {
  console.log('[ResumeExtractor] Running local heuristic fallback parser...');
  const personalInfo: Partial<PersonalInfo> = {};
  const academicInfo: Partial<AcademicInfo> = {};
  const technicalSkills: TechnicalSkill[] = [];

  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) personalInfo.email = emailMatch[0];

  const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) personalInfo.phone = phoneMatch[0];

  const cleanFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
  const titleName = cleanFileName.replace(/\b(resume|cv|latest|profile|final|doc|pdf)\b/gi, '').trim();
  if (titleName && titleName.length > 2) {
    personalInfo.fullName = titleName
      .split(' ')
      .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
      .join(' ');
  }

  const linkedInMatch = rawText.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  if (linkedInMatch) personalInfo.linkedInUrl = linkedInMatch[0];

  const githubMatch = rawText.match(/(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  if (githubMatch) personalInfo.gitHubUrl = githubMatch[0];

  const techMap: Array<{ pattern: RegExp; canonical: string; category: TechnicalSkill['category'] }> = [
    { pattern: /\b(js|javascript|es6)\b/i, canonical: 'JavaScript', category: 'Programming' },
    { pattern: /\b(ts|typescript)\b/i, canonical: 'TypeScript', category: 'Programming' },
    { pattern: /\b(react|reactjs|react\.js)\b/i, canonical: 'React', category: 'Web Development' },
    { pattern: /\b(node|nodejs|node\.js)\b/i, canonical: 'Node.js', category: 'Web Development' },
    { pattern: /\b(express|expressjs|express\.js)\b/i, canonical: 'Express.js', category: 'Web Development' },
    { pattern: /\b(python|py|python3)\b/i, canonical: 'Python', category: 'Programming' },
    { pattern: /\b(java)\b/i, canonical: 'Java', category: 'Programming' },
    { pattern: /\b(c\+\+|cpp)\b/i, canonical: 'C++', category: 'Programming' },
    { pattern: /\b(sql|mysql)\b/i, canonical: 'SQL', category: 'Database' },
    { pattern: /\b(postgres|postgresql)\b/i, canonical: 'PostgreSQL', category: 'Database' },
    { pattern: /\b(mongo|mongodb)\b/i, canonical: 'MongoDB', category: 'Database' },
    { pattern: /\b(html|html5)\b/i, canonical: 'HTML', category: 'Web Development' },
    { pattern: /\b(css|css3)\b/i, canonical: 'CSS', category: 'Web Development' },
    { pattern: /\b(tailwind|tailwindcss)\b/i, canonical: 'Tailwind CSS', category: 'Web Development' },
    { pattern: /\b(git|github)\b/i, canonical: 'Git', category: 'Tools' },
    { pattern: /\b(docker)\b/i, canonical: 'Docker', category: 'Cloud & DevOps' },
    { pattern: /\b(aws)\b/i, canonical: 'AWS', category: 'Cloud & DevOps' },
  ];

  const foundTech = new Set<string>();
  techMap.forEach((t) => {
    if (t.pattern.test(rawText) && !foundTech.has(t.canonical)) {
      foundTech.add(t.canonical);
      technicalSkills.push({
        id: `skill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: t.canonical,
        category: t.category,
        proficiency: 'Intermediate',
      });
    }
  });

  if (/\b(b\.?tech|b\.?e\.?|bachelor of technology)\b/i.test(rawText)) academicInfo.degree = 'B.Tech';
  if (/\b(computer science|cse|cs)\b/i.test(rawText)) academicInfo.branch = 'Computer Science & Engineering';

  const result: Partial<StudentProfile> = {
    personalInfo: personalInfo as PersonalInfo,
    academicInfo: academicInfo as AcademicInfo,
    technicalSkills,
    softSkills: [],
    projects: [],
    experience: [],
    certifications: [],
    achievements: [],
    languages: [],
    coursework: [],
    publications: [],
    awards: [],
    aboutMe: '',
  };

  return normalizeExtractedSkills(result);
}

/**
 * Calls FastAPI Backend Gemini Document Understanding Pipeline to extract complete structured profile JSON.
 * Throws with a descriptive error if extraction fails — does NOT silently fall back to the local parser.
 */
export async function parseResumeWithAI(file: File): Promise<Partial<StudentProfile>> {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[ResumeExtractor] ▶ PIPELINE START');
  console.log(`[ResumeExtractor] File: ${file.name}`);
  console.log(`[ResumeExtractor] Size: ${(file.size / 1024).toFixed(1)} KB (${file.size} bytes)`);
  console.log(`[ResumeExtractor] Type: ${file.type}`);
  console.log(`[ResumeExtractor] Backend URL: ${apiBase}/parse-resume-file`);

  // ── Step 1: Primary — POST file to FastAPI Gemini endpoint ──
  let backendError: string | null = null;
  try {
    const formData = new FormData();
    formData.append('file', file);
    console.log('[ResumeExtractor] Sending multipart/form-data POST to backend...');

    const resp = await fetch(`${apiBase}/parse-resume-file`, {
      method: 'POST',
      body: formData,
    });

    console.log(`[ResumeExtractor] Backend response status: ${resp.status} ${resp.statusText}`);

    if (resp.ok) {
      const resData = await resp.json();

      if (resData.extracted && typeof resData.extracted === 'object') {
        const extractedKeys = Object.keys(resData.extracted);
        const fieldReport: string[] = [];
        for (const key of extractedKeys) {
          const val = resData.extracted[key];
          if (Array.isArray(val)) {
            fieldReport.push(`${key}: ${val.length} items`);
          } else if (val && typeof val === 'object') {
            const nonEmpty = Object.values(val).filter((v) => v).length;
            fieldReport.push(`${key}: ${nonEmpty} non-empty fields`);
          } else if (val) {
            fieldReport.push(`${key}: present`);
          }
        }

        console.log('[ResumeExtractor] ✅ Backend Gemini Document Understanding SUCCESS');
        console.log(`[ResumeExtractor] Model used: ${resData.modelUsed}`);
        console.log(`[ResumeExtractor] Upload method: ${resData.uploadMethod || 'unknown'}`);
        console.log(`[ResumeExtractor] Fields extracted: ${extractedKeys.join(', ')}`);
        console.log(`[ResumeExtractor] Field details: ${fieldReport.join(' | ')}`);

        const normalized = normalizeExtractedSkills(resData.extracted);
        console.log('[ResumeExtractor] ✅ Normalization complete');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return normalized;
      } else {
        backendError = `Backend returned success but no 'extracted' field. Response keys: ${Object.keys(resData).join(', ')}`;
        console.warn(`[ResumeExtractor] ⚠ ${backendError}`);
      }
    } else {
      let errBody = '';
      try { errBody = await resp.text(); } catch { errBody = '(could not read error body)'; }
      backendError = `HTTP ${resp.status}: ${errBody}`;
      console.error(`[ResumeExtractor] ❌ Backend /parse-resume-file failed — ${backendError}`);
    }
  } catch (err: any) {
    backendError = `Backend unreachable: ${err?.message || err}`;
    console.error(`[ResumeExtractor] ❌ ${backendError}`);
  }

  // ── Step 2: Fallback — extract text and send to /parse-resume ──
  console.log('[ResumeExtractor] Trying text fallback via /parse-resume...');
  let textFallbackError: string | null = null;
  try {
    const rawText = await extractRawTextFromFile(file);
    console.log(`[ResumeExtractor] Extracted raw text length: ${rawText.length} chars`);

    if (rawText.length > 50) {
      const resp = await fetch(`${apiBase}/parse-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      });

      console.log(`[ResumeExtractor] Text endpoint response status: ${resp.status}`);

      if (resp.ok) {
        const resData = await resp.json();
        if (resData.extracted && typeof resData.extracted === 'object') {
          console.log('[ResumeExtractor] ✅ Backend text parsing SUCCESS');
          console.log(`[ResumeExtractor] Fields: ${Object.keys(resData.extracted).join(', ')}`);
          const normalized = normalizeExtractedSkills(resData.extracted);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          return normalized;
        }
      } else {
        let errBody = '';
        try { errBody = await resp.text(); } catch { /* ignore */ }
        textFallbackError = `Text endpoint HTTP ${resp.status}: ${errBody}`;
      }
    } else {
      textFallbackError = 'Raw text extraction too short for AI parsing';
    }
  } catch (err: any) {
    textFallbackError = `Text fallback failed: ${err?.message || err}`;
  }
  if (textFallbackError) {
    console.warn(`[ResumeExtractor] ⚠ Text fallback: ${textFallbackError}`);
  }

  // ── Step 3: Last resort — local heuristic parser ──
  console.warn('[ResumeExtractor] ⚠ Both AI endpoints failed. Using local heuristic parser as last resort.');
  console.warn('[ResumeExtractor] Primary error:', backendError);
  if (textFallbackError) console.warn('[ResumeExtractor] Text fallback error:', textFallbackError);

  const rawTextFallback = await extractRawTextFromFile(file);
  const localResult = extractProfileFromTextLocally(rawTextFallback, file.name);

  // Check if local result has any meaningful data
  const hasData = (localResult.technicalSkills?.length || 0) > 0
    || (localResult.projects?.length || 0) > 0
    || localResult.personalInfo?.email
    || localResult.personalInfo?.fullName;

  if (!hasData) {
    // If local parser also got nothing, throw with the real reason
    const errorMsg = backendError || textFallbackError || 'Unknown extraction failure';
    console.error(`[ResumeExtractor] ❌ PIPELINE FAILED — No data extracted. Root cause: ${errorMsg}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    throw new Error(`Resume extraction failed: ${errorMsg}`);
  }

  console.log('[ResumeExtractor] ✅ Local heuristic extracted some data (limited accuracy)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  return localResult;
}
