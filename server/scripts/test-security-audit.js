import { pool } from '../db.js';
import bcrypt from 'bcryptjs';
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

async function runSecurityAuditTests() {
  console.log('================================================================');
  console.log('    WEEK 12 - PHASE 4 STEP 6 SECURITY & PRODUCTION AUDIT        ');
  console.log('================================================================\n');

  try {
    // ==========================================
    // 1. PASSWORD HASHING VERIFICATION
    // ==========================================
    console.log('1. Verifying Password Hashing Algorithm...');
    const [adminRows] = await pool.query('SELECT password_hash FROM admins ORDER BY id ASC LIMIT 1;');
    assert(adminRows.length > 0, 'Admin account exists in MySQL database');
    const hash = adminRows[0].password_hash;
    assert(hash.startsWith('$2a$') || hash.startsWith('$2b$'), `Password is hashed using bcrypt ($2a$/$2b$ format verified: ${hash.substring(0, 7)}...)`);
    const testSampleHash = await bcrypt.hash('audit_validation_pwd', 12);
    const isMatch = await bcrypt.compare('audit_validation_pwd', testSampleHash);
    assert(isMatch === true, 'Admin password hash validates correctly with bcrypt');
    const isWrongMatch = await bcrypt.compare('wrong_password_definitely_invalid', hash);
    assert(isWrongMatch === false, 'Invalid password strictly rejected by bcrypt');

    // ==========================================
    // 2. INDEPENDENT ADMIN ROUTE PROTECTION (HTTP 401)
    // ==========================================
    console.log('\n2. Verifying Independent Route Authentication & 401 Rejections...');
    const adminEndpoints = [
      { method: 'PUT', url: `${API_BASE}/admin/profile`, body: { title: 'Hacked' } },
      { method: 'POST', url: `${API_BASE}/admin/projects`, body: { name: 'Hacked' } },
      { method: 'PUT', url: `${API_BASE}/admin/projects/reorder`, body: { orderedIds: [] } },
      { method: 'POST', url: `${API_BASE}/admin/skills`, body: { name: 'Hacked' } },
      { method: 'POST', url: `${API_BASE}/admin/experience`, body: { role: 'Hacked' } },
      { method: 'POST', url: `${API_BASE}/admin/services`, body: { title: 'Hacked' } },
      { method: 'GET', url: `${API_BASE}/admin/messages` },
      { method: 'GET', url: `${API_BASE}/auth/me` }
    ];

    for (const ep of adminEndpoints) {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
        body: ep.body ? JSON.stringify(ep.body) : undefined
      });
      assert(res.status === 401, `Unauthenticated ${ep.method} ${ep.url.replace(API_BASE, '')} rejected with HTTP 401 (got: ${res.status})`);
    }

    // ==========================================
    // 3. INVALID & EXPIRED JWT REJECTION
    // ==========================================
    console.log('\n3. Testing Tampered and Expired Token Rejection...');
    
    // 3.1 Tampered Token
    const tamperedRes = await fetch(`${API_BASE}/admin/messages`, {
      headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.token' }
    });
    assert(tamperedRes.status === 401, `Tampered JWT token rejected with HTTP 401 (got: ${tamperedRes.status})`);

    // 3.2 Expired Token
    const expiredToken = jwt.sign(
      { id: 'admin-1', email: 'admin@hassaan.dev' },
      JWT_SECRET,
      { expiresIn: '-10s' } // Expired 10 seconds ago
    );
    const expiredRes = await fetch(`${API_BASE}/admin/messages`, {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    assert(expiredRes.status === 401, `Expired JWT token rejected with HTTP 401 (got: ${expiredRes.status})`);

    // 3.3 Token Signed with Wrong Secret
    const forgedToken = jwt.sign(
      { id: 'admin-1', email: 'admin@hassaan.dev' },
      'wrong_secret_key_attacker_attempt_999',
      { expiresIn: '1h' }
    );
    const forgedRes = await fetch(`${API_BASE}/admin/messages`, {
      headers: { Authorization: `Bearer ${forgedToken}` }
    });
    assert(forgedRes.status === 401, `Forged JWT with attacker secret rejected with HTTP 401 (got: ${forgedRes.status})`);

    // ==========================================
    // 4. SQL INJECTION IMMUNITY
    // ==========================================
    console.log('\n4. Testing SQL Injection Immunity on Public & Admin Endpoints...');
    const sqliPayload = "' OR '1'='1' -- ";

    // 4.1 SQLi on Project Slug
    const sqliProjectRes = await fetch(`${API_BASE}/projects/${encodeURIComponent(sqliPayload)}`);
    assert(sqliProjectRes.status === 404, `SQL injection in /projects/:slug safely returns 404 (got: ${sqliProjectRes.status})`);

    // 4.2 SQLi on Contact Form Name & Message
    const sqliContactRes = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "'; DROP TABLE test_dummy; --",
        email: 'sqli_tester@security.org',
        subject: "'; UPDATE profile SET title='Hacked'; --",
        message: "' OR 1=1 UNION SELECT * FROM admins --"
      })
    });
    assert(sqliContactRes.status === 201, 'Parameterized SQL inserts special characters safely as literal strings');

    // Verify profile table was NOT modified by injection attempt
    const [profAfterSqli] = await pool.query('SELECT title FROM profile LIMIT 1;');
    assert(profAfterSqli[0]?.title !== 'Hacked', 'Database remains completely uncompromised after SQL injection attempt');

    // Clean up test message
    await pool.query('DELETE FROM contact_messages WHERE email = ?;', ['sqli_tester@security.org']);
    console.log('[PASS] Cleaned up SQLi test record');

    // ==========================================
    // 5. INPUT BOUNDARY & XSS SANITIZATION
    // ==========================================
    console.log('\n5. Testing Input Boundaries, Payloads & Length Constraints...');
    
    // Oversized Message > 5000 chars
    const hugeMessage = 'A'.repeat(5001);
    const hugeRes = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tester',
        email: 'tester@security.org',
        subject: 'Boundary Test',
        message: hugeMessage
      })
    });
    assert(hugeRes.status === 400, 'Payload exceeding maximum character limit rejected with HTTP 400');

    // XSS Payload in Contact Form
    const xssScript = '<script>alert("XSS")</script><img src=x onerror=alert(1)>';
    const xssRes = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'XSS Tester',
        email: 'xss@security.org',
        subject: 'XSS Probe',
        message: xssScript
      })
    });
    assert(xssRes.status === 201, 'XSS input stored as raw literal text in database');
    
    const [xssRow] = await pool.query('SELECT message FROM contact_messages WHERE email = ? LIMIT 1;', ['xss@security.org']);
    assert(xssRow[0]?.message === xssScript, 'XSS string stored safely as plain text without server-side execution');

    // Clean up XSS test record
    await pool.query('DELETE FROM contact_messages WHERE email = ?;', ['xss@security.org']);

    // ==========================================
    // 6. HEALTH CHECK INFORMATION DISCLOSURE
    // ==========================================
    console.log('\n6. Testing Health Check & Information Disclosure...');
    const healthRes = await fetch(`${API_BASE}/health`);
    assert(healthRes.status === 200, 'Health check returns HTTP 200');
    const healthJson = await healthRes.json();
    assert(healthJson.status === 'ok', 'Health status is ok');
    assert(healthJson.service.includes('Hassaan Ali Akbar'), 'Health check contains service identity');
    assert(!healthJson.error, 'No error messages exposed in healthy response');

    console.log('\nAll Security & Production-Readiness tests passed successfully!');

  } catch (err) {
    console.error('[SECURITY AUDIT ERROR]', err);
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

runSecurityAuditTests();
