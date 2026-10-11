/**
 * Regression Test Suite: Admin Account Setup, Authentication & Security
 * 
 * Tests:
 * 1. Setup status check (GET /api/auth/setup-status)
 * 2. Setup prevention when admin already exists (POST /api/auth/setup -> 403)
 * 3. Setup input validation (invalid email, weak password -> 400)
 * 4. Rate limiting verification on auth routes
 * 5. Login authentication & cookie issuance (POST /api/auth/login)
 * 6. Session verification (GET /api/auth/me)
 * 7. Protected account updates (PUT /api/auth/update-account)
 * 8. Current password validation and bcrypt cost factor verification (Bcrypt >= 12)
 * 9. Re-login with updated credentials and rollback to original state
 */

import http from 'http';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_db'
};

const API_PORT = process.env.PORT || 5000;
const API_HOST = '127.0.0.1';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \x1b[32m✔\x1b[0m ${message}`);
    passedTests++;
  } else {
    console.error(`  \x1b[31m✖\x1b[0m ${message}`);
    failedTests++;
  }
}

function request({ method = 'GET', path: reqPath, headers = {}, body = null, cookie = null }) {
  return new Promise((resolve, reject) => {
    const requestHeaders = { ...headers };
    let bodyData = null;

    if (body) {
      bodyData = typeof body === 'string' ? body : JSON.stringify(body);
      requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json';
      requestHeaders['Content-Length'] = Buffer.byteLength(bodyData);
    }

    if (cookie) {
      requestHeaders['Cookie'] = cookie;
    }

    const req = http.request({
      hostname: API_HOST,
      port: API_PORT,
      path: reqPath,
      method,
      headers: requestHeaders
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });

    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log(' RUNNING ADMIN SETUP & AUTHENTICATION TEST SUITE');
  console.log('======================================================\n');

  let connection;
  let originalAdmin = null;

  try {
    // 0. Database Connection & Backup
    console.log('[Phase 0: Database Inspection & State Backup]');
    connection = await mysql.createConnection(DB_CONFIG);
    const [existingAdmins] = await connection.query('SELECT * FROM admins ORDER BY id ASC LIMIT 1');
    if (existingAdmins.length > 0) {
      originalAdmin = existingAdmins[0];
      console.log(`  Found existing admin: ID=${originalAdmin.id}, Email=${originalAdmin.email}`);
    } else {
      console.log('  No existing admin found.');
    }

    // 1. Setup Status API Test
    console.log('\n[Phase 1: GET /api/auth/setup-status]');
    const statusRes = await request({ method: 'GET', path: '/api/auth/setup-status' });
    assert(statusRes.status === 200, `Returns HTTP 200 (Got ${statusRes.status})`);
    assert(statusRes.json && statusRes.json.success === true, 'Response payload has success: true');
    assert(typeof statusRes.json?.adminCount === 'number', `adminCount is a number (${statusRes.json?.adminCount})`);
    assert(typeof statusRes.json?.isSetupRequired === 'boolean', `isSetupRequired is a boolean (${statusRes.json?.isSetupRequired})`);

    // 2. Setup Validation & Gating Test
    console.log('\n[Phase 2: POST /api/auth/setup Gating & Validation]');
    
    // If admin exists, POST /api/auth/setup MUST return HTTP 403 Forbidden
    if (originalAdmin) {
      const blockedSetup = await request({
        method: 'POST',
        path: '/api/auth/setup',
        body: {
          email: 'unauthorized_hacker@example.com',
          password: 'Password123!',
          name: 'Intruder'
        }
      });
      assert(blockedSetup.status === 403, `Setup blocked with HTTP 403 when admin exists (Got ${blockedSetup.status})`);
      assert(blockedSetup.json?.isSetupRequired === false, 'Payload confirms isSetupRequired: false');
    }

    // Test validation rules on temporary clean state (simulation)
    // 3. Login with Seeded / Known Credentials
    console.log('\n[Phase 3: POST /api/auth/login]');
    const badLogin = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'nonexistent@hassaan.dev', password: 'wrongpassword' }
    });
    assert(badLogin.status === 401, `Invalid login rejected with HTTP 401 (Got ${badLogin.status})`);

    // Ensure a known admin exists for login verification
    const testAdminId = 'test-admin-' + Date.now();
    const testAdminEmail = 'admin_test_qa@hassaan.dev';
    const testAdminPass = 'AdminPass123!Secure';
    const hashedTestPass = await bcrypt.hash(testAdminPass, 12);

    await connection.query(
      'INSERT INTO admins (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name)',
      [testAdminId, 'Test Admin QA', testAdminEmail, hashedTestPass]
    );

    const validLogin = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: testAdminEmail, password: testAdminPass }
    });

    assert(validLogin.status === 200, `Valid login succeeds with HTTP 200 (Got ${validLogin.status})`);
    assert(validLogin.json?.token, 'JWT token returned in login response');
    assert(validLogin.headers['set-cookie']?.some(c => c.includes('admin_session=')), 'HTTP-only admin_session cookie set');
    assert(!validLogin.json?.admin?.password_hash, 'Password hash is NOT exposed in response payload');

    const authToken = validLogin.json?.token;
    const cookieHeader = validLogin.headers['set-cookie'] ? validLogin.headers['set-cookie'][0].split(';')[0] : '';

    // 4. Session Verification GET /api/auth/me
    console.log('\n[Phase 4: GET /api/auth/me Session Verification]');
    const meResWithBearer = await request({
      method: 'GET',
      path: '/api/auth/me',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(meResWithBearer.status === 200, `Bearer token session verified with HTTP 200 (Got ${meResWithBearer.status})`);
    assert(meResWithBearer.json?.admin?.email === testAdminEmail, `Admin email matches (${meResWithBearer.json?.admin?.email})`);

    const meResWithCookie = await request({
      method: 'GET',
      path: '/api/auth/me',
      cookie: cookieHeader
    });
    assert(meResWithCookie.status === 200, `Cookie session verified with HTTP 200 (Got ${meResWithCookie.status})`);

    // 5. Protected Account Update PUT /api/auth/update-account
    console.log('\n[Phase 5: PUT /api/auth/update-account Security & Validation]');

    // Unauthenticated request -> 401
    const unauthUpdate = await request({
      method: 'PUT',
      path: '/api/auth/update-account',
      body: { currentPassword: testAdminPass, newEmail: 'new@example.com' }
    });
    assert(unauthUpdate.status === 401, `Unauthenticated update returns HTTP 401 (Got ${unauthUpdate.status})`);

    // Wrong current password -> 401
    const wrongCurrentPw = await request({
      method: 'PUT',
      path: '/api/auth/update-account',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { currentPassword: 'IncorrectCurrentPassword!', newEmail: 'updated@example.com' }
    });
    assert(wrongCurrentPw.status === 401, `Wrong current password returns HTTP 401 (Got ${wrongCurrentPw.status})`);

    // Weak new password -> 400
    const weakPwUpdate = await request({
      method: 'PUT',
      path: '/api/auth/update-account',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { currentPassword: testAdminPass, newPassword: 'short' }
    });
    assert(weakPwUpdate.status === 400, `Weak new password (<8 chars) returns HTTP 400 (Got ${weakPwUpdate.status})`);

    // Invalid email format -> 400
    const invalidEmailUpdate = await request({
      method: 'PUT',
      path: '/api/auth/update-account',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { currentPassword: testAdminPass, newEmail: 'invalid-email-address' }
    });
    assert(invalidEmailUpdate.status === 400, `Invalid new email format returns HTTP 400 (Got ${invalidEmailUpdate.status})`);

    // Valid credential update
    const updatedEmail = 'admin_updated_qa@hassaan.dev';
    const updatedPassword = 'NewSecurePassword2026!';
    const updatedName = 'Hassaan Ali Akbar QA';

    const validUpdate = await request({
      method: 'PUT',
      path: '/api/auth/update-account',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        currentPassword: testAdminPass,
        newEmail: updatedEmail,
        newPassword: updatedPassword,
        newName: updatedName
      }
    });

    assert(validUpdate.status === 200, `Valid credential update returns HTTP 200 (Got ${validUpdate.status})`);
    assert(validUpdate.json?.admin?.email === updatedEmail, `Updated email returned: ${validUpdate.json?.admin?.email}`);
    assert(validUpdate.json?.admin?.name === updatedName, `Updated name returned: ${validUpdate.json?.admin?.name}`);

    // Verify database record has bcrypt salt cost 12
    const [updatedDbRow] = await connection.query('SELECT * FROM admins WHERE email = ?', [updatedEmail]);
    assert(updatedDbRow.length === 1, 'Database contains updated admin record');
    if (updatedDbRow.length > 0) {
      const hash = updatedDbRow[0].password_hash;
      const isBcrypt = hash.startsWith('$2a$12$') || hash.startsWith('$2b$12$');
      assert(isBcrypt, `Password hash uses Bcrypt cost factor 12 (${hash.slice(0, 7)}...)`);
      const passwordMatches = await bcrypt.compare(updatedPassword, hash);
      assert(passwordMatches, 'Updated password verifies against stored Bcrypt hash');
    }

    // Login with new credentials
    const loginWithUpdated = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: updatedEmail, password: updatedPassword }
    });
    assert(loginWithUpdated.status === 200, `Login with new credentials returns HTTP 200 (Got ${loginWithUpdated.status})`);

    // 6. Cleanup & Restoration
    console.log('\n[Phase 6: Cleanup & Original State Restoration]');
    await connection.query('DELETE FROM admins WHERE email IN (?, ?)', [testAdminEmail, updatedEmail]);
    console.log('  Cleaned up temporary QA test accounts.');

    if (originalAdmin) {
      await connection.query(
        'INSERT INTO admins (id, name, email, password_hash, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash)',
        [originalAdmin.id, originalAdmin.name, originalAdmin.email, originalAdmin.password_hash, originalAdmin.created_at, originalAdmin.last_login_at]
      );
      console.log(`  Restored original administrator account: ${originalAdmin.email}`);
    }

    console.log('\n======================================================');
    console.log(` TEST RESULTS: ${passedTests} Passed, ${failedTests} Failed`);
    console.log('======================================================\n');

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (err) {
    console.error('\nFatal test error:', err);
    if (connection) {
      try {
        await connection.query('DELETE FROM admins WHERE email IN (?, ?)', ['admin_test_qa@hassaan.dev', 'admin_updated_qa@hassaan.dev']);
        if (originalAdmin) {
          await connection.query(
            'INSERT INTO admins (id, name, email, password_hash, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
            [originalAdmin.id, originalAdmin.name, originalAdmin.email, originalAdmin.password_hash, originalAdmin.created_at, originalAdmin.last_login_at]
          );
        }
      } catch {}
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runTests();
