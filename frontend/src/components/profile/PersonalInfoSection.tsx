import React, { useState } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import type { PersonalInfo } from '../../types/profile';
import { User, Mail, Phone, MapPin, Globe, Edit3, Save, X, Link as LinkIcon, Code, Calendar, Heart } from 'lucide-react';

export const PersonalInfoSection: React.FC = () => {
  const { profile, updatePersonalInfo } = useStudentProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PersonalInfo>(profile.personalInfo);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = () => {
    setFormData(profile.personalInfo);
    setErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(profile.personalInfo);
    setErrors({});
    setIsEditing(false);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!/^[+\d\s-]{8,15}$/.test(formData.phone)) {
      errs.phone = 'Please enter a valid phone number.';
    }
    if (!formData.city.trim()) errs.city = 'City is required.';
    if (!formData.state.trim()) errs.state = 'State is required.';

    const urlPattern = /^(https?:\/\/)?([\w.-]+)+[\w\-_~:/?#[\]@!$&'()*+,;=.]+$/;
    if (formData.linkedInUrl && !urlPattern.test(formData.linkedInUrl)) {
      errs.linkedInUrl = 'Please enter a valid URL.';
    }
    if (formData.gitHubUrl && !urlPattern.test(formData.gitHubUrl)) {
      errs.gitHubUrl = 'Please enter a valid URL.';
    }
    if (formData.portfolioUrl && !urlPattern.test(formData.portfolioUrl)) {
      errs.portfolioUrl = 'Please enter a valid URL.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const success = await updatePersonalInfo(formData);
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
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Personal Information</h2>
            <p className="text-xs text-slate-400">Basic identity, contact details, DOB & social links</p>
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
              className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-cyan-500/20"
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
              <User className="w-3.5 h-3.5 text-slate-500" /> Full Name
            </span>
            <p className="text-sm font-semibold text-white">{profile.personalInfo.fullName || '—'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" /> Email Address
            </span>
            <p className="text-sm font-semibold text-white">{profile.personalInfo.email || '—'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" /> Phone Number
            </span>
            <p className="text-sm font-semibold text-white">{profile.personalInfo.phone || '—'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Date of Birth
            </span>
            <p className="text-sm font-semibold text-white">{profile.personalInfo.dob || '—'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-slate-500" /> Gender
            </span>
            <p className="text-sm font-semibold text-white">{profile.personalInfo.gender || '—'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" /> Location
            </span>
            <p className="text-sm font-semibold text-white">
              {profile.personalInfo.city || profile.personalInfo.state || profile.personalInfo.country
                ? `${profile.personalInfo.city || ''} ${profile.personalInfo.state ? ', ' + profile.personalInfo.state : ''} ${profile.personalInfo.country ? ', ' + profile.personalInfo.country : ''}`
                : '—'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-slate-500" /> LinkedIn
            </span>
            {profile.personalInfo.linkedInUrl ? (
              <a
                href={profile.personalInfo.linkedInUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-cyan-400 hover:underline truncate block"
              >
                {profile.personalInfo.linkedInUrl}
              </a>
            ) : (
              <p className="text-sm text-slate-500">Not provided</p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-slate-500" /> GitHub
            </span>
            {profile.personalInfo.gitHubUrl ? (
              <a
                href={profile.personalInfo.gitHubUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-cyan-400 hover:underline truncate block"
              >
                {profile.personalInfo.gitHubUrl}
              </a>
            ) : (
              <p className="text-sm text-slate-500">Not provided</p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500" /> Portfolio Website
            </span>
            {profile.personalInfo.portfolioUrl ? (
              <a
                href={profile.personalInfo.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-cyan-400 hover:underline truncate block"
              >
                {profile.personalInfo.portfolioUrl}
              </a>
            ) : (
              <p className="text-sm text-slate-500">Not provided</p>
            )}
          </div>
        </div>
      ) : (
        /* EDIT FORM */
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`w-full bg-slate-950 border ${
                errors.fullName ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500`}
            />
            {errors.fullName && <p className="text-xs text-rose-400 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full bg-slate-950 border ${
                errors.email ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500`}
            />
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 9876543210"
              className={`w-full bg-slate-950 border ${
                errors.phone ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500`}
            />
            {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth (DOB)</label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">City *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Hyderabad"
              className={`w-full bg-slate-950 border ${
                errors.city ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500`}
            />
            {errors.city && <p className="text-xs text-rose-400 mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">State *</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="e.g. Telangana"
              className={`w-full bg-slate-950 border ${
                errors.state ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500`}
            />
            {errors.state && <p className="text-xs text-rose-400 mt-1">{errors.state}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="e.g. India"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar Image URL</label>
            <input
              type="text"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              placeholder="https://..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">LinkedIn Profile URL</label>
            <input
              type="text"
              value={formData.linkedInUrl || ''}
              onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              className={`w-full bg-slate-950 border ${
                errors.linkedInUrl ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500`}
            />
            {errors.linkedInUrl && <p className="text-xs text-rose-400 mt-1">{errors.linkedInUrl}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub Profile URL</label>
            <input
              type="text"
              value={formData.gitHubUrl || ''}
              onChange={(e) => setFormData({ ...formData, gitHubUrl: e.target.value })}
              placeholder="https://github.com/..."
              className={`w-full bg-slate-950 border ${
                errors.gitHubUrl ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500`}
            />
            {errors.gitHubUrl && <p className="text-xs text-rose-400 mt-1">{errors.gitHubUrl}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Portfolio Website URL</label>
            <input
              type="text"
              value={formData.portfolioUrl || ''}
              onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
              placeholder="https://yourportfolio.dev"
              className={`w-full bg-slate-950 border ${
                errors.portfolioUrl ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500`}
            />
            {errors.portfolioUrl && <p className="text-xs text-rose-400 mt-1">{errors.portfolioUrl}</p>}
          </div>
        </form>
      )}
    </div>
  );
};
