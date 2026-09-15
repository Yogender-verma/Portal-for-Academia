import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';

export const FinalCtaSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-slate-950 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="glass-panel p-10 sm:p-16 rounded-3xl text-center space-y-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
            <Compass className="w-7 h-7" />
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Know where you stand. <br className="hidden sm:inline" />
              <span className="text-gradient-accent">Know what to learn next.</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-300 font-normal">
              Build a clearer path from your current skills to the career you want.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 border border-indigo-400/20"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
            >
              Already have an account? Sign In
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
};
