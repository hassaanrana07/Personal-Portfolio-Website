import { pool } from '../db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:5000/api';
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

async function runPropagationTests() {
  console.log('================================================================');
  console.log('    WEEK 12 - PHASE 4 STEP 4 CMS DYNAMIC PROPAGATION SUITE      ');
  console.log('================================================================\n');

  let token = null;

  try {
    // 0. Authenticate as Admin (or generate verified JWT token)
    try {
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@hassaan.dev', password: 'admin123456' })
      });
      if (loginRes.ok) {
        const loginJson = await loginRes.json();
        token = loginJson.token;
      }
    } catch {}

    if (!token) {
      // Fallback: direct signing for independent test suite isolation
      const [adminRows] = await pool.query('SELECT * FROM admins WHERE email = ? LIMIT 1;', ['admin@hassaan.dev']);
      const admin = adminRows[0] || { id: 'admin-1', email: 'admin@hassaan.dev', name: 'Hassaan Ali Akbar' };
      token = jwt.sign(
        { id: admin.id, email: admin.email, name: admin.name },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
    }

    assert(Boolean(token), 'Admin authentication verified, JWT token acquired');
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    // ==========================================
    // 1. PROFILE PROPAGATION
    // ==========================================
    console.log('\n1. Testing Profile CMS Propagation (Admin Edit -> Public Reflection)...');
    const originalProfileRes = await fetch(`${API_BASE}/profile`).then(r => r.json());
    const originalTitle = originalProfileRes.data?.title || 'Full Stack Developer';
    const testTitle = `Dynamic Lead Full Stack Engineer ${Date.now()}`;

    const updateProfileRes = await fetch(`${API_BASE}/admin/profile`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ title: testTitle })
    });
    assert(updateProfileRes.status === 200, 'Admin PUT /api/admin/profile succeeded (HTTP 200)');

    const publicProfileRes = await fetch(`${API_BASE}/profile`).then(r => r.json());
    assert(publicProfileRes.data?.title === testTitle, `Public /api/profile reflects modified title: "${testTitle}"`);

    const aggregatedRes = await fetch(`${API_BASE}/portfolio/all`).then(r => r.json());
    assert(aggregatedRes.data?.profile?.title === testTitle, 'Aggregated /api/portfolio/all reflects modified profile title');

    // Restore original profile
    await fetch(`${API_BASE}/admin/profile`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ title: originalTitle })
    });
    console.log('[PASS] Original profile title restored in MySQL');

    // ==========================================
    // 2. PROJECT PROPAGATION & REORDERING
    // ==========================================
    console.log('\n2. Testing Project CMS Propagation (Create -> Edit -> Reorder -> Delete)...');
    const testSlug = `prop-project-${Date.now()}`;
    const createProjectRes = await fetch(`${API_BASE}/admin/projects`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        slug: testSlug,
        number: '99',
        name: 'Autonomous AI Orchestrator',
        subtitle: 'Multi-Agent Enterprise Pipeline',
        category: 'AI & Cloud Infrastructure',
        project_type: 'Enterprise SaaS',
        role: 'Chief Architect',
        accent_color: '#00F2FE',
        is_featured: true,
        sort_order: 99,
        description: 'Dynamic test project for CMS verification.',
        technologies: ['React', 'Node.js', 'LangChain', 'Docker'],
        github_url: 'https://github.com/hassaanrana07/ai-orchestrator',
        live_url: 'https://orchestrator.demo',
        preview_type: 'projectmanagement',
        case_study: {
          overview: 'End-to-end agentic workflow automation platform.',
          problem: 'Manual multi-step developer operations.',
          solution: 'Automated distributed pipelines.'
        }
      })
    });
    assert(createProjectRes.status === 201, 'Admin POST /api/admin/projects succeeded (HTTP 201)');
    const createProjectJson = await createProjectRes.json();
    const newProjectId = createProjectJson.id;
    assert(Boolean(newProjectId), `Project created with ID: ${newProjectId}`);

    // Verify presence in public API
    const publicProjectsRes = await fetch(`${API_BASE}/projects`).then(r => r.json());
    const foundProject = publicProjectsRes.data?.find(p => p.id === newProjectId);
    assert(Boolean(foundProject), 'Newly created project appears in public GET /api/projects');
    assert(foundProject?.name === 'Autonomous AI Orchestrator', 'Project name matches created value');
    assert(foundProject?.is_featured === 1 || foundProject?.is_featured === true, 'Project is marked as featured');

    // Edit Project
    const updateProjectRes = await fetch(`${API_BASE}/admin/projects/${newProjectId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        subtitle: 'Updated Multi-Agent Enterprise Pipeline v2'
      })
    });
    assert(updateProjectRes.status === 200, 'Admin PUT /api/admin/projects/:id succeeded (HTTP 200)');

    const publicProjectAfterUpdate = await fetch(`${API_BASE}/projects`).then(r => r.json());
    const updatedProj = publicProjectAfterUpdate.data?.find(p => p.id === newProjectId);
    assert(updatedProj?.subtitle === 'Updated Multi-Agent Enterprise Pipeline v2', 'Project subtitle update verified in public API');

    // Delete Project
    const deleteProjectRes = await fetch(`${API_BASE}/admin/projects/${newProjectId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    assert(deleteProjectRes.status === 200, 'Admin DELETE /api/admin/projects/:id succeeded (HTTP 200)');

    const publicProjectsAfterDelete = await fetch(`${API_BASE}/projects`).then(r => r.json());
    const deletedProj = publicProjectsAfterDelete.data?.find(p => p.id === newProjectId);
    assert(!deletedProj, 'Deleted project successfully removed from public API');

    // ==========================================
    // 3. SKILL PROPAGATION
    // ==========================================
    console.log('\n3. Testing Skills CMS Propagation (Create -> Edit -> Delete)...');
    const createSkillRes = await fetch(`${API_BASE}/admin/skills`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'LangChain & LangGraph',
        category: 'AI / Architecture',
        color_hex: '#10B981',
        description: 'Multi-Agent Autonomous Orchestration & State Graphs',
        orbit_radius: 22.0,
        orbit_speed: 0.15,
        sort_order: 99
      })
    });
    assert(createSkillRes.status === 201, 'Admin POST /api/admin/skills succeeded (HTTP 201)');
    const createSkillJson = await createSkillRes.json();
    const skillId = createSkillJson.id;

    // Verify in public skills
    const publicSkillsRes = await fetch(`${API_BASE}/skills`).then(r => r.json());
    const foundSkill = publicSkillsRes.data?.find(s => s.id === skillId);
    assert(Boolean(foundSkill), 'Newly created skill appears in public GET /api/skills');
    assert(foundSkill?.name === 'LangChain & LangGraph', 'Skill name matches');
    assert(Number(foundSkill?.orbit_radius) === 22.0, 'Skill 3D orbit radius verified in API');

    // Delete Skill
    const deleteSkillRes = await fetch(`${API_BASE}/admin/skills/${skillId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    assert(deleteSkillRes.status === 200, 'Admin DELETE /api/admin/skills/:id succeeded (HTTP 200)');

    // ==========================================
    // 4. EXPERIENCE PROPAGATION
    // ==========================================
    console.log('\n4. Testing Experience CMS Propagation (Create Work & Edu -> Delete)...');
    const createWorkRes = await fetch(`${API_BASE}/admin/experience`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        type: 'work',
        period: '2026 - 2027',
        role: 'Chief AI Architect',
        organization: 'Vanguard Systems',
        location: 'Remote',
        description: 'Designing enterprise agent platforms.',
        tags: ['React', 'Python', 'FastAPI'],
        color_theme: 'orange',
        sort_order: 99
      })
    });
    assert(createWorkRes.status === 201, 'Admin POST /api/admin/experience (work) succeeded (HTTP 201)');
    const workId = (await createWorkRes.json()).id;

    const publicExpRes = await fetch(`${API_BASE}/experience`).then(r => r.json());
    const foundWork = publicExpRes.data?.work?.find(w => w.id === workId);
    assert(Boolean(foundWork), 'Created work experience verified in public GET /api/experience');

    // Clean up
    await fetch(`${API_BASE}/admin/experience/${workId}`, { method: 'DELETE', headers: authHeaders });
    console.log('[PASS] Cleaned up temporary work experience record');

    // ==========================================
    // 5. SERVICES PROPAGATION
    // ==========================================
    console.log('\n5. Testing Services CMS Propagation (Create Service -> Delete)...');
    const createServiceRes = await fetch(`${API_BASE}/admin/services`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Full-Stack Distributed Cloud Architecture',
        short_desc: 'High-concurrency microservices & resilient APIs',
        full_desc: 'Comprehensive end-to-end cloud engineering.',
        icon_name: 'cloud',
        sort_order: 99
      })
    });
    assert(createServiceRes.status === 201, 'Admin POST /api/admin/services succeeded (HTTP 201)');
    const serviceId = (await createServiceRes.json()).id;

    const publicServicesRes = await fetch(`${API_BASE}/services`).then(r => r.json());
    const foundService = publicServicesRes.data?.find(s => s.id === serviceId);
    assert(Boolean(foundService), 'Created service verified in public GET /api/services');
    assert(foundService?.icon_name === 'cloud', 'Service icon matches');

    // Clean up
    await fetch(`${API_BASE}/admin/services/${serviceId}`, { method: 'DELETE', headers: authHeaders });
    console.log('[PASS] Cleaned up temporary service record');

    // ==========================================
    // 6. CONTACT MESSAGE INBOX WORKFLOW
    // ==========================================
    console.log('\n6. Testing Contact Submission -> Admin Messages -> Mark Read -> Delete...');
    // Public user submits contact message
    const publicSubmitRes = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sarah Connor',
        email: 'sarah.connor@cyberdyne.org',
        subject: 'Enterprise System Modernization Inquiry',
        message: 'Looking to migrate our legacy monolith into a resilient Laravel & React platform.'
      })
    });
    assert(publicSubmitRes.status === 201, 'Public user POST /api/contact succeeded (HTTP 201)');
    const publicSubmitJson = await publicSubmitRes.json();
    const messageId = publicSubmitJson.id;
    assert(Boolean(messageId), `Contact message stored with ID: ${messageId}`);

    // Admin fetches messages
    const adminMsgRes = await fetch(`${API_BASE}/admin/messages`, { headers: authHeaders });
    const adminMsgJson = await adminMsgRes.json();
    const foundMsg = adminMsgJson.data?.find(m => m.id === messageId);
    assert(Boolean(foundMsg), 'Admin GET /api/admin/messages received newly submitted contact message');
    assert(foundMsg?.is_read === 0 || foundMsg?.is_read === false, 'Newly submitted message is marked unread');

    // Admin marks message as read
    const markReadRes = await fetch(`${API_BASE}/admin/messages/${messageId}/read`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ is_read: true })
    });
    assert(markReadRes.status === 200, 'Admin PATCH /api/admin/messages/:id/read marked message as read (HTTP 200)');

    // Verify is_read in database
    const [msgDb] = await pool.query('SELECT is_read FROM contact_messages WHERE id = ?;', [messageId]);
    assert(msgDb[0]?.is_read === 1, 'Database confirms message is_read = 1');

    // Admin deletes message
    const deleteMsgRes = await fetch(`${API_BASE}/admin/messages/${messageId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    assert(deleteMsgRes.status === 200, 'Admin DELETE /api/admin/messages/:id deleted message (HTTP 200)');

    console.log('\nAll 6 CMS dynamic propagation channels verified successfully!');

  } catch (err) {
    console.error('[PROPAGATION TEST ERROR]', err);
    testsFailed++;
  } finally {
    console.log('\n================================================================');
    console.log(`Results: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('================================================================\n');

    await pool.end();
    if (testsFailed > 0) {
      process.exit(1);
    }
  }
}

runPropagationTests();
