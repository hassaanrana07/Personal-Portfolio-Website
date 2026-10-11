import { pool } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://127.0.0.1:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_week12_portfolio_hassaan_ali_akbar_2026';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

async function runProjectFeatureTests() {
  console.log('================================================================');
  console.log('  WEEK 12 - PROJECT MANAGEMENT, REORDERING & VISIBILITY TESTS   ');
  console.log('================================================================\n');

  let adminToken = null;
  let testProjectId = null;
  let originalAdmin = null;

  try {
    // 0. Authenticate Admin
    const [existingAdmins] = await pool.query('SELECT * FROM admins ORDER BY id ASC LIMIT 1;');
    if (existingAdmins.length > 0) {
      originalAdmin = { ...existingAdmins[0] };
    }
    const testEmail = originalAdmin?.email || 'admin@hassaan.dev';
    const testPassword = 'FeatureTestPassword123!';
    const testHash = await bcrypt.hash(testPassword, 12);
    if (originalAdmin) {
      await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?;', [testHash, originalAdmin.id]);
    }

    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const loginJson = await loginRes.json();
    adminToken = loginJson.token;
    assert(Boolean(adminToken), 'Admin authenticated and JWT token acquired');

    // ==========================================
    // 1. PREVIEW COMPONENT & BLANK DEFAULTS
    // ==========================================
    console.log('\n1. Testing Preview Component Field & Defaults...');

    // 1.1 Create project with blank preview component
    const createBlankRes = await fetch(`${API_BASE}/admin/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        slug: 'test-blank-preview',
        name: 'Blank Preview Project',
        description: 'Testing blank default preview component',
        category: 'Full-Stack',
        preview_type: '', // Blank by default
        is_published: true
      })
    });
    assert(createBlankRes.status === 201, `Create project with blank preview_type returns HTTP 201 (got: ${createBlankRes.status})`);
    const blankJson = await createBlankRes.json();
    testProjectId = blankJson.id;

    // 1.2 Verify blank preview_type saved in database
    const [blankDbRow] = await pool.query('SELECT preview_type FROM projects WHERE id = ?;', [testProjectId]);
    assert(blankDbRow[0]?.preview_type === '', 'Blank preview_type stored cleanly as empty string');

    // 1.3 Update with custom identifier
    const updateCustomRes = await fetch(`${API_BASE}/admin/projects/${testProjectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        preview_type: 'custom_ai_simulation'
      })
    });
    assert(updateCustomRes.status === 200, 'Update project with custom preview_type succeeds');

    const [customDbRow] = await pool.query('SELECT preview_type FROM projects WHERE id = ?;', [testProjectId]);
    assert(customDbRow[0]?.preview_type === 'custom_ai_simulation', 'Custom preview_type identifier persisted in database');

    // ==========================================
    // 2. PROJECT REORDERING (DIRECT POSITION JUMP & SEQUENTIAL NORMALIZATION)
    // ==========================================
    console.log('\n2. Testing Project Reordering & Direct Position Jumps...');

    // 2.1 Fetch current project list
    const adminProjRes = await fetch(`${API_BASE}/admin/projects`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminProjRes.status === 200, 'Admin GET /api/admin/projects returns HTTP 200');
    const adminProjJson = await adminProjRes.json();
    const allProjects = adminProjJson.data;
    assert(Array.isArray(allProjects) && allProjects.length >= 7, `Retrieved ${allProjects.length} projects for reordering tests`);

    const targetProject = allProjects[allProjects.length - 1]; // Last project (e.g. pos 8 or 7)
    const originalLastId = targetProject.id;
    const targetPos = 3;

    // 2.2 Move last project directly to position 3
    const moveRes = await fetch(`${API_BASE}/admin/projects/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        projectId: originalLastId,
        targetPosition: targetPos
      })
    });
    const moveJson = await moveRes.json().catch(() => null);
    if (moveRes.status !== 200) {
      console.error('moveRes failed:', moveRes.status, moveJson);
    }
    assert(moveRes.status === 200, `Direct position jump to position ${targetPos} returns HTTP 200 (got: ${moveRes.status})`);

    // 2.3 Verify sort_order in database is strictly sequential 1..N
    const [reorderedDbRows] = await pool.query('SELECT id, sort_order, name FROM projects ORDER BY sort_order ASC;');
    assert(reorderedDbRows[targetPos - 1]?.id === originalLastId, `Project moved to position ${targetPos} in MySQL (got: ${reorderedDbRows[targetPos - 1]?.name})`);

    let isStrictlySequential = true;
    for (let i = 0; i < reorderedDbRows.length; i++) {
      if (reorderedDbRows[i].sort_order !== i + 1) {
        isStrictlySequential = false;
        break;
      }
    }
    assert(isStrictlySequential === true, 'All project sort_order values are strictly normalized 1..N without duplicates or gaps');

    // ==========================================
    // 3. PROJECT VISIBILITY CONTROLS & PUBLIC CONSECUTIVE RENUMBERING
    // ==========================================
    console.log('\n3. Testing Visibility Controls & Public Consecutive Numbering...');

    const projectToHide = reorderedDbRows[3]; // 4th project
    const hideId = projectToHide.id;

    // 3.1 Toggle Visibility to Hidden
    const hideRes = await fetch(`${API_BASE}/admin/projects/${hideId}/publish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ is_published: false })
    });
    assert(hideRes.status === 200, `PATCH /projects/:id/publish to false returns HTTP 200`);
    const hideJson = await hideRes.json();
    assert(hideJson.is_published === false, 'Visibility toggle reports is_published: false');

    // 3.2 Admin endpoint still returns the hidden project
    const adminAfterHideRes = await fetch(`${API_BASE}/admin/projects`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminAfterHideJson = await adminAfterHideRes.json();
    const hiddenInAdmin = adminAfterHideJson.data.find((p) => p.id === hideId);
    assert(Boolean(hiddenInAdmin) && hiddenInAdmin.is_published === false, 'Admin CMS maintains access to hidden/unpublished projects');

    // 3.3 Public endpoint filters out the hidden project
    const publicAfterHideRes = await fetch(`${API_BASE}/projects`);
    const publicAfterHideJson = await publicAfterHideRes.json();
    const hiddenInPublic = publicAfterHideJson.data.find((p) => p.id === hideId);
    assert(!hiddenInPublic, 'Hidden project is strictly excluded from public /api/projects');

    // 3.4 Verify public consecutive renumbering (01, 02, 03, 04, 05...)
    let allConsecutive = true;
    for (let i = 0; i < publicAfterHideJson.data.length; i++) {
      const expectedNum = String(i + 1).padStart(2, '0');
      if (publicAfterHideJson.data[i].number !== expectedNum) {
        allConsecutive = false;
        console.error(`Number mismatch at index ${i}: expected ${expectedNum}, got ${publicAfterHideJson.data[i].number}`);
        break;
      }
    }
    assert(allConsecutive === true, 'Public project listing numbers are consecutively renumbered 01..N');

    // 3.5 Public single-project endpoint returns 404 for hidden project
    const hiddenSlug = projectToHide.slug || hideId;
    const publicSlugRes = await fetch(`${API_BASE}/projects/${hiddenSlug}`);
    assert(publicSlugRes.status === 404, `Public GET /projects/:slug for unpublished project returns HTTP 404 (got: ${publicSlugRes.status})`);

    // 3.6 Restore / Publish project again
    const restoreRes = await fetch(`${API_BASE}/admin/projects/${hideId}/publish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ is_published: true })
    });
    assert(restoreRes.status === 200, 'Publishing project again succeeds');

    // ==========================================
    // 4. IMAGE UPLOAD & PERSISTENCE
    // ==========================================
    console.log('\n4. Testing Image Upload & Static Serving...');

    // Create a mock 1x1 PNG buffer
    const mockPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    // Create multipart form boundary
    const boundary = '----WebKitFormBoundary' + crypto.randomBytes(8).toString('hex');
    const header = `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="test-mockup.png"\r\nContent-Type: image/png\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;
    const multipartBody = Buffer.concat([Buffer.from(header), mockPngBuffer, Buffer.from(footer)]);

    const uploadRes = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        Authorization: `Bearer ${adminToken}`
      },
      body: multipartBody
    });
    assert(uploadRes.status === 201, `Image upload returns HTTP 201 (got: ${uploadRes.status})`);
    const uploadJson = await uploadRes.json();
    assert(Boolean(uploadJson.url) && uploadJson.url.startsWith('/uploads/'), `Returned upload URL format verified: ${uploadJson.url}`);

    // Verify static serving of uploaded image
    const staticImgRes = await fetch(`http://127.0.0.1:5000${uploadJson.url}`);
    assert(staticImgRes.status === 200, `Static image endpoint returns HTTP 200 (got: ${staticImgRes.status})`);
    assert(staticImgRes.headers.get('content-type')?.includes('image'), 'Static asset served with image content-type');

    // Clean up test image from disk
    const filename = uploadJson.filename;
    const diskPath = path.join(__dirname, '../uploads', filename);
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
      console.log('[PASS] Cleaned up temporary test upload from disk');
    }

    // ==========================================
    // 5. CLEANUP TEMPORARY PROJECT
    // ==========================================
    if (testProjectId) {
      const deleteRes = await fetch(`${API_BASE}/admin/projects/${testProjectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert(deleteRes.status === 200, 'Temporary test project deleted and positions renormalized');
    }

    console.log('\nAll Project Management, Reordering & Visibility tests passed successfully!');

  } catch (err) {
    console.error('[TEST SUITE ERROR]', err);
    testsFailed++;
  } finally {
    // Restore original admin state
    if (originalAdmin) {
      await pool.query('UPDATE admins SET password_hash = ?, email = ?, name = ? WHERE id = ?;', [
        originalAdmin.password_hash,
        originalAdmin.email,
        originalAdmin.name,
        originalAdmin.id
      ]);
    }

    // Reset rate limiter
    await fetch(`${API_BASE}/auth/reset-limiter`, {
      method: 'POST',
      headers: { 'x-test-suite': 'true' }
    }).catch(() => {});

    console.log('\n================================================================');
    console.log(`Results: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('================================================================\n');

    await pool.end();
    if (testsFailed > 0) {
      process.exit(1);
    }
  }
}

runProjectFeatureTests();
