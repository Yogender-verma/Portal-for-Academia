import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';

export const ProductPreviewSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gap' | 'roadmap'>('overview');

  return (
    <section className="py-20 md:py-28 bg-slate-900/40 relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-semibold">
            Product Preview
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Designed for <span className="text-gradient-accent">clarity & progress</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            An intuitive student portal interface designed to simplify skill analysis and career planning.
          </p>
        </div>

        {/* Mock Interface Container */}
        <div className="glass-panel rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-w-5xl mx-auto">
          
          {/* Top Bar / App Header */}
          <div className="bg-slate-950/90 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                SB
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Student Portal — Preview Mode</h4>
                <p className="text-[11px] text-slate-400">Target Role: <span className="text-indigo-400 font-medium">Software Engineer</span></p>
              </div>
            </div>

            {/* Interactive Preview Tabs */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Skill Overview
              </button>
              <button
                onClick={() => setActiveTab('gap')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeTab === 'gap' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Skill Gap Analysis
              </button>
              <button
                onClick={() => setActiveTab('roadmap')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeTab === 'roadmap' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Learning Roadmap
              </button>
            </div>
          </div>

          {/* Main Dashboard Preview Content */}
          <div className="p-6 sm:p-8 bg-slate-950/60">
            
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Match Score Card */}
                <div className="md:col-span-4 bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Target Role Match</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white">78%</span>
                    <span className="text-xs text-emerald-400 font-medium">+12% this month</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full w-[78%]" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Good match for Software Engineer entry roles. 3 key competencies need prioritization.
                  </p>
                </div>

                {/* Skill Ratings Progress */}
                <div className="md:col-span-8 bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Extracted Skill Profile vs Role Thresholds
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-200 font-medium">Python Programming</span>
                        <span className="text-emerald-400 font-mono">80% (Required 70%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[80%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-200 font-medium">React.js</span>
                        <span className="text-emerald-400 font-mono">70% (Required 60%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[70%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-200 font-medium">Data Structures & Algorithms (DSA)</span>
                        <span className="text-amber-400 font-mono">30% (Required 80%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full w-[30%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-200 font-medium">System Design</span>
                        <span className="text-red-400 font-mono">20% (Required 60%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full w-[20%]" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'gap' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-semibold text-white">Prioritized Skill Gap Matrix</h4>
                  <span className="text-slate-400">Target Role: Software Engineer</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* High Priority Gap */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-red-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded">High Priority</span>
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </div>
                    <h5 className="text-sm font-semibold text-white">DSA & Problem Solving</h5>
                    <p className="text-xs text-slate-400">Current: 30% | Required: 80%</p>
                    <p className="text-[11px] text-slate-400">Gap delta: -50% in graph algorithms & tree traversals.</p>
                  </div>

                  {/* High Priority Gap 2 */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-red-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded">High Priority</span>
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </div>
                    <h5 className="text-sm font-semibold text-white">System Design Basics</h5>
                    <p className="text-xs text-slate-400">Current: 20% | Required: 60%</p>
                    <p className="text-[11px] text-slate-400">Gap delta: -40% in API caching, REST standards & SQL schema design.</p>
                  </div>

                  {/* Medium Priority Gap */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Medium Priority</span>
                      <Target className="w-4 h-4 text-amber-400" />
                    </div>
                    <h5 className="text-sm font-semibold text-white">SQL Database Queries</h5>
                    <p className="text-xs text-slate-400">Current: 40% | Required: 70%</p>
                    <p className="text-[11px] text-slate-400">Gap delta: -30% in complex joins & indexing.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'roadmap' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-semibold text-white">AI-Generated 4-Week Career Action Plan</h4>
                  <span className="text-indigo-400 font-mono">Personalized for User</span>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        W1
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-white">Week 1–2: DSA Fundamentals & Trees</h5>
                        <p className="text-[11px] text-slate-400">Focus: LeetCode arrays, binary trees, recursion patterns</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded font-medium">In Progress</span>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                        W3
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-white">Week 3: Advanced SQL & Query Optimization</h5>
                        <p className="text-[11px] text-slate-400">Focus: PostgreSQL indexing, aggregation & joins</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-medium">Up Next</span>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                        W4
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-white">Week 4: System Design & REST Architecture</h5>
                        <p className="text-[11px] text-slate-400">Focus: Microservices, database sharding & API specs</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-medium">Up Next</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};
