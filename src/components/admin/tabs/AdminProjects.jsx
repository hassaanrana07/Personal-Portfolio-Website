import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink, 
  Github, 
  Sparkles, 
  Search, 
  RefreshCw, 
  Loader2, 
  Save, 
  X, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  Layers,
  Code,
  Upload,
  Image as ImageIcon,
  Link2,
  MoveVertical
} from 'lucide-react';
import adminApi from '../../../services/adminApi';
import ConfirmModal from '../common/ConfirmModal';

const PREVIEW_OPTIONS = [
  { value: '', label: 'None / Neutral Fallback' },
  { value: 'construction', label: 'Construction Platform (Interactive)' },
  { value: 'realestate', label: 'Real Estate Platform (Interactive)' },
  { value: 'social', label: 'Social Platform (Interactive)' },
  { value: 'management', label: 'Project Management (Interactive)' },
  { value: 'airquality', label: 'IoT / Environment (Interactive)' },
  { value: 'cms', label: 'Headless CMS (Interactive)' },
  { value: 'custom', label: 'Custom Identifier...' }
];

export default function AdminProjects({ showToast }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('basic'); // basic | casestudy | json
  
  // Image handling in form
  const [imageInputMode, setImageInputMode] = useState('url'); // 'url' | 'upload'
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Custom preview identifier state
  const [isCustomPreview, setIsCustomPreview] = useState(false);
  const [customPreviewVal, setCustomPreviewVal] = useState('');

  // Confirm Delete Modal
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form Fields
  const initialFormState = {
    slug: '',
    number: '01',
    name: '',
    subtitle: '',
    category: 'Full-Stack Web Application',
    project_type: 'Full-Stack Web Application',
    role: 'Lead Developer',
    accent_color: '#FF9A3D',
    is_featured: false,
    is_published: true,
    sort_order: 0,
    image_url: '',
    description: '',
    technologies: 'React, Node.js, Express, MySQL',
    github_url: '',
    live_url: '',
    preview_type: '', // Blank by default for new projects
    case_study: {
      overview: '',
      problem: '',
      solution: '',
      architecture: '',
      impact: '',
      features: [],
      metrics: []
    }
  };

  const [formData, setFormData] = useState(initialFormState);
  const [caseStudyRawJson, setCaseStudyRawJson] = useState('{}');
  const [jsonError, setJsonError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProjects();
      if (res && res.success && Array.isArray(res.data)) {
        const sorted = [...res.data].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        setProjects(sorted);
      }
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to fetch projects from MySQL.' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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
    const nextOrder = projects.length + 1;
    const nextNum = nextOrder < 10 ? `0${nextOrder}` : `${nextOrder}`;
    const initial = {
      ...initialFormState,
      number: nextNum,
      sort_order: nextOrder,
      preview_type: '' // Blank by default
    };
    setFormData(initial);
    setIsCustomPreview(false);
    setCustomPreviewVal('');
    setImageInputMode('url');
    setCaseStudyRawJson(JSON.stringify(initial.case_study, null, 2));
    setJsonError(null);
    setActiveFormTab('basic');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingId(project.id);
    let techString = '';
    if (Array.isArray(project.technologies)) {
      techString = project.technologies.join(', ');
    } else if (typeof project.technologies === 'string') {
      try {
        const parsed = JSON.parse(project.technologies);
        techString = Array.isArray(parsed) ? parsed.join(', ') : project.technologies;
      } catch {
        techString = project.technologies;
      }
    }

    let csObj = project.case_study || project.caseStudy || {};
    if (typeof csObj === 'string') {
      try {
        csObj = JSON.parse(csObj);
      } catch {
        csObj = {};
      }
    }

    const rawPreview = project.preview_type || project.preview || '';
    const isStandardOption = PREVIEW_OPTIONS.some((opt) => opt.value === rawPreview);

    if (isStandardOption) {
      setIsCustomPreview(false);
      setCustomPreviewVal('');
    } else {
      setIsCustomPreview(true);
      setCustomPreviewVal(rawPreview);
    }

    const imgUrl = project.image_url || project.image || '';
    setImageInputMode(imgUrl.startsWith('/uploads/') ? 'upload' : 'url');

    setFormData({
      slug: project.slug || '',
      number: project.number || '01',
      name: project.name || '',
      subtitle: project.subtitle || '',
      category: project.category || 'Full-Stack Web Application',
      project_type: project.project_type || project.category || '',
      role: project.role || 'Developer',
      accent_color: project.accent_color || project.accentColor || '#FF9A3D',
      is_featured: Boolean(project.is_featured || project.isFeatured),
      is_published: project.is_published !== undefined ? Boolean(project.is_published) : (project.isPublished !== undefined ? Boolean(project.isPublished) : true),
      sort_order: project.sort_order !== undefined ? project.sort_order : 0,
      image_url: imgUrl,
      description: project.description || '',
      technologies: techString,
      github_url: project.github_url || project.github || '',
      live_url: project.live_url || project.live || '',
      preview_type: rawPreview,
      case_study: csObj
    });

    setCaseStudyRawJson(JSON.stringify(csObj, null, 2));
    setJsonError(null);
    setActiveFormTab('basic');
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePreviewDropdownChange = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomPreview(true);
      setFormData((prev) => ({ ...prev, preview_type: customPreviewVal }));
    } else {
      setIsCustomPreview(false);
      setFormData((prev) => ({ ...prev, preview_type: val }));
    }
  };

  const handleCustomPreviewInputChange = (e) => {
    const val = e.target.value.toLowerCase().trim();
    setCustomPreviewVal(val);
    setFormData((prev) => ({ ...prev, preview_type: val }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', message: 'Please select a valid image file (PNG, JPG, JPEG, WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: 'error', message: 'File size exceeds maximum limit of 5MB.' });
      return;
    }

    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      if (res && res.success && res.url) {
        setFormData((prev) => ({ ...prev, image_url: res.url }));
        showToast({ type: 'success', message: 'Image uploaded successfully.' });
      }
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to upload image.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCaseStudyFieldChange = (field, val) => {
    setFormData((prev) => {
      const updatedCs = { ...prev.case_study, [field]: val };
      setCaseStudyRawJson(JSON.stringify(updatedCs, null, 2));
      return { ...prev, case_study: updatedCs };
    });
  };

  const handleRawJsonChange = (e) => {
    const val = e.target.value;
    setCaseStudyRawJson(val);
    try {
      const parsed = JSON.parse(val);
      setFormData((prev) => ({ ...prev, case_study: parsed }));
      setJsonError(null);
    } catch (err) {
      setJsonError(err.message);
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!formData.slug.trim() || !formData.name.trim() || !formData.description.trim()) {
      showToast({ type: 'error', message: 'Slug, Name, and Description are required.' });
      return;
    }

    if (jsonError) {
      showToast({ type: 'error', message: 'Please fix JSON errors in Case Study before saving.' });
      return;
    }

    setModalSaving(true);
    try {
      const techArray = formData.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        slug: formData.slug.trim().toLowerCase(),
        number: formData.number.trim(),
        name: formData.name.trim(),
        subtitle: formData.subtitle.trim(),
        category: formData.category.trim(),
        project_type: formData.project_type.trim() || formData.category.trim(),
        role: formData.role.trim(),
        accent_color: formData.accent_color.trim(),
        is_featured: Boolean(formData.is_featured),
        is_published: Boolean(formData.is_published),
        sort_order: parseInt(formData.sort_order || 0, 10),
        image_url: formData.image_url.trim() || null,
        description: formData.description.trim(),
        technologies: techArray,
        github_url: formData.github_url.trim() || null,
        live_url: formData.live_url.trim() || null,
        preview_type: formData.preview_type.trim(),
        case_study: formData.case_study
      };

      if (editingId) {
        await adminApi.updateProject(editingId, payload);
        showToast({ type: 'success', message: `Project "${payload.name}" updated successfully!` });
      } else {
        await adminApi.createProject(payload);
        showToast({ type: 'success', message: `Project "${payload.name}" created successfully!` });
      }

      setIsModalOpen(false);
      await fetchProjects();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to save project.' });
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteProject(deleteId);
      showToast({ type: 'success', message: 'Project deleted successfully from MySQL.' });
      setDeleteId(null);
      await fetchProjects();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to delete project.' });
    } finally {
      setDeleting(false);
    }
  };

  // Step-by-step Move (Up / Down)
  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const newOrder = [...projects];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    setProjects(newOrder);
    setReordering(true);

    try {
      const orderedIds = newOrder.map((p) => p.id);
      await adminApi.reorderProjects(orderedIds);
      showToast({ type: 'success', message: 'Project order saved in MySQL.' });
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to reorder projects.' });
      await fetchProjects();
    } finally {
      setReordering(false);
    }
  };

  // Direct Jump Reordering (e.g. Move project 7 directly to position 3)
  const handleDirectReorder = async (projectId, targetPos) => {
    if (!projectId || typeof targetPos !== 'number') return;
    setReordering(true);

    try {
      await adminApi.moveProjectDirect(projectId, targetPos);
      showToast({ type: 'success', message: `Project moved to position ${targetPos} successfully.` });
      await fetchProjects();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to move project.' });
      await fetchProjects();
    } finally {
      setReordering(false);
    }
  };

  // Quick Toggle Project Visibility
  const handleTogglePublish = async (projectId, currentPublished) => {
    const nextState = !currentPublished;
    try {
      await adminApi.toggleProjectPublish(projectId, nextState);
      showToast({
        type: 'success',
        message: `Project ${nextState ? 'published on public portfolio' : 'hidden from public portfolio'}.`
      });
      await fetchProjects();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to update visibility.' });
    }
  };

  const filteredProjects = projects.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.slug && p.slug.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="font-sora text-xl font-bold text-[#F5F1EC] flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#FF9A3D]" />
            <span>Projects & Case Studies</span>
          </h2>
          <p className="font-sans text-xs text-[#9A9088] mt-1">
            Manage your flagship project catalog, visibility, screenshots, case study narratives, and display order.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchProjects}
            disabled={loading || reordering}
            className="px-3.5 py-2 rounded-xl bg-white/05 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#9A9088] hover:text-[#F5F1EC] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Refresh list"
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
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#141210] border border-white/10">
        <Search className="w-4 h-4 text-[#9A9088] ml-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by name, slug, or category..."
          className="bg-transparent border-none text-xs font-mono text-[#F5F1EC] placeholder-[#9A9088]/60 focus:outline-none w-full"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="p-1 rounded hover:bg-white/10 text-[#9A9088] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Project Table / List */}
      {loading ? (
        <div className="w-full min-h-[300px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#FF9A3D]" />
          <span className="text-xs font-mono text-[#9A9088]">Loading Projects from MySQL...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-[#9A9088] border border-dashed border-white/10 rounded-2xl bg-[#141210]">
          {searchTerm ? 'No projects match your search.' : 'No projects found. Click "Add Project" to create one.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project, index) => {
            const isPub = project.is_published !== undefined ? Boolean(project.is_published) : (project.isPublished !== undefined ? Boolean(project.isPublished) : true);
            const isFeat = Boolean(project.is_featured || project.isFeatured);

            return (
              <div
                key={project.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#141210] border border-white/10 hover:border-white/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
              >
                {/* Left Column: Reorder Controls, Accent Color, Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  
                  {/* Reordering Controls: Up/Down + Position Selector */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0 || reordering}
                        className="p-1 rounded bg-white/05 hover:bg-white/15 text-[#9A9088] hover:text-[#F5F1EC] disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === projects.length - 1 || reordering}
                        className="p-1 rounded bg-white/05 hover:bg-white/15 text-[#9A9088] hover:text-[#F5F1EC] disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Direct Position Dropdown */}
                    <div className="hidden sm:flex flex-col items-center">
                      <select
                        value={index + 1}
                        onChange={(e) => handleDirectReorder(project.id, parseInt(e.target.value, 10))}
                        disabled={reordering}
                        aria-label={`Position selector for ${project.name}`}
                        className="bg-white/05 hover:bg-white/10 text-[11px] font-mono font-bold text-[#F5F1EC] rounded-lg px-2 py-1.5 border border-white/10 outline-none cursor-pointer"
                        title="Jump directly to position"
                      >
                        {projects.map((_, pIdx) => (
                          <option key={pIdx + 1} value={pIdx + 1} className="bg-[#141210] text-[#F5F1EC]">
                            Pos #{pIdx + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Accent Color Dot & Number */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 border"
                    style={{
                      backgroundColor: `${project.accent_color || '#FF9A3D'}15`,
                      borderColor: `${project.accent_color || '#FF9A3D'}40`,
                      color: project.accent_color || '#FF9A3D'
                    }}
                  >
                    #{project.sort_order || index + 1}
                  </div>

                  {/* Info */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-sora text-sm font-bold text-[#F5F1EC] truncate">
                        {project.name}
                      </h3>
                      <span className="text-[10px] font-mono text-[#9A9088] bg-white/05 px-2 py-0.5 rounded border border-white/05">
                        /{project.slug}
                      </span>
                      
                      {/* Visibility Badge */}
                      <span
                        className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
                          isPub
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        }`}
                      >
                        {isPub ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                        <span>{isPub ? 'Published' : 'Hidden'}</span>
                      </span>

                      {/* Featured Badge */}
                      {isFeat && (
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Featured
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-sans text-[#9A9088] line-clamp-1">
                      {project.subtitle || project.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-[#9A9088] flex-wrap">
                      <span className="text-[#FF9A3D]">{project.category}</span>
                      <span>&bull;</span>
                      <span>{project.role || 'Developer'}</span>
                      {project.preview_type && (
                        <>
                          <span>&bull;</span>
                          <span className="text-[#9A9088]/80">Preview: {project.preview_type}</span>
                        </>
                      )}
                      {project.image_url && (
                        <>
                          <span>&bull;</span>
                          <span className="text-sky-400">Screenshot Attached</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  {/* Quick Visibility Toggle */}
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(project.id, isPub)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isPub
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                    title={isPub ? 'Click to hide from public site' : 'Click to publish on public site'}
                  >
                    {isPub ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{isPub ? 'Hide' : 'Publish'}</span>
                  </button>

                  <a
                    href={`#projects/${project.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/05 hover:bg-white/10 border border-white/10 text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer"
                    title="View Case Study Live"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(project)}
                    className="px-3 py-2 rounded-xl bg-white/05 hover:bg-white/10 border border-white/10 text-xs font-mono font-medium text-[#F5F1EC] hover:text-[#FF9A3D] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteId(project.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center min-h-screen"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-4xl bg-[#12100E] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-[#F5F1EC] my-auto max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF9A3D]/10 text-[#FF9A3D] flex items-center justify-center">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sora text-lg font-bold text-[#F5F1EC]">
                    {editingId ? `Edit Project: ${formData.name}` : 'Add New Project'}
                  </h3>
                  <p className="font-mono text-xs text-[#9A9088]">
                    Configure showcase details, screenshots, preview component, and case study.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveFormTab('basic')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  activeFormTab === 'basic'
                    ? 'bg-[#FF9A3D]/20 text-[#FF9A3D] border border-[#FF9A3D]/30'
                    : 'text-[#9A9088] hover:text-[#F5F1EC]'
                }`}
              >
                1. Basic Info & Media
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('casestudy')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  activeFormTab === 'casestudy'
                    ? 'bg-[#FF9A3D]/20 text-[#FF9A3D] border border-[#FF9A3D]/30'
                    : 'text-[#9A9088] hover:text-[#F5F1EC]'
                }`}
              >
                2. Case Study Narrative
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('json')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeFormTab === 'json'
                    ? 'bg-[#FF9A3D]/20 text-[#FF9A3D] border border-[#FF9A3D]/30'
                    : 'text-[#9A9088] hover:text-[#F5F1EC]'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Raw Case Study JSON</span>
              </button>
            </div>

            {/* Modal Scrollable Form Body */}
            <form onSubmit={handleSaveProject} className="space-y-6 overflow-y-auto flex-1 pr-2 max-h-[calc(85vh-160px)]">
              
              {/* Tab 1: Basic Info & Media */}
              {activeFormTab === 'basic' && (
                <div className="space-y-5">
                  
                  {/* Public Visibility Switch */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#181513] border border-white/10">
                    <div className="space-y-0.5">
                      <label htmlFor="is_published_cb" className="text-xs font-mono font-bold text-[#F5F1EC] cursor-pointer flex items-center gap-2">
                        {formData.is_published ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-amber-400" />}
                        <span>Show on Public Portfolio (Published)</span>
                      </label>
                      <p className="text-[11px] font-mono text-[#9A9088]">
                        When enabled, project appears on public portfolio. When disabled, project is saved in draft mode.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="is_published_cb"
                      name="is_published"
                      checked={formData.is_published}
                      onChange={handleFormChange}
                      className="w-5 h-5 rounded text-[#FF5722] accent-[#FF5722] cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#9A9088]">URL Slug *</label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleFormChange}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                        placeholder="brickbeam"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#9A9088]">Display Number</label>
                      <input
                        type="text"
                        name="number"
                        value={formData.number}
                        onChange={handleFormChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                        placeholder="01"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#9A9088]">Project Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                        placeholder="BrickBeam"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#9A9088]">Subtitle</label>
                      <input
                        type="text"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleFormChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                        placeholder="Enterprise Construction Operations Platform"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#9A9088]">Category</label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                        placeholder="Full-Stack Web Application"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#9A9088]">Role</label>
                      <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleFormChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                        placeholder="Lead Developer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#9A9088]">Accent Color (HEX)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          name="accent_color"
                          value={formData.accent_color}
                          onChange={handleFormChange}
                          className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          name="accent_color"
                          value={formData.accent_color}
                          onChange={handleFormChange}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                        />
                      </div>
                    </div>

                    {/* Preview Component Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#9A9088]">Preview Component</label>
                      <select
                        value={isCustomPreview ? 'custom' : formData.preview_type}
                        onChange={handlePreviewDropdownChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] outline-none cursor-pointer"
                      >
                        {PREVIEW_OPTIONS.map((pt) => (
                          <option key={pt.value} value={pt.value} className="bg-[#181513] text-[#F5F1EC]">
                            {pt.label}
                          </option>
                        ))}
                      </select>

                      {/* Custom Identifier Text Entry */}
                      {isCustomPreview && (
                        <div className="pt-2">
                          <input
                            type="text"
                            value={customPreviewVal}
                            onChange={handleCustomPreviewInputChange}
                            placeholder="e.g. construction, realestate, custom_id"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#100E0D] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Preview Image / Screenshot Section */}
                  <div className="space-y-3 p-4 rounded-2xl bg-[#141210] border border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="text-xs font-mono font-bold text-[#F5F1EC] flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-[#FF9A3D]" />
                          <span>Project Preview Image / Screenshot</span>
                        </label>
                        <p className="text-[11px] font-mono text-[#9A9088]">
                          Showcase screenshot displayed on the right side of the project card and case study.
                        </p>
                      </div>

                      {/* Mode Switcher */}
                      <div className="flex items-center gap-1 bg-white/05 p-1 rounded-xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => setImageInputMode('upload')}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                            imageInputMode === 'upload'
                              ? 'bg-[#FF9A3D] text-[#0D0B0A] font-bold'
                              : 'text-[#9A9088] hover:text-[#F5F1EC]'
                          }`}
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload File</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageInputMode('url')}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                            imageInputMode === 'url'
                              ? 'bg-[#FF9A3D] text-[#0D0B0A] font-bold'
                              : 'text-[#9A9088] hover:text-[#F5F1EC]'
                          }`}
                        >
                          <Link2 className="w-3 h-3" />
                          <span>Image URL</span>
                        </button>
                      </div>
                    </div>

                    {/* Option A: Upload Local Image File */}
                    {imageInputMode === 'upload' && (
                      <div className="space-y-3 pt-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/png, image/jpeg, image/webp, image/gif"
                          className="hidden"
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="p-6 border-2 border-dashed border-white/15 hover:border-[#FF9A3D]/50 rounded-xl bg-white/02 text-center cursor-pointer transition-colors space-y-2"
                        >
                          {uploadingImage ? (
                            <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#FF9A3D]">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Uploading &amp; validating image file...</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-[#9A9088] mx-auto" />
                              <div className="text-xs font-mono text-[#F5F1EC] font-bold">
                                Click to select image file from your computer
                              </div>
                              <div className="text-[11px] font-mono text-[#9A9088]">
                                Supports PNG, JPG, JPEG, WebP (Max: 5MB)
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Option B: Provide Image URL */}
                    {imageInputMode === 'url' && (
                      <div className="pt-2">
                        <input
                          type="url"
                          name="image_url"
                          value={formData.image_url}
                          onChange={handleFormChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                          placeholder="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80"
                        />
                      </div>
                    )}

                    {/* Live Image Preview & Clear */}
                    {formData.image_url && (
                      <div className="pt-2 flex items-center gap-4 bg-white/03 p-3 rounded-xl border border-white/05">
                        <img
                          src={formData.image_url}
                          alt="Screenshot Preview"
                          className="w-24 h-16 object-cover rounded-lg border border-white/10 bg-black/40"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="text-xs font-mono text-[#F5F1EC] font-bold truncate">
                            Attached Preview Image
                          </div>
                          <div className="text-[10px] font-mono text-[#9A9088] truncate">
                            {formData.image_url}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image_url: '' }))}
                          className="p-1.5 rounded-lg text-[#9A9088] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#9A9088]">Project Summary Description *</label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-sans text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                      placeholder="Comprehensive executive overview of the project, problem solved, and technical architecture."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#9A9088]">Technologies (comma separated)</label>
                    <input
                      type="text"
                      name="technologies"
                      value={formData.technologies}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                      placeholder="Laravel, React, PostgreSQL, Tailwind CSS, Docker"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#9A9088]">GitHub Repository URL</label>
                      <input
                        type="url"
                        name="github_url"
                        value={formData.github_url}
                        onChange={handleFormChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                        placeholder="https://github.com/hassaanrana07/brickbeam"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#9A9088]">Live Demo URL</label>
                      <input
                        type="url"
                        name="live_url"
                        value={formData.live_url}
                        onChange={handleFormChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                        placeholder="https://brickbeam.demo.com"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#181513] border border-white/10">
                    <input
                      type="checkbox"
                      id="is_featured_cb"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleFormChange}
                      className="w-4 h-4 rounded text-[#FF5722] accent-[#FF5722] cursor-pointer"
                    />
                    <label htmlFor="is_featured_cb" className="text-xs font-mono text-[#F5F1EC] cursor-pointer">
                      Mark as Featured Flagship Project (Displays highlighted badge and top-tier showcase treatment)
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: Case Study Narrative */}
              {activeFormTab === 'casestudy' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#9A9088]">Architecture &amp; System Overview</label>
                    <textarea
                      rows={3}
                      value={formData.case_study?.overview || formData.case_study?.architecture || ''}
                      onChange={(e) => handleCaseStudyFieldChange('overview', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-sans text-[#F5F1EC] placeholder-[#8A8078] outline-none leading-relaxed"
                      placeholder="High-level architecture, microservices, frontend-backend communications..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#9A9088]">Core Problem Solved</label>
                      <textarea
                        rows={3}
                        value={formData.case_study?.problem || ''}
                        onChange={(e) => handleCaseStudyFieldChange('problem', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-sans text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                        placeholder="What specific operational bottleneck or challenge did the client face?"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#9A9088]">Engineered Solution</label>
                      <textarea
                        rows={3}
                        value={formData.case_study?.solution || ''}
                        onChange={(e) => handleCaseStudyFieldChange('solution', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-sans text-[#F5F1EC] placeholder-[#8A8078] outline-none"
                        placeholder="What architectural patterns, algorithms, or tools were implemented to resolve it?"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#9A9088]">Impact &amp; Measurable Outcomes</label>
                    <textarea
                      rows={3}
                      value={formData.case_study?.impact || ''}
                      onChange={(e) => handleCaseStudyFieldChange('impact', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181513] border border-white/15 focus:border-[#FF9A3D] text-xs font-sans text-[#F5F1EC] placeholder-[#8A8078] outline-none leading-relaxed"
                      placeholder="Quantifiable speedups, error reductions, user adoptions, and scalability gains..."
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Raw JSON */}
              {activeFormTab === 'json' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-[#9A9088]">
                      Case Study JSON Payload (Full structured model with modules, decisions, data models):
                    </label>
                    {jsonError ? (
                      <span className="text-xs font-mono text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Invalid JSON
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Valid JSON
                      </span>
                    )}
                  </div>

                  <textarea
                    rows={12}
                    value={caseStudyRawJson}
                    onChange={handleRawJsonChange}
                    className="w-full p-4 rounded-xl bg-[#0A0908] border border-white/15 focus:border-[#FF9A3D] text-xs font-mono text-[#F5F1EC] placeholder-[#8A8078] outline-none leading-relaxed"
                    spellCheck="false"
                  />

                  {jsonError && (
                    <p className="text-xs font-mono text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                      JSON Parse Error: {jsonError}
                    </p>
                  )}
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalSaving}
                  className="px-4 py-2.5 rounded-xl bg-white/05 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#9A9088] hover:text-[#F5F1EC] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving || Boolean(jsonError)}
                  className="px-6 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#FF9A3D] text-[#0D0B0A] font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF5722]/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {modalSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{modalSaving ? 'Saving Project...' : editingId ? 'Update Project' : 'Create Project'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Project"
        message="Are you sure you want to delete this project? This will remove its case study and details permanently from MySQL."
        confirmText="Delete Project"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
