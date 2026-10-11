import React, { useState, useEffect, useCallback } from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  RefreshCw, 
  Loader2, 
  Save, 
  X, 
  MapPin, 
  Calendar,
  Tag
} from 'lucide-react';
import adminApi from '../../../services/adminApi';
import ConfirmModal from '../common/ConfirmModal';

const COLOR_THEMES = [
  { value: 'cyan', label: 'Cyan Glow', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { value: 'orange', label: 'Orange Flare', bg: 'bg-[#FF9A3D]/10', text: 'text-[#FF9A3D]', border: 'border-[#FF9A3D]/30' },
  { value: 'purple', label: 'Purple Mist', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  { value: 'emerald', label: 'Emerald Beam', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' }
];

export default function AdminExperience({ showToast }) {
  const [workList, setWorkList] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all | work | education

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const initialFormState = {
    type: 'work',
    period: '',
    role: '',
    organization: '',
    location: 'Lahore, Pakistan',
    description: '',
    tags: '',
    color_theme: 'cyan',
    sort_order: 0
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchExperience = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getExperience();
      if (res && res.success && res.data) {
        setWorkList(Array.isArray(res.data.work) ? res.data.work : []);
        setEducationList(Array.isArray(res.data.education) ? res.data.education : []);
      }
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to load experience items from MySQL.' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchExperience();
  }, [fetchExperience]);

  // Escape key & body scroll lock for modal
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !modalSaving) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isModalOpen, modalSaving]);

  const handleOpenAdd = (defaultType = 'work') => {
    setEditingId(null);
    const count = defaultType === 'work' ? workList.length : educationList.length;
    setFormData({
      ...initialFormState,
      type: defaultType,
      sort_order: count + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    let tagString = '';
    if (Array.isArray(item.tags)) {
      tagString = item.tags.join(', ');
    } else if (typeof item.tags === 'string') {
      try {
        const parsed = JSON.parse(item.tags);
        tagString = Array.isArray(parsed) ? parsed.join(', ') : item.tags;
      } catch {
        tagString = item.tags;
      }
    }

    setFormData({
      type: item.type || 'work',
      period: item.period || '',
      role: item.role || '',
      organization: item.organization || item.company || item.institution || '',
      location: item.location || '',
      description: item.description || '',
      tags: tagString,
      color_theme: item.color_theme || item.color || 'cyan',
      sort_order: item.sort_order !== undefined ? item.sort_order : 0
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.period.trim() || !formData.role.trim() || !formData.organization.trim() || !formData.description.trim()) {
      showToast({ type: 'error', message: 'Period, Role, Organization, and Description are required.' });
      return;
    }

    setModalSaving(true);
    try {
      const tagArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        type: formData.type,
        period: formData.period.trim(),
        role: formData.role.trim(),
        organization: formData.organization.trim(),
        location: formData.location.trim() || null,
        description: formData.description.trim(),
        tags: tagArray,
        color_theme: formData.color_theme,
        sort_order: parseInt(formData.sort_order || 0, 10)
      };

      if (editingId) {
        await adminApi.updateExperience(editingId, payload);
        showToast({ type: 'success', message: 'Experience record updated successfully!' });
      } else {
        await adminApi.createExperience(payload);
        showToast({ type: 'success', message: 'Experience record created successfully!' });
      }

      setIsModalOpen(false);
      await fetchExperience();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to save experience.' });
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteExperience(deleteId);
      showToast({ type: 'success', message: 'Experience record deleted from MySQL.' });
      setDeleteId(null);
      await fetchExperience();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to delete experience.' });
    } finally {
      setDeleting(false);
    }
  };

  const allItems = [
    ...workList.map(w => ({ ...w, type: 'work' })),
    ...educationList.map(e => ({ ...e, type: 'education' }))
  ];

  const displayedItems = allItems.filter(item => {
    if (activeTab === 'work') return item.type === 'work';
    if (activeTab === 'education') return item.type === 'education';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="font-sora text-xl font-bold text-[#F5F1EC] flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#FF9A3D]" />
            <span>Experience & Education Timeline</span>
          </h2>
          <p className="font-sans text-xs text-[#9A9088] mt-1">
            Manage your career history, professional roles, academic milestones, and technical achievements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchExperience}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white/05 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#9A9088] hover:text-[#F5F1EC] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAdd(activeTab === 'education' ? 'education' : 'work')}
            className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#FF9A3D] text-[#0D0B0A] font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF5722]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#FF9A3D] text-[#0D0B0A] font-bold'
              : 'text-[#9A9088] hover:text-[#F5F1EC] hover:bg-white/05'
          }`}
        >
          All ({allItems.length})
        </button>
        <button
          onClick={() => setActiveTab('work')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'work'
              ? 'bg-cyan-500 text-[#0D0B0A] font-bold'
              : 'text-[#9A9088] hover:text-[#F5F1EC] hover:bg-white/05'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Work Experience ({workList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'education'
              ? 'bg-purple-500 text-[#0D0B0A] font-bold'
              : 'text-[#9A9088] hover:text-[#F5F1EC] hover:bg-white/05'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Education ({educationList.length})</span>
        </button>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="w-full min-h-[300px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#FF9A3D]" />
          <span className="text-xs font-mono text-[#9A9088]">Fetching experience records...</span>
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-[#9A9088] border border-dashed border-white/10 rounded-2xl bg-[#141210]">
          No entries found in this section. Click "Add Entry" to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {displayedItems.map((item) => {
            const isEdu = item.type === 'education';
            const theme = COLOR_THEMES.find(t => t.value === (item.color_theme || item.color)) || COLOR_THEMES[0];
            const tags = Array.isArray(item.tags)
              ? item.tags
              : typeof item.tags === 'string'
              ? item.tags.split(',').map(t => t.trim()).filter(Boolean)
              : [];

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#141210] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${theme.bg} ${theme.text} ${theme.border}`}>
                    {isEdu ? <GraduationCap className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-sora text-base font-bold text-[#F5F1EC]">
                        {item.role}
                      </h3>
                      <span className="text-xs font-mono text-[#FF9A3D]">
                        @ {item.organization || item.company || item.institution}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                        isEdu ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      }`}>
                        {item.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-[#9A9088]">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#FF9A3D]" />
                        {item.period}
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#9A9088]" />
                          {item.location}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-sans text-[#b8b8b5] leading-relaxed pt-1">
                      {item.description}
                    </p>

                    {tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-2">
                        {tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/05 text-[#9A9088] border border-white/05"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-xl bg-white/05 hover:bg-white/10 border border-white/10 text-[#F5F1EC] hover:text-[#FF9A3D] transition-colors cursor-pointer"
                    title="Edit Item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(item.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accessible Experience Form Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center min-h-screen"
          onClick={() => !modalSaving && setIsModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-[#14110F] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-[#F5F1EC]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Pinned) */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF9A3D]/10 text-[#FF9A3D] flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="font-sora text-base font-bold text-[#F5F1EC]">
                  {editingId ? 'Edit Timeline Entry' : 'Add New Timeline Entry'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer"
                title="Close dialog"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSave} className="space-y-4 overflow-y-auto flex-1 pr-1.5 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#9A9088]">Entry Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] outline-none"
                  >
                    <option value="work">Work Experience</option>
                    <option value="education">Education</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#9A9088]">Period / Duration *</label>
                  <input
                    type="text"
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                    placeholder="2023 - Present"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#9A9088]">Role / Degree *</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                    placeholder="Senior Full Stack Developer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#9A9088]">Company / University *</label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                    placeholder="Tech Enterprise Ltd"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#9A9088]">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                    placeholder="Lahore, Pakistan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#9A9088]">Color Theme</label>
                  <select
                    name="color_theme"
                    value={formData.color_theme}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] outline-none"
                  >
                    {COLOR_THEMES.map((theme) => (
                      <option key={theme.value} value={theme.value}>
                        {theme.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9A9088]">Description / Key Achievements *</label>
                <textarea
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-sans text-[#F5F1EC] placeholder-[#8A8078] outline-none leading-relaxed"
                  placeholder="Led development of multi-tenant enterprise portal, reducing latency by 40%..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9A9088]">Technologies / Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                  placeholder="Laravel, React, PostgreSQL, Docker, AWS"
                />
              </div>

              {/* Modal Footer (Pinned) */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalSaving}
                  className="px-4 py-2.5 rounded-xl bg-white/05 hover:bg-white/10 text-xs font-mono text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#FF9A3D] text-[#0D0B0A] font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF5722]/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {modalSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalSaving ? 'Saving...' : editingId ? 'Update Entry' : 'Create Entry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Timeline Entry"
        message="Are you sure you want to delete this experience record? It will be removed permanently from MySQL."
        confirmText="Delete Entry"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
