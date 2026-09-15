import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                SkillBridge
              </span>
            </Link>
            
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Connecting student skills with industry opportunities. Built for Smart India Hackathon 2026 (Problem Statement SIH 26044).
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-400">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Academia-Industry Portal
              </span>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#why-skillbridge" className="hover:text-indigo-400 transition-colors">Why SkillBridge</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-indigo-400 transition-colors">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Students Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Students
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/student/dashboard" className="hover:text-indigo-400 transition-colors">Skill Profile</Link>
              </li>
              <li>
                <Link to="/student/dashboard" className="hover:text-indigo-400 transition-colors">Skill Gap Analysis</Link>
              </li>
              <li>
                <Link to="/student/dashboard" className="hover:text-indigo-400 transition-colors">Career Roadmap</Link>
              </li>
              <li>
                <Link to="/student/dashboard" className="hover:text-indigo-400 transition-colors">Opportunities</Link>
              </li>
            </ul>
          </div>

          {/* Platform & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Platform & Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-slate-400 cursor-default">SIH 26044 Module</span>
              </li>
              <li>
                <span className="text-slate-400 cursor-default">Privacy Policy (Placeholder)</span>
              </li>
              <li>
                <span className="text-slate-400 cursor-default">Terms of Service (Placeholder)</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 SkillBridge. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>SIH 2026 Academia-Industry Collaboration Project</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
