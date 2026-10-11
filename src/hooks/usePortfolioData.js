import { useState, useEffect, useCallback } from 'react';
import { projects as staticProjects, projectFilters as staticProjectFilters } from '../data/projects.js';
import { workExperience as staticWorkExperience, educationExperience as staticEducationExperience } from '../data/experience.js';
import { services as staticServices } from '../data/services.js';
import { techCategories as staticTechCategories } from '../data/technologies.js';
import { sortExperienceList } from '../utils/experienceSorter.js';

/**
 * Fallback static profile data for Hassaan Ali Akbar
 */
export const fallbackProfile = {
  id: 'default-profile',
  fullName: 'Hassaan Ali Akbar',
  title: 'Full Stack Developer',
  headline: 'Building Scalable Web Systems',
  tagline: 'Creative Problem Solver',
  bio: `I build scalable web applications and enterprise systems with a strong focus on clean architecture, maintainable backends and performant frontends. I specialise in Laravel for backend, React and Vue for frontend, and PostgreSQL for reliable data storage.

My work centres on dashboards, admin panels, authentication systems, and REST APIs for business-critical applications. I design systems to be secure, testable and scalable — implementing role-based access control, background jobs, and API integrations. I also use AI-assisted development tools to speed up iteration while keeping code quality and architecture decisions intentional.

Outside of development I enjoy photography as a creative hobby. While I value visual craft, my primary focus is delivering robust engineering solutions that drive business outcomes.`,
  email: 'hassaanalee07@gmail.com',
  phone: '+92-313-456-3723',
  location: 'Lahore, Pakistan',
  statusText: 'Open for Opportunities',
  statusBadge: 'Full-Time',
  githubUrl: 'https://github.com/hassaanrana07',
  linkedinUrl: 'https://linkedin.com/in/hassaanaliakbar',
  instagramUrl: 'https://www.instagram.com/hassaanaleerana/',
  resumeUrl: '/Hassaan Ali Akbar Resume.pdf'
};

/**
 * Static 3D Solar System & Tech Stack fallback
 */
export const fallbackSkills = [
  { name: 'React.js', category: 'Frontend', colorHex: '#FFE9A8', desc: 'Hooks, Context API, Virtual DOM & Modular UI Components', orbitRadius: 6.2, orbitSpeed: 0.8 },
  { name: 'Vue.js', category: 'Frontend', colorHex: '#FFE9A8', desc: 'Vue 3 Composition API, Pinia State & Reactive Templates', orbitRadius: 7.2, orbitSpeed: 0.72 },
  { name: 'JavaScript', category: 'Frontend', colorHex: '#FFE9A8', desc: 'ES6+ Modern Asynchronous JS Engine & Web APIs', orbitRadius: 8.2, orbitSpeed: 0.65 },
  { name: 'HTML5', category: 'Frontend', colorHex: '#FFE9A8', desc: 'Modern Semantic Markup & Web Accessibility Standards', orbitRadius: 9.2, orbitSpeed: 0.58 },
  { name: 'CSS3', category: 'Frontend', colorHex: '#FFE9A8', desc: 'Responsive Layouts, Custom Properties, Flexbox & Grid Systems', orbitRadius: 10.2, orbitSpeed: 0.52 },
  { name: 'Tailwind CSS', category: 'Frontend', colorHex: '#FFE9A8', desc: 'Utility-First CSS Framework & Rapid Design System Architecture', orbitRadius: 11.2, orbitSpeed: 0.46 },
  { name: 'Bootstrap', category: 'Frontend', colorHex: '#FFE9A8', desc: 'Responsive Grid System & UI Component Frameworks', orbitRadius: 12.2, orbitSpeed: 0.42 },
  { name: 'WordPress', category: 'Frontend', colorHex: '#FFE9A8', desc: 'Custom Headless CMS, Theme Development & REST APIs', orbitRadius: 13.2, orbitSpeed: 0.38 },
  { name: 'Node.js', category: 'Backend', colorHex: '#FF9A3D', desc: 'Asynchronous Event-Driven Backend Server Runtime', orbitRadius: 14.2, orbitSpeed: 0.35 },
  { name: 'Express.js', category: 'Backend', colorHex: '#FF9A3D', desc: 'Fast RESTful API Services & Middleware Architecture', orbitRadius: 15.2, orbitSpeed: 0.32 },
  { name: 'Laravel', category: 'Backend', colorHex: '#FF9A3D', desc: 'Eloquent ORM, Blade Templates, Inertia.js & Modular Backends', orbitRadius: 16.2, orbitSpeed: 0.28 },
  { name: 'PHP', category: 'Backend', colorHex: '#FF9A3D', desc: 'Modern Object-Oriented Backend Engineering & Server Logic', orbitRadius: 17.2, orbitSpeed: 0.25 },
  { name: 'JWT / RBAC', category: 'Backend', colorHex: '#FF9A3D', desc: 'Secure JSON Web Tokens & Multi-Role Access Control Systems', orbitRadius: 18.2, orbitSpeed: 0.22 },
  { name: 'PostgreSQL', category: 'Databases', colorHex: '#FF5722', desc: 'Advanced Relational Database Queries, Indexing & JSON Types', orbitRadius: 19.2, orbitSpeed: 0.20 },
  { name: 'MySQL', category: 'Databases', colorHex: '#FF5722', desc: 'Relational Schema Architecture, Index Optimization & Transactions', orbitRadius: 10.8, orbitSpeed: 0.48 },
  { name: 'MongoDB', category: 'Databases', colorHex: '#FF5722', desc: 'NoSQL Document Storage, Aggregations & Flexible Data Models', orbitRadius: 12.8, orbitSpeed: 0.40 },
  { name: 'Redis', category: 'Databases', colorHex: '#FF5722', desc: 'In-Memory Key-Value Cache, Session Storage & Pub/Sub Messaging', orbitRadius: 14.8, orbitSpeed: 0.33 },
  { name: 'Git', category: 'Tools / Cloud', colorHex: '#a855f7', desc: 'Distributed Version Control, Branching & Merge Workflows', orbitRadius: 16.8, orbitSpeed: 0.26 },
  { name: 'GitHub', category: 'Tools / Cloud', colorHex: '#a855f7', desc: 'CI/CD Workflows, Pull Requests & Collaborative Code Review', orbitRadius: 17.8, orbitSpeed: 0.24 },
  { name: 'Docker', category: 'Tools / Cloud', colorHex: '#a855f7', desc: 'Containerization, Multi-Stage Dockerfiles & Compose Networks', orbitRadius: 18.8, orbitSpeed: 0.21 },
  { name: 'AWS', category: 'Tools / Cloud', colorHex: '#a855f7', desc: 'Cloud Deployment, S3 Bucket Assets, EC2 Instances & Infrastructure', orbitRadius: 19.8, orbitSpeed: 0.18 }
];

/**
 * Safely parse JSON strings or return fallback value
 */
function safeParseJson(value, fallback = {}) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * Normalize Profile Object
 */
function normalizeProfile(raw) {
  if (!raw || typeof raw !== 'object') return fallbackProfile;
  return {
    id: raw.id || 'default-profile',
    fullName: raw.full_name || raw.fullName || fallbackProfile.fullName,
    title: raw.title || fallbackProfile.title,
    headline: raw.headline || raw.tagline || fallbackProfile.headline,
    tagline: raw.tagline || raw.headline || fallbackProfile.tagline,
    bio: raw.bio || fallbackProfile.bio,
    email: raw.email || fallbackProfile.email,
    phone: raw.phone || fallbackProfile.phone,
    location: raw.location || fallbackProfile.location,
    statusText: raw.status_text || raw.statusText || fallbackProfile.statusText,
    statusBadge: raw.status_badge || raw.statusBadge || fallbackProfile.statusBadge,
    githubUrl: raw.github_url || raw.githubUrl || fallbackProfile.githubUrl,
    linkedinUrl: raw.linkedin_url || raw.linkedinUrl || fallbackProfile.linkedinUrl,
    instagramUrl: raw.instagram_url || raw.instagramUrl || fallbackProfile.instagramUrl,
    resumeUrl: raw.resume_url || raw.resumeUrl || fallbackProfile.resumeUrl
  };
}

/**
 * Normalize Project Object to match existing component requirements
 */
function normalizeProject(p) {
  if (!p || typeof p !== 'object') return null;

  // Case study parsing
  let caseStudy = p.caseStudy || p.case_study || {};
  if (typeof caseStudy === 'string') {
    caseStudy = safeParseJson(caseStudy, {});
  }

  // Parse nested structured case-study arrays if needed
  if (typeof caseStudy.features === 'string') caseStudy.features = safeParseJson(caseStudy.features, []);
  if (typeof caseStudy.modules === 'string') caseStudy.modules = safeParseJson(caseStudy.modules, []);
  if (typeof caseStudy.dataModel === 'string') caseStudy.dataModel = safeParseJson(caseStudy.dataModel, []);
  if (typeof caseStudy.decisions === 'string') caseStudy.decisions = safeParseJson(caseStudy.decisions, []);
  if (typeof caseStudy.challenges === 'string') caseStudy.challenges = safeParseJson(caseStudy.challenges, []);
  if (typeof caseStudy.futureImprovements === 'string') caseStudy.futureImprovements = safeParseJson(caseStudy.futureImprovements, []);

  // Technologies list normalization
  let technologies = p.technologies;
  if (typeof technologies === 'string') {
    technologies = safeParseJson(technologies, []);
  }
  if (!Array.isArray(technologies)) {
    technologies = [];
  }

  return {
    ...p,
    id: p.id || p.slug,
    slug: p.slug || p.id,
    number: p.number || '01',
    name: p.name || 'Project',
    subtitle: p.subtitle || '',
    category: p.category || 'Web Application',
    type: p.project_type || p.type || p.category || 'Web Application',
    role: p.role || 'Developer',
    accentColor: p.accentColor || p.accent_color || '#FF9A3D',
    isFeatured: p.isFeatured !== undefined ? Boolean(p.isFeatured) : Boolean(p.is_featured),
    image: p.image || p.image_url || '',
    description: p.description || '',
    technologies,
    github: p.github || p.github_url || null,
    live: p.live || p.live_url || null,
    preview: p.preview || p.preview_type || 'default',
    sortOrder: p.sort_order !== undefined ? Number(p.sort_order) : 0,
    caseStudy
  };
}

/**
 * Normalize Skill Object
 */
function normalizeSkill(s) {
  if (!s || typeof s !== 'object') return null;
  return {
    id: s.id,
    name: s.name,
    category: s.category || 'General',
    colorHex: s.colorHex || s.color_hex || '#FFE9A8',
    desc: s.desc || s.description || '',
    iconUrl: s.iconUrl || s.icon_url || '',
    orbitRadius: s.orbitRadius !== undefined ? Number(s.orbitRadius) : (s.orbit_radius !== undefined ? Number(s.orbit_radius) : 10),
    orbitSpeed: s.orbitSpeed !== undefined ? Number(s.orbitSpeed) : (s.orbit_speed !== undefined ? Number(s.orbit_speed) : 0.5),
    sortOrder: s.sort_order !== undefined ? Number(s.sort_order) : 0
  };
}

/**
 * Normalize Experience Item (Work & Education)
 */
function normalizeExperienceItem(e) {
  if (!e || typeof e !== 'object') return null;
  let tags = e.tags;
  if (typeof tags === 'string') {
    tags = safeParseJson(tags, tags.split(' ').filter(Boolean));
  }
  if (!Array.isArray(tags)) tags = [];

  return {
    id: e.id,
    type: e.type || 'work',
    period: e.period || '',
    role: e.role || '',
    company: e.company || e.organization || '',
    institution: e.institution || e.organization || '',
    location: e.location || '',
    color: e.color || e.color_theme || 'cyan',
    description: e.description || '',
    tags,
    sortOrder: e.sort_order !== undefined ? Number(e.sort_order) : 0
  };
}

/**
 * Normalize Service Object
 */
function normalizeService(s) {
  if (!s || typeof s !== 'object') return null;
  return {
    id: s.id,
    title: s.title || '',
    desc: s.desc || s.short_desc || s.full_desc || '',
    shortDesc: s.short_desc || s.desc || '',
    fullDesc: s.full_desc || s.desc || '',
    icon: s.icon || s.icon_name || 'code',
    sortOrder: s.sort_order !== undefined ? Number(s.sort_order) : 0
  };
}

/**
 * Central usePortfolioData Hybrid Hydration Layer Hook
 * 
 * Provides an instant-hydrated dataset using static fallbacks immediately,
 * then seamlessly updates with fresh dynamic data from the MySQL 8 backend.
 */
export function usePortfolioData() {
  const [profile, setProfile] = useState(() => normalizeProfile(fallbackProfile));
  const [projects, setProjects] = useState(() => (staticProjects || []).map(normalizeProject).filter(Boolean));
  const [skills, setSkills] = useState(() => (fallbackSkills || []).map(normalizeSkill).filter(Boolean));
  const [experience, setExperience] = useState(() => ({
    work: sortExperienceList((staticWorkExperience || []).map(normalizeExperienceItem).filter(Boolean)),
    education: sortExperienceList((staticEducationExperience || []).map(normalizeExperienceItem).filter(Boolean))
  }));
  const [services, setServices] = useState(() => (staticServices || []).map(normalizeService).filter(Boolean));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(true);

  const fetchPortfolioData = useCallback(async (signal) => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/portfolio/all`, {
        signal,
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();

      if (json && json.success && json.data) {
        const {
          profile: apiProfile,
          projects: apiProjects,
          skills: apiSkills,
          experience: apiExperience,
          services: apiServices
        } = json.data;

        if (apiProfile && Object.keys(apiProfile).length > 0) {
          setProfile(normalizeProfile(apiProfile));
        }

        if (Array.isArray(apiProjects) && apiProjects.length > 0) {
          setProjects(apiProjects.map(normalizeProject).filter(Boolean));
        }

        if (Array.isArray(apiSkills) && apiSkills.length > 0) {
          setSkills(apiSkills.map(normalizeSkill).filter(Boolean));
        }

        if (apiExperience) {
          const work = sortExperienceList(Array.isArray(apiExperience.work)
            ? apiExperience.work.map(normalizeExperienceItem).filter(Boolean)
            : (staticWorkExperience || []).map(normalizeExperienceItem).filter(Boolean));
          const education = sortExperienceList(Array.isArray(apiExperience.education)
            ? apiExperience.education.map(normalizeExperienceItem).filter(Boolean)
            : (staticEducationExperience || []).map(normalizeExperienceItem).filter(Boolean));

          setExperience({ work, education });
        }

        if (Array.isArray(apiServices) && apiServices.length > 0) {
          setServices(apiServices.map(normalizeService).filter(Boolean));
        }

        setIsUsingFallback(false);
        setError(null);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('[usePortfolioData] Backend fetch unavailable, using static fallback:', err.message);
      setError(err);
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPortfolioData(controller.signal);
    return () => controller.abort();
  }, [fetchPortfolioData]);

  const refresh = useCallback(() => {
    return fetchPortfolioData();
  }, [fetchPortfolioData]);

  const getProjectBySlug = useCallback((slug) => {
    if (!slug) return null;
    return projects.find((p) => p.slug === slug || p.id === slug) || null;
  }, [projects]);

  return {
    profile,
    projects,
    skills,
    experience,
    workExperience: experience.work,
    educationExperience: experience.education,
    services,
    projectFilters: staticProjectFilters,
    loading,
    error,
    isUsingFallback,
    refresh,
    getProjectBySlug
  };
}

export default usePortfolioData;
