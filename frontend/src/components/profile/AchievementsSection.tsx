import React, { useState } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import type { AchievementItem } from '../../types/profile';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Trophy, Plus, Edit2, Trash2, Calendar, FileText, X, Save, Upload } from 'lucide-react';

export const AchievementsSection: React.FC = () => {
  const { profile, addAchievement, updateAchievement, deleteAchievement } = useStudentProfile();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AchievementItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');

  const [formData, setFormData] = useState<Omit<AchievementItem, 'id'>>({
    title: '',
    organizationOrEvent: '',
    date: '',
    description: '',
    proofFileName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      organizationOrEvent: '',
      date: '',
      description: '',
      proofFileName: '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (item: AchievementItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      organizationOrEvent: item.organizationOrEvent,
      date: item.date,
      description: item.description,
      proofFileName: item.proofFileName || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        proofFileName: file.name,
      }));
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = 'Title is required.';
    if (!formData.organizationOrEvent.trim()) errs.organizationOrEvent = 'Event / Organization is required.';
    if (!formData.description.trim()) errs.description = 'Description is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingItem) {
      await updateAchievement(editingItem.id, formData);
    } else {
      await addAchievement(formData);
    }
    setModalOpen(false);
  };

  const promptDelete = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      await deleteAchievement(deleteTargetId);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Achievements & Awards</h2>
            <p className="text-xs text-slate-400">Hackathon wins, honors, Dean's list & coding competition ranks</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-yellow-500/20"
        >
          <Plus className="w-4 h-4" /> Add Achievement
        </button>
      </div>

      {/* List */}
      {profile.achievements.length === 0 ? (
        <div className="text-center py-8 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">🚀 No achievements added yet.</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Showcase your hackathon victories, academic honors or contest ranks.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Achievement
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.achievements.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-cyan-400 font-medium">{item.organizationOrEvent}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="text-slate-400 hover:text-yellow-400 p-1.5 rounded-lg hover:bg-slate-800"
                      title="Edit Achievement"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => promptDelete(item.id, item.title)}
                      className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800"
                      title="Delete Achievement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-3 text-xs text-slate-400">
                {item.date ? (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> {item.date}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Verified Achievement</span>
                )}

                {item.proofFileName && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> {item.proofFileName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">{editingItem ? 'Edit Achievement' : 'Add Achievement'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Achievement Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 1st Place - National Hackathon 2025"
                  className={`w-full bg-slate-950 border ${
                    errors.title ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-yellow-500`}
                />
                {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Event / Organization *</label>
                <input
                  type="text"
                  value={formData.organizationOrEvent}
                  onChange={(e) => setFormData({ ...formData, organizationOrEvent: e.target.value })}
                  placeholder="e.g. HackIndia 2025 / College Dean's Office"
                  className={`w-full bg-slate-950 border ${
                    errors.organizationOrEvent ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-yellow-500`}
                />
                {errors.organizationOrEvent && <p className="text-xs text-rose-400 mt-1">{errors.organizationOrEvent}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details of the award, competition scale, position achieved..."
                  className={`w-full bg-slate-950 border ${
                    errors.description ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-yellow-500`}
                />
                {errors.description && <p className="text-xs text-rose-400 mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Proof Document (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-yellow-400" /> Choose File
                    <input type="file" accept=".pdf,image/*" onChange={handleFileAttach} className="hidden" />
                  </label>
                  <span className="text-xs text-slate-400 truncate max-w-[200px]">
                    {formData.proofFileName || 'No file selected'}
                  </span>
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
                  className="flex items-center gap-1.5 px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-yellow-500/20"
                >
                  <Save className="w-4 h-4" /> Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Achievement"
        itemDescription={deleteTargetName}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
