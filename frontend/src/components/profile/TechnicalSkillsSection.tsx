import React, { useState } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import type { TechnicalSkill, ProficiencyLevel } from '../../types/profile';
import { PROFICIENCY_NUMERIC_MAP } from '../../utils/skillGapCalculator';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Code, Plus, Edit2, Trash2, X, Save, Zap } from 'lucide-react';

export const TechnicalSkillsSection: React.FC = () => {
  const { profile, addTechnicalSkill, updateTechnicalSkill, deleteTechnicalSkill } = useStudentProfile();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<TechnicalSkill | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');

  const [name, setName] = useState('');
  const [category, setCategory] = useState<TechnicalSkill['category']>('Web Development');
  const [proficiency, setProficiency] = useState<ProficiencyLevel>('Intermediate');
  const [error, setError] = useState('');

  const handleOpenAdd = () => {
    setEditingSkill(null);
    setName('');
    setCategory('Web Development');
    setProficiency('Intermediate');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (skill: TechnicalSkill) => {
    setEditingSkill(skill);
    setName(skill.name);
    setCategory(skill.category);
    setProficiency(skill.proficiency);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Skill name is required.');
      return;
    }

    if (editingSkill) {
      await updateTechnicalSkill(editingSkill.id, { name, category, proficiency });
    } else {
      await addTechnicalSkill({ name, category, proficiency });
    }
    setModalOpen(false);
  };

  const promptDelete = (id: string, skillName: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(skillName);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      await deleteTechnicalSkill(deleteTargetId);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  const getProficiencyBadgeClass = (level: ProficiencyLevel) => {
    switch (level) {
      case 'Expert':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case 'Advanced':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'Intermediate':
        return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Technical Skills</h2>
            <p className="text-xs text-slate-400">Programming languages, frameworks & tools with numeric proficiency levels</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {/* Skills Grid */}
      {profile.technicalSkills.length === 0 ? (
        <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">🚀 No technical skills added yet.</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Add your technical skills to calculate your skill gaps, matching internship opportunities & career roadmap.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Technical Skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {profile.technicalSkills.map((skill) => {
            const numericVal = PROFICIENCY_NUMERIC_MAP[skill.proficiency] || 25;
            return (
              <div
                key={skill.id}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{skill.category}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(skill)}
                        className="text-slate-400 hover:text-cyan-400 p-1 rounded-md hover:bg-slate-800"
                        title="Edit Skill"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => promptDelete(skill.id, skill.name)}
                        className="text-slate-400 hover:text-rose-400 p-1 rounded-md hover:bg-slate-800"
                        title="Delete Skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mt-1">{skill.name}</h3>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${getProficiencyBadgeClass(skill.proficiency)}`}>
                      {skill.proficiency}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{numericVal}%</span>
                  </div>

                  {/* Visual Level Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full"
                      style={{ width: `${numericVal}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">{editingSkill ? 'Edit Technical Skill' : 'Add Technical Skill'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Skill Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. React, Python, Docker"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
                {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Programming">Programming</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Database">Database</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Tools">Tools</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Proficiency Level *</label>
                <select
                  value={proficiency}
                  onChange={(e) => setProficiency(e.target.value as ProficiencyLevel)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Beginner">Beginner (25%)</option>
                  <option value="Intermediate">Intermediate (50%)</option>
                  <option value="Advanced">Advanced (75%)</option>
                  <option value="Expert">Expert (100%)</option>
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
                  className="flex items-center gap-1.5 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20"
                >
                  <Save className="w-4 h-4" /> Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Technical Skill"
        itemDescription={deleteTargetName}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
