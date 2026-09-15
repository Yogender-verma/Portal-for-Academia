import React, { useState } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { normalizeSkillName } from '../../utils/skillNormalization';
import { 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Sparkles,
  BarChart3,
  Search
} from 'lucide-react';

interface JobDescriptionMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const JobDescriptionMatchModal: React.FC<JobDescriptionMatchModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { profile } = useStudentProfile();
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = () => {
    if (!jobDescription.trim()) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      const jdText = jobDescription.toLowerCase();

      // Extract skills present in JD
      const commonTechKeywords = [
        'javascript', 'react', 'typescript', 'node.js', 'express', 'python', 'django',
        'fastapi', 'postgresql', 'mongodb', 'sql', 'html', 'css', 'tailwind css',
        'c++', 'java', 'git', 'docker', 'kubernetes', 'aws', 'redis', 'rest api',
        'graphql', 'unit testing', 'ci/cd', 'agile', 'system design', 'redux'
      ];

      const foundJdSkills: string[] = [];
      commonTechKeywords.forEach((kw) => {
        if (jdText.includes(kw)) {
          foundJdSkills.push(normalizeSkillName(kw));
        }
      });

      // Get student's normalized skills
      const studentSkillSet = new Set(
        (profile.technicalSkills || []).map((s) => normalizeSkillName(s.name).toLowerCase())
      );

      const matched: string[] = [];
      const missing: string[] = [];

      foundJdSkills.forEach((skillName) => {
        if (studentSkillSet.has(skillName.toLowerCase())) {
          matched.push(skillName);
        } else {
          missing.push(skillName);
        }
      });

      // Calculate score
      const totalJdSkills = foundJdSkills.length;
      let matchScore = 75; // Default score if no exact tech keywords found
      if (totalJdSkills > 0) {
        matchScore = Math.round((matched.length / totalJdSkills) * 100);
      } else {
        // Fallback simple keyword match
        let count = 0;
        studentSkillSet.forEach((sk) => {
          if (jdText.includes(sk)) count++;
        });
        matchScore = Math.min(95, Math.max(40, 50 + count * 10));
      }

      setAnalysisResult({
        matchScore,
        matchedSkills: matched.length > 0 ? matched : Array.from(studentSkillSet).map(s => normalizeSkillName(s)),
        missingSkills: missing,
      });

      setIsAnalyzing(false);
    }, 600);
  };

  const handleJumpToSkillGaps = () => {
    onClose();
    if (onNavigateTab) {
      onNavigateTab('skill-gaps');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 text-sky-400 rounded-xl border border-sky-500/30">
              <Target className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Resume ↔ Job Description Match
              </h3>
              <p className="text-xs text-slate-400">
                Compare your saved profile & resume against any specific target job description
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Job Description Textarea Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Paste Target Job Description (JD)
            </label>
            <textarea
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job requirements, desired technical skills, or role description here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors resize-none leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={!jobDescription.trim() || isAnalyzing}
                className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing Match...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Analyze SkillBridge Match Score</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="space-y-6 pt-4 border-t border-slate-800 animate-in fade-in duration-300">
              
              {/* Score Banner */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-sky-500/30 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" /> SkillBridge Resume/Job Match Score
                  </span>
                  <p className="text-xs text-slate-400">
                    Calculated by matching saved skills vs target JD requirements.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {analysisResult.matchScore}%
                  </span>
                  <span className="block text-[10px] text-emerald-400 font-semibold">Match Readiness</span>
                </div>
              </div>

              {/* Matched Skills List */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <CheckCircle2 className="w-4 h-4" /> Matched Skills ({analysisResult.matchedSkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.matchedSkills.length > 0 ? (
                    analysisResult.matchedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                      >
                        ✓ {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No direct technical skills matched.</span>
                  )}
                </div>
              </div>

              {/* Missing Skills List & Action Link */}
              <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-4 space-y-3 bg-amber-950/10">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Missing Skills Identified ({analysisResult.missingSkills.length})
                  </h4>
                  <button
                    onClick={handleJumpToSkillGaps}
                    className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    View in Skill Gap Analysis <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.missingSkills.length > 0 ? (
                    analysisResult.missingSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30"
                      >
                        + Add {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold">
                      🎉 Great job! No missing critical skills identified for this job description.
                    </span>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">
          <span className="text-[11px] text-slate-500">
            Note: Match score is a SkillBridge resume/job match indicator.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
