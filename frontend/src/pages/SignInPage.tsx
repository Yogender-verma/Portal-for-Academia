import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboard } from '../components/auth/ProtectedRoute';
import { 
  Compass, 
  Loader2, 
  AlertCircle, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  GraduationCap,
  Building2,
  School
} from 'lucide-react';

type UserRole = 'student' | 'company' | 'college';

export const SignInPage: React.FC = () => {
  const { login, loginWithGoogle, error, clearError, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const roleConfig = {
    student: {
      label: 'Student',
      tagline: 'Student Portal',
      description: 'Access your skill profile, gap analysis & career learning roadmaps.',
      accent: 'bg-indigo-600 border-indigo-500'
    },
    company: {
      label: 'Company',
      tagline: 'Industry / Company Portal',
      description: 'Post job opportunities, review candidate scores & hire top talent.',
      accent: 'bg-sky-600 border-sky-500'
    },
    college: {
      label: 'College',
      tagline: 'College / Academia Portal',
      description: 'Track student placement analytics & industry partnerships.',
      accent: 'bg-emerald-600 border-emerald-500'
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError(null);
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!formData.password) {
      setFormError('Please enter your password.');
      return;
    }

    try {
      setSubmitting(true);
      await login({
        email: formData.email.trim(),
        password: formData.password,
      }, selectedRole);
      navigate(getRoleDashboard(selectedRole), { replace: true });
    } catch (err: any) {
      // Error handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (clearError) clearError();
    try {
      setGoogleSubmitting(true);
      await loginWithGoogle(selectedRole);
      navigate(getRoleDashboard(selectedRole), { replace: true });
    } catch (err: any) {
      // Handled in context
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative glow-gradient">
      
      {/* Top Brand Link */}
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">SkillBridge</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6 pt-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-slate-400">
            Sign in to your SkillBridge account portal.
          </p>

          {isDemoMode && (
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium">
              Demo Auth Active (Instant Sign In Preview)
            </div>
          )}
        </div>

        {/* Card Form */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          
          {/* Role Selection Tabs (3 Options: Student, Company, College) */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
              Select Account Type
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('student');
                  if (error) clearError();
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-medium transition-all ${
                  selectedRole === 'student'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('company');
                  if (error) clearError();
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-medium transition-all ${
                  selectedRole === 'company'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Company</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('college');
                  if (error) clearError();
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-medium transition-all ${
                  selectedRole === 'college'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <School className="w-4 h-4 shrink-0" />
                <span>College</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
              <span className="text-xs font-semibold text-slate-200">
                {roleConfig[selectedRole].tagline}
              </span>
              <p className="text-[11px] text-slate-400 leading-normal">
                {roleConfig[selectedRole].description}
              </p>
            </div>
          </div>

          {(formError || error) && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{formError || error}</span>
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={selectedRole === 'company' ? 'recruiter@company.com' : selectedRole === 'college' ? 'admin@university.edu' : 'student@university.edu'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Email Sign In Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || googleSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as {roleConfig[selectedRole].label} with Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-950 px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase absolute">
              OR
            </span>
          </div>

          {/* Google Sign-In Primary Action Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting || googleSubmitting}
              className="w-full flex items-center justify-center gap-3 py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl border border-slate-700 shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {googleSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  <span className="text-sm">Connecting to Google...</span>
                </>
              ) : (
                <>
                  {/* Colorful Google SVG Logo */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>

                  <span className="text-sm font-semibold">
                    Sign In as {roleConfig[selectedRole].label} with Google
                  </span>
                  
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Footer Navigation Link */}
          <div className="pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account yet?{' '}
              <Link to="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Sign Up
              </Link>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};



