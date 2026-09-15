import React from 'react';
import { Layers, Sliders, Building2, Workflow } from 'lucide-react';

interface Pillar {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const pillars: Pillar[] = [
  {
    title: 'Skill-first',
    subtitle: 'Deep Competency Extraction',
    description: 'Move beyond simply matching keywords in resumes. Understand actual capability levels, projects, and normalized technical skill vectors.',
    icon: Layers,
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    title: 'Personalized',
    subtitle: 'Tailored Learning Paths',
    description: 'Recommendations are based directly on the student’s current skill profile and target career role rather than generic coursework.',
    icon: Sliders,
    color: 'from-sky-500 to-sky-600',
  },
  {
    title: 'Industry-aligned',
    subtitle: 'Real Employer Expectations',
    description: 'Career preparation is connected directly to skill requirements defined by industry partners and active career benchmarks.',
    icon: Building2,
    color: 'from-amber-500 to-amber-600',
  },
  {
    title: 'One connected journey',
    subtitle: 'Unified Student Ecosystem',
    description: 'Skills, gap intelligence, learning roadmaps, opportunities, and application tracking exist in one seamless, collaborative platform.',
    icon: Workflow,
    color: 'from-emerald-500 to-emerald-600',
  },
];

export const WhySkillBridgeSection: React.FC = () => {
  return (
    <section id="why-skillbridge" className="py-20 md:py-28 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              The Differentiator
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Why <span className="text-indigo-400">SkillBridge</span> is Built Differently
            </h2>

            <p className="text-slate-400 text-base leading-relaxed">
              Traditional job portals match superficial text keywords. SkillBridge focuses on the underlying intelligence: what you actually know, what industry requires, and what exact steps bridge the gap.
            </p>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2">
              <span className="font-semibold text-white block">Product Principle:</span>
              <p className="italic text-slate-400">
                "Not another generic internship job portal. An AI-powered bridge between student capabilities and industry skill requirements."
              </p>
            </div>
          </div>

          {/* Right Column Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={pillar.title} 
                  className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${pillar.color} flex items-center justify-center text-white shadow-md mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block mb-1">
                    {pillar.subtitle}
                  </span>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
