import { Router } from 'express';
import { pool } from '../db.js';
import crypto from 'crypto';
import { sortExperienceList } from '../utils/experienceSorter.js';
import { validate, schemas } from '../middleware/validator.js';

const router = Router();

// Helper to safely parse JSON fields from MySQL
function parseJson(val, fallback = {}) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// 1. Aggregated Hydration Endpoint
router.get('/portfolio/all', async (req, res) => {
  try {
    const [profileRows] = await pool.query('SELECT * FROM profile LIMIT 1;');
    const [projectRows] = await pool.query('SELECT * FROM projects WHERE is_published = 1 ORDER BY sort_order ASC, created_at ASC;');
    const [skillRows] = await pool.query('SELECT * FROM skills ORDER BY sort_order ASC;');
    const [expRows] = await pool.query('SELECT * FROM experience ORDER BY sort_order ASC;');
    const [servicesRows] = await pool.query('SELECT * FROM services ORDER BY sort_order ASC;');

    const profile = profileRows[0] || {};
    const projects = projectRows.map((p, idx) => ({
      ...p,
      number: String(idx + 1).padStart(2, '0'),
      isFeatured: Boolean(p.is_featured),
      isPublished: Boolean(p.is_published),
      accentColor: p.accent_color,
      github: p.github_url,
      live: p.live_url,
      image: p.image_url,
      preview: p.preview_type || '',
      technologies: parseJson(p.technologies, []),
      caseStudy: parseJson(p.case_study, {})
    }));

    const skills = skillRows.map((s) => ({
      ...s,
      colorHex: s.color_hex,
      desc: s.description,
      orbitRadius: Number(s.orbit_radius),
      orbitSpeed: Number(s.orbit_speed)
    }));

    const rawWork = expRows
      .filter((e) => e.type === 'work')
      .map((e) => ({
        ...e,
        company: e.organization,
        color: e.color_theme,
        tags: parseJson(e.tags, [])
      }));

    const rawEducation = expRows
      .filter((e) => e.type === 'education')
      .map((e) => ({
        ...e,
        institution: e.organization,
        color: e.color_theme,
        tags: parseJson(e.tags, [])
      }));

    const workExperience = sortExperienceList(rawWork);
    const educationExperience = sortExperienceList(rawEducation);

    const services = servicesRows.map((s) => ({
      ...s,
      desc: s.short_desc
    }));

    res.json({
      success: true,
      data: {
        profile,
        projects,
        skills,
        experience: {
          work: workExperience,
          education: educationExperience
        },
        services
      },
      meta: {
        engine: 'MySQL 8.0',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('[API Error] /portfolio/all:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve portfolio dataset.' });
  }
});

// 2. Projects List (Public: Published projects only)
router.get('/projects', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects WHERE is_published = 1 ORDER BY sort_order ASC, created_at ASC;');
    const projects = rows.map((p, idx) => ({
      ...p,
      number: String(idx + 1).padStart(2, '0'),
      isFeatured: Boolean(p.is_featured),
      isPublished: Boolean(p.is_published),
      accentColor: p.accent_color,
      github: p.github_url,
      live: p.live_url,
      image: p.image_url,
      preview: p.preview_type || '',
      technologies: parseJson(p.technologies, []),
      caseStudy: parseJson(p.case_study, {})
    }));
    res.json({ success: true, data: projects });
  } catch (err) {
    console.error('[API Error] /projects:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve projects.' });
  }
});

// 3. Single Project with Case Study by Slug (Public: Published only)
router.get('/projects/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query('SELECT * FROM projects WHERE (slug = ? OR id = ?) AND is_published = 1 LIMIT 1;', [slug, slug]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Project '${slug}' not found.` });
    }

    const p = rows[0];
    const project = {
      ...p,
      isFeatured: Boolean(p.is_featured),
      isPublished: Boolean(p.is_published),
      accentColor: p.accent_color,
      github: p.github_url,
      live: p.live_url,
      image: p.image_url,
      preview: p.preview_type || '',
      technologies: parseJson(p.technologies, []),
      caseStudy: parseJson(p.case_study, {})
    };

    res.json({ success: true, data: project });
  } catch (err) {
    console.error('[API Error] /projects/:slug:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve project details.' });
  }
});

// 4. Skills List
router.get('/skills', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM skills ORDER BY sort_order ASC;');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[API Error] /skills:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve skills.' });
  }
});

// 5. Experience List
router.get('/experience', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM experience ORDER BY sort_order ASC;');
    const rawWork = rows.filter((e) => e.type === 'work').map((e) => ({ ...e, tags: parseJson(e.tags, []) }));
    const rawEducation = rows.filter((e) => e.type === 'education').map((e) => ({ ...e, tags: parseJson(e.tags, []) }));
    res.json({
      success: true,
      data: {
        work: sortExperienceList(rawWork),
        education: sortExperienceList(rawEducation)
      }
    });
  } catch (err) {
    console.error('[API Error] /experience:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve experience.' });
  }
});

// 6. Services List
router.get('/services', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services ORDER BY sort_order ASC;');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[API Error] /services:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve services.' });
  }
});

// 7. Profile
router.get('/profile', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM profile LIMIT 1;');
    res.json({ success: true, data: rows[0] || {} });
  } catch (err) {
    console.error('[API Error] /profile:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
});

// 8. Contact Submission
router.post('/contact', validate(schemas.contact), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Subject is required.' });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    // Length boundary validation
    if (trimmedName.length > 150) {
      return res.status(400).json({ success: false, message: 'Name cannot exceed 150 characters.' });
    }
    if (trimmedEmail.length > 255) {
      return res.status(400).json({ success: false, message: 'Email cannot exceed 255 characters.' });
    }
    if (trimmedSubject.length > 255) {
      return res.status(400).json({ success: false, message: 'Subject cannot exceed 255 characters.' });
    }
    if (trimmedMessage.length > 5000) {
      return res.status(400).json({ success: false, message: 'Message cannot exceed 5,000 characters.' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const id = crypto.randomUUID();
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const ip = String(rawIp).substring(0, 45);

    await pool.query(
      `INSERT INTO contact_messages (id, name, email, subject, message, ip_address, is_read) VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
      [id, trimmedName, trimmedEmail, trimmedSubject, trimmedMessage, ip]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received and saved.',
      id
    });
  } catch (err) {
    console.error('[API Error] /contact:', err);
    res.status(500).json({ success: false, message: 'Failed to record message submission.' });
  }
});

export default router;
