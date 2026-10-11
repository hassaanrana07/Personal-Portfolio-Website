const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE BACKEND API & AUTH TEST SUITE');
  console.log('====================================================\n');

  const results = [];

  async function test(name, path, method = 'GET', body = null, headers = {}, expectedStatus = 200) {
    try {
      const opts = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };
      if (body) opts.body = JSON.stringify(body);

      const res = await fetch(`${BASE_URL}${path}`, opts);
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      const passed = res.status === expectedStatus;
      results.push({
        name,
        method,
        path,
        status: res.status,
        expected: expectedStatus,
        passed,
        data
      });

      console.log(`[${passed ? 'PASS ✅' : 'FAIL ❌'}] ${name} -> ${method} ${path} (Status: ${res.status}, Expected: ${expectedStatus})`);
      return { res, data };
    } catch (err) {
      results.push({
        name,
        method,
        path,
        status: 'CONN_ERR',
        expected: expectedStatus,
        passed: false,
        error: err.message
      });
      console.log(`[FAIL ❌] ${name} -> ${method} ${path} (Connection Error: ${err.message})`);
      return { res: null, data: null };
    }
  }

  // --- 1. PUBLIC ENDPOINTS ---
  await test('1. Health Check', '/api/health', 'GET', null, {}, 200);
  await test('2. Aggregated Dataset (/portfolio/all)', '/api/portfolio/all', 'GET', null, {}, 200);
  await test('3. Projects List (/projects)', '/api/projects', 'GET', null, {}, 200);
  await test('4. Single Project Flagship (/projects/brickbeam)', '/api/projects/brickbeam', 'GET', null, {}, 200);
  await test('5. Single Project 404 (/projects/non-existent-slug)', '/api/projects/non-existent-slug', 'GET', null, {}, 404);
  await test('6. Skills List (/skills)', '/api/skills', 'GET', null, {}, 200);
  await test('7. Experience List (/experience)', '/api/experience', 'GET', null, {}, 200);
  await test('8. Services List (/services)', '/api/services', 'GET', null, {}, 200);
  await test('9. Profile Details (/profile)', '/api/profile', 'GET', null, {}, 200);

  // --- 2. CONTACT SUBMISSION & VALIDATION ---
  await test('10. Contact Valid Submission', '/api/contact', 'POST', {
    name: 'Sarah Connor',
    email: 'sarah.connor@example.com',
    subject: 'Senior Full-Stack Role Opportunity',
    message: 'Hello Hassaan, we reviewed your BrickBeam and Laravel/React portfolio and would love to interview you.'
  }, {}, 201);

  await test('11. Contact Invalid Email Validation', '/api/contact', 'POST', {
    name: 'Invalid Inquirer',
    email: 'invalid-email-string',
    subject: 'Hello',
    message: 'Test message'
  }, {}, 400);

  await test('12. Contact Missing Required Fields', '/api/contact', 'POST', {
    name: '',
    email: '',
    subject: '',
    message: ''
  }, {}, 400);

  // --- 3. AUTHENTICATION & JWT SECURITY ---
  const { data: loginData } = await test('13. Auth Valid Login', '/api/auth/login', 'POST', {
    email: 'admin@hassaan.dev',
    password: 'admin123456'
  }, {}, 200);

  const token = loginData && loginData.token ? loginData.token : '';
  const authHeader = { Authorization: `Bearer ${token}` };

  await test('14. Auth Invalid Password', '/api/auth/login', 'POST', {
    email: 'admin@hassaan.dev',
    password: 'wrong_password_999'
  }, {}, 401);

  await test('15. Auth Invalid Email', '/api/auth/login', 'POST', {
    email: 'fake_admin@hassaan.dev',
    password: 'admin123456'
  }, {}, 401);

  await test('16. Auth Missing Credentials', '/api/auth/login', 'POST', {
    email: '',
    password: ''
  }, {}, 400);

  // --- 4. PROTECTED ADMIN ROUTES & SESSION CHECK ---
  await test('17. Auth /me with Valid Token', '/api/auth/me', 'GET', null, authHeader, 200);
  await test('18. Auth /me Missing Token', '/api/auth/me', 'GET', null, {}, 401);
  await test('19. Auth /me Invalid Token', '/api/auth/me', 'GET', null, { Authorization: 'Bearer invalid.token.xyz' }, 401);
  await test('20. Admin Messages Inbox (Protected)', '/api/admin/messages', 'GET', null, authHeader, 200);
  await test('21. Auth Logout', '/api/auth/logout', 'POST', null, authHeader, 200);

  // --- SUMMARY REPORT ---
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log('\n====================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passedCount}/${totalCount} TESTS PASSED`);
  console.log('====================================================');

  if (passedCount === totalCount) {
    console.log('🎉 ALL BACKEND & AUTHENTICATION TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.log(`⚠️ ${totalCount - passedCount} TESTS FAILED.\n`);
    process.exit(1);
  }
}

runTests();
