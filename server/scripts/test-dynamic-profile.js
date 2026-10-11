import { pool } from '../db.js';
import { fallbackProfile } from '../../src/hooks/usePortfolioData.js';

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

async function runProfileTests() {
  console.log('================================================================');
  console.log('      WEEK 12 - PHASE 3 STEP 5B DYNAMIC PROFILE TEST           ');
  console.log('================================================================\n');

  try {
    // 1. Validate Fallback Profile Structure
    assert(fallbackProfile.fullName === 'Hassaan Ali Akbar', 'Fallback profile full name is "Hassaan Ali Akbar"');
    assert(fallbackProfile.title === 'Full Stack Developer', 'Fallback profile title is "Full Stack Developer"');
    assert(Boolean(fallbackProfile.tagline), 'Fallback profile tagline is present');
    assert(Boolean(fallbackProfile.headline), 'Fallback profile headline is present');
    assert(Boolean(fallbackProfile.bio), 'Fallback profile bio is present');
    assert(fallbackProfile.statusText === 'Open for Opportunities', 'Fallback profile statusText matches');
    assert(fallbackProfile.statusBadge === 'Full-Time', 'Fallback profile statusBadge matches');
    assert(fallbackProfile.email === 'hassaanalee07@gmail.com', 'Fallback profile email matches');
    assert(fallbackProfile.githubUrl.includes('github.com'), 'Fallback profile githubUrl is valid');
    assert(fallbackProfile.linkedinUrl.includes('linkedin.com'), 'Fallback profile linkedinUrl is valid');
    assert(fallbackProfile.instagramUrl.includes('instagram.com'), 'Fallback profile instagramUrl is valid');
    assert(fallbackProfile.resumeUrl.includes('.pdf'), 'Fallback profile resumeUrl is valid');

    // 2. Direct Profile API Test: GET /api/profile
    const profRes = await fetch(`${API_BASE}/profile`);
    assert(profRes.status === 200, `GET /api/profile returns HTTP 200 OK (got: ${profRes.status})`);
    const profJson = await profRes.json();
    assert(profJson.success === true, 'Profile API response indicates success: true');
    assert(Boolean(profJson.data), 'Profile API data payload is present');
    assert(profJson.data.full_name === 'Hassaan Ali Akbar', `Profile name from DB is "Hassaan Ali Akbar" (got: "${profJson.data.full_name}")`);
    assert(profJson.data.status_text === 'Open for Opportunities', `Profile status_text is "Open for Opportunities" (got: "${profJson.data.status_text}")`);
    assert(profJson.data.status_badge === 'Full-Time', `Profile status_badge is "Full-Time" (got: "${profJson.data.status_badge}")`);
    assert(Boolean(profJson.data.instagram_url), `Profile instagram_url is present (got: "${profJson.data.instagram_url}")`);

    // 3. Aggregated Portfolio API Test: GET /api/portfolio/all
    const allRes = await fetch(`${API_BASE}/portfolio/all`);
    assert(allRes.status === 200, `GET /api/portfolio/all returns HTTP 200 OK (got: ${allRes.status})`);
    const allJson = await allRes.json();
    assert(allJson.success === true, 'Aggregated API response indicates success: true');
    assert(Boolean(allJson.data.profile), 'Aggregated API contains profile object');

    const apiProf = allJson.data.profile;
    assert(apiProf.full_name === 'Hassaan Ali Akbar', 'Aggregated profile full_name matches');
    assert(Boolean(apiProf.bio), 'Aggregated profile bio is present');
    assert(Boolean(apiProf.email), 'Aggregated profile email is present');
    assert(Boolean(apiProf.github_url), 'Aggregated profile github_url is present');
    assert(Boolean(apiProf.linkedin_url), 'Aggregated profile linkedin_url is present');
    assert(Boolean(apiProf.resume_url), 'Aggregated profile resume_url is present');

    // 4. Live MySQL Database Mutation Test
    console.log('\nTesting live database mutation on Profile title & tagline...');
    const [origRows] = await pool.query('SELECT title, tagline FROM profile LIMIT 1;');
    const origTitle = origRows[0]?.title || 'Full Stack Developer';
    const origTagline = origRows[0]?.tagline || 'Creative Problem Solver';
    const tempTestTitle = `DYNAMIC PROFILE TITLE ${Date.now()}`;
    const tempTestTagline = `DYNAMIC TAGLINE ${Date.now()}`;

    // Mutate in MySQL
    await pool.query('UPDATE profile SET title = ?, tagline = ? WHERE id IS NOT NULL;', [tempTestTitle, tempTestTagline]);

    // Query through API
    const mutatedProfRes = await fetch(`${API_BASE}/profile`);
    const mutatedProfJson = await mutatedProfRes.json();
    assert(
      mutatedProfJson.data.title === tempTestTitle,
      `Live /api/profile returned mutated title from MySQL: "${mutatedProfJson.data.title}"`
    );
    assert(
      mutatedProfJson.data.tagline === tempTestTagline,
      `Live /api/profile returned mutated tagline from MySQL: "${mutatedProfJson.data.tagline}"`
    );

    const mutatedAllRes = await fetch(`${API_BASE}/portfolio/all`);
    const mutatedAllJson = await mutatedAllRes.json();
    assert(
      mutatedAllJson.data.profile.title === tempTestTitle,
      `Live /api/portfolio/all returned mutated profile title: "${mutatedAllJson.data.profile.title}"`
    );

    // Restore original values
    await pool.query('UPDATE profile SET title = ?, tagline = ? WHERE id IS NOT NULL;', [origTitle, origTagline]);

    // Verify restoration
    const restoredProfRes = await fetch(`${API_BASE}/profile`);
    const restoredProfJson = await restoredProfRes.json();
    assert(
      restoredProfJson.data.title === origTitle,
      `Original profile title successfully restored in MySQL: "${origTitle}"`
    );
    assert(
      restoredProfJson.data.tagline === origTagline,
      `Original profile tagline successfully restored in MySQL: "${origTagline}"`
    );

    console.log('\nProfile dynamic MySQL data flow 100% verified!\n');
  } catch (err) {
    console.error('[TEST ERROR]', err);
    testsFailed++;
  } finally {
    console.log('================================================================');
    console.log(`Results: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('================================================================\n');
    await pool.end();
    if (testsFailed > 0) {
      process.exit(1);
    }
  }
}

runProfileTests();
