import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRole?: UserRole;
}

export const getRoleDashboard = (role?: UserRole): string => {
  if (role === 'company') return '/company/dashboard';
  if (role === 'college') return '/college/dashboard';
  return '/student/dashboard';
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  allowedRole
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium">Verifying authentication portal...</p>
      </div>
    );
  }

  // 1. Unauthenticated users trying to access protected routes -> send to /login
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Authenticated users trying to access auth pages (/login, /signin, /signup) -> redirect to their role dashboard
  if (!requireAuth && user) {
    return <Navigate to={getRoleDashboard(user.role)} replace />;
  }

  // 3. Authenticated users trying to access a portal belonging to another role -> redirect to their role dashboard
  if (requireAuth && user && allowedRole && user.role !== allowedRole) {
    return <Navigate to={getRoleDashboard(user.role)} replace />;
  }

  return <>{children}</>;
};

