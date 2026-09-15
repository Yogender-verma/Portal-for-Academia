import React, { useState } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import type { AcademicInfo } from '../../types/profile';
import { GraduationCap, Award, BookOpen, Calendar, Building2, Edit3, Save, X } from 'lucide-react';

export const AcademicInfoSection: React.FC = () => {
  const { profile, updateAcademicInfo } = useStudentProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AcademicInfo>(profile.academicInfo);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = () => {
    setFormData(profile.academicInfo);
    setErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(profile.academicInfo);
    setErrors({});
    setIsEditing(false);
  };

  const formatScore = (scoreStr?: string) => {
    if (!scoreStr || !scoreStr.trim()) return '—';
    const num = parseFloat(scoreStr);
    if (isNaN(num)) return scoreStr;
    if (num <= 10) {
      return `${num} CGPA`;
    }
    return `${num}%`;
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.college.trim()) errs.college = 'College/University is required.';
    if (!formData.degree.trim()) errs.degree = 'Degree is required.';
    if (!formData.branch.trim()) errs.branch = 'Branch is required.';

    if (formData.cgpa) {
      const val = parseFloat(formData.cgpa);
      if (isNaN(val) || val < 0 || val > 10) {
        errs.cgpa = 'CGPA must be between 0 and 10.';
      }
    }

    if (formData.tenthPercentage) {
      const val = parseFloat(formData.tenthPercentage);
      if (isNaN(val) || val < 0 || val > 100) {
        errs.tenthPercentage = 'Marks must be between 0 and 100.';
      }
    }

    if (formData.twelfthPercentage) {
      const val = parseFloat(formData.twelfthPercentage);
      if (isNaN(val) || val < 0 || val > 100) {
        errs.twelfthPercentage = 'Marks must be between 0 and 100.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const success = await updateAcademicInfo(formData);
    setIsSubmitting(false);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Academic Information</h2>
            <p className="text-xs text-slate-400">College, Degree, CGPA & Class 10th / 12th scores</p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" /> Edit Details
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        /* READ ONLY VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" /> College / Institution
            </span>
            <p className="text-sm font-semibold text-white">{profile.academicInfo.college || '—'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" /> Degree & Branch
            </span>
            <p className="text-sm font-semibold text-white">
              {profile.academicInfo.degree || profile.academicInfo.branch
                ? `${profile.academicInfo.degree || ''} ${profile.academicInfo.branch ? '(' + profile.academicInfo.branch + ')' : ''}`
                : '—'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" /> Current Year / Semester
            </span>
            <p className="text-sm font-semibold text-white">
              {profile.academicInfo.currentYear || profile.academicInfo.currentSemester
                ? `${profile.academicInfo.currentYear || ''} • ${profile.academicInfo.currentSemester || ''}`
                : '—'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-500" /> Current CGPA
            </span>
            <p className="text-base font-extrabold text-emerald-400">
              {profile.academicInfo.cgpa ? `${profile.academicInfo.cgpa} / 10.0` : '—'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Expected Graduation
            </span>
            <p className="text-sm font-semibold text-white">{profile.academicInfo.graduationYear || '—'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400">Class 10th & 12th Marks</span>
            <p className="text-sm font-semibold text-white">
              10th: <span className="text-cyan-400 font-mono">{formatScore(profile.academicInfo.tenthPercentage)}</span> | 12th:{' '}
              <span className="text-cyan-400 font-mono">{formatScore(profile.academicInfo.twelfthPercentage)}</span>
            </p>
          </div>
        </div>
      ) : (
        /* EDIT FORM */
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">College / Institution *</label>
            <input
              type="text"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              placeholder="e.g. ABC Institute of Technology"
              className={`w-full bg-slate-950 border ${
                errors.college ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500`}
            />
            {errors.college && <p className="text-xs text-rose-400 mt-1">{errors.college}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Degree *</label>
            <input
              type="text"
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              placeholder="e.g. B.Tech"
              className={`w-full bg-slate-950 border ${
                errors.degree ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500`}
            />
            {errors.degree && <p className="text-xs text-rose-400 mt-1">{errors.degree}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Branch / Specialization *</label>
            <input
              type="text"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              placeholder="e.g. Computer Science & Engineering"
              className={`w-full bg-slate-950 border ${
                errors.branch ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500`}
            />
            {errors.branch && <p className="text-xs text-rose-400 mt-1">{errors.branch}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Academic Year</label>
            <select
              value={formData.currentYear}
              onChange={(e) => setFormData({ ...formData, currentYear: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Semester</label>
            <input
              type="text"
              value={formData.currentSemester}
              onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
              placeholder="e.g. Semester 6"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">College CGPA (0 - 10)</label>
            <input
              type="text"
              value={formData.cgpa}
              onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
              placeholder="e.g. 8.75"
              className={`w-full bg-slate-950 border ${
                errors.cgpa ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500`}
            />
            {errors.cgpa && <p className="text-xs text-rose-400 mt-1">{errors.cgpa}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Class 10th Marks (CGPA or %)
            </label>
            <input
              type="text"
              value={formData.tenthPercentage}
              onChange={(e) => setFormData({ ...formData, tenthPercentage: e.target.value })}
              placeholder="e.g. 9.4 (CGPA) or 94.5 (%)"
              className={`w-full bg-slate-950 border ${
                errors.tenthPercentage ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500`}
            />
            <p className="text-[10px] text-slate-500 mt-1">Values ≤ 10 = CGPA. Values &gt; 10 = %</p>
            {errors.tenthPercentage && <p className="text-xs text-rose-400 mt-1">{errors.tenthPercentage}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Class 12th Marks (CGPA or %)
            </label>
            <input
              type="text"
              value={formData.twelfthPercentage}
              onChange={(e) => setFormData({ ...formData, twelfthPercentage: e.target.value })}
              placeholder="e.g. 9.2 (CGPA) or 92.0 (%)"
              className={`w-full bg-slate-950 border ${
                errors.twelfthPercentage ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500`}
            />
            <p className="text-[10px] text-slate-500 mt-1">Values ≤ 10 = CGPA. Values &gt; 10 = %</p>
            {errors.twelfthPercentage && <p className="text-xs text-rose-400 mt-1">{errors.twelfthPercentage}</p>}
          </div>
        </form>
      )}
    </div>
  );
};
