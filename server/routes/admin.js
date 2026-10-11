import { Router } from 'express';
import { pool } from '../db.js';
import { authenticateAdmin } from '../middleware/auth.js';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sortExperienceList } from '../utils/experienceSorter.js';
import { validateImageContent, validatePdfContent, safelyRemoveFile } from '../utils/fileSafety.js';
import { validate, schemas } from '../middleware/validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration (Supports Images and PDF Documents)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'].includes(ext) ? ext : (file.mimetype === 'application/pdf' ? '.pdf' : '.png');
    const prefix = ext === '.pdf' || file.mimetype === 'application/pdf' ? 'doc' : 'project';
    const uniqueName = `${prefix}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}${safeExt}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/jpg',
    'application/pdf'
  ];
  if (allowedMimes.includes(file.mimetype.toLowerCase()) || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, WEBP, GIF images, and PDF documents are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB max for images and PDFs
  }
});

const router = Router();
router.use(authenticateAdmin);

// Helper to normalize all projects' sort_order to 1..N
async function normalizeProjectSortOrders(conn = pool) {
  const [rows] = await conn.query('SELECT id FROM projects ORDER BY sort_order ASC, created_at ASC;');
  for (let i = 0; i < rows.length; i++) {
    await conn.query('UPDATE projects SET sort_order = ? WHERE id = ?;', [i + 1, rows[i].id]);
  }
}

// ==================== GENERAL UPLOAD ENDPOINT ====================
router.post('/upload', (req, res) => {
  upload.any()(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'File size exceeds maximum limit of 10MB.' });
        }
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ success: false, message: err.message || 'Failed to upload file.' });
    }

    const file = req.files && req.files[0];
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file provided.' });
    }

    // Binary Content Inspection: Check magic bytes to guarantee genuine image format
    const check = await validateImageContent(file.path);
    if (!check.valid) {
      safelyRemoveFile(file.path);
      return res.status(400).json({
        success: false,
        message: 'File content verification failed: ' + check.error
      });
    }

    const relativeUrl = `/uploads/${file.filename}`;
    res.status(201).json({
      success: true,
      message: 'File uploaded and verified successfully.',
      url: relativeUrl,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    });
  });
});

// ==================== DEDICATED RESUME UPLOAD & PROFILE SYNC ENDPOINT ====================
router.post('/resume', (req, res) => {
  upload.any()(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'Resume file size exceeds maximum limit of 10MB.' });
        }
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ success: false, message: err.message || 'Failed to upload resume.' });
    }

    const file = req.files && req.files[0];
    if (!file) {
      return res.status(400).json({ success: false, message: 'No resume document file provided.' });
    }

    // Strict validation: must be a valid PDF extension and MIME
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' && file.mimetype !== 'application/pdf') {
      safelyRemoveFile(file.path);
      return res.status(400).json({ success: false, message: 'Only PDF documents (.pdf) are accepted for resumes.' });
    }

    // Binary Content Inspection: Check magic bytes (%PDF-) to guarantee genuine PDF document
    const check = await validatePdfContent(file.path);
    if (!check.valid) {
      safelyRemoveFile(file.path);
      return res.status(400).json({
        success: false,
        message: 'File content verification failed: ' + check.error
      });
    }

    const relativeUrl = `/uploads/${file.filename}`;

    try {
      // 1. Get current resume URL to identify previous custom upload for safe cleanup
      const [oldRows] = await pool.query('SELECT resume_url FROM profile LIMIT 1;');
      const oldResumeUrl = oldRows[0]?.resume_url;

      // 2. Persist new resume URL into MySQL profile table
      await pool.query('UPDATE profile SET resume_url = ? WHERE id IS NOT NULL;', [relativeUrl]);

      // 3. Clean up previous custom uploaded file ONLY after DB update succeeds
      if (oldResumeUrl && oldResumeUrl.startsWith('/uploads/doc-') && oldResumeUrl !== relativeUrl) {
        const oldFilePath = path.join(__dirname, '..', oldResumeUrl);
        safelyRemoveFile(oldFilePath);
      }

      res.status(200).json({
        success: true,
        message: 'Resume uploaded and updated in profile successfully.',
        url: relativeUrl,
        filename: file.filename,
        size: file.size
      });
    } catch (dbErr) {
      console.error('[Admin Resume Error] DB Update failed:', dbErr);
      safelyRemoveFile(file.path);
      res.status(500).json({ success: false, message: 'Failed to update resume path in database.' });
    }
  });
});

// ==================== PROJECTS CRUD ====================

// 0. List All Projects for Admin (Published & Unpublished)
router.get('/projects', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects ORDER BY sort_order ASC, created_at ASC;');
    const projects = rows.map((p) => ({
      ...p,
      is_featured: Boolean(p.is_featured),
      is_published: p.is_published !== undefined ? Boolean(p.is_published) : true,
      isFeatured: Boolean(p.is_featured),
      isPublished: p.is_published !== undefined ? Boolean(p.is_published) : true,
      accentColor: p.accent_color,
      github: p.github_url,
      live: p.live_url,
      image: p.image_url,
      preview: p.preview_type || '',
      technologies: typeof p.technologies === 'string' ? JSON.parse(p.technologies || '[]') : p.technologies,
      caseStudy: typeof p.case_study === 'string' ? JSON.parse(p.case_study || '{}') : p.case_study
    }));
    res.json({ success: true, data: projects });
  } catch (err) {
    console.error('[Admin Project Error] List:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin projects.' });
  }
});

// 1. Create Project
router.post('/projects', validate(schemas.project), async (req, res) => {
  try {
    const {
      slug, number, name, subtitle, category, project_type, role,
      accent_color, is_featured, is_published, sort_order, image_url, description,
      technologies, github_url, live_url, preview_type, case_study
    } = req.body;

    if (!slug || !name || !description) {
      return res.status(400).json({ success: false, message: 'Slug, name, and description are required.' });
    }

    const [maxOrderRows] = await pool.query('SELECT MAX(sort_order) as maxOrder FROM projects;');
    const nextOrder = typeof sort_order === 'number' && sort_order > 0
      ? sort_order 
      : (maxOrderRows[0]?.maxOrder || 0) + 1;

    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO projects (id, slug, number, name, subtitle, category, project_type, role, accent_color, is_featured, is_published, sort_order, image_url, description, technologies, github_url, live_url, preview_type, case_study)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        slug.trim().toLowerCase(),
        number || String(nextOrder).padStart(2, '0'),
        name.trim(),
        subtitle || null,
        category || 'Full-Stack Web Application',
        project_type || 'Full-Stack Web Application',
        role || 'Developer',
        accent_color || '#FF9A3D',
        Boolean(is_featured),
        is_published !== undefined ? Boolean(is_published) : true,
        nextOrder,
        image_url || null,
        description,
        JSON.stringify(technologies || []),
        github_url || null,
        live_url || null,
        preview_type || '',
        JSON.stringify(case_study || {})
      ]
    );

    await normalizeProjectSortOrders();

    res.status(201).json({ success: true, message: 'Project created successfully.', id });
  } catch (err) {
    console.error('[Admin Project Error] Create:', err);
    res.status(500).json({ success: false, message: 'Failed to create project.' });
  }
});

// 2. Batch Reorder Projects (Supports full array of ordered IDs OR direct jump by position)
// Placed before /projects/:id to avoid Express parameter capture
router.put('/projects/reorder', async (req, res) => {
  try {
    const { orderedIds, projectId, targetPosition } = req.body || {};

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (Array.isArray(orderedIds) && orderedIds.length > 0) {
        // Option 1: Full ordered list of IDs
        for (let i = 0; i < orderedIds.length; i++) {
          await conn.query('UPDATE projects SET sort_order = ? WHERE id = ?;', [i + 1, orderedIds[i]]);
        }
      } else if (projectId && typeof targetPosition === 'number') {
        // Option 2: Direct jump (e.g. move project from position 7 directly to position 3)
        const [allRows] = await conn.query('SELECT id FROM projects ORDER BY sort_order ASC, created_at ASC;');
        const idList = allRows.map((r) => r.id);
        const currentIndex = idList.indexOf(projectId);
        if (currentIndex === -1) {
          await conn.rollback();
          return res.status(404).json({ success: false, message: 'Project to reorder not found.' });
        }

        idList.splice(currentIndex, 1);
        const newIndex = Math.max(0, Math.min(targetPosition - 1, idList.length));
        idList.splice(newIndex, 0, projectId);

        for (let i = 0; i < idList.length; i++) {
          await conn.query('UPDATE projects SET sort_order = ? WHERE id = ?;', [i + 1, idList[i]]);
        }
      } else {
        await conn.rollback();
        return res.status(400).json({ success: false, message: 'Either orderedIds array or projectId with targetPosition must be provided.' });
      }

      await conn.commit();
      res.json({ success: true, message: 'Projects reordered successfully.' });
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('[Admin Project Error] Reorder:', err);
    res.status(500).json({ success: false, message: 'Failed to reorder projects.' });
  }
});

// 2.5 Quick Toggle Project Visibility (Publish / Hide)
router.patch('/projects/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body || {};

    const [existing] = await pool.query('SELECT is_published, name FROM projects WHERE id = ?;', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const currentPub = Boolean(existing[0].is_published);
    const newPub = typeof is_published === 'boolean' ? is_published : !currentPub;

    await pool.query('UPDATE projects SET is_published = ? WHERE id = ?;', [newPub, id]);

    res.json({
      success: true,
      message: `Project "${existing[0].name}" ${newPub ? 'published' : 'hidden'} successfully.`,
      is_published: newPub
    });
  } catch (err) {
    console.error('[Admin Project Error] Toggle Publish:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle project visibility.' });
  }
});

// 3. Update Project
router.put('/projects/:id', validate(schemas.paramId, 'params'), validate(schemas.project), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      slug, number, name, subtitle, category, project_type, role,
      accent_color, is_featured, is_published, sort_order, image_url, description,
      technologies, github_url, live_url, preview_type, case_study
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM projects WHERE id = ?;', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    await pool.query(
      `UPDATE projects SET
        slug = COALESCE(?, slug),
        number = COALESCE(?, number),
        name = COALESCE(?, name),
        subtitle = COALESCE(?, subtitle),
        category = COALESCE(?, category),
        project_type = COALESCE(?, project_type),
        role = COALESCE(?, role),
        accent_color = COALESCE(?, accent_color),
        is_featured = COALESCE(?, is_featured),
        is_published = COALESCE(?, is_published),
        sort_order = COALESCE(?, sort_order),
        image_url = CASE WHEN ? IS NOT NULL THEN ? ELSE image_url END,
        description = COALESCE(?, description),
        technologies = COALESCE(?, technologies),
        github_url = CASE WHEN ? IS NOT NULL THEN ? ELSE github_url END,
        live_url = CASE WHEN ? IS NOT NULL THEN ? ELSE live_url END,
        preview_type = CASE WHEN ? IS NOT NULL THEN ? ELSE preview_type END,
        case_study = COALESCE(?, case_study)
       WHERE id = ?;`,
      [
        slug ? slug.trim().toLowerCase() : null,
        number || null,
        name ? name.trim() : null,
        subtitle !== undefined ? subtitle : null,
        category || null,
        project_type || null,
        role || null,
        accent_color || null,
        typeof is_featured === 'boolean' ? is_featured : null,
        typeof is_published === 'boolean' ? is_published : null,
        typeof sort_order === 'number' ? sort_order : null,
        image_url !== undefined ? image_url : null,
        image_url !== undefined ? image_url : null,
        description || null,
        technologies ? JSON.stringify(technologies) : null,
        github_url !== undefined ? github_url : null,
        github_url !== undefined ? github_url : null,
        live_url !== undefined ? live_url : null,
        live_url !== undefined ? live_url : null,
        preview_type !== undefined ? preview_type : null,
        preview_type !== undefined ? preview_type : null,
        case_study ? JSON.stringify(case_study) : null,
        id
      ]
    );

    res.json({ success: true, message: 'Project updated successfully.' });
  } catch (err) {
    console.error('[Admin Project Error] Update:', err);
    res.status(500).json({ success: false, message: 'Failed to update project.' });
  }
});

// 4. Delete Project
router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?;', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    await normalizeProjectSortOrders();

    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) {
    console.error('[Admin Project Error] Delete:', err);
    res.status(500).json({ success: false, message: 'Failed to delete project.' });
  }
});

// ==================== SKILLS CRUD ====================

router.post('/skills', validate(schemas.skill), async (req, res) => {
  try {
    const { category, name, color_hex, description, orbit_radius, orbit_speed, sort_order } = req.body;
    if (!category || !name) {
      return res.status(400).json({ success: false, message: 'Category and name are required.' });
    }

    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO skills (id, category, name, color_hex, description, orbit_radius, orbit_speed, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, category, name, color_hex || '#FF9A3D', description || null, orbit_radius || 5.4, orbit_speed || 0.005, sort_order || 0]
    );

    res.status(201).json({ success: true, message: 'Skill created successfully.', id });
  } catch (err) {
    console.error('[Admin Skill Error] Create:', err);
    res.status(500).json({ success: false, message: 'Failed to create skill.' });
  }
});

router.put('/skills/:id', validate(schemas.paramId, 'params'), validate(schemas.skill), async (req, res) => {
  try {
    const { id } = req.params;
    const { category, name, color_hex, description, orbit_radius, orbit_speed, sort_order } = req.body;

    await pool.query(
      `UPDATE skills SET
        category = COALESCE(?, category),
        name = COALESCE(?, name),
        color_hex = COALESCE(?, color_hex),
        description = COALESCE(?, description),
        orbit_radius = COALESCE(?, orbit_radius),
        orbit_speed = COALESCE(?, orbit_speed),
        sort_order = COALESCE(?, sort_order)
       WHERE id = ?;`,
      [category || null, name || null, color_hex || null, description || null, orbit_radius || null, orbit_speed || null, sort_order ?? null, id]
    );

    res.json({ success: true, message: 'Skill updated successfully.' });
  } catch (err) {
    console.error('[Admin Skill Error] Update:', err);
    res.status(500).json({ success: false, message: 'Failed to update skill.' });
  }
});

router.delete('/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM skills WHERE id = ?;', [id]);
    res.json({ success: true, message: 'Skill deleted successfully.' });
  } catch (err) {
    console.error('[Admin Skill Error] Delete:', err);
    res.status(500).json({ success: false, message: 'Failed to delete skill.' });
  }
});

// ==================== PROFILE UPDATE ====================

router.put('/profile', validate(schemas.profile), async (req, res) => {
  try {
    const { full_name, title, tagline, bio, location, email, phone, status_text, status_badge, github_url, linkedin_url, instagram_url, resume_url } = req.body;
    await pool.query(
      `UPDATE profile SET
        full_name = COALESCE(?, full_name),
        title = COALESCE(?, title),
        tagline = COALESCE(?, tagline),
        bio = COALESCE(?, bio),
        location = COALESCE(?, location),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        status_text = COALESCE(?, status_text),
        status_badge = COALESCE(?, status_badge),
        github_url = COALESCE(?, github_url),
        linkedin_url = COALESCE(?, linkedin_url),
        instagram_url = COALESCE(?, instagram_url),
        resume_url = COALESCE(?, resume_url)
       WHERE id IS NOT NULL;`,
      [
        full_name || null,
        title || null,
        tagline || null,
        bio || null,
        location || null,
        email || null,
        phone || null,
        status_text || null,
        status_badge || null,
        github_url || null,
        linkedin_url || null,
        instagram_url || null,
        resume_url || null
      ]
    );

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('[Admin Profile Error] Update:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// ==================== EXPERIENCE CRUD ====================

// 0. List All Experiences Sorted Chronologically
router.get('/experience', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM experience ORDER BY sort_order ASC, created_at ASC;');
    const work = rows.filter((e) => e.type === 'work').map((e) => ({
      ...e,
      tags: typeof e.tags === 'string' ? JSON.parse(e.tags || '[]') : e.tags
    }));
    const education = rows.filter((e) => e.type === 'education').map((e) => ({
      ...e,
      tags: typeof e.tags === 'string' ? JSON.parse(e.tags || '[]') : e.tags
    }));

    res.json({
      success: true,
      data: {
        work: sortExperienceList(work),
        education: sortExperienceList(education)
      }
    });
  } catch (err) {
    console.error('[Admin Experience Error] List:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve experience records.' });
  }
});

// 1. Create Experience (Work / Education)
router.post('/experience', validate(schemas.experience), async (req, res) => {
  try {
    const { type, period, role, organization, location, description, tags, color_theme, sort_order } = req.body || {};

    if (!type || !period || !role || !organization || !description) {
      return res.status(400).json({ success: false, message: 'Type, period, role, organization, and description are required.' });
    }

    if (!['work', 'education'].includes(type)) {
      return res.status(400).json({ success: false, message: "Type must be either 'work' or 'education'." });
    }

    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO experience (id, type, period, role, organization, location, description, tags, color_theme, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        type,
        period.trim(),
        role.trim(),
        organization.trim(),
        location ? location.trim() : null,
        description.trim(),
        JSON.stringify(Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : [])),
        color_theme || 'cyan',
        parseInt(sort_order || 0, 10)
      ]
    );

    res.status(201).json({ success: true, message: 'Experience record created successfully.', id });
  } catch (err) {
    console.error('[Admin Experience Error] Create:', err);
    res.status(500).json({ success: false, message: 'Failed to create experience record.' });
  }
});

// 2. Update Experience
router.put('/experience/:id', validate(schemas.paramId, 'params'), validate(schemas.experience), async (req, res) => {
  try {
    const { id } = req.params;
    const { type, period, role, organization, location, description, tags, color_theme, sort_order } = req.body || {};

    const [existing] = await pool.query('SELECT * FROM experience WHERE id = ?;', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Experience record not found.' });
    }

    if (type && !['work', 'education'].includes(type)) {
      return res.status(400).json({ success: false, message: "Type must be either 'work' or 'education'." });
    }

    await pool.query(
      `UPDATE experience SET
        type = COALESCE(?, type),
        period = COALESCE(?, period),
        role = COALESCE(?, role),
        organization = COALESCE(?, organization),
        location = COALESCE(?, location),
        description = COALESCE(?, description),
        tags = COALESCE(?, tags),
        color_theme = COALESCE(?, color_theme),
        sort_order = COALESCE(?, sort_order)
       WHERE id = ?;`,
      [
        type || null,
        period ? period.trim() : null,
        role ? role.trim() : null,
        organization ? organization.trim() : null,
        location !== undefined ? (location ? location.trim() : null) : null,
        description ? description.trim() : null,
        tags !== undefined ? JSON.stringify(Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : [])) : null,
        color_theme || null,
        typeof sort_order === 'number' ? sort_order : (sort_order !== undefined ? parseInt(sort_order, 10) : null),
        id
      ]
    );

    res.json({ success: true, message: 'Experience record updated successfully.' });
  } catch (err) {
    console.error('[Admin Experience Error] Update:', err);
    res.status(500).json({ success: false, message: 'Failed to update experience record.' });
  }
});

// 3. Delete Experience
router.delete('/experience/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM experience WHERE id = ?;', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Experience record not found.' });
    }
    res.json({ success: true, message: 'Experience record deleted successfully.' });
  } catch (err) {
    console.error('[Admin Experience Error] Delete:', err);
    res.status(500).json({ success: false, message: 'Failed to delete experience record.' });
  }
});

// ==================== SERVICES CRUD ====================

// 1. Create Service
router.post('/services', validate(schemas.service), async (req, res) => {
  try {
    const { title, short_desc, full_desc, icon_name, sort_order } = req.body || {};

    if (!title || !short_desc) {
      return res.status(400).json({ success: false, message: 'Title and short_desc are required.' });
    }

    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO services (id, title, short_desc, full_desc, icon_name, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        title.trim(),
        short_desc.trim(),
        full_desc ? full_desc.trim() : null,
        icon_name ? icon_name.trim() : 'code',
        parseInt(sort_order || 0, 10)
      ]
    );

    res.status(201).json({ success: true, message: 'Service created successfully.', id });
  } catch (err) {
    console.error('[Admin Services Error] Create:', err);
    res.status(500).json({ success: false, message: 'Failed to create service.' });
  }
});

// 2. Update Service
router.put('/services/:id', validate(schemas.paramId, 'params'), validate(schemas.service), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, short_desc, full_desc, icon_name, sort_order } = req.body || {};

    const [existing] = await pool.query('SELECT * FROM services WHERE id = ?;', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    await pool.query(
      `UPDATE services SET
        title = COALESCE(?, title),
        short_desc = COALESCE(?, short_desc),
        full_desc = COALESCE(?, full_desc),
        icon_name = COALESCE(?, icon_name),
        sort_order = COALESCE(?, sort_order)
       WHERE id = ?;`,
      [
        title ? title.trim() : null,
        short_desc ? short_desc.trim() : null,
        full_desc !== undefined ? (full_desc ? full_desc.trim() : null) : null,
        icon_name ? icon_name.trim() : null,
        typeof sort_order === 'number' ? sort_order : (sort_order !== undefined ? parseInt(sort_order, 10) : null),
        id
      ]
    );

    res.json({ success: true, message: 'Service updated successfully.' });
  } catch (err) {
    console.error('[Admin Services Error] Update:', err);
    res.status(500).json({ success: false, message: 'Failed to update service.' });
  }
});

// 3. Delete Service
router.delete('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM services WHERE id = ?;', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }
    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (err) {
    console.error('[Admin Services Error] Delete:', err);
    res.status(500).json({ success: false, message: 'Failed to delete service.' });
  }
});

// ==================== CONTACT MESSAGES INBOX ====================

router.get('/messages', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC;');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[Admin Messages Error] List:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve messages.' });
  }
});

router.patch('/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read } = req.body;
    await pool.query('UPDATE contact_messages SET is_read = ? WHERE id = ?;', [Boolean(is_read), id]);
    res.json({ success: true, message: 'Message read status updated.' });
  } catch (err) {
    console.error('[Admin Messages Error] Patch:', err);
    res.status(500).json({ success: false, message: 'Failed to update message status.' });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM contact_messages WHERE id = ?;', [id]);
    res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (err) {
    console.error('[Admin Messages Error] Delete:', err);
    res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
});

export default router;
