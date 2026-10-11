import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Github, 
  Linkedin, 
  Instagram, 
  FileText, 
  Save, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Shield,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import adminApi from '../../../services/adminApi';

export default function AdminProfile({ admin, onUpdateAccount, showToast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    title: '',
    tagline: '',
    headline: '',
    bio: '',
    location: '',
    email: '',
    phone: '',
    status_text: '',
    status_badge: '',
    github_url: '',
    linkedin_url: '',
    instagram_url: '',
    resume_url: ''
  });

  // Account Security & Credentials State
  const [accountForm, setAccountForm] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);

  useEffect(() => {
    if (admin) {
      setAccountForm((prev) => ({
        ...prev,
        name: admin.name || prev.name,
        email: admin.email || prev.email
      }));
    }
  }, [admin]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProfile();
      if (res && res.success && res.data) {
        const d = res.data;
        setFormData({
          full_name: d.full_name || d.fullName || '',
          title: d.title || '',
          tagline: d.tagline || '',
          headline: d.headline || d.tagline || '',
          bio: d.bio || '',
          location: d.location || '',
          email: d.email || '',
          phone: d.phone || '',
          status_text: d.status_text || d.statusText || '',
          status_badge: d.status_badge || d.statusBadge || '',
          github_url: d.github_url || d.githubUrl || '',
          linkedin_url: d.linkedin_url || d.linkedinUrl || '',
          instagram_url: d.instagram_url || d.instagramUrl || '',
          resume_url: d.resume_url || d.resumeUrl || ''
        });
      }
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to load profile from MySQL.' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.title.trim()) {
      showToast({ type: 'error', message: 'Full name and Job Title are required.' });
      return;
    }

    setSaving(true);
    try {
      await adminApi.updateProfile({
        full_name: formData.full_name.trim(),
        title: formData.title.trim(),
        tagline: formData.tagline.trim(),
        headline: formData.headline.trim() || formData.tagline.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        status_text: formData.status_text.trim(),
        status_badge: formData.status_badge.trim(),
        github_url: formData.github_url.trim(),
        linkedin_url: formData.linkedin_url.trim(),
        instagram_url: formData.instagram_url.trim(),
        resume_url: formData.resume_url.trim()
      });

      showToast({ type: 'success', message: 'Profile updated in MySQL and saved successfully!' });
      await loadProfile();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    if (!accountForm.currentPassword) {
      showToast({ type: 'error', message: 'Current password is required to update security credentials.' });
      return;
    }

    if (accountForm.newPassword) {
      if (accountForm.newPassword.length < 8) {
        showToast({ type: 'error', message: 'New password must be at least 8 characters long.' });
        return;
      }
      if (accountForm.newPassword !== accountForm.confirmNewPassword) {
        showToast({ type: 'error', message: 'New password and confirmation do not match.' });
        return;
      }
    }

    setAccountSaving(true);
    try {
      if (onUpdateAccount) {
        await onUpdateAccount(
          accountForm.currentPassword,
          accountForm.email,
          accountForm.newPassword || undefined,
          accountForm.name || undefined
        );
      } else {
        await adminApi.updateAccount({
          currentPassword: accountForm.currentPassword,
          newEmail: accountForm.email,
          newPassword: accountForm.newPassword || undefined,
          newName: accountForm.name || undefined
        });
      }
      showToast({ type: 'success', message: 'Admin account credentials updated successfully!' });
      setAccountForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to update credentials.' });
    } finally {
      setAccountSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF9A3D]" />
        <span className="text-xs font-mono text-[#9A9088]">Fetching Profile Data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="font-sora text-xl font-bold text-[#F5F1EC] flex items-center gap-2">
            <User className="w-5 h-5 text-[#FF9A3D]" />
            <span>Profile Management</span>
          </h2>
          <p className="font-sans text-xs text-[#9A9088] mt-1">
            Update personal information, hero headlines, about text, and social links shown across the public portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadProfile}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl bg-white/05 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#9A9088] hover:text-[#F5F1EC] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#FF9A3D] text-[#0D0B0A] font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF5722]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Core Identity */}
        <div className="p-6 rounded-2xl bg-[#141210] border border-white/10 space-y-4">
          <h3 className="font-sora text-sm font-bold text-[#FF9A3D] uppercase tracking-wider">
            1. Core Identity & Hero Content
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                placeholder="Hassaan Ali Akbar"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">Job Title / Role *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                placeholder="Full Stack Developer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                placeholder="Creative Problem Solver"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">Headline</label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                placeholder="Building Scalable Web Systems"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Availability & Status */}
        <div className="p-6 rounded-2xl bg-[#141210] border border-white/10 space-y-4">
          <h3 className="font-sora text-sm font-bold text-[#FF9A3D] uppercase tracking-wider">
            2. Availability & Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">Status Text</label>
              <input
                type="text"
                name="status_text"
                value={formData.status_text}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                placeholder="Open for Opportunities"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">Status Badge</label>
              <input
                type="text"
                name="status_badge"
                value={formData.status_badge}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                placeholder="Full-Time"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                placeholder="Lahore, Pakistan"
              />
            </div>
          </div>
        </div>

        {/* Section 3: About Bio */}
        <div className="p-6 rounded-2xl bg-[#141210] border border-white/10 space-y-4">
          <h3 className="font-sora text-sm font-bold text-[#FF9A3D] uppercase tracking-wider">
            3. About Me Biography
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#9A9088]">Bio Description (Markdown / Multi-paragraph support)</label>
            <textarea
              name="bio"
              rows={6}
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-sans text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors leading-relaxed resize-y"
              placeholder="Detailed description of your background, architectural focus, and engineering values..."
            />
          </div>
        </div>

        {/* Section 4: Contact & Social Profiles */}
        <div className="p-6 rounded-2xl bg-[#141210] border border-white/10 space-y-4">
          <h3 className="font-sora text-sm font-bold text-[#FF9A3D] uppercase tracking-wider">
            4. Contact & Social Profiles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                placeholder="hassaanalee07@gmail.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">Phone / WhatsApp</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                placeholder="+92-313-456-3723"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">GitHub Profile URL</label>
              <input
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                placeholder="https://github.com/hassaanrana07"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">LinkedIn Profile URL</label>
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                placeholder="https://linkedin.com/in/hassaanaliakbar"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">Instagram Profile URL</label>
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                placeholder="https://www.instagram.com/hassaanaleerana/"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-[#9A9088] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#FF9A3D]" />
                  <span>Resume / Review PDF Document</span>
                </label>
                {formData.resume_url && (
                  <a
                    href={formData.resume_url.startsWith('http') ? formData.resume_url : (formData.resume_url.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${formData.resume_url}` : formData.resume_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-[#FF9A3D] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View / Test Download</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  name="resume_url"
                  value={formData.resume_url}
                  onChange={handleChange}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                  placeholder="/uploads/doc-... or /Hassaan Ali Akbar Resume.pdf"
                />

                <label className={`px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FF9A3D]/40 text-xs font-mono font-bold text-[#F5F1EC] flex items-center justify-center gap-2 transition-colors flex-shrink-0 ${uploadingResume ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  {uploadingResume ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF9A3D]" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-[#FF9A3D]" />
                  )}
                  <span>{uploadingResume ? 'Uploading...' : 'Upload PDF'}</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    disabled={uploadingResume}
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Client-side validations
                      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                      if (!isPdf) {
                        showToast('error', 'Only PDF files (.pdf) are supported for resume.');
                        e.target.value = '';
                        return;
                      }

                      if (file.size > 10 * 1024 * 1024) {
                        showToast('error', 'Resume PDF exceeds 10MB limit.');
                        e.target.value = '';
                        return;
                      }

                      setUploadingResume(true);
                      try {
                        const res = await adminApi.uploadResume(file);
                        if (res && res.success && res.url) {
                          setFormData((prev) => ({ ...prev, resume_url: res.url }));
                          showToast('success', res.message || 'Resume uploaded and updated successfully.');
                        } else {
                          showToast('error', res?.message || 'Failed to upload resume PDF.');
                        }
                      } catch (err) {
                        showToast('error', err.message || err.data?.message || 'Resume upload failed.');
                      } finally {
                        setUploadingResume(false);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bottom Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-[#FF5722] hover:bg-[#FF9A3D] text-[#0D0B0A] font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF5722]/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* Section 5: Administrator Account & Login Security */}
      <div className="p-6 rounded-2xl bg-[#141210] border border-amber-500/20 shadow-lg shadow-black/40 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/08 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FF9A3D]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sora text-sm font-bold text-[#F5F1EC] flex items-center gap-2">
                <span>5. Administrator Account & Login Security</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400">
                  Protected
                </span>
              </h3>
              <p className="text-xs font-sans text-[#9A9088] mt-0.5">
                Update your login email, display name, and password for accessing this Admin CMS. Requires verifying your current password.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAccountSubmit} className="space-y-4">
          {/* Current Password Field */}
          <div className="p-4 rounded-xl bg-white/03 border border-white/08 space-y-2">
            <label className="text-xs font-mono text-[#F5F1EC] font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#FF9A3D]" />
              <span>Current Password (Required for Verification) *</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                name="currentPassword"
                value={accountForm.currentPassword}
                onChange={handleAccountChange}
                required
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                placeholder="Enter current admin password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Admin Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">Admin Display Name</label>
              <input
                type="text"
                name="name"
                value={accountForm.name}
                onChange={handleAccountChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                placeholder="Hassaan Ali Akbar"
              />
            </div>

            {/* New Admin Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">Admin Login Email</label>
              <input
                type="email"
                name="email"
                value={accountForm.email}
                onChange={handleAccountChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                placeholder="admin@hassaan.dev"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">New Password (Leave blank to keep current)</label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  name="newPassword"
                  value={accountForm.newPassword}
                  onChange={handleAccountChange}
                  minLength={8}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors"
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9A9088]">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  name="confirmNewPassword"
                  value={accountForm.confirmNewPassword}
                  onChange={handleAccountChange}
                  minLength={8}
                  disabled={!accountForm.newPassword}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Repeat new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer disabled:opacity-50"
                  tabIndex={-1}
                  disabled={!accountForm.newPassword}
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={accountSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FF9A3D] hover:opacity-90 text-[#0D0B0A] font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF5722]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {accountSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              <span>{accountSaving ? 'Updating Credentials...' : 'Update Login Credentials'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
