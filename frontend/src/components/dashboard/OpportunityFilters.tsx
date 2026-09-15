import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface OpportunityFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  opportunityType: 'all' | 'internship' | 'job';
  setOpportunityType: (t: 'all' | 'internship' | 'job') => void;
  workModeFilter: string;
  setWorkModeFilter: (w: string) => void;
  sourceFilter: string;
  setSourceFilter: (s: string) => void;
  minMatchFilter: number;
  setMinMatchFilter: (m: number) => void;
  sortBy: string;
  setSortBy: (sb: string) => void;
  onRefreshAgent: () => void;
  isSearching: boolean;
  targetRole?: string;
}

export const OpportunityFilters: React.FC<OpportunityFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  opportunityType,
  setOpportunityType,
  workModeFilter,
  setWorkModeFilter,
  sourceFilter,
  setSourceFilter,
  minMatchFilter,
  setMinMatchFilter,
  sortBy,
  setSortBy,
  onRefreshAgent,
  isSearching
}) => {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
      
      {/* Top Bar: Search Input, Type Toggle & Refresh Agent Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role title, company, required skill (e.g. React, Python, Remote)..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Opportunity Type Pill Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setOpportunityType('all')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              opportunityType === 'all' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Opportunities
          </button>
          <button
            onClick={() => setOpportunityType('internship')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              opportunityType === 'internship' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Internships
          </button>
          <button
            onClick={() => setOpportunityType('job')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              opportunityType === 'job' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Full-Time Jobs
          </button>
        </div>

        {/* Refresh AI Agent Button */}
        <button
          onClick={onRefreshAgent}
          disabled={isSearching}
          className="px-4 py-2.5 bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
          <span>{isSearching ? 'Searching Sources...' : 'Refresh AI Agent'}</span>
        </button>

      </div>

      {/* Second Row: Detailed Filters (Work Mode, Source, Match %, Sort By) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
        
        {/* Work Mode */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Work Mode
          </label>
          <select
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Modes</option>
            <option value="remote">Remote Only</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </div>

        {/* Source Platform */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Platform Source
          </label>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Platforms</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Indeed">Indeed</option>
            <option value="Internshala">Internshala</option>
            <option value="Naukri">Naukri</option>
            <option value="Wellfound">Wellfound</option>
            <option value="Glassdoor">Glassdoor</option>
            <option value="RemoteOK">RemoteOK</option>
          </select>
        </div>

        {/* Minimum Skill Match % */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Min Skill Match %
          </label>
          <select
            value={minMatchFilter}
            onChange={(e) => setMinMatchFilter(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value={0}>All Matches</option>
            <option value={50}>50%+ Match</option>
            <option value={75}>75%+ Match</option>
            <option value={100}>100% Fully Matched</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="match">Highest Skill Match %</option>
            <option value="latest">Latest Posted</option>
            <option value="company">Company Name (A-Z)</option>
          </select>
        </div>

      </div>
    </div>
  );
};
