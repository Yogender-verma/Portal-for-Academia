import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  Users, 
  Upload, 
  Trash2, 
  CheckCircle, 
  Edit3, 
  X, 
  Save, 
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { CompanyProfile, CompanyTypeOption, CompanySizeOption } from '../types/companyProfile';
import { fetchCompanyProfileFromBackend, saveCompanyProfileToBackend } from '../services/companyProfileApiService';

const COMPANY_PROFILE_STORAGE_KEY_PREFIX = 'sb_company_profile_';

export const CompanyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || user?.uid || 'default-company';

  // Master saved profile state
  const [profile, setProfile] = useState<CompanyProfile>(() => {
    const storageKey = `${COMPANY_PROFILE_STORAGE_KEY_PREFIX}${userId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      id: `profile-${userId}`,
      userId,
      companyName: user?.name || 'SkillBridge Partner Organization',
      logo: '',
      officialEmail: user?.email || '',
      phoneNumber: '',
      companyType: 'Private',
      companySize: '51-200',
      foundedYear: '',
      website: '',
      linkedin: '',
      description: '',
      updatedAt: new Date().toISOString()
    };
  });

  // Edit Mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<CompanyProfile>(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Sync profile from PostgreSQL (authoritative) when user logs in or switches account
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const loadAuthoritativeCompanyProfile = async () => {
      try {
        console.log('[CompanyProfilePage] Fetching authoritative profile from PostgreSQL for UID:', userId);
        const res = await fetchCompanyProfileFromBackend(userId);
        if (!isMounted) return;

        if (res.status === 'success' && res.profile) {
          console.log('[CompanyProfilePage] Successfully loaded authoritative company profile from PostgreSQL for UID:', userId);
          const authoritative: CompanyProfile = {
            id: `profile-${userId}`,
            userId,
            companyName: res.profile.companyName || user?.name || 'SkillBridge Employer',
            logo: res.profile.logo || '',
            officialEmail: res.profile.officialEmail || user?.email || '',
            phoneNumber: res.profile.phoneNumber || '',
            companyType: res.profile.companyType || 'Private',
            companySize: res.profile.companySize || '51-200',
            foundedYear: res.profile.foundedYear || '',
            website: res.profile.website || '',
            linkedin: res.profile.linkedin || '',
            description: res.profile.description || '',
            updatedAt: res.profile.updatedAt || new Date().toISOString()
          };
          setProfile(authoritative);
          setFormData(authoritative);
          const storageKey = `${COMPANY_PROFILE_STORAGE_KEY_PREFIX}${userId}`;
          localStorage.setItem(storageKey, JSON.stringify(authoritative));
        } else if (res.status === 'not_found') {
          console.log('[CompanyProfilePage] No PostgreSQL record found for UID:', userId, '— seeding DB with initial profile');
          const storageKey = `${COMPANY_PROFILE_STORAGE_KEY_PREFIX}${userId}`;
          const saved = localStorage.getItem(storageKey);
          let currentProf = profile;
          if (saved) {
            try { currentProf = JSON.parse(saved); } catch (e) { /* ignore */ }
          }
          saveCompanyProfileToBackend(userId, currentProf).catch((err) => {
            console.warn('[CompanyProfilePage] Initial DB seed warning:', err);
          });
        }
      } catch (err) {
        console.warn('[CompanyProfilePage] Backend unavailable — using localStorage fallback:', err);
      }
    };

    loadAuthoritativeCompanyProfile();

    return () => {
      isMounted = false;
    };
  }, [userId, user]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Company Name (Required)
    if (!formData.companyName || !formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required.';
    }

    // 2. Official Email (Required & Valid format)
    if (!formData.officialEmail || !formData.officialEmail.trim()) {
      newErrors.officialEmail = 'Official email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.officialEmail.trim())) {
      newErrors.officialEmail = 'Please enter a valid email address (e.g. contact@company.com).';
    }

    // 3. Phone Number (Reasonable format)
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      if (!/^\+?[0-9\s\-()]{7,20}$/.test(formData.phoneNumber.trim())) {
        newErrors.phoneNumber = 'Please enter a valid phone number format (e.g. +91 9876543210).';
      }
    }

    // 4. Founded Year (4-digit, not in future)
    if (formData.foundedYear !== undefined && formData.foundedYear !== '' && formData.foundedYear !== null) {
      const yearNum = Number(formData.foundedYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1800 || yearNum > currentYear) {
        newErrors.foundedYear = `Founded year must be a 4-digit year between 1800 and ${currentYear}.`;
      }
    }

    // 5. Website (Valid URL format)
    if (formData.website && formData.website.trim()) {
      try {
        const formatted = formData.website.startsWith('http://') || formData.website.startsWith('https://') 
          ? formData.website 
          : `https://${formData.website}`;
        new URL(formatted);
      } catch (e) {
        newErrors.website = 'Please enter a valid URL (e.g. https://www.company.com).';
      }
    }

    // 6. LinkedIn (Valid URL format)
    if (formData.linkedin && formData.linkedin.trim()) {
      try {
        const formatted = formData.linkedin.startsWith('http://') || formData.linkedin.startsWith('https://') 
          ? formData.linkedin 
          : `https://${formData.linkedin}`;
        new URL(formatted);
      } catch (e) {
        newErrors.linkedin = 'Please enter a valid LinkedIn URL (e.g. https://linkedin.com/company/name).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Logo upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, logo: 'Supported formats: PNG, JPG/JPEG, WEBP.' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, logo: base64String }));
        setErrors(prev => {
          const updated = { ...prev };
          delete updated.logo;
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Logo removal
  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  // Save changes handler
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updatedProfile: CompanyProfile = {
      ...formData,
      companyName: formData.companyName.trim(),
      officialEmail: formData.officialEmail.trim(),
      phoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() : '',
      website: formData.website ? formData.website.trim() : '',
      linkedin: formData.linkedin ? formData.linkedin.trim() : '',
      description: formData.description ? formData.description.trim() : '',
      updatedAt: new Date().toISOString()
    };

    // Update local state and localStorage cache immediately for quick UI response
    const storageKey = `${COMPANY_PROFILE_STORAGE_KEY_PREFIX}${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
    setFormData(updatedProfile);
    setIsEditing(false);

    // Persist to PostgreSQL database
    try {
      await saveCompanyProfileToBackend(userId, updatedProfile);
      setSuccessMessage('✓ Company profile updated and saved to PostgreSQL database successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (backendErr: any) {
      console.error('[CompanyProfilePage] Database save failed:', backendErr);
      setSuccessMessage(`⚠ Saved locally, but PostgreSQL database save failed: ${backendErr?.message || 'Connection error'}`);
      setTimeout(() => setSuccessMessage(''), 6000);
    }
  };

  // Cancel edit handler
  const handleCancelEdit = () => {
    setFormData(profile);
    setErrors({});
    setIsEditing(false);
  };

  // Helper for displaying external links safely
  const formatExternalUrl = (url?: string) => {
    if (!url) return '#';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-sky-400" />
            Company Profile
          </h1>
          <p className="text-xs text-slate-400">
            Official employer brand identity and organization contact details.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02]"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between text-xs font-semibold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Profile Form / View Panel */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-8 bg-slate-900/90 shadow-2xl">
        
        {/* LOGO SECTION */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
          <div className="relative">
            {isEditing ? (
              formData.logo ? (
                <div className="w-28 h-28 rounded-2xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center overflow-hidden shadow-xl">
                  <img src={formData.logo} alt="Company Logo Preview" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-slate-950 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 space-y-1">
                  <Building2 className="w-8 h-8 text-slate-600" />
                  <span className="text-[10px] font-semibold">No Logo</span>
                </div>
              )
            ) : (
              profile.logo ? (
                <div className="w-28 h-28 rounded-2xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center overflow-hidden shadow-xl">
                  <img src={profile.logo} alt="Company Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 p-1 shadow-xl">
                  <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center text-3xl font-black text-white uppercase">
                    {profile.companyName.charAt(0)}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {isEditing ? (formData.companyName || 'Company Name') : (profile.companyName || 'Company Name')}
            </h2>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-sky-400 font-semibold">
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>{isEditing ? (formData.officialEmail || 'email@company.com') : (profile.officialEmail || 'email@company.com')}</span>
            </div>

            {isEditing && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
                <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer flex items-center gap-1.5 transition-all">
                  <Upload className="w-3.5 h-3.5 text-sky-400" />
                  <span>{formData.logo ? 'Replace Logo' : 'Upload Logo'}</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {formData.logo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-semibold border border-red-500/30 flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Logo</span>
                  </button>
                )}
              </div>
            )}
            {errors.logo && <p className="text-xs text-red-400 font-medium pt-1">{errors.logo}</p>}
          </div>
        </div>

        {/* PROFILE FIELDS (EXACTLY 10 SPECIFIED FIELDS) */}
        <form onSubmit={handleSaveChanges} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* 1. COMPANY NAME & 2. OFFICIAL EMAIL (SHOW ONLY IF EDIT IS GOING ON) */}
            {isEditing && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    1. Company Name <span className="text-red-400">*</span>
                  </label>
                  <div>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="e.g. SkillBridge Technologies Inc."
                      className={`w-full px-4 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 ${
                        errors.companyName ? 'border-red-500' : 'border-slate-800'
                      }`}
                    />
                    {errors.companyName && <p className="text-[11px] text-red-400 mt-1">{errors.companyName}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    2. Official Email <span className="text-red-400">*</span>
                  </label>
                  <div>
                    <input
                      type="email"
                      required
                      value={formData.officialEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, officialEmail: e.target.value }))}
                      placeholder="e.g. hr@company.com"
                      className={`w-full px-4 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 ${
                        errors.officialEmail ? 'border-red-500' : 'border-slate-800'
                      }`}
                    />
                    {errors.officialEmail && <p className="text-[11px] text-red-400 mt-1">{errors.officialEmail}</p>}
                  </div>
                </div>
              </>
            )}

            {/* 3. COMPANY PHONE NUMBER */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                3. Company Phone Number
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="e.g. +91 9876543210"
                    className={`w-full px-4 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 ${
                      errors.phoneNumber ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  {errors.phoneNumber && <p className="text-[11px] text-red-400 mt-1">{errors.phoneNumber}</p>}
                </div>
              ) : (
                <div className="px-4 py-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>{profile.phoneNumber || 'Not specified'}</span>
                </div>
              )}
            </div>

            {/* 4. COMPANY TYPE */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                4. Company Type
              </label>
              {isEditing ? (
                <select
                  value={formData.companyType}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyType: e.target.value as CompanyTypeOption }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Startup">Startup</option>
                  <option value="Private">Private</option>
                  <option value="Public">Public</option>
                  <option value="MNC">MNC</option>
                  <option value="Government">Government</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div className="px-4 py-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                  <span>{profile.companyType}</span>
                </div>
              )}
            </div>

            {/* 5. COMPANY SIZE */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                5. Company Size
              </label>
              {isEditing ? (
                <select
                  value={formData.companySize}
                  onChange={(e) => setFormData(prev => ({ ...prev, companySize: e.target.value as CompanySizeOption }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="1-10">1–10 employees</option>
                  <option value="11-50">11–50 employees</option>
                  <option value="51-200">51–200 employees</option>
                  <option value="201-500">201–500 employees</option>
                  <option value="501-1000">501–1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              ) : (
                <div className="px-4 py-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  <span>{profile.companySize} employees</span>
                </div>
              )}
            </div>

            {/* 6. FOUNDED YEAR */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                6. Founded Year
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.foundedYear || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, foundedYear: e.target.value }))}
                    placeholder="e.g. 2015"
                    className={`w-full px-4 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 ${
                      errors.foundedYear ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  {errors.foundedYear && <p className="text-[11px] text-red-400 mt-1">{errors.foundedYear}</p>}
                </div>
              ) : (
                <div className="px-4 py-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>{profile.foundedYear || 'Not specified'}</span>
                </div>
              )}
            </div>

            {/* 7. WEBSITE */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                7. Website
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.company.com"
                    className={`w-full px-4 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 ${
                      errors.website ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  {errors.website && <p className="text-[11px] text-red-400 mt-1">{errors.website}</p>}
                </div>
              ) : (
                <div className="px-4 py-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  {profile.website ? (
                    <a
                      href={formatExternalUrl(profile.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <span>{profile.website}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span>Not specified</span>
                  )}
                </div>
              )}
            </div>

            {/* 8. LINKEDIN PROFILE */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                8. LinkedIn Profile
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="url"
                    value={formData.linkedin || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/company/name"
                    className={`w-full px-4 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 ${
                      errors.linkedin ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  {errors.linkedin && <p className="text-[11px] text-red-400 mt-1">{errors.linkedin}</p>}
                </div>
              ) : (
                <div className="px-4 py-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  {profile.linkedin ? (
                    <a
                      href={formatExternalUrl(profile.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <span>{profile.linkedin}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span>Not specified</span>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* 9. COMPANY DESCRIPTION */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              9. Company Description
            </label>
            {isEditing ? (
              <textarea
                rows={5}
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your company..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            ) : (
              <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-xs text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[100px]">
                {profile.description || 'Describe your company...'}
              </div>
            )}
          </div>

          {/* FORM EDITING ACTIONS: CANCEL / SAVE CHANGES */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-600/30 transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};
