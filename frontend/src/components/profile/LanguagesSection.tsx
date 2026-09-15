import React, { useState } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import type { LanguageItem } from '../../types/profile';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Languages, Plus, Edit2, Trash2, X, Save, Globe2 } from 'lucide-react';

export const LanguagesSection: React.FC = () => {
  const { profile, addLanguage, updateLanguage, deleteLanguage } = useStudentProfile();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLang, setEditingLang] = useState<LanguageItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');

  const [formData, setFormData] = useState<Omit<LanguageItem, 'id'>>({
    language: '',
  });

  const [error, setError] = useState('');

  const handleOpenAdd = () => {
    setEditingLang(null);
    setFormData({
      language: '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (lang: LanguageItem) => {
    setEditingLang(lang);
    setFormData({
      language: lang.language,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.language.trim()) {
      setError('Language name is required.');
      return;
    }

    if (editingLang) {
      await updateLanguage(editingLang.id, formData);
    } else {
      await addLanguage(formData);
    }
    setModalOpen(false);
  };

  const promptDelete = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      await deleteLanguage(deleteTargetId);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Languages Known</h2>
            <p className="text-xs text-slate-400">Spoken and written language list</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-teal-500/20"
        >
          <Plus className="w-4 h-4" /> Add Language
        </button>
      </div>

      {/* Languages List */}
      {profile.languages.length === 0 ? (
        <div className="text-center py-8 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">🚀 No languages added yet.</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Add your spoken and written languages to complete your profile.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Language
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {profile.languages.map((lang) => (
            <div
              key={lang.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3 transition-all group"
            >
              <Globe2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                {lang.language}
              </span>

              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => handleOpenEdit(lang)}
                  className="text-slate-400 hover:text-teal-400 p-1 rounded-lg hover:bg-slate-800"
                  title="Edit Language"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => promptDelete(lang.id, lang.language)}
                  className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800"
                  title="Delete Language"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">{editingLang ? 'Edit Language' : 'Add Language'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Language Name *</label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  placeholder="e.g. English, Hindi, German, Japanese"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  autoFocus
                />
                {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
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
                  className="flex items-center gap-1.5 px-5 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-teal-500/20"
                >
                  <Save className="w-4 h-4" /> Save Language
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Language"
        itemDescription={deleteTargetName}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
