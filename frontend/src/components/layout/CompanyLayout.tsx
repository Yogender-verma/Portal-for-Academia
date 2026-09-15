import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { CompanySidebar } from './CompanySidebar';
import { CompanyHeader } from './CompanyHeader';

export const CompanyLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* Company Portal Sidebar */}
      <CompanySidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <CompanyHeader onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
