import React, { useState } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import type { SoftSkill, ProficiencyLevel } from '../../types/profile';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { BrainCircuit, Plus, Edit2, Trash2, X, Save, MessageSquare } from 'lucide-react';

export const SoftSkillsSection: React.FC = () => {
  const { profile, addSoftSkill, updateSoftSkill, deleteSoftSkill } = useStudentProfile();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SoftSkill | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');

  const [name, setName] = useState('');
  const [proficiency, setProficiency] = useState<ProficiencyLevel>('Advanced');
  const [error, setError] = useState('');

  const handleOpenAdd = () => {
    setEditingSkill(null);
    setName('');
    setProficiency('Advanced');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (skill: SoftSkill) => {
    setEditingSkill(skill);
    setName(skill.name);
    setProficiency(skill.proficiency);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Soft skill name is required.');
      return;
    }

    if (editingSkill) {
      await updateSoftSkill(editingSkill.id, { name, proficiency });
    } else {
      await addSoftSkill({ name, proficiency });
    }
    setModalOpen(false);
  };

  const promptDelete = (id: string, skillName: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(skillName);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      await deleteSoftSkill(deleteTargetId);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Soft Skills & Interpersonal Competencies</h2>
            <p className="text-xs text-slate-400">Communication, leadership, teamwork & problem-solving abilities</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Add Soft Skill
        </button>
      </div>

      {/* Skills Grid */}
      {profile.softSkills.length === 0 ? (
        <div className="text-center py-8 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">🚀 No soft skills added yet.</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Add your interpersonal and teamwork capabilities to impress corporate recruiters.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Soft Skill
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {profile.softSkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all group"
            >
              <div>
                <span className="text-sm font-semibold text-white">{skill.name}</span>
                <span className="text-[11px] text-indigo-300 ml-2 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  {skill.proficiency}
                </span>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(skill)}
                  className="text-slate-400 hover:text-indigo-400 p-1 rounded-md hover:bg-slate-800"
                  title="Edit Soft Skill"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => promptDelete(skill.id, skill.name)}
                  className="text-slate-400 hover:text-rose-400 p-1 rounded-md hover:bg-slate-800"
                  title="Delete Soft Skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Soft Skill Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">{editingSkill ? 'Edit Soft Skill' : 'Add Soft Skill'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Soft Skill Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Communication, Leadership, Adaptability"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Proficiency Level</label>
                <select
                  value={proficiency}
                  onChange={(e) => setProficiency(e.target.value as ProficiencyLevel)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
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
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/20"
                >
                  <Save className="w-4 h-4" /> Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Soft Skill"
        itemDescription={deleteTargetName}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
