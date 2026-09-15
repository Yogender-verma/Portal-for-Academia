import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentSidebar } from '../components/layout/StudentSidebar';
import { StudentHeader } from '../components/layout/StudentHeader';
import { OverviewCards } from '../components/dashboard/OverviewCards';
import { SkillProfileCard } from '../components/dashboard/SkillProfileCard';
import { SkillGapsCard } from '../components/dashboard/SkillGapsCard';
import { SkillGapAnalysisView } from '../components/dashboard/SkillGapAnalysisView';
import { CareerRoadmapView } from '../components/dashboard/CareerRoadmapView';
import { MatchedOpportunities } from '../components/dashboard/MatchedOpportunities';
import { TrackingAndAnalytics } from '../components/dashboard/TrackingAndAnalytics';

// Profile Section Components
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard';
import { PersonalInfoSection } from '../components/profile/PersonalInfoSection';
import { AcademicInfoSection } from '../components/profile/AcademicInfoSection';
import { TechnicalSkillsSection } from '../components/profile/TechnicalSkillsSection';
import { SoftSkillsSection } from '../components/profile/SoftSkillsSection';
import { ProjectsSection } from '../components/profile/ProjectsSection';
import { CertificationsSection } from '../components/profile/CertificationsSection';
import { AchievementsSection } from '../components/profile/AchievementsSection';
import { ExperienceSection } from '../components/profile/ExperienceSection';
import { ResumeSection } from '../components/profile/ResumeSection';
import { CareerPreferencesSection } from '../components/profile/CareerPreferencesSection';
import { LanguagesSection } from '../components/profile/LanguagesSection';

import { 
  Briefcase, 
  Building2, 
  Sparkles
} from 'lucide-react';
import { StudentCompilerPage } from './StudentCompilerPage';

interface StudentDashboardProps {
  initialTab?: string;
  standalone?: boolean;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ initialTab = 'dashboard', standalone = false }) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [focusedSkill, setFocusedSkill] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleNavigateTab = (tab: string, skill?: string) => {
    setActiveTab(tab);
    if (skill) {
      setFocusedSkill(skill);
    }

    switch (tab) {
      case 'skill-gaps':
        navigate('/student/skill-gap');
        break;
      case 'career-roadmap':
        navigate('/student/roadmap');
        break;
      case 'internships':
      case 'internships-matched':
      case 'internships-applied':
      case 'internships-selected':
      case 'internships-rejected':
        navigate('/student/internships');
        break;
      case 'jobs':
      case 'jobs-matched':
      case 'jobs-applied':
      case 'jobs-selected':
      case 'jobs-rejected':
        navigate('/student/jobs');
        break;
      case 'compiler':
      case 'assessments':
        navigate('/student/compiler');
        break;
      case 'progress':
        navigate('/student/progress');
        break;
      case 'profile':
        navigate('/student/profile');
        break;
      case 'dashboard':
        navigate('/student/dashboard');
        break;
      default:
        break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mainContent = (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* TAB 1: MAIN DASHBOARD HUB — ONLY LEVEL 1, SKILL PROFILE, & TOP GAPS */}
      {(activeTab === 'dashboard' || activeTab === 'dashboard') && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Current Student Level & Metrics */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Current Student Status & Level
              </h2>
              <span className="text-xs text-slate-400 font-mono">Live SIH 26044 Data</span>
            </div>
            <OverviewCards onNavigateTab={handleNavigateTab} />
          </section>

          {/* Skill Profile & Top Skill Gaps Side-by-Side */}
          <section className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkillProfileCard onNavigateTab={handleNavigateTab} />
              <SkillGapsCard onNavigateTab={handleNavigateTab} />
            </div>
          </section>

        </div>
      )}

      {/* TAB 2: SKILL GAP ANALYSIS */}
      {activeTab === 'skill-gaps' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <SkillGapAnalysisView onNavigateTab={handleNavigateTab} />
        </div>
      )}

      {/* TAB 3: CAREER ROADMAP */}
      {activeTab === 'career-roadmap' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <CareerRoadmapView onNavigateTab={handleNavigateTab} initialFocusedSkill={focusedSkill} />
        </div>
      )}

      {/* TAB 4: INTERNSHIPS VIEWS */}
      {activeTab.startsWith('internships') && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Horizontal Sub-Section Filter Tabs (Top Matched, Applied, Selected, Rejected) */}
          <div className="glass-panel p-3 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between px-3 pt-2">
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white tracking-tight">Internships</h2>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                {activeTab === 'internships-applied' ? '2 Applied' : activeTab === 'internships-selected' ? '1 Selected & Worked' : activeTab === 'internships-rejected' ? '1 Rejected' : '5 Top Matched'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('internships-matched')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'internships-matched' || activeTab === 'internships'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Top Matched
              </button>

              <button
                onClick={() => setActiveTab('internships-applied')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'internships-applied'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                Applied
              </button>

              <button
                onClick={() => setActiveTab('internships-selected')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'internships-selected'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Selected & Worked
              </button>

              <button
                onClick={() => setActiveTab('internships-rejected')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'internships-rejected'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Rejected
              </button>
            </div>
          </div>

          <MatchedOpportunities onNavigateTab={handleNavigateTab} filterTab={activeTab} />
        </div>
      )}

      {/* TAB 5: JOBS VIEWS */}
      {activeTab.startsWith('jobs') && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Horizontal Sub-Section Filter Tabs (Top Matched, Applied, Selected, Rejected) */}
          <div className="glass-panel p-3 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between px-3 pt-2">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-sky-400" />
                <h2 className="text-base font-bold text-white tracking-tight">Jobs</h2>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
                {activeTab === 'jobs-applied' ? '2 Applied' : activeTab === 'jobs-selected' ? '1 Selected & Worked' : activeTab === 'jobs-rejected' ? '1 Rejected' : '5 Top Matched'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('jobs-matched')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'jobs-matched' || activeTab === 'jobs'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Top Matched
              </button>

              <button
                onClick={() => setActiveTab('jobs-applied')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'jobs-applied'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                Applied
              </button>

              <button
                onClick={() => setActiveTab('jobs-selected')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'jobs-selected'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Selected & Worked
              </button>

              <button
                onClick={() => setActiveTab('jobs-rejected')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'jobs-rejected'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Rejected
              </button>
            </div>
          </div>

          <MatchedOpportunities onNavigateTab={handleNavigateTab} filterTab={activeTab} />
        </div>
      )}

      {/* TAB 6: CODE COMPILER & SKILL ASSESSMENT LAB */}
      {(activeTab === 'compiler' || activeTab === 'assessments') && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <StudentCompilerPage />
        </div>
      )}

      {/* TAB 7: TRACKING & APPLICATIONS */}
      {activeTab === 'progress' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <TrackingAndAnalytics onNavigateTab={handleNavigateTab} />
        </div>
      )}

      {/* TAB 8: FULL STUDENT PROFILE (11 PERSISTENT SECTIONS) */}
      {(activeTab === 'profile' || activeTab === 'skills') && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <ProfileHeaderCard />
          <PersonalInfoSection />
          <AcademicInfoSection />
          <TechnicalSkillsSection />
          <SoftSkillsSection />
          <ProjectsSection />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CertificationsSection />
            <AchievementsSection />
          </div>
          <ExperienceSection />
          <ResumeSection />
          <CareerPreferencesSection />
          <LanguagesSection />
        </div>
      )}
    </div>
  );

  if (!standalone) {
    return mainContent;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row selection:bg-indigo-600 selection:text-white">
      
      {/* 1. Left Fixed Sidebar */}
      <StudentSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Mobile backdrop overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* 2. Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <StudentHeader 
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          onNavigateTab={handleNavigateTab}
        />

        {/* Dynamic Body Content based on activeTab */}
        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {mainContent}
        </main>
      </div>

    </div>
  );
};
