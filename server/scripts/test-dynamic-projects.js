import { pool } from '../db.js';
import { fallbackProfile } from '../../src/hooks/usePortfolioData.js';
import { projects as staticProjects } from '../../src/data/projects.js';

console.log('================================================================');
console.log('       WEEK 12 - PHASE 3 STEP 2 DYNAMIC PROJECTS VERIFICATION    ');
console.log('================================================================\n');

async function runDynamicVerification() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Static Fallback Check
    assert(Array.isArray(staticProjects) && staticProjects.length === 6, 'Static fallback has exactly 6 projects');
    const staticBrickBeam = staticProjects.find(p => p.slug === 'brickbeam');
    assert(staticBrickBeam && staticBrickBeam.name === 'BrickBeam', 'Static BrickBeam exists in fallback');

    // 2. Dynamic Live API Check
    const res = await fetch('http://localhost:5000/api/portfolio/all');
    assert(res.status === 200, 'GET /api/portfolio/all returns 200 OK');
    const json = await res.json();
    assert(json.success === true, 'API payload indicates success: true');

    const dynamicProjects = json.data.projects;
    assert(Array.isArray(dynamicProjects) && dynamicProjects.length === 6, `Dynamic API returned 6 projects (got ${dynamicProjects.length})`);

    // 3. Flagship Project Verification
    const firstProject = dynamicProjects[0];
    assert(firstProject.slug === 'brickbeam', `Project #01 in dynamic dataset is BrickBeam (slug: ${firstProject.slug})`);
    assert(firstProject.number === '01', `BrickBeam number is "01" (got: ${firstProject.number})`);
    assert(firstProject.isFeatured === true, `BrickBeam is featured (isFeatured: ${firstProject.isFeatured})`);
    assert(Array.isArray(firstProject.technologies) && firstProject.technologies.includes('Laravel 12'), 'BrickBeam technologies array is parsed');
    assert(firstProject.caseStudy && firstProject.caseStudy.architecture, 'BrickBeam caseStudy object is parsed');
    assert(firstProject.caseStudy.features && firstProject.caseStudy.features.length > 0, 'BrickBeam caseStudy features array is populated');

    // 4. Project Single Endpoint
    const singleRes = await fetch('http://localhost:5000/api/projects/brickbeam');
    assert(singleRes.status === 200, 'GET /api/projects/brickbeam returns 200 OK');
    const singleJson = await singleRes.json();
    assert(singleJson.data.name === 'BrickBeam', 'Single endpoint returns BrickBeam data');

    // 5. Dynamic Mutation Proof of Life Test
    const originalSubtitle = firstProject.subtitle;
    const testSubtitle = `DYNAMIC TEST VERIFICATION ${Date.now()}`;
    console.log(`\nTesting live database mutation on BrickBeam subtitle...`);
    console.log(`Original: "${originalSubtitle}"`);
    console.log(`Temporary: "${testSubtitle}"`);

    // Mutate in DB
    await pool.query('UPDATE projects SET subtitle = ? WHERE slug = "brickbeam"', [testSubtitle]);

    // Fetch from API to prove dynamic read from MySQL
    const mutatedRes = await fetch('http://localhost:5000/api/portfolio/all');
    const mutatedJson = await mutatedRes.json();
    const mutatedBrickBeam = mutatedJson.data.projects.find(p => p.slug === 'brickbeam');
    assert(mutatedBrickBeam.subtitle === testSubtitle, `Live API returned mutated subtitle from MySQL: "${mutatedBrickBeam.subtitle}"`);

    // Restore original in DB
    await pool.query('UPDATE projects SET subtitle = ? WHERE slug = "brickbeam"', [originalSubtitle]);

    // Verify restored
    const restoredRes = await fetch('http://localhost:5000/api/portfolio/all');
    const restoredJson = await restoredRes.json();
    const restoredBrickBeam = restoredJson.data.projects.find(p => p.slug === 'brickbeam');
    assert(restoredBrickBeam.subtitle === originalSubtitle, `Original subtitle successfully restored in MySQL: "${restoredBrickBeam.subtitle}"`);

    console.log(`\nDynamic MySQL data flow 100% verified!`);

  } catch (err) {
    assert(false, `Unexpected error during test execution: ${err.message}`);
  } finally {
    console.log(`\n================================================================`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log('================================================================');
    await pool.end();
    if (failed > 0) process.exit(1);
  }
}

runDynamicVerification();
