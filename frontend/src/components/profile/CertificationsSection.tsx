import React, { useState } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import type { CertificationItem } from '../../types/profile';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Award, Plus, Edit2, Trash2, ExternalLink, Calendar, FileText, CheckCircle, X, Save, Upload } from 'lucide-react';

export const CertificationsSection: React.FC = () => {
  const { profile, addCertification, updateCertification, deleteCertification } = useStudentProfile();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificationItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');

  const [formData, setFormData] = useState<Omit<CertificationItem, 'id'>>({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    certificateFileName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setEditingCert(null);
    setFormData({
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      certificateFileName: '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (cert: CertificationItem) => {
    setEditingCert(cert);
    setFormData({
      name: cert.name,
      issuingOrganization: cert.issuingOrganization,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate || '',
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
      certificateFileName: cert.certificateFileName || '',
    });
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
    if (!formData.name.trim()) errs.name = 'Certification Name is required.';
    if (!formData.issuingOrganization.trim()) errs.issuingOrganization = 'Issuing Organization is required.';

    const urlPattern = /^(https?:\/\/)?([\w.-]+)+[\w\-_~:/?#[\]@!$&'()*+,;=.]+$/;
    if (formData.credentialUrl && !urlPattern.test(formData.credentialUrl)) {
      errs.credentialUrl = 'Please enter a valid Credential URL.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingCert) {
      await updateCertification(editingCert.id, formData);
    } else {
      await addCertification(formData);
    }
    setModalOpen(false);
  };

  const promptDelete = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      await deleteCertification(deleteTargetId);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Certifications & Licenses</h2>
            <p className="text-xs text-slate-400">Verified industry certifications, courses & micro-credentials</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Add Certification
        </button>
      </div>

      {/* Certifications Grid */}
      {profile.certifications.length === 0 ? (
        <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">🚀 No certifications added yet.</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Add your credentials from Meta, AWS, Google, Coursera, or NPTEL to boost your profile score.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Certification
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.certifications.map((cert) => (
            <div
              key={cert.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all group relative"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                        {cert.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">{cert.issuingOrganization}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cert)}
                      className="text-slate-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-800"
                      title="Edit Certification"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => promptDelete(cert.id, cert.name)}
                      className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800"
                      title="Delete Certification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {(cert.issueDate || cert.credentialId) && (
                  <div className="space-y-1 text-xs text-slate-400 pt-1">
                    {cert.issueDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Issued: {cert.issueDate}</span>
                      </div>
                    )}
                    {cert.credentialId && <p className="font-mono text-[11px] text-slate-500">ID: {cert.credentialId}</p>}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-4">
                {cert.certificateFileName ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> {cert.certificateFileName}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 italic">No file attached</span>
                )}

                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    Verify Credential <ExternalLink className="w-3 h-3" />
                  </a>
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
              <h3 className="text-lg font-bold text-white">{editingCert ? 'Edit Certification' : 'Add Certification'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Certification Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. AWS Certified Developer"
                  className={`w-full bg-slate-950 border ${
                    errors.name ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500`}
                />
                {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Issuing Organization *</label>
                <input
                  type="text"
                  value={formData.issuingOrganization}
                  onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })}
                  placeholder="e.g. Amazon Web Services, Meta, Coursera"
                  className={`w-full bg-slate-950 border ${
                    errors.issuingOrganization ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500`}
                />
                {errors.issuingOrganization && <p className="text-xs text-rose-400 mt-1">{errors.issuingOrganization}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Credential ID</label>
                <input
                  type="text"
                  value={formData.credentialId || ''}
                  onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                  placeholder="e.g. AWS-123456"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Credential Verification URL</label>
                <input
                  type="text"
                  value={formData.credentialUrl || ''}
                  onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                  placeholder="https://coursera.org/verify/..."
                  className={`w-full bg-slate-950 border ${
                    errors.credentialUrl ? 'border-rose-500' : 'border-slate-800'
                  } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500`}
                />
                {errors.credentialUrl && <p className="text-xs text-rose-400 mt-1">{errors.credentialUrl}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Certificate Document (PDF / Image)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-amber-400" /> Choose File
                    <input type="file" accept=".pdf,image/*" onChange={handleFileAttach} className="hidden" />
                  </label>
                  <span className="text-xs text-slate-400 truncate max-w-[200px]">
                    {formData.certificateFileName || 'No file selected'}
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
                  className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20"
                >
                  <Save className="w-4 h-4" /> Save Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Certification"
        itemDescription={deleteTargetName}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
