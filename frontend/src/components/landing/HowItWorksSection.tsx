import React from 'react';
import { UserPlus, FileText, Target, Map, Award, ArrowDown } from 'lucide-react';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  bgAccent: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Create Your Profile',
    description: 'Sign up and tell us about your academic background and career goals.',
    icon: UserPlus,
    accent: 'text-indigo-400',
    bgAccent: 'bg-indigo-500/10 border-indigo-500/30',
  },
  {
    number: '02',
    title: 'Analyze Your Skills',
    description: 'Upload your resume and let the platform structure your skills and experience.',
    icon: FileText,
    accent: 'text-sky-400',
    bgAccent: 'bg-sky-500/10 border-sky-500/30',
  },
  {
    number: '03',
    title: 'Discover Your Skill Gaps',
    description: 'Choose your target role and compare your current capabilities with industry requirements.',
    icon: Target,
    accent: 'text-amber-400',
    bgAccent: 'bg-amber-500/10 border-amber-500/30',
  },
  {
    number: '04',
    title: 'Build Your Roadmap',
    description: 'Get a personalized plan focused on the skills that matter most for your target career.',
    icon: Map,
    accent: 'text-emerald-400',
    bgAccent: 'bg-emerald-500/10 border-emerald-500/30',
  },
  {
    number: '05',
    title: 'Discover Opportunities',
    description: 'Find relevant internships and jobs and track your applications.',
    icon: Award,
    accent: 'text-purple-400',
    bgAccent: 'bg-purple-500/10 border-purple-500/30',
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-slate-900/60 relative overflow-hidden border-y border-slate-800/80">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            Seamless Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            From <span className="text-gradient-accent">skills to opportunities</span>
          </h2>
          <p className="text-slate-400 text-base">
            A clear 5-step guided journey connecting what you learn today to where you want to be tomorrow.
          </p>
        </div>

        {/* Timeline Desktop horizontal / Mobile vertical flow */}
        <div className="relative">
          
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-500/40 via-sky-500/40 to-emerald-500/40 -translate-y-6 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="relative group">
                  
                  {/* Step Card */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 h-full flex flex-col justify-between">
                    
                    <div>
                      {/* Badge & Icon header */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-black font-mono text-slate-400 tracking-wider">
                          {step.number}
                        </span>
                        <div className={`w-10 h-10 rounded-xl border ${step.bgAccent} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${step.accent}`} />
                        </div>
                      </div>

                      <h3 className="text-base font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                        {step.title}
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Step indicator arrow for mobile */}
                    {idx < steps.length - 1 && (
                      <div className="lg:hidden flex justify-center pt-4 text-slate-400">
                        <ArrowDown className="w-4 h-4 animate-bounce" />
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
