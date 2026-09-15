import React from 'react';
import type { CodingAssessmentResult } from '../../types/assessment';
import { CheckCircle2, XCircle, Award, ShieldCheck, X } from 'lucide-react';

interface TestResultsProps {
  assessmentResult: CodingAssessmentResult;
  onClose?: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({ assessmentResult, onClose }) => {
  const { score, passedTests, totalTests, difficulty, skill, testResults } = assessmentResult;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      
      {/* Assessment Header Score Summary Card */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 p-5 rounded-2xl border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>SkillBridge Proctored Assessment Result</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Skill Evaluation: <strong className="text-cyan-300">{skill}</strong>
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Dismiss result"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Assessed difficulty: <span className="text-white font-bold">{difficulty}</span> • Submitted {new Date(assessmentResult.submittedAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 px-5">
          <div className="text-center">
            <span className="block text-[10px] text-slate-400 uppercase font-bold">Assessment Score</span>
            <span className={`text-3xl font-black font-mono ${
              score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {score}%
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div className="text-center">
            <span className="block text-[10px] text-slate-400 uppercase font-bold">Passed Cases</span>
            <span className="text-xl font-bold text-cyan-300 font-mono">
              {passedTests} / {totalTests}
            </span>
          </div>
        </div>
      </div>

      {/* Individual Test Cases List */}
      {testResults && testResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Test Cases Breakdown</span>
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              {passedTests} of {totalTests} passed
            </span>
          </h4>

          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {testResults.map((t, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border font-mono text-xs flex flex-col space-y-1.5 transition-all ${
                  t.passed
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="font-bold text-white">
                      Test Case #{idx + 1} {t.isPublic ? '(Public)' : '(Hidden)'}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    t.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {t.passed ? 'PASSED ✓' : 'FAILED ✗'}
                  </span>
                </div>

                {t.isPublic ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Input:</span>
                      <code className="bg-slate-950 px-2 py-1 rounded block truncate">{t.input}</code>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Output:</span>
                      <code className="bg-slate-950 px-2 py-1 rounded block truncate">{t.output || 'N/A'}</code>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">
                    Hidden Test Case used for security validation.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
