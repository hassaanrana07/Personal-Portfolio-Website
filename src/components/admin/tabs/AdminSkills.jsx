import React, { useState, useEffect, useCallback } from 'react';
import { 
  Cpu, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  RefreshCw, 
  Loader2, 
  Save, 
  X, 
  Sparkles,
  Filter,
  Globe
} from 'lucide-react';
import adminApi from '../../../services/adminApi';
import ConfirmModal from '../common/ConfirmModal';

const CATEGORIES = ['Frontend', 'Backend', 'Databases', 'Tools / Cloud', 'AI / Architecture'];

const COLOR_PRESETS = [
  { label: 'Amber Glow', hex: '#FFE9A8' },
  { label: 'Warm Orange', hex: '#FF9A3D' },
  { label: 'Crimson Flame', hex: '#FF5722' },
  { label: 'Cyber Violet', hex: '#a855f7' },
  { label: 'Neon Cyan', hex: '#00F2FE' },
  { label: 'Emerald Green', hex: '#10B981' }
];

export default function AdminSkills({ showToast }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const initialFormState = {
    name: '',
    category: 'Frontend',
    color_hex: '#FFE9A8',
    description: '',
    orbit_radius: 10.0,
    orbit_speed: 0.5,
    sort_order: 0
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSkills();
      if (res && res.success && Array.isArray(res.data)) {
        setSkills(res.data);
      }
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to load skills from MySQL.' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Modal body scroll lock and Escape key listener
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setIsModalOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isModalOpen]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...initialFormState,
      sort_order: skills.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (skill) => {
    setEditingId(skill.id);
    setFormData({
      name: skill.name || '',
      category: skill.category || 'Frontend',
      color_hex: skill.color_hex || skill.colorHex || '#FFE9A8',
      description: skill.description || skill.desc || '',
      orbit_radius: skill.orbit_radius !== undefined ? Number(skill.orbit_radius) : (skill.orbitRadius !== undefined ? Number(skill.orbitRadius) : 10.0),
      orbit_speed: skill.orbit_speed !== undefined ? Number(skill.orbit_speed) : (skill.orbitSpeed !== undefined ? Number(skill.orbitSpeed) : 0.5),
      sort_order: skill.sort_order !== undefined ? Number(skill.sort_order) : 0
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category.trim()) {
      showToast({ type: 'error', message: 'Skill name and Category are required.' });
      return;
    }

    setModalSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        color_hex: formData.color_hex.trim(),
        description: formData.description.trim() || null,
        orbit_radius: parseFloat(formData.orbit_radius || 10),
        orbit_speed: parseFloat(formData.orbit_speed || 0.5),
        sort_order: parseInt(formData.sort_order || 0, 10)
      };

      if (editingId) {
        await adminApi.updateSkill(editingId, payload);
        showToast({ type: 'success', message: `Skill "${payload.name}" updated successfully!` });
      } else {
        await adminApi.createSkill(payload);
        showToast({ type: 'success', message: `Skill "${payload.name}" created successfully!` });
      }

      setIsModalOpen(false);
      await fetchSkills();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to save skill.' });
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteSkill(deleteId);
      showToast({ type: 'success', message: 'Skill deleted from MySQL.' });
      setDeleteId(null);
      await fetchSkills();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to delete skill.' });
    } finally {
      setDeleting(false);
    }
  };

  const filteredSkills = skills.filter((s) => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.description && s.description.toLowerCase().includes(term));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="font-sora text-xl font-bold text-[#F5F1EC] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#FF9A3D]" />
            <span>Skills & 3D Solar System Orbits</span>
          </h2>
          <p className="font-sans text-xs text-[#9A9088] mt-1">
            Manage your technical skill matrix and Three.js 3D Solar System planetary coordinates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSkills}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white/05 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#9A9088] hover:text-[#F5F1EC] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#FF9A3D] text-[#0D0B0A] font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF5722]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {/* Filter / Category Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#FF9A3D] text-[#0D0B0A] font-bold'
                  : 'bg-white/05 text-[#9A9088] hover:text-[#F5F1EC] hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#141210] border border-white/10 sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#9A9088] ml-1" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search skills..."
            className="bg-transparent border-none text-xs font-mono text-[#F5F1EC] placeholder-[#9A9088]/60 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="w-full min-h-[300px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#FF9A3D]" />
          <span className="text-xs font-mono text-[#9A9088]">Loading skills matrix...</span>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-[#9A9088] border border-dashed border-white/10 rounded-2xl bg-[#141210]">
          No skills found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="p-5 rounded-2xl bg-[#141210] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full shadow-md shrink-0"
                      style={{ backgroundColor: skill.color_hex || skill.colorHex || '#FFE9A8' }}
                    />
                    <h3 className="font-sora text-sm font-bold text-[#F5F1EC]">
                      {skill.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#9A9088] bg-white/05 px-2 py-0.5 rounded border border-white/05">
                    {skill.category}
                  </span>
                </div>

                <p className="text-xs font-sans text-[#9A9088] line-clamp-2 leading-relaxed">
                  {skill.description || skill.desc || 'Core technology stack tool.'}
                </p>
              </div>

              {/* Orbit Parameters & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-white/05">
                <div className="text-[10px] font-mono text-[#9A9088]">
                  <span>R: <b className="text-[#F5F1EC]">{skill.orbit_radius || skill.orbitRadius || 10}</b></span>
                  <span className="mx-1.5">&bull;</span>
                  <span>Spd: <b className="text-[#F5F1EC]">{skill.orbit_speed || skill.orbitSpeed || 0.5}</b></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(skill)}
                    className="p-1.5 rounded-lg bg-white/05 hover:bg-white/15 text-[#F5F1EC] hover:text-[#FF9A3D] transition-colors cursor-pointer"
                    title="Edit Skill"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(skill.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                    title="Delete Skill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Skill Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center min-h-screen"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-[#12100E] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-[#F5F1EC] my-auto max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF9A3D]/10 text-[#FF9A3D] flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="font-sora text-base font-bold text-[#F5F1EC]">
                  {editingId ? `Edit Skill: ${formData.name}` : 'Add New Skill'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-4 overflow-y-auto flex-1 max-h-[calc(85vh-150px)] pr-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9A9088]">Skill Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                  placeholder="e.g. Laravel, React.js, PostgreSQL"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#9A9088]">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#9A9088]">Color Theme</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="color_hex"
                      value={formData.color_hex}
                      onChange={handleChange}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      name="color_hex"
                      value={formData.color_hex}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Color Presets */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-mono text-[#9A9088]">Presets:</span>
                {COLOR_PRESETS.map((cp) => (
                  <button
                    key={cp.hex}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, color_hex: cp.hex }))}
                    className="w-4 h-4 rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: cp.hex }}
                    title={cp.label}
                  />
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9A9088]">Description / Technologies</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-sans text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                  placeholder="Eloquent ORM, Blade Templates, Inertia.js & Modular Backends"
                />
              </div>

              {/* Orbit Coordinates */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#9A9088]">3D Orbit Radius</label>
                  <input
                    type="number"
                    step="0.1"
                    name="orbit_radius"
                    value={formData.orbit_radius}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#9A9088]">3D Orbit Speed</label>
                  <input
                    type="number"
                    step="0.01"
                    name="orbit_speed"
                    value={formData.orbit_speed}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] outline-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalSaving}
                  className="px-4 py-2 rounded-xl bg-white/05 hover:bg-white/10 text-xs font-mono text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="px-5 py-2 rounded-xl bg-[#FF5722] hover:bg-[#FF9A3D] text-[#0D0B0A] font-mono font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {modalSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalSaving ? 'Saving...' : editingId ? 'Update Skill' : 'Create Skill'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Skill"
        message="Are you sure you want to delete this skill? It will be removed from the 3D Solar System and TechStack list."
        confirmText="Delete Skill"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
