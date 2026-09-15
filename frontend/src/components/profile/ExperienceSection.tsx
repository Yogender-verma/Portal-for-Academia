import React, { useState } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import type { ExperienceItem } from '../../types/profile';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Briefcase, Plus, Edit2, Trash2, Calendar, MapPin, CheckSquare, Square, X, Save, Upload } from 'lucide-react';

export const ExperienceSection: React.FC = () => {
  const { profile, addExperience, updateExperience, deleteExperience } = useStudentProfile();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');

  const [formData, setFormData] = useState<Omit<ExperienceItem, 'id'>>({
    organization: '',
    role: '',
    employmentType: 'Internship',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    location: '',
    responsibilities: '',
    skillsGained: [],
    certificateFileName: '',
  });

  const [skillsInput, setSkillsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setEditingExp(null);
    setFormData({
      organization: '',
      role: '',
      employmentType: 'Internship',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      location: '',
      responsibilities: '',
      skillsGained: [],
      certificateFileName: '',
    });
    setSkillsInput('');
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (exp: ExperienceItem) => {
    setEditingExp(exp);
    setFormData({
      organization: exp.organization,
      role: exp.role,
      employmentType: exp.employmentType,
      startDate: exp.startDate,
      endDate: exp.endDate || '',
      currentlyWorking: exp.currentlyWorking,
      location: exp.location,
      responsibilities: exp.responsibilities,
      skillsGained: exp.skillsGained,
      certificateFileName: exp.certificateFileName || '',
    });
    setSkillsInput(exp.skillsGained.join(', '));
    setErrors({});
    setModalOpen(true);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        certificateFileName: file.name,
      }));
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.organization.trim()) errs.organization = 'Organization is required.';
    if (!formData.role.trim()) errs.role = 'Role is required.';
    if (!formData.startDate) errs.startDate = 'Start Date is required.';

    if (!formData.currentlyWorking && formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errs.endDate = 'End Date cannot be earlier than Start Date.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const expData = {
      ...formData,
      endDate: formData.currentlyWorking ? 'Present' : formData.endDate,
      skillsGained: parsedSkills.length > 0 ? parsedSkills : formData.skillsGained,
    };

    if (editingExp) {
      await updateExperience(editingExp.id, expData);
    } else {
      await addExperience(expData);
    }
    setModalOpen(false);
  };

  const promptDelete = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      await deleteExperience(deleteTargetId);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Work & Internship Experience</h2>
            <p className="text-xs text-slate-400">Previous corporate internships, full-time & freelance projects</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" /> Add Experience
        </button>
      </div>

      {/* Experience List */}
      {profile.experience.length === 0 ? (
        <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">🚀 No experience added yet.</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Add your past internships, freelance gigs or part-time work to highlight real industry exposure.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Experience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {profile.experience.map((exp) => (
            <div
              key={exp.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-4 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                      {exp.role}
                    </h3>
                    <span className="text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-md">
                      {exp.employmentType}
                    </span>
                    {exp.currentlyWorking && (
                      <span className="text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                        Currently Working
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-semibold">{exp.organization}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(exp)}
                    className="text-slate-400 hover:text-purple-400 p-1.5 rounded-lg hover:bg-slate-800"
                    title="Edit Experience"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => promptDelete(exp.id, `${exp.role} at ${exp.organization}`)}
                    className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800"
                    title="Delete Experience"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {exp.startDate} — {exp.currentlyWorking ? 'Present' : exp.endDate || 'Present'}
                </span>
                {exp.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {exp.location}
                  </span>
                )}
              </div>

              {exp.responsibilities && (
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                  {exp.responsibilities}
                </p>
              )}

              {/* Skills gained tags */}
              {exp.skillsGained.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {exp.skillsGained.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">{editingExp ? 'Edit Experience' : 'Add Experience'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. TechVision Solutions"
                    className={`w-full bg-slate-950 border ${
                      errors.organization ? 'border-rose-500' : 'border-slate-800'
                    } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500`}
                  />
                  {errors.organization && <p className="text-xs text-rose-400 mt-1">{errors.organization}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Job Role / Title *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Frontend Development Intern"
                    className={`w-full bg-slate-950 border ${
                      errors.role ? 'border-rose-500' : 'border-slate-800'
                    } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500`}
                  />
                  {errors.role && <p className="text-xs text-rose-400 mt-1">{errors.role}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Hyderabad (Hybrid)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full bg-slate-950 border ${
                      errors.startDate ? 'border-rose-500' : 'border-slate-800'
                    } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500`}
                  />
                  {errors.startDate && <p className="text-xs text-rose-400 mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    disabled={formData.currentlyWorking}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`w-full bg-slate-950 border ${
                      errors.endDate ? 'border-rose-500' : 'border-slate-800'
                    } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-40 disabled:cursor-not-allowed`}
                  />
                  {errors.endDate && <p className="text-xs text-rose-400 mt-1">{errors.endDate}</p>}
                </div>

                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, currentlyWorking: !formData.currentlyWorking })}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer select-none"
                  >
                    {formData.currentlyWorking ? (
                      <CheckSquare className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600" />
                    )}
                    I am currently working in this role
                  </button>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Responsibilities & Achievements</label>
                  <textarea
                    rows={3}
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    placeholder="Key tasks, features built, team size, tools used..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Skills Gained (comma separated)</label>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="e.g. React, REST APIs, Git, Agile"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Internship Certificate (Optional)</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium flex items-center gap-2 transition-colors">
                      <Upload className="w-4 h-4 text-purple-400" /> Choose File
                      <input type="file" accept=".pdf,image/*" onChange={handleFileAttach} className="hidden" />
                    </label>
                    <span className="text-xs text-slate-400 truncate max-w-[200px]">
                      {formData.certificateFileName || 'No file selected'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-500/20"
                >
                  <Save className="w-4 h-4" /> Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Experience"
        itemDescription={deleteTargetName}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
