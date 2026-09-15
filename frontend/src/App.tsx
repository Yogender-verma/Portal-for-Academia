import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StudentProfileProvider } from './context/StudentProfileContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
// Student Portal Components
import { StudentLayout } from './components/layout/StudentLayout';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentProfilePage } from './pages/StudentProfilePage';

// Company Portal Components
import { CompanyLayout } from './components/layout/CompanyLayout';
import { CompanyDashboardPage } from './pages/CompanyDashboardPage';
import { 
  PostOpportunityPage, 
  MyOpportunitiesPage, 
  ApplicantsPage, 
  TopTalentInternshipsPage, 
  TopTalentJobsPage, 
  InterviewsPage, 
  CompanyProfilePage 
} from './pages/CompanyPortalPages';

// College Portal Components
import { CollegeLayout } from './components/layout/CollegeLayout';
import { CollegeDashboardPage } from './pages/CollegeDashboardPage';
import { 
  CollegeStudentsPage, 
  CollegeSkillAnalyticsPage, 
  CollegeInternshipsPage, 
  CollegePlacementsPage, 
  CollegeIndustryPage, 
  CollegeCareerReadinessPage,
  CollegeReportsPage, 
  CollegeProfilePage 
} from './pages/CollegePortalPages';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <StudentProfileProvider>
        <Router>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Unauthenticated Auth Routes */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <SignInPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/signin" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <SignInPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <SignUpPage />
                </ProtectedRoute>
              } 
            />

            {/* 1. Protected Student Portal Routes (/student/*) */}
            <Route 
              path="/student" 
              element={
                <ProtectedRoute requireAuth={true} allowedRole="student">
                  <StudentLayout />
                </ProtectedRoute>
              } 
            >
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard initialTab="dashboard" />} />
              <Route path="skill-gap" element={<StudentDashboard initialTab="skill-gaps" />} />
              <Route path="roadmap" element={<StudentDashboard initialTab="career-roadmap" />} />
              <Route path="internships" element={<StudentDashboard initialTab="internships" />} />
              <Route path="jobs" element={<StudentDashboard initialTab="jobs" />} />
              <Route path="compiler" element={<StudentDashboard initialTab="compiler" />} />
              <Route path="progress" element={<StudentDashboard initialTab="progress" />} />
              <Route path="profile" element={<StudentProfilePage />} />
              <Route path="settings" element={<StudentDashboard initialTab="settings" />} />
              <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
            </Route>

            {/* 2. Protected Company Portal Routes (/company/*) */}
            <Route 
              path="/company" 
              element={
                <ProtectedRoute requireAuth={true} allowedRole="company">
                  <CompanyLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/company/dashboard" replace />} />
              <Route path="dashboard" element={<CompanyDashboardPage />} />
              <Route path="post-opportunity" element={<PostOpportunityPage />} />
              <Route path="opportunities" element={<MyOpportunitiesPage />} />
              <Route path="applicants" element={<ApplicantsPage />} />
              <Route path="top-talent/internships" element={<TopTalentInternshipsPage />} />
              <Route path="top-talent/jobs" element={<TopTalentJobsPage />} />
              {/* Backward compat redirects */}
              <Route path="top-applicants/internships" element={<Navigate to="/company/top-talent/internships" replace />} />
              <Route path="top-applicants/jobs" element={<Navigate to="/company/top-talent/jobs" replace />} />
              <Route path="interviews" element={<InterviewsPage />} />
              <Route path="profile" element={<CompanyProfilePage />} />
              <Route path="*" element={<Navigate to="/company/dashboard" replace />} />
            </Route>

            {/* 3. Protected College Portal Routes (/college/*) */}
            <Route 
              path="/college" 
              element={
                <ProtectedRoute requireAuth={true} allowedRole="college">
                  <CollegeLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/college/dashboard" replace />} />
              <Route path="dashboard" element={<CollegeDashboardPage />} />
              <Route path="students" element={<CollegeStudentsPage />} />
              <Route path="skills" element={<CollegeSkillAnalyticsPage />} />
              <Route path="internships" element={<CollegeInternshipsPage />} />
              <Route path="placements" element={<CollegePlacementsPage />} />
              <Route path="industry" element={<CollegeIndustryPage />} />
              <Route path="companies" element={<Navigate to="/college/industry" replace />} />
              <Route path="readiness" element={<CollegeCareerReadinessPage />} />
              <Route path="reports" element={<CollegeReportsPage />} />
              <Route path="profile" element={<CollegeProfilePage />} />
              <Route path="*" element={<Navigate to="/college/dashboard" replace />} />
            </Route>

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </StudentProfileProvider>
    </AuthProvider>
  );
};

export default App;

