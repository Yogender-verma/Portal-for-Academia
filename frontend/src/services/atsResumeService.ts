import type { StudentProfile } from '../types/profile';

/**
 * Formats a student's confirmed profile data into an ATS-friendly single-column layout text string.
 * Strictly uses only confirmed student profile data — zero invented facts or skills.
 */
export function generateAtsResumeContent(profile: StudentProfile): string {
  const { personalInfo, academicInfo, technicalSkills, softSkills, projects, experience, certifications, achievements, aboutMe } = profile;

  const lines: string[] = [];

  // Header / Contact Information
  if (personalInfo.fullName) lines.push(personalInfo.fullName.toUpperCase());
  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    [personalInfo.city, personalInfo.state].filter(Boolean).join(', '),
    personalInfo.linkedInUrl,
    personalInfo.gitHubUrl,
    personalInfo.portfolioUrl,
  ].filter(Boolean);
  if (contactParts.length > 0) lines.push(contactParts.join(' | '));
  lines.push('');

  // Professional Summary / About Me
  const summary = aboutMe || personalInfo.aboutMe;
  if (summary) {
    lines.push('PROFESSIONAL SUMMARY');
    lines.push('--------------------');
    lines.push(summary);
    lines.push('');
  }

  // Education / Academic Info
  if (academicInfo.college || academicInfo.degree) {
    lines.push('EDUCATION');
    lines.push('---------');
    const degreeLine = [academicInfo.degree, academicInfo.branch].filter(Boolean).join(' in ');
    if (degreeLine) lines.push(degreeLine);
    if (academicInfo.college) lines.push(academicInfo.college);
    const yearCgpa = [
      academicInfo.graduationYear ? `Expected Graduation: ${academicInfo.graduationYear}` : '',
      academicInfo.cgpa ? `CGPA: ${academicInfo.cgpa}` : '',
    ].filter(Boolean).join(' | ');
    if (yearCgpa) lines.push(yearCgpa);
    lines.push('');
  }

  // Technical Skills
  if (technicalSkills && technicalSkills.length > 0) {
    lines.push('TECHNICAL SKILLS');
    lines.push('----------------');
    const categories: Record<string, string[]> = {};
    technicalSkills.forEach((s) => {
      const cat = s.category || 'Other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(s.name);
    });

    Object.entries(categories).forEach(([cat, list]) => {
      lines.push(`${cat}: ${list.join(', ')}`);
    });
    lines.push('');
  }

  // Soft Skills
  if (softSkills && softSkills.length > 0) {
    lines.push('CORE COMPETENCIES & SOFT SKILLS');
    lines.push('-------------------------------');
    lines.push(softSkills.map((s) => s.name).join(', '));
    lines.push('');
  }

  // Work Experience
  if (experience && experience.length > 0) {
    lines.push('WORK & INTERNSHIP EXPERIENCE');
    lines.push('----------------------------');
    experience.forEach((exp) => {
      lines.push(`${exp.role.toUpperCase()} - ${exp.organization}`);
      const dates = [exp.startDate, exp.currentlyWorking ? 'Present' : exp.endDate].filter(Boolean).join(' to ');
      const loc = exp.location ? ` | ${exp.location}` : '';
      if (dates || loc) lines.push(`${dates}${loc}`);
      if (exp.responsibilities) {
        exp.responsibilities.split('\n').forEach((resp) => {
          if (resp.trim()) lines.push(`• ${resp.trim()}`);
        });
      }
      lines.push('');
    });
  }

  // Projects
  if (projects && projects.length > 0) {
    lines.push('KEY PROJECTS');
    lines.push('------------');
    projects.forEach((proj) => {
      lines.push(`${proj.projectName.toUpperCase()}${proj.role ? ` (${proj.role})` : ''}`);
      if (proj.technologies && proj.technologies.length > 0) {
        lines.push(`Technologies: ${proj.technologies.join(', ')}`);
      }
      if (proj.description) {
        proj.description.split('\n').forEach((d) => {
          if (d.trim()) lines.push(`• ${d.trim()}`);
        });
      }
      if (proj.githubUrl) lines.push(`GitHub: ${proj.githubUrl}`);
      lines.push('');
    });
  }

  // Certifications
  if (certifications && certifications.length > 0) {
    lines.push('CERTIFICATIONS');
    lines.push('--------------');
    certifications.forEach((c) => {
      const line = [c.name, c.issuingOrganization, c.issueDate].filter(Boolean).join(' - ');
      lines.push(`• ${line}`);
    });
    lines.push('');
  }

  // Achievements
  if (achievements && achievements.length > 0) {
    lines.push('ACHIEVEMENTS & AWARDS');
    lines.push('---------------------');
    achievements.forEach((a) => {
      const titleLine = [a.title, a.organizationOrEvent].filter(Boolean).join(' | ');
      lines.push(`• ${titleLine}`);
      if (a.description) lines.push(`  ${a.description}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Downloads resume as ATS formatted DOCX file
 */
export function downloadAtsResumeDocx(profile: StudentProfile, filename = 'ATS_Resume.docx'): void {
  const content = generateAtsResumeContent(profile);

  // Generate valid Word XML docx file contents
  const docxHeader = `xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"`;
  const formattedHtml = `
    <html ${docxHeader}>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.35; color: #000; margin: 1in; }
          h1 { font-size: 18pt; text-align: center; text-transform: uppercase; margin-bottom: 4px; }
          .contact { text-align: center; font-size: 10pt; margin-bottom: 16px; }
          h2 { font-size: 12pt; text-transform: uppercase; border-bottom: 1px solid #000; margin-top: 14px; margin-bottom: 6px; }
          p { margin: 2px 0; }
          ul { margin: 4px 0 8px 18px; padding: 0; }
          li { margin-bottom: 2px; }
        </style>
      </head>
      <body>
        ${content.split('\n').map((line) => {
          if (!line.trim()) return '<br/>';
          if (line.match(/^[A-Z\s&]{4,}$/) && !line.includes('|')) return `<h2>${line}</h2>`;
          if (line.startsWith('----------------')) return '';
          if (line.startsWith('• ')) return `<li>${line.slice(2)}</li>`;
          return `<p>${line}</p>`;
        }).join('')}
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', formattedHtml], {
    type: 'application/msword',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.docx') || filename.endsWith('.doc') ? filename : `${filename}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads resume as ATS formatted PDF file via Browser Print View Blob
 */
export function downloadAtsResumePdf(profile: StudentProfile, filename = 'ATS_Resume.pdf'): void {
  const content = generateAtsResumeContent(profile);

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          @page { size: letter; margin: 0.75in; }
          body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #111; line-height: 1.4; margin: 0; padding: 0; }
          h1 { text-align: center; font-size: 18pt; text-transform: uppercase; margin: 0 0 4px 0; letter-spacing: 0.5px; }
          .contact { text-align: center; font-size: 10pt; color: #333; margin-bottom: 16px; }
          h2 { font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1.5px solid #111; padding-bottom: 2px; margin-top: 14px; margin-bottom: 6px; }
          p { margin: 2px 0; }
          .bullet { margin-left: 18px; text-indent: -12px; }
        </style>
      </head>
      <body>
        ${content.split('\n').map((line) => {
          if (!line.trim()) return '<div style="height: 6px;"></div>';
          if (line.match(/^[A-Z\s&]{4,}$/) && !line.includes('|') && !line.includes('-')) return `<h2>${line}</h2>`;
          if (line.startsWith('----------------')) return '';
          if (line.startsWith('• ')) return `<div class="bullet">• ${line.slice(2)}</div>`;
          return `<p>${line}</p>`;
        }).join('')}
        <script>
          window.onload = function() { window.print(); window.close(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Improves ATS bullet points grammar and phrasing using Gemini API WITHOUT inventing facts/skills/experience.
 */
export async function improveResumeWordingWithAI(profile: StudentProfile): Promise<string> {
  const rawText = generateAtsResumeContent(profile);
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  if (!geminiKey) {
    throw new Error('AI service key is missing or not configured on frontend.');
  }

  const prompt = `You are an expert ATS resume editor. 
Refine the grammar, action verbs, and impact phrasing of the following resume text to make it compelling and ATS-scannable.

STRICT SAFETY RULES:
1. DO NOT invent or add any new skills, experience, company names, metrics, certifications, dates, or credentials.
2. ONLY refine the wording and formatting of existing entries.
3. Retain single-column clear text layout.

RESUME TEXT:
${rawText}`;

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  if (!resp.ok) {
    throw new Error('Failed to refine resume wording with AI service.');
  }

  const json = await resp.json();
  const improved = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!improved) throw new Error('No response returned from AI service.');
  return improved;
}
