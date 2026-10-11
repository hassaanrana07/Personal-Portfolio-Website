import { pool } from '../db.js';
import { parseExperiencePeriod, sortExperienceList } from '../utils/experienceSorter.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_BASE = 'http://localhost:5000/api';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`[PASS ✅] ${msg}`);
    passed++;
  } else {
    console.error(`[FAIL ❌] ${msg}`);
    failed++;
  }
}

async function run() {
  console.log('================================================================');
  console.log('  WEEK 12 FINAL VERIFICATION: RESUME UPLOAD & EXPERIENCE SORT   ');
  console.log('================================================================\n');

  // 1. Get an admin token
  const [adminRows] = await pool.query('SELECT * FROM admins LIMIT 1;');
  const originalAdmin = adminRows[0] ? { ...adminRows[0] } : null;
  const testPassword = 'TestPassword123!';
  const testHash = await bcrypt.hash(testPassword, 12);

  // Backup profile resume_url
  const [profileRows] = await pool.query('SELECT resume_url FROM profile LIMIT 1;');
  const originalResumeUrl = profileRows[0]?.resume_url;
  let uploadedDiskPath = null;

  try {
    if (originalAdmin) {
      await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?;', [testHash, originalAdmin.id]);
    }

    // Sign in with the known test password
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: originalAdmin.email, password: testPassword })
    });

    const loginData = await loginRes.json();
    const token = loginData.token;
    assert(Boolean(token), `Acquired JWT auth token for ${originalAdmin.email}`);

    // --- TEST A: RESUME UPLOAD (PDF Valid) ---
    console.log('\n--- 1. Testing Resume PDF Upload Endpoint (/api/admin/resume) ---');
    
    // Create a dummy PDF buffer
    const dummyPdfContent = '%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF';
    const dummyPdfBlob = new Blob([dummyPdfContent], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('resume', dummyPdfBlob, 'test-resume.pdf');

    const uploadRes = await fetch(`${API_BASE}/admin/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    assert(uploadRes.status === 200, `POST /api/admin/resume with valid PDF returns 200 (got: ${uploadRes.status})`);
    const uploadJson = await uploadRes.json();
    assert(uploadJson.success === true, 'Upload response reports success: true');
    assert(Boolean(uploadJson.url && uploadJson.url.startsWith('/uploads/doc-')), `URL is valid uploaded doc: ${uploadJson.url}`);

    // Verify DB updated
    const [updatedProfileRows] = await pool.query('SELECT resume_url FROM profile LIMIT 1;');
    assert(updatedProfileRows[0]?.resume_url === uploadJson.url, `MySQL profile.resume_url atomically updated to ${uploadJson.url}`);

    // Verify file exists on disk
    uploadedDiskPath = path.join(__dirname, '..', uploadJson.url);
    assert(fs.existsSync(uploadedDiskPath), `Uploaded PDF exists on disk: ${uploadedDiskPath}`);

    // Verify public /api/portfolio/all returns this updated resume_url
    const publicRes = await fetch(`${API_BASE}/portfolio/all`);
    const publicJson = await publicRes.json();
    assert(publicJson.data?.profile?.resume_url === uploadJson.url, 'Public /api/portfolio/all reflects updated resume_url');

    // --- TEST B: RESUME REJECTION (Invalid File Type) ---
    console.log('\n--- 2. Testing Invalid File Type Rejection ---');
    const txtBlob = new Blob(['Plain text file content'], { type: 'text/plain' });
    const invalidForm = new FormData();
    invalidForm.append('resume', txtBlob, 'malicious.txt');

    const invalidRes = await fetch(`${API_BASE}/admin/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: invalidForm
    });

    assert(invalidRes.status === 400, `Non-PDF upload rejected with HTTP 400 (got: ${invalidRes.status})`);
    const invalidJson = await invalidRes.json();
    assert(invalidJson.success === false, 'Error response reports success: false');

    // Verify DB unchanged after failed upload
    const [postFailedProfileRows] = await pool.query('SELECT resume_url FROM profile LIMIT 1;');
    assert(postFailedProfileRows[0]?.resume_url === uploadJson.url, 'Database resume_url was NOT corrupted by failed upload');

    // --- TEST C: EXPERIENCE SORTING UTILITY & ENDPOINTS ---
    console.log('\n--- 3. Testing Work Experience Sorting ---');

    // Unit tests on parseExperiencePeriod
    const p1 = parseExperiencePeriod('2023 — Present');
    assert(p1.isCurrent === true && p1.endVal === 99999999, '2023 — Present parsed as isCurrent with max endVal');

    const p2 = parseExperiencePeriod('2021 — 2023');
    assert(p2.isCurrent === false && p2.endVal === 202312, '2021 — 2023 parsed with endVal 202312');

    const p3 = parseExperiencePeriod('Jan 2020 — Dec 2020');
    assert(p3.endVal === 202012, 'Jan 2020 — Dec 2020 parsed with endVal 202012');

    // Test sorting array
    const rawList = [
      { id: 1, role: 'Older Role', period: '2019 — 2021' },
      { id: 2, role: 'Current Role', period: '2023 — Present' },
      { id: 3, role: 'Recent Past Role', period: '2022 — 2023' },
      { id: 4, role: 'Same End Year Earlier Start', period: '2020 — 2023' }
    ];

    const sortedList = sortExperienceList(rawList);
    assert(sortedList[0].id === 2, `Current role is sorted #1 (got: ${sortedList[0].role})`);
    assert(sortedList[1].id === 3 || sortedList[1].id === 4, `2023 ending roles sorted before 2021 (got: ${sortedList[1].role})`);
    assert(sortedList[sortedList.length - 1].id === 1, `2019-2021 role sorted last (got: ${sortedList[sortedList.length - 1].role})`);

    // Test public API experience endpoint sorting
    const expRes = await fetch(`${API_BASE}/experience`);
    const expJson = await expRes.json();
    const workList = expJson.data?.work || [];
    assert(workList.length > 0, `Public /api/experience returned ${workList.length} work experiences`);

    if (workList.length > 1) {
      const isSorted = workList.every((item, i) => {
        if (i === 0) return true;
        const prev = parseExperiencePeriod(workList[i - 1].period);
        const curr = parseExperiencePeriod(item.period);
        if (prev.isCurrent && !curr.isCurrent) return true;
        if (!prev.isCurrent && curr.isCurrent) return false;
        return prev.endVal >= curr.endVal;
      });
      assert(isSorted, 'Public work experience array is strictly sorted chronologically (Current first, then latest end date)');
    }
  } finally {
    // Clean up uploaded test PDF from disk
    if (uploadedDiskPath && fs.existsSync(uploadedDiskPath)) {
      try { fs.unlinkSync(uploadedDiskPath); } catch {}
    }

    // Restore original resume URL
    if (originalResumeUrl) {
      await pool.query('UPDATE profile SET resume_url = ? WHERE id IS NOT NULL;', [originalResumeUrl]);
      console.log(`[RESTORE] Restored original resume_url: ${originalResumeUrl}`);
    }

    // Restore original admin password hash
    if (originalAdmin) {
      await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?;', [originalAdmin.password_hash, originalAdmin.id]);
      console.log(`[RESTORE] Restored original admin credentials for ${originalAdmin.email}`);
    }

    await pool.end();
  }

  console.log('\n================================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
