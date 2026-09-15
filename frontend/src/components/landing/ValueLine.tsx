import React from 'react';

export const ValueLine: React.FC = () => {
  return (
    <div className="border-y border-slate-800/80 bg-slate-950/60 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
            <p className="text-sm font-semibold text-slate-200 tracking-wide">
              Understand your skills. <span className="text-indigo-400">Discover your gaps.</span> Build your career.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Skill-Based Intelligence
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Academia-Industry Collaboration
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
