import React from 'react';
import { 
  FileSearch, 
  BrainCircuit, 
  Target, 
  Compass, 
  Briefcase, 
  CheckSquare, 
  Award 
} from 'lucide-react';

interface FeatureItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  accentColor: string;
  iconBg: string;
}

const features: FeatureItem[] = [
  {
    id: 'resume-analysis',
    icon: FileSearch,
    title: 'AI Resume & Skill Analysis',
    description: 'Upload your resume and let AI identify and structure your skills, experience, projects, and relevant competencies.',
    accentColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'skill-profile',
    icon: BrainCircuit,
    title: 'Intelligent Skill Profile',
    description: 'Build a structured profile of your technical and professional skills instead of relying only on a traditional resume.',
    accentColor: 'text-sky-400',
    iconBg: 'bg-sky-500/10 border-sky-500/20',
  },
  {
    id: 'skill-gap',
    icon: Target,
    title: 'Skill Gap Analysis',
    description: 'Compare your current skills with the skills required for your target career role and clearly identify what you need to improve.',
    accentColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'career-roadmap',
    icon: Compass,
    title: 'Personalized Career Roadmap',
    description: 'Get a prioritized learning roadmap based on your current skills and career goals.',
    accentColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'internship-matching',
    icon: Briefcase,
    title: 'Internship & Job Matching',
    description: 'Discover opportunities that match your actual skills and career goals.',
    accentColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    id: 'application-tracking',
    icon: CheckSquare,
    title: 'Application Tracking',
    description: 'Track the opportunities you apply to and monitor your application progress.',
    accentColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    id: 'digital-portfolio',
    icon: Award,
    title: 'Digital Skill Portfolio',
    description: 'Create a verified, structured digital profile that showcases your skills, projects, achievements, and career readiness.',
    accentColor: 'text-teal-400',
    iconBg: 'bg-teal-500/10 border-teal-500/20',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
            Core Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Everything you need to become <span className="text-indigo-400">industry-ready</span>
          </h2>
          <p className="text-slate-400 text-base">
            Designed to bridge the gap between academic education and industry performance expectations.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const isWide = idx === features.length - 1; // Last item spans 1 column on wide grid or centers nicely

            return (
              <div
                key={feature.id}
                className={`glass-card p-6 rounded-2xl relative group overflow-hidden flex flex-col justify-between ${
                  isWide ? 'lg:col-span-3 lg:max-w-md lg:mx-auto w-full' : ''
                }`}
              >
                {/* Accent glow line on top hover */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  <div className={`w-12 h-12 rounded-xl border ${feature.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${feature.accentColor}`} />
                  </div>

                  <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">SIH 26044 Module</span>
                  <span className="text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Planned Feature →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
