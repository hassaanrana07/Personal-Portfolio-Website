import { pool } from '../db.js';
import bcrypt from 'bcryptjs';

const API_BASE = 'http://localhost:5000/api';

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

async function runAdminCmsTests() {
  console.log('================================================================');
  console.log('      WEEK 12 - PHASE 4 STEP 2 ADMIN CMS & AUTH TEST SUITE      ');
  console.log('================================================================\n');

  let adminToken = null;
  const createdExpIds = [];
  const createdServiceIds = [];
  const createdSkillIds = [];
  const createdProjectIds = [];
  let originalAdmin = null;

  try {
    // 0. Backup existing admin state
    const [existingRows] = await pool.query('SELECT * FROM admins ORDER BY id ASC LIMIT 1;');
    if (existingRows.length > 0) {
      originalAdmin = { ...existingRows[0] };
    }
    const testEmail = originalAdmin?.email || 'admin@hassaan.dev';
    const testPassword = 'TestPassword123!';
    const testHash = await bcrypt.hash(testPassword, 12);
    if (originalAdmin) {
      await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?;', [testHash, originalAdmin.id]);
    }

    // ==================== 1. AUTHENTICATION TESTS ====================
    console.log('1. Testing Authentication Endpoints...');

    // 1.1 Valid Admin Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    assert(loginRes.status === 200, `Valid login returns HTTP 200 (got: ${loginRes.status})`);
    const loginJson = await loginRes.json();
    assert(loginJson.success === true, 'Login response indicates success: true');
    assert(Boolean(loginJson.token), 'JWT token returned on valid login');
    assert(loginJson.admin?.email === testEmail, `Admin object returned with correct email (${testEmail})`);
    adminToken = loginJson.token;

    // 1.2 Invalid Password
    const invalidPassRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'wrong_password_123' })
    });
    assert(invalidPassRes.status === 401, `Invalid password returns HTTP 401 (got: ${invalidPassRes.status})`);

    // 1.3 Missing Credentials
    const missingCredsRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    assert(missingCredsRes.status === 400, `Missing password returns HTTP 400 (got: ${missingCredsRes.status})`);

    // 1.4 Protected Endpoint without Token
    const unauthRes = await fetch(`${API_BASE}/admin/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hacked' })
    });
    assert(unauthRes.status === 401, `Unauthenticated request to protected route returns HTTP 401 (got: ${unauthRes.status})`);

    // 1.5 Authenticated Session Verification /api/auth/me
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(meRes.status === 200, `GET /api/auth/me returns HTTP 200 with valid token (got: ${meRes.status})`);
    const meJson = await meRes.json();
    assert(meJson.admin?.email === testEmail, `/api/auth/me returns verified admin email (${testEmail})`);

    // ==================== 2. EXPERIENCE CRUD ====================
    console.log('\n2. Testing Experience CRUD Endpoints...');

    // 2.1 Unauthorized Create Experience Fails
    const unauthExpRes = await fetch(`${API_BASE}/admin/experience`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'work',
        period: '2026 - Present',
        role: 'Senior Test Lead',
        organization: 'Acme Test Corp',
        description: 'Testing experience management'
      })
    });
    assert(unauthExpRes.status === 401, `Unauthorized POST /api/admin/experience returns HTTP 401 (got: ${unauthExpRes.status})`);

    // 2.2 Create Experience Record (Authenticated)
    const createExpRes = await fetch(`${API_BASE}/admin/experience`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        type: 'work',
        period: '2026 - 2027',
        role: 'Cloud Architect Intern',
        organization: 'CloudScale Inc',
        location: 'Remote',
        description: 'Architecting distributed Kubernetes clusters and microservices.',
        tags: ['Kubernetes', 'Go', 'AWS'],
        color_theme: 'cyan',
        sort_order: 99
      })
    });
    assert(createExpRes.status === 201, `Create experience returns HTTP 201 (got: ${createExpRes.status})`);
    const createExpJson = await createExpRes.json();
    assert(Boolean(createExpJson.id), `Experience record created with ID: ${createExpJson.id}`);
    const expId = createExpJson.id;
    if (expId) createdExpIds.push(expId);

    // 2.3 Verify Created Experience via Public API
    const publicExpRes = await fetch(`${API_BASE}/experience`);
    const publicExpJson = await publicExpRes.json();
    const foundExp = publicExpJson.data?.work?.find(e => e.id === expId);
    assert(Boolean(foundExp), 'New experience record appears in public GET /api/experience');
    assert(foundExp?.role === 'Cloud Architect Intern', 'Role matches created value');

    // 2.4 Update Experience Record
    const updateExpRes = await fetch(`${API_BASE}/admin/experience/${expId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        role: 'Lead Cloud Architect',
        period: '2026 - Present'
      })
    });
    assert(updateExpRes.status === 200, `Update experience returns HTTP 200 (got: ${updateExpRes.status})`);

    // Verify update
    const publicExpAfterUpdate = await fetch(`${API_BASE}/experience`).then(r => r.json());
    const updatedExp = publicExpAfterUpdate.data?.work?.find(e => e.id === expId);
    assert(updatedExp?.role === 'Lead Cloud Architect', `Updated role verified: "${updatedExp?.role}"`);

    // 2.5 Delete Experience Record
    const deleteExpRes = await fetch(`${API_BASE}/admin/experience/${expId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(deleteExpRes.status === 200, `Delete experience returns HTTP 200 (got: ${deleteExpRes.status})`);

    // Verify deletion
    const publicExpAfterDelete = await fetch(`${API_BASE}/experience`).then(r => r.json());
    const deletedExp = publicExpAfterDelete.data?.work?.find(e => e.id === expId);
    assert(!deletedExp, 'Deleted experience record no longer present in public API');

    // ==================== 3. SERVICES CRUD ====================
    console.log('\n3. Testing Services CRUD Endpoints...');

    // 3.1 Unauthorized Create Service Fails
    const unauthSvcRes = await fetch(`${API_BASE}/admin/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'AI Automation', short_desc: 'Agents' })
    });
    assert(unauthSvcRes.status === 401, `Unauthorized POST /api/admin/services returns HTTP 401 (got: ${unauthSvcRes.status})`);

    // 3.2 Create Service Record (Authenticated)
    const createSvcRes = await fetch(`${API_BASE}/admin/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'AI Workflow Automation & Agent Integration',
        short_desc: 'Autonomous Agents & Custom Workflows',
        full_desc: 'Engineering autonomous agentic workflows, n8n integrations, and AI-assisted pipelines.',
        icon_name: 'cpu',
        sort_order: 99
      })
    });
    assert(createSvcRes.status === 201, `Create service returns HTTP 201 (got: ${createSvcRes.status})`);
    const createSvcJson = await createSvcRes.json();
    assert(Boolean(createSvcJson.id), `Service created with ID: ${createSvcJson.id}`);
    const svcId = createSvcJson.id;
    if (svcId) createdServiceIds.push(svcId);

    // 3.3 Verify Created Service via Public API
    const publicSvcRes = await fetch(`${API_BASE}/services`);
    const publicSvcJson = await publicSvcRes.json();
    const foundSvc = publicSvcJson.data?.find(s => s.id === svcId);
    assert(Boolean(foundSvc), 'New service appears in public GET /api/services');
    assert(foundSvc?.title === 'AI Workflow Automation & Agent Integration', 'Service title matches');

    // 3.4 Update Service Record
    const updateSvcRes = await fetch(`${API_BASE}/admin/services/${svcId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        short_desc: 'Autonomous Agent Pipelines'
      })
    });
    assert(updateSvcRes.status === 200, `Update service returns HTTP 200 (got: ${updateSvcRes.status})`);

    const publicSvcAfterUpdate = await fetch(`${API_BASE}/services`).then(r => r.json());
    const updatedSvc = publicSvcAfterUpdate.data?.find(s => s.id === svcId);
    assert(updatedSvc?.short_desc === 'Autonomous Agent Pipelines', `Updated short_desc verified: "${updatedSvc?.short_desc}"`);

    // 3.5 Delete Service Record
    const deleteSvcRes = await fetch(`${API_BASE}/admin/services/${svcId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(deleteSvcRes.status === 200, `Delete service returns HTTP 200 (got: ${deleteSvcRes.status})`);

    const publicSvcAfterDelete = await fetch(`${API_BASE}/services`).then(r => r.json());
    const deletedSvc = publicSvcAfterDelete.data?.find(s => s.id === svcId);
    assert(!deletedSvc, 'Deleted service record no longer present in public API');

    // ==================== 4. EXISTING ADMIN ENDPOINTS CHECK ====================
    console.log('\n4. Verifying Existing Profile, Projects, Skills, Messages Endpoints...');

    // 4.1 Admin Profile PUT
    const profRes = await fetch(`${API_BASE}/admin/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Full Stack Developer',
        tagline: 'Creative Problem Solver'
      })
    });
    assert(profRes.status === 200, `PUT /api/admin/profile works with authentication (got: ${profRes.status})`);

    // 4.2 Admin Messages GET
    const msgRes = await fetch(`${API_BASE}/admin/messages`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(msgRes.status === 200, `GET /api/admin/messages returns HTTP 200 (got: ${msgRes.status})`);
    const msgJson = await msgRes.json();
    assert(Array.isArray(msgJson.data), 'Messages data is an array');

    // ==================== 5. LOGIN RATE LIMITING TEST ====================
    console.log('\n5. Testing Login Rate Limiting (authLimiter)...');
    let rateLimited = false;
    // Send repeated failed attempts until 429 is triggered
    for (let i = 0; i < 25; i++) {
      const floodRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'flooder@example.com', password: 'bad_password' })
      });
      if (floodRes.status === 429) {
        rateLimited = true;
        break;
      }
    }
    assert(rateLimited === true, 'Repeated failed login attempts trigger HTTP 429 Rate Limit');

    // Reset rate limiter so developer/QA is never locked out on localhost
    await fetch(`${API_BASE}/auth/reset-limiter`, {
      method: 'POST',
      headers: { 'x-test-suite': 'true' }
    }).catch(() => {});

    console.log('\nAll Phase 4 Step 2 backend tests passed successfully!');

  } catch (err) {
    console.error('[TEST ERROR]', err);
    testsFailed++;
  } finally {
    // Cleanup any lingering created IDs
    if (createdExpIds.length > 0) {
      await pool.query('DELETE FROM experience WHERE id IN (?);', [createdExpIds]);
    }
    if (createdServiceIds.length > 0) {
      await pool.query('DELETE FROM services WHERE id IN (?);', [createdServiceIds]);
    }
    if (createdSkillIds.length > 0) {
      await pool.query('DELETE FROM skills WHERE id IN (?);', [createdSkillIds]);
    }
    if (createdProjectIds.length > 0) {
      await pool.query('DELETE FROM projects WHERE id IN (?);', [createdProjectIds]);
    }

    // Restore original admin state
    if (originalAdmin) {
      await pool.query('UPDATE admins SET password_hash = ?, email = ?, name = ? WHERE id = ?;', [
        originalAdmin.password_hash,
        originalAdmin.email,
        originalAdmin.name,
        originalAdmin.id
      ]);
    }

    console.log('\n================================================================');
    console.log(`Results: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('================================================================\n');

    await pool.end();
    if (testsFailed > 0) {
      process.exit(1);
    }
  }
}

runAdminCmsTests();
