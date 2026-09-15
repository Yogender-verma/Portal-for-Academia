import React, { useState, useEffect } from 'react';
import { 
  School, 
  GraduationCap, 
  TrendingUp, 
  Briefcase, 
  Award, 
  BarChart3,
  Download,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  fetchCollegeDashboard, 
  type CollegeDashboardData 
} from '../services/collegeApiService';

export const CollegeDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<CollegeDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCollegeDashboard(user?.uid);
      setData(res);
    } catch (err: any) {
      console.error('[CollegeDashboardPage] Error fetching dashboard data:', err);
      setError(err?.message || 'Failed to load college dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-xs font-semibold">Computing institutional skill & placement analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Dashboard Data Error</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">{error || 'Unable to connect to backend analytics server.'}</p>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const kpis = data.kpis;
  const readiness = data.readiness_overview;

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 rounded-2xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <School className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Institutional Placement & Analytics Portal</h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time PostgreSQL telemetry of student skills, industry demand gap, placement readiness, and corporate drives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/college/reports')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            <span>Generate Placement Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stats (6 Cards dynamically computed from DB) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Total Students</span>
            <GraduationCap className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-xl font-extrabold text-white block">{kpis.total_students}</span>
          <span className="text-[10px] text-slate-500 block">{kpis.profile_completion_pct}% Profile Completion</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Avg Readiness %</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl font-extrabold text-emerald-400 block">{kpis.avg_readiness_pct}%</span>
          <span className="text-[10px] text-slate-500 block">Avg Skill Score: {kpis.avg_skill_score}%</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Internship %</span>
            <Briefcase className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-xl font-extrabold text-white block">{kpis.internship_participation_pct}%</span>
          <span className="text-[10px] text-slate-500 block">{kpis.active_internship_opportunities} Active Opportunities</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Placement Ready</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-xl font-extrabold text-indigo-300 block">{kpis.students_placement_ready}</span>
          <span className="text-[10px] text-slate-500 block">Students &gt;= 75% Readiness</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Students Placed</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl font-extrabold text-white block">{kpis.students_placed}</span>
          <span className="text-[10px] text-slate-500 block">Placement Rate: {kpis.placement_rate_pct}%</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">Active Jobs</span>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-xl font-extrabold text-white block">{kpis.active_job_opportunities}</span>
          <span className="text-[10px] text-slate-500 block">Company Hiring Drives</span>
        </div>

      </div>

      {/* Career Readiness Distribution Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Institutional Career Readiness Breakdown
            </h3>
            <p className="text-xs text-slate-400">Categorization of student cohort based on technical & soft skill readiness benchmarks.</p>
          </div>
          <button
            onClick={() => navigate('/college/readiness')}
            className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300"
          >
            <span>Actionable Readiness List</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          
          <div 
            onClick={() => navigate('/college/students?readiness_category=Placement Ready')}
            className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1 cursor-pointer hover:border-emerald-500 transition-all"
          >
            <div className="flex justify-between items-center text-xs text-emerald-400 font-bold">
              <span>Placement Ready</span>
              <span>&gt;= 75% Score</span>
            </div>
            <span className="text-2xl font-extrabold text-white block">{readiness.ready}</span>
            <span className="text-[11px] text-slate-400 block">Ready for immediate recruitment</span>
          </div>

          <div 
            onClick={() => navigate('/college/students?readiness_category=Nearly Ready')}
            className="p-4 rounded-xl bg-sky-950/40 border border-sky-500/30 space-y-1 cursor-pointer hover:border-sky-500 transition-all"
          >
            <div className="flex justify-between items-center text-xs text-sky-400 font-bold">
              <span>Nearly Ready</span>
              <span>60% - 74% Score</span>
            </div>
            <span className="text-2xl font-extrabold text-white block">{readiness.nearly_ready}</span>
            <span className="text-[11px] text-slate-400 block">Needs minor skill fine-tuning</span>
          </div>

          <div 
            onClick={() => navigate('/college/students?readiness_category=Needs Improvement')}
            className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-1 cursor-pointer hover:border-amber-500 transition-all"
          >
            <div className="flex justify-between items-center text-xs text-amber-400 font-bold">
              <span>Needs Improvement</span>
              <span>45% - 59% Score</span>
            </div>
            <span className="text-2xl font-extrabold text-white block">{readiness.needs_improvement}</span>
            <span className="text-[11px] text-slate-400 block">Requires core skill training</span>
          </div>

          <div 
            onClick={() => navigate('/college/readiness')}
            className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-1 cursor-pointer hover:border-rose-500 transition-all"
          >
            <div className="flex justify-between items-center text-xs text-rose-400 font-bold">
              <span>High Priority</span>
              <span>&lt; 45% Score</span>
            </div>
            <span className="text-2xl font-extrabold text-white block">{readiness.high_priority}</span>
            <span className="text-[11px] text-slate-400 block">Needs targeted bootcamps</span>
          </div>

        </div>
      </div>

      {/* Department Wise Readiness & Skill Gap Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Readiness Table */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Department Skill Gap & Readiness
            </h3>
            <button 
              onClick={() => navigate('/college/skills')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {data.department_overview.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-white text-sm">{item.department}</span>
                  <span className="text-emerald-400 font-bold">{item.avg_readiness_pct}% Avg Readiness</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full" 
                    style={{ width: `${item.avg_readiness_pct}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{item.student_count} Students | {item.placement_rate_pct}% Placed</span>
                  <span className="text-amber-400 font-medium">Gap: {item.top_skill_gap}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Skill Demand Matrix */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Industry Demand vs. Student Coverage Matrix
            </h3>
            <button 
              onClick={() => navigate('/college/skills')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300"
            >
              Curriculum View
            </button>
          </div>

          <div className="space-y-3">
            {data.industry_skill_demand.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{item.skill}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-slate-400">Student: <strong className="text-slate-200">{item.student_coverage_pct}%</strong></span>
                    <span className="text-slate-400">Demand: <strong className="text-sky-400">{item.industry_demand_pct}%</strong></span>
                    {item.gap_pct > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                        -{item.gap_pct}% Gap
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        Sufficient
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                  <div className="bg-sky-500 h-full" style={{ width: `${item.student_coverage_pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
