import React from 'react';
import type { CodingQuestion } from '../../types/assessment';
import { Target, FileText, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

interface ProblemPanelProps {
  question: CodingQuestion;
  mode: 'practice' | 'assessment';
  onToggleMode: (newMode: 'practice' | 'assessment') => void;
  questionsList?: CodingQuestion[];
  onSelectQuestion?: (question: CodingQuestion) => void;
}

export const ProblemPanel: React.FC<ProblemPanelProps> = ({
  question,
  mode,
  onToggleMode,
  questionsList = [],
  onSelectQuestion,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6 flex flex-col h-full overflow-y-auto custom-scrollbar shadow-2xl">
      
      {/* Mode Switcher Banner (Practice vs Assessment) */}
      <div className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs">
        <button
          onClick={() => onToggleMode('practice')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'practice'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Practice Mode</span>
        </button>

        <button
          onClick={() => onToggleMode('assessment')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'assessment'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Assessment Mode</span>
        </button>
      </div>

      {/* Select Problem Dropdown if multiple available */}
      {questionsList.length > 1 && onSelectQuestion && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Problem:
          </label>
          <select
            value={question.id}
            onChange={(e) => {
              const q = questionsList.find(item => item.id === e.target.value);
              if (q) onSelectQuestion(q);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-cyan-400"
          >
            {questionsList.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title} ({q.skill} • {q.difficulty})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Problem Header */}
      <div className="space-y-2.5 border-b border-slate-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            question.difficulty === 'Easy'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : question.difficulty === 'Medium'
              ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}>
            {question.difficulty}
          </span>

          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
            {question.skill}
          </span>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">{question.title}</h2>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span>Description</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-normal">{question.description}</p>
      </div>

      {/* Examples */}
      {question.examples && question.examples.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Input / Output Examples</span>
          </h3>

          {question.examples.map((ex, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-850 rounded-xl p-3 space-y-1.5 font-mono text-xs">
              <div className="text-slate-400 text-[11px]">
                <strong className="text-slate-300">Input: </strong>
                <span className="text-cyan-300">{ex.input}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                <strong className="text-slate-300">Output: </strong>
                <span className="text-emerald-400 font-bold">{ex.output}</span>
              </div>
              {ex.explanation && (
                <p className="text-[10px] text-slate-400 font-sans italic pt-1 border-t border-slate-900">
                  {ex.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Constraints */}
      {question.constraints && question.constraints.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Constraints</span>
          </h3>
          <ul className="space-y-1 text-[11px] text-slate-400 font-mono list-disc list-inside">
            {question.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};
