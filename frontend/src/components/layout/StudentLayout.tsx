import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';

export const StudentLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL pathname
  const getActiveTabFromPath = (pathname: string): string => {
    if (pathname.includes('/student/skill-gap')) return 'skill-gaps';
    if (pathname.includes('/student/roadmap')) return 'career-roadmap';
    if (pathname.includes('/student/internships')) return 'internships';
    if (pathname.includes('/student/jobs')) return 'jobs';
    if (pathname.includes('/student/compiler')) return 'compiler';
    if (pathname.includes('/student/progress')) return 'progress';
    if (pathname.includes('/student/profile')) return 'profile';
    return 'dashboard';
  };

  const activeTab = getActiveTabFromPath(location.pathname);

  const handleSetActiveTab = (tabId: string) => {
    switch (tabId) {
      case 'skill-gaps':
        navigate('/student/skill-gap');
        break;
      case 'career-roadmap':
        navigate('/student/roadmap');
        break;
      case 'internships':
        navigate('/student/internships');
        break;
      case 'jobs':
        navigate('/student/jobs');
        break;
      case 'compiler':
        navigate('/student/compiler');
        break;
      case 'progress':
        navigate('/student/progress');
        break;
      case 'profile':
        navigate('/student/profile');
        break;
      default:
        navigate('/student/dashboard');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* Student Portal Sidebar */}
      <StudentSidebar 
        activeTab={activeTab} 
        setActiveTab={handleSetActiveTab} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      {/* Main Content Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <StudentHeader 
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} 
          onNavigateTab={handleSetActiveTab}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
