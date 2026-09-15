import React, { useState } from 'react';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard';
import { PersonalInfoSection } from '../components/profile/PersonalInfoSection';
import { AboutMeSection } from '../components/profile/AboutMeSection';
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
import { User, GraduationCap, Code, FolderGit2, Award, Briefcase, FileText, Target, Globe, AlignLeft } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    if (id === 'all') return;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navTabs = [
    { id: 'all', label: 'All Sections', icon: User },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'aboutme', label: 'About Me', icon: AlignLeft },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'skills', label: 'Technical Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'preferences', label: 'Career Preferences', icon: Target },
    { id: 'languages', label: 'Languages', icon: Globe },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Main Hero Header Card */}
      <ProfileHeaderCard />

      {/* Quick Sub-Navigation Tabs Bar */}
      <div className="sticky top-16 z-20 bg-slate-950/90 backdrop-blur-md py-3 border-y border-slate-800/80 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sections Hierarchy */}
      <div className="space-y-8">
        <div id="personal">
          <PersonalInfoSection />
        </div>

        <div id="aboutme">
          <AboutMeSection />
        </div>

        <div id="academic">
          <AcademicInfoSection />
        </div>

        <div id="skills" className="space-y-8">
          <TechnicalSkillsSection />
          <SoftSkillsSection />
        </div>

        <div id="projects">
          <ProjectsSection />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div id="certifications">
            <CertificationsSection />
          </div>
          <div id="achievements">
            <AchievementsSection />
          </div>
        </div>

        <div id="experience">
          <ExperienceSection />
        </div>

        <div id="resume">
          <ResumeSection onNavigateSection={scrollToSection} />
        </div>

        <div id="preferences">
          <CareerPreferencesSection />
        </div>

        <div id="languages">
          <LanguagesSection />
        </div>
      </div>
    </div>
  );
};

