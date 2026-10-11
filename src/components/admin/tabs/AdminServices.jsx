import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wrench, 
  Plus, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  Loader2, 
  Save, 
  X, 
  Code, 
  Server, 
  Database, 
  Layout, 
  Cloud, 
  ShieldCheck, 
  Cpu, 
  Terminal,
  Layers
} from 'lucide-react';
import adminApi from '../../../services/adminApi';
import ConfirmModal from '../common/ConfirmModal';

const AVAILABLE_ICONS = [
  { name: 'code', label: 'Code / Full-Stack', Icon: Code },
  { name: 'server', label: 'Server / Backend', Icon: Server },
  { name: 'database', label: 'Database / SQL', Icon: Database },
  { name: 'layout', label: 'Layout / UI/UX', Icon: Layout },
  { name: 'cloud', label: 'Cloud / DevOps', Icon: Cloud },
  { name: 'shield', label: 'Shield / Security', Icon: ShieldCheck },
  { name: 'cpu', label: 'CPU / Performance', Icon: Cpu },
  { name: 'terminal', label: 'Terminal / CLI', Icon: Terminal }
];

function getServiceIcon(iconName) {
  const found = AVAILABLE_ICONS.find(i => i.name === iconName);
  return found ? found.Icon : Code;
}

export default function AdminServices({ showToast }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const initialFormState = {
    title: '',
    short_desc: '',
    full_desc: '',
    icon_name: 'code',
    sort_order: 0
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getServices();
      if (res && res.success && Array.isArray(res.data)) {
        const sorted = [...res.data].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        setServices(sorted);
      }
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to load services from MySQL.' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

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
      sort_order: services.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingId(service.id);
    setFormData({
      title: service.title || '',
      short_desc: service.short_desc || service.desc || '',
      full_desc: service.full_desc || service.desc || '',
      icon_name: service.icon_name || service.icon || 'code',
      sort_order: service.sort_order !== undefined ? service.sort_order : 0
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.short_desc.trim()) {
      showToast({ type: 'error', message: 'Title and Short Description are required.' });
      return;
    }

    setModalSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        short_desc: formData.short_desc.trim(),
        full_desc: formData.full_desc.trim() || null,
        icon_name: formData.icon_name,
        sort_order: parseInt(formData.sort_order || 0, 10)
      };

      if (editingId) {
        await adminApi.updateService(editingId, payload);
        showToast({ type: 'success', message: `Service "${payload.title}" updated successfully!` });
      } else {
        await adminApi.createService(payload);
        showToast({ type: 'success', message: `Service "${payload.title}" created successfully!` });
      }

      setIsModalOpen(false);
      await fetchServices();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to save service.' });
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteService(deleteId);
      showToast({ type: 'success', message: 'Service deleted from MySQL.' });
      setDeleteId(null);
      await fetchServices();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to delete service.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="font-sora text-xl font-bold text-[#F5F1EC] flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#FF9A3D]" />
            <span>Services & Capabilities</span>
          </h2>
          <p className="font-sans text-xs text-[#9A9088] mt-1">
            Manage the service offerings, architectural specializations, and engineering capabilities displayed on the portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchServices}
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
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="w-full min-h-[300px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#FF9A3D]" />
          <span className="text-xs font-mono text-[#9A9088]">Loading services from MySQL...</span>
        </div>
      ) : services.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-[#9A9088] border border-dashed border-white/10 rounded-2xl bg-[#141210]">
          No services defined yet. Click "Add Service" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, index) => {
            const IconComponent = getServiceIcon(service.icon_name || service.icon);

            return (
              <div
                key={service.id}
                className="p-6 rounded-2xl bg-[#141210] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-5 group relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#FF9A3D]/10 border border-[#FF9A3D]/20 text-[#FF9A3D] flex items-center justify-center">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono text-[#9A9088] bg-white/05 px-2 py-0.5 rounded border border-white/05">
                      #{service.sort_order || index + 1}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-sora text-base font-bold text-[#F5F1EC]">
                      {service.title}
                    </h3>
                    <p className="text-xs font-sans text-[#9A9088] mt-1 leading-relaxed">
                      {service.short_desc || service.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/05">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(service)}
                    className="px-3 py-1.5 rounded-lg bg-white/05 hover:bg-white/15 text-xs font-mono text-[#F5F1EC] hover:text-[#FF9A3D] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(service.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
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
                  <Wrench className="w-4 h-4" />
                </div>
                <h3 className="font-sora text-base font-bold text-[#F5F1EC]">
                  {editingId ? 'Edit Service' : 'Add New Service'}
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

            <form onSubmit={handleSaveService} className="space-y-4 overflow-y-auto flex-1 max-h-[calc(85vh-150px)] pr-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9A9088]">Service Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                  placeholder="e.g. Full-Stack Web Development"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9A9088]">Icon *</label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_ICONS.map(({ name, label, Icon }) => {
                    const isSelected = formData.icon_name === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon_name: name }))}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FF9A3D]/20 border-[#FF9A3D] text-[#FF9A3D]'
                            : 'bg-white/03 border-white/10 hover:bg-white/07 text-[#9A9088]'
                        }`}
                        title={label}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-mono capitalize">{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9A9088]">Short Description *</label>
                <textarea
                  rows={2}
                  name="short_desc"
                  value={formData.short_desc}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-sans text-[#F5F1EC] placeholder-[#8A8078] outline-none leading-relaxed"
                  placeholder="Concise overview for service cards..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9A9088]">Full Description (Optional)</label>
                <textarea
                  rows={3}
                  name="full_desc"
                  value={formData.full_desc}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-sans text-[#F5F1EC] placeholder-[#8A8078] outline-none leading-relaxed"
                  placeholder="Extended breakdown of delivery workflow, SLA, technologies used..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9A9088]">Sort Order</label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] outline-none"
                />
              </div>

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
                  <span>{modalSaving ? 'Saving...' : editingId ? 'Update Service' : 'Create Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Service"
        message="Are you sure you want to delete this service? It will be removed from the public services section."
        confirmText="Delete Service"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
