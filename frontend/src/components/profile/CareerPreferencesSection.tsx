import React, { useState } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import type { CareerPreferences } from '../../types/profile';
import { Target, Edit3, Save, X, Compass, DollarSign, MapPin, Briefcase, Zap } from 'lucide-react';

export const CareerPreferencesSection: React.FC = () => {
  const { profile, updateCareerPreferences } = useStudentProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CareerPreferences>(profile.careerPreferences);
  const [rolesInput, setRolesInput] = useState('');
  const [domainsInput, setDomainsInput] = useState('');
  const [locationsInput, setLocationsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = () => {
    setFormData(profile.careerPreferences);
    setRolesInput(profile.careerPreferences.preferredRoles.join(', '));
    setDomainsInput(profile.careerPreferences.preferredDomains.join(', '));
    setLocationsInput(profile.careerPreferences.preferredLocations.join(', '));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(profile.careerPreferences);
    setIsEditing(false);
  };

  const toggleOpportunityType = (type: 'Internship' | 'Full-time' | 'Part-time') => {
    const current = formData.opportunityType || [];
    if (current.includes(type)) {
      setFormData({ ...formData, opportunityType: current.filter((t) => t !== type) });
    } else {
      setFormData({ ...formData, opportunityType: [...current, type] });
    }
  };

  const toggleWorkMode = (mode: 'On-site' | 'Hybrid' | 'Remote') => {
    const current = formData.workMode || [];
    if (current.includes(mode)) {
      setFormData({ ...formData, workMode: current.filter((m) => m !== mode) });
    } else {
      setFormData({ ...formData, workMode: [...current, mode] });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const parsedRoles = rolesInput
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);
    const parsedDomains = domainsInput
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
    const parsedLocations = locationsInput
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    const updatedData: Partial<CareerPreferences> = {
      ...formData,
      preferredRoles: parsedRoles.length > 0 ? parsedRoles : formData.preferredRoles,
      preferredDomains: parsedDomains.length > 0 ? parsedDomains : formData.preferredDomains,
      preferredLocations: parsedLocations.length > 0 ? parsedLocations : formData.preferredLocations,
    };

    const success = await updateCareerPreferences(updatedData);
    setIsSubmitting(false);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Career Preferences & Target Role</h2>
            <p className="text-xs text-slate-400">Target role benchmarks, desired work modes & salary expectations</p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" /> Edit Preferences
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
              className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-cyan-500/20"
            >
              <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        /* READ ONLY VIEW */
        <div className="space-y-6">
          <div className="bg-cyan-950/40 border border-cyan-800/50 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" /> Connected Skill Matrix Engine
              </span>
              <h3 className="text-xl font-extrabold text-white">
                Target Role: <span className="text-cyan-300">{profile.careerPreferences.targetRole}</span>
              </h3>
              <p className="text-xs text-slate-300">
                Skill gap analysis, roadmap timeline and internship matches are dynamically synchronized with this role.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Preferred Roles
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.careerPreferences.preferredRoles.map((role, idx) => (
                  <span key={idx} className="text-xs bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-0.5 rounded-md">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-500" /> Preferred Industry Domains
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.careerPreferences.preferredDomains.map((domain, idx) => (
                  <span key={idx} className="text-xs bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-0.5 rounded-md">
                    {domain}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Preferred Locations
              </span>
              <p className="text-sm font-semibold text-white">
                {profile.careerPreferences.preferredLocations.join(', ') || 'Flexible'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400">Opportunity Type & Work Mode</span>
              <p className="text-sm font-semibold text-white">
                {profile.careerPreferences.opportunityType.join(', ')} • {profile.careerPreferences.workMode.join(', ')}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" /> Min. Expected Stipend
              </span>
              <p className="text-sm font-semibold text-emerald-400">{profile.careerPreferences.minExpectedStipend || 'Negotiable'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" /> Min. Expected Salary (Full-time)
              </span>
              <p className="text-sm font-semibold text-emerald-400">{profile.careerPreferences.minExpectedSalary || 'Negotiable'}</p>
            </div>
          </div>
        </div>
      ) : (
        /* EDIT FORM */
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Primary Role *</label>
              <select
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="React Developer">React Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Roles (comma separated)</label>
              <input
                type="text"
                value={rolesInput}
                onChange={(e) => setRolesInput(e.target.value)}
                placeholder="e.g. Frontend Developer, React Developer, UI Engineer"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Domains (comma separated)</label>
              <input
                type="text"
                value={domainsInput}
                onChange={(e) => setDomainsInput(e.target.value)}
                placeholder="e.g. Web Development, SaaS, EdTech, FinTech"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Locations (comma separated)</label>
              <input
                type="text"
                value={locationsInput}
                onChange={(e) => setLocationsInput(e.target.value)}
                placeholder="e.g. Hyderabad, Bengaluru, Remote"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-sans">Opportunity Type</label>
              <div className="flex gap-2 pt-1">
                {(['Internship', 'Full-time', 'Part-time'] as const).map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => toggleOpportunityType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      formData.opportunityType.includes(type)
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Work Mode</label>
              <div className="flex gap-2 pt-1">
                {(['On-site', 'Hybrid', 'Remote'] as const).map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => toggleWorkMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      formData.workMode.includes(mode)
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Min Expected Stipend</label>
              <input
                type="text"
                value={formData.minExpectedStipend || ''}
                onChange={(e) => setFormData({ ...formData, minExpectedStipend: e.target.value })}
                placeholder="e.g. ₹25,000 / month"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Min Expected Salary (LPA)</label>
              <input
                type="text"
                value={formData.minExpectedSalary || ''}
                onChange={(e) => setFormData({ ...formData, minExpectedSalary: e.target.value })}
                placeholder="e.g. ₹8.5 LPA"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
