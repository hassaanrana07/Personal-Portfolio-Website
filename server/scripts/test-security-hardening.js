import { pool } from '../db.js';
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
  console.log('       SECURITY HARDENING VERIFICATION & AUDIT SUITE            ');
  console.log('================================================================\n');

  // 1. Get an admin token for authenticated tests
  const [adminRows] = await pool.query('SELECT * FROM admins LIMIT 1;');
  const originalAdmin = adminRows[0] ? { ...adminRows[0] } : null;
  const testPassword = 'TestPassword123!';
  const testHash = await bcrypt.hash(testPassword, 12);

  let token = null;

  try {
    if (originalAdmin) {
      await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?;', [testHash, originalAdmin.id]);
    }

    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: originalAdmin.email, password: testPassword })
    });

    const loginData = await loginRes.json();
    token = loginData.token;
    assert(Boolean(token), 'Admin authenticated for security testing');

    // ==================== 1. RATE LIMITING TESTS ====================
    console.log('\n--- 1. Testing Tiered Rate Limiting & Auth Exponential Backoff ---');

    // 1.1 Public Endpoint Rate Limit Headers
    const pubRes = await fetch(`${API_BASE}/portfolio/all`);
    assert(pubRes.status === 200, 'Public endpoint returns 200');
    assert(pubRes.headers.has('ratelimit-limit') || pubRes.headers.has('x-ratelimit-limit'), 'Public response includes rate limit headers');

    // 1.2 Auth Reset for test
    await fetch(`${API_BASE}/auth/reset-limiter`, {
      method: 'POST',
      headers: { 'x-test-suite': 'true', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'backoff_test@example.com' })
    });

    // 1.3 Trigger Consecutive Failed Logins to activate Exponential Backoff
    const testAccount = 'backoff_target@example.com';
    let backoffTriggered = false;
    let retryAfterHeader = null;

    for (let i = 1; i <= 6; i++) {
      const failRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testAccount, password: 'WrongPassword123!' })
      });
      if (failRes.status === 429) {
        backoffTriggered = true;
        retryAfterHeader = failRes.headers.get('retry-after');
        break;
      }
    }

    assert(backoffTriggered, 'Consecutive failed login attempts trigger HTTP 429 Exponential Backoff');
    assert(Boolean(retryAfterHeader), `429 response contains Retry-After header (${retryAfterHeader}s)`);

    // Reset backoff counter after test
    await fetch(`${API_BASE}/auth/reset-limiter`, {
      method: 'POST',
      headers: { 'x-test-suite': 'true', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testAccount })
    });

    // ==================== 2. INPUT VALIDATION TESTS ====================
    console.log('\n--- 2. Testing Strict Schema Input Validation ---');

    // 2.1 Contact Form: Reject Invalid Email Format
    const badEmailRes = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tester',
        email: 'invalid-email-no-domain',
        subject: 'General Question',
        message: 'This is a test message that has sufficient length.'
      })
    });
    assert(badEmailRes.status === 400, 'Contact submission with invalid email format rejected (HTTP 400)');
    const badEmailData = await badEmailRes.json();
    assert(badEmailData.success === false, 'Error message returned for invalid email format');

    // 2.2 Contact Form: Reject Short Message
    const shortMsgRes = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tester',
        email: 'valid@example.com',
        subject: 'General Question',
        message: 'Short'
      })
    });
    assert(shortMsgRes.status === 400, 'Contact submission with short message rejected (< 10 chars)');

    // 2.3 Login: Reject Short Password
    const shortPwRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: '123' })
    });
    assert(shortPwRes.status === 400, 'Login with short password rejected by schema validator (HTTP 400)');

    // 2.4 Project: Reject Invalid Hex Color
    const badHexRes = await fetch(`${API_BASE}/admin/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: 'Invalid Color Project',
        accent_color: 'not-a-hex-color'
      })
    });
    assert(badHexRes.status === 400, 'Project creation with invalid hex color rejected (HTTP 400)');

    // ==================== 3. ERROR HANDLING & LEAKAGE TESTS ====================
    console.log('\n--- 3. Testing Error Sanitization & Information Leakage Prevention ---');

    // 3.1 Malformed JSON payload
    const malformedRes = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"invalid-json: true'
    });
    assert(malformedRes.status === 400, 'Malformed JSON request returns clean HTTP 400');
    const malformedData = await malformedRes.json();
    assert(!JSON.stringify(malformedData).includes('at Object.'), 'Malformed JSON response contains no stack trace');

    // 3.2 404 Route returns clean message without server internals
    const notFoundRes = await fetch(`${API_BASE}/non-existent-secret-path`);
    assert(notFoundRes.status === 404, '404 handler returns clean HTTP 404');
    const notFoundData = await notFoundRes.json();
    assert(notFoundData.success === false && notFoundData.message.includes('not found'), '404 response contains clean user message');

    // ==================== 4. FILE UPLOAD SAFETY TESTS ====================
    console.log('\n--- 4. Testing File Upload Binary Inspection & Non-Executable Storage ---');

    // 4.1 Spoofed Image (Text file masquerading as PNG)
    const fakePngBlob = new Blob(['<?php echo "evil script"; ?>'], { type: 'image/png' });
    const fakePngForm = new FormData();
    fakePngForm.append('image', fakePngBlob, 'shell.png');

    const fakePngRes = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fakePngForm
    });
    assert(fakePngRes.status === 400, 'Spoofed PNG (text/PHP payload) rejected by magic byte inspection (HTTP 400)');
    const fakePngData = await fakePngRes.json();
    assert(fakePngData.message.includes('File content verification failed'), 'Error reports binary content mismatch');

    // 4.2 Genuine PNG Upload (Valid Magic Bytes: 89 50 4E 47 0D 0A 1A 0A)
    const genuinePngBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52]);
    const genuinePngBlob = new Blob([genuinePngBytes], { type: 'image/png' });
    const genuinePngForm = new FormData();
    genuinePngForm.append('image', genuinePngBlob, 'genuine.png');

    const genuinePngRes = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: genuinePngForm
    });
    assert(genuinePngRes.status === 201, 'Genuine PNG with valid magic bytes accepted (HTTP 201)');
    const genuinePngData = await genuinePngRes.json();
    const uploadedPngUrl = genuinePngData.url;

    // 4.3 Static Uploads Security Headers (X-Content-Type-Options: nosniff, CSP sandbox)
    if (uploadedPngUrl) {
      const staticRes = await fetch(`http://localhost:5000${uploadedPngUrl}`);
      assert(staticRes.status === 200, 'Uploaded static asset served with HTTP 200');
      assert(staticRes.headers.get('x-content-type-options') === 'nosniff', 'Upload static server sets X-Content-Type-Options: nosniff');
      assert(staticRes.headers.get('content-security-policy')?.includes('sandbox'), 'Upload static server sets CSP sandbox');

      // Cleanup
      const diskPath = path.join(__dirname, '..', uploadedPngUrl);
      if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
    }

    // 4.4 Spoofed PDF (Text masquerading as PDF)
    const fakePdfBlob = new Blob(['Not a genuine PDF content at all'], { type: 'application/pdf' });
    const fakePdfForm = new FormData();
    fakePdfForm.append('resume', fakePdfBlob, 'fake.pdf');

    const fakePdfRes = await fetch(`${API_BASE}/admin/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fakePdfForm
    });
    assert(fakePdfRes.status === 400, 'Spoofed PDF rejected by magic byte inspection (HTTP 400)');

    // 4.5 Genuine PDF Upload (%PDF- magic bytes: 0x25, 0x50, 0x44, 0x46, 0x2D)
    const genuinePdfContent = '%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF';
    const genuinePdfBlob = new Blob([genuinePdfContent], { type: 'application/pdf' });
    const genuinePdfForm = new FormData();
    genuinePdfForm.append('resume', genuinePdfBlob, 'genuine-resume.pdf');

    const genuinePdfRes = await fetch(`${API_BASE}/admin/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: genuinePdfForm
    });
    assert(genuinePdfRes.status === 200, 'Genuine PDF accepted and verified (HTTP 200)');
    const genuinePdfData = await genuinePdfRes.json();
    if (genuinePdfData.url) {
      const diskPath = path.join(__dirname, '..', genuinePdfData.url);
      if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
    }
  } finally {
    // Restore original admin password hash
    if (originalAdmin) {
      await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?;', [originalAdmin.password_hash, originalAdmin.id]);
    }
    await pool.end();
  }

  console.log('\n================================================================');
  console.log(`Security Test Results: ${passed} passed, ${failed} failed`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Security test runner error:', err);
  process.exit(1);
});
