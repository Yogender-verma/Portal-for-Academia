import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: 'what-is-skillbridge',
    question: 'What is SkillBridge?',
    answer: 'SkillBridge is a platform designed to connect academic learning with industry expectations by helping students understand their skills, identify skill gaps, prepare for career roles, and discover relevant opportunities.',
  },
  {
    id: 'how-analyze-skills',
    question: 'How does the platform analyze my skills?',
    answer: 'The platform will use AI to analyze information from your resume and profile and convert it into a structured skill profile with normalized technical capabilities.',
  },
  {
    id: 'need-resume',
    question: 'Do I need a resume to use the platform?',
    answer: 'A resume will provide richer information for analysis, but the platform can progressively build a student\'s profile from manually declared competencies, coursework, and projects as well.',
  },
  {
    id: 'how-gap-calculated',
    question: 'How is my skill gap calculated?',
    answer: 'The platform compares the student\'s current skill profile with the skills and competencies required for the selected target career role or specific industry opportunity.',
  },
  {
    id: 'find-internships',
    question: 'Can I find internships through the platform?',
    answer: 'Yes. The planned platform will match students with internships and jobs based on their skills, career goals, and opportunity requirements.',
  },
  {
    id: 'only-students',
    question: 'Is this only for students?',
    answer: 'The platform is designed as a broader academia-industry collaboration system. Students are the first portal we are implementing, with industry and academic modules planned for later phases.',
  },
  {
    id: 'guarantee-job',
    question: 'Will the platform guarantee a job or internship?',
    answer: 'No. The platform provides skill intelligence, preparation guidance, and opportunity matching. Selection decisions remain with the organization offering the opportunity.',
  },
];

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('what-is-skillbridge');

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-slate-950 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Got questions? We have answers.
          </h2>
          <p className="text-slate-400 text-base">
            Everything you need to know about SkillBridge and how it helps students prepare for industry roles.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div 
                key={faq.id}
                className={`glass-card rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-indigo-500/40 bg-slate-900/80 shadow-lg shadow-indigo-950/20' : 'border-slate-800/80'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-white hover:text-indigo-300 transition-colors">
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-300 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-indigo-600 text-white' : ''
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
