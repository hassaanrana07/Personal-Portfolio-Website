import { pool } from '../db.js';

const API_BASE = 'http://localhost:5000/api';

let testsPassed = 0;
let testsFailed = 0;
const insertedIds = [];

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

async function runContactTests() {
  console.log('================================================================');
  console.log('       WEEK 12 - PHASE 3 STEP 6 CONTACT INTEGRATION TEST        ');
  console.log('================================================================\n');

  try {
    // Test 1: Valid contact submission
    console.log('1. Testing valid contact message submission...');
    const validPayload = {
      name: 'Dr. Jane Smith',
      email: 'jane.smith@example.org',
      subject: 'Architecture Consultation & Opportunity',
      message: 'Hello Hassaan, I reviewed your full-stack engineering portfolio and BrickBeam case study. Would love to discuss a consulting opportunity.'
    };

    const validRes = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload)
    });

    assert(validRes.status === 201, `Valid submission returns HTTP 201 Created (got: ${validRes.status})`);
    const validJson = await validRes.json();
    assert(validJson.success === true, 'Response JSON indicates success: true');
    assert(Boolean(validJson.message), `Response contains confirmation message: "${validJson.message}"`);
    assert(Boolean(validJson.id), `Response returns newly generated message ID: "${validJson.id}"`);

    if (validJson.id) insertedIds.push(validJson.id);

    // Test 2: MySQL persistence verification
    console.log('\n2. Verifying record persistence in MySQL database...');
    const [rows] = await pool.query('SELECT * FROM contact_messages WHERE id = ?;', [validJson.id]);
    assert(rows.length === 1, 'Exactly one record found in MySQL contact_messages table');
    const msg = rows[0];
    assert(msg.name === validPayload.name, `Stored name matches: "${msg.name}"`);
    assert(msg.email === validPayload.email.toLowerCase(), `Stored email normalized: "${msg.email}"`);
    assert(msg.subject === validPayload.subject, `Stored subject matches: "${msg.subject}"`);
    assert(msg.message === validPayload.message, `Stored message content matches`);
    assert(msg.is_read === 0 || msg.is_read === false, 'New message defaults to is_read = false');
    assert(Boolean(msg.created_at), 'Message contains valid created_at timestamp');

    // Test 3: Missing required fields
    console.log('\n3. Testing missing required fields...');
    const missingTests = [
      { payload: { email: 'test@example.com', subject: 'Hi', message: 'Hello' }, label: 'Missing name' },
      { payload: { name: 'Test User', subject: 'Hi', message: 'Hello' }, label: 'Missing email' },
      { payload: { name: 'Test User', email: 'test@example.com', message: 'Hello' }, label: 'Missing subject' },
      { payload: { name: 'Test User', email: 'test@example.com', subject: 'Hi' }, label: 'Missing message' },
      { payload: { name: '   ', email: 'test@example.com', subject: 'Hi', message: 'Hello' }, label: 'Whitespace-only name' },
    ];

    for (const mt of missingTests) {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mt.payload)
      });
      assert(res.status === 400, `Rejected payload (${mt.label}) with HTTP 400 (got: ${res.status})`);
      const json = await res.json();
      assert(json.success === false, `Response success is false for ${mt.label}`);
    }

    // Test 4: Invalid email format
    console.log('\n4. Testing invalid email address formats...');
    const invalidEmails = ['invalid-email', 'jane@', '@domain.com', 'user@domain'];
    for (const em of invalidEmails) {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Doe',
          email: em,
          subject: 'Question',
          message: 'This is a test message.'
        })
      });
      assert(res.status === 400, `Rejected invalid email "${em}" with HTTP 400 (got: ${res.status})`);
      const json = await res.json();
      assert(json.success === false, `Response indicates error for invalid email`);
    }

    // Test 5: Oversized inputs
    console.log('\n5. Testing input length constraints...');
    const oversizedName = 'A'.repeat(151);
    const resOversizedName = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: oversizedName,
        email: 'test@example.com',
        subject: 'Valid Subject',
        message: 'Valid message body'
      })
    });
    assert(resOversizedName.status === 400, `Rejected name > 150 chars with HTTP 400 (got: ${resOversizedName.status})`);

    const oversizedMessage = 'M'.repeat(5001);
    const resOversizedMsg = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Valid Subject',
        message: oversizedMessage
      })
    });
    assert(resOversizedMsg.status === 400, `Rejected message > 5000 chars with HTTP 400 (got: ${resOversizedMsg.status})`);

    // Test 6: Database cleanup
    console.log('\n6. Cleaning up test records from MySQL...');
    if (insertedIds.length > 0) {
      const [delResult] = await pool.query('DELETE FROM contact_messages WHERE id IN (?);', [insertedIds]);
      assert(delResult.affectedRows >= 1, `Cleaned up ${delResult.affectedRows} test message(s) from database`);
    }

    console.log('\nContact dynamic MySQL data flow 100% verified!');

  } catch (err) {
    console.error('[TEST ERROR]', err);
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

runContactTests();
