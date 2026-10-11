/**
 * Central Admin API Client Service
 * Week 12 Dynamic Portfolio - Hassaan Ali Akbar
 * 
 * Provides typed, error-handled HTTP methods for all administrative CMS endpoints.
 * Transmits authentication credentials via HTTP-only session cookies and Bearer tokens.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const TOKEN_KEY = 'hassaan_admin_token';

function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return headers;
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const defaultHeaders = getAuthHeaders();
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    },
    credentials: 'include'
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => null);

  if (!response.ok || (data && data.success === false)) {
    const errorMsg = (data && data.message) || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const adminApi = {
  // Public/Aggregated data
  getPortfolioAll: () => request('/api/portfolio/all'),
  getHealth: () => request('/api/health'),

  // Auth & Account Setup
  getSetupStatus: () => request('/api/auth/setup-status'),
  setupAdmin: (setupData) => request('/api/auth/setup', {
    method: 'POST',
    body: JSON.stringify(setupData)
  }),
  updateAccount: (accountData) => request('/api/auth/update-account', {
    method: 'PUT',
    body: JSON.stringify(accountData)
  }),

  // Profile
  getProfile: () => request('/api/profile'),
  updateProfile: (profileData) => request('/api/admin/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),

  // Projects
  getProjects: () => request('/api/admin/projects'),
  createProject: (projectData) => request('/api/admin/projects', {
    method: 'POST',
    body: JSON.stringify(projectData)
  }),
  updateProject: (id, projectData) => request(`/api/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData)
  }),
  toggleProjectPublish: (id, isPublished) => request(`/api/admin/projects/${id}/publish`, {
    method: 'PATCH',
    body: JSON.stringify({ is_published: isPublished })
  }),
  deleteProject: (id) => request(`/api/admin/projects/${id}`, {
    method: 'DELETE'
  }),
  reorderProjects: (orderedIds) => request('/api/admin/projects/reorder', {
    method: 'PUT',
    body: JSON.stringify({ orderedIds })
  }),
  moveProjectDirect: (projectId, targetPosition) => request('/api/admin/projects/reorder', {
    method: 'PUT',
    body: JSON.stringify({ projectId, targetPosition })
  }),
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const url = `${API_BASE}/api/admin/upload`;
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include'
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || (data && data.success === false)) {
      const errorMsg = (data && data.message) || `Upload failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const url = `${API_BASE}/api/admin/resume`;
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include'
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || (data && data.success === false)) {
      const errorMsg = (data && data.message) || `Resume upload failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  // Skills
  getSkills: () => request('/api/skills'),
  createSkill: (skillData) => request('/api/admin/skills', {
    method: 'POST',
    body: JSON.stringify(skillData)
  }),
  updateSkill: (id, skillData) => request(`/api/admin/skills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(skillData)
  }),
  deleteSkill: (id) => request(`/api/admin/skills/${id}`, {
    method: 'DELETE'
  }),

  // Experience
  getExperience: () => request('/api/experience'),
  createExperience: (expData) => request('/api/admin/experience', {
    method: 'POST',
    body: JSON.stringify(expData)
  }),
  updateExperience: (id, expData) => request(`/api/admin/experience/${id}`, {
    method: 'PUT',
    body: JSON.stringify(expData)
  }),
  deleteExperience: (id) => request(`/api/admin/experience/${id}`, {
    method: 'DELETE'
  }),

  // Services
  getServices: () => request('/api/services'),
  createService: (serviceData) => request('/api/admin/services', {
    method: 'POST',
    body: JSON.stringify(serviceData)
  }),
  updateService: (id, serviceData) => request(`/api/admin/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData)
  }),
  deleteService: (id) => request(`/api/admin/services/${id}`, {
    method: 'DELETE'
  }),

  // Messages
  getMessages: () => request('/api/admin/messages'),
  markMessageRead: (id, isRead) => request(`/api/admin/messages/${id}/read`, {
    method: 'PATCH',
    body: JSON.stringify({ is_read: isRead })
  }),
  deleteMessage: (id) => request(`/api/admin/messages/${id}`, {
    method: 'DELETE'
  })
};

export default adminApi;
