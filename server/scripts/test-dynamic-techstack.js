import { pool } from '../db.js';
import { fallbackSkills } from '../../src/hooks/usePortfolioData.js';
import { techCategories as staticTech } from '../../src/data/technologies.js';

console.log('================================================================');
console.log('      WEEK 12 - PHASE 3 STEP 4B DYNAMIC TECHSTACK TEST          ');
console.log('================================================================\n');

async function runTechStackVerification() {
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
    // 1. Fallback Data Integrity Check
    assert(Array.isArray(fallbackSkills) && fallbackSkills.length === 21, `Fallback skills array has 21 skills (got ${fallbackSkills.length})`);
    assert(Array.isArray(staticTech) && staticTech.length === 6, `Static techCategories has 6 categories (got ${staticTech.length})`);

    // Check specific fallback skill fields
    const fallbackReact = fallbackSkills.find(s => s.name === 'React.js');
    assert(fallbackReact && fallbackReact.colorHex === '#FFE9A8', 'Fallback React.js skill node has correct category color');

    // 2. Direct Skills API Check
    const skillsRes = await fetch('http://localhost:5000/api/skills');
    assert(skillsRes.status === 200, 'GET /api/skills returns HTTP 200 OK');
    const skillsJson = await skillsRes.json();
    assert(skillsJson.success === true, 'Skills API response success is true');
    assert(Array.isArray(skillsJson.data) && skillsJson.data.length === 21, `Skills API returned 21 skills (got ${skillsJson.data.length})`);

    // 3. Aggregated Portfolio API Check
    const allRes = await fetch('http://localhost:5000/api/portfolio/all');
    assert(allRes.status === 200, 'GET /api/portfolio/all returns HTTP 200 OK');
    const allJson = await allRes.json();
    assert(allJson.success === true, 'Portfolio aggregated API response success is true');
    assert(Array.isArray(allJson.data.skills) && allJson.data.skills.length === 21, `Aggregated API returned 21 skills (got ${allJson.data.skills.length})`);

    // 4. Normalized Skills Structure Verification
    const sampleSkill = allJson.data.skills.find(s => s.name === 'Laravel');
    assert(sampleSkill !== undefined, 'Normalized Laravel skill node exists in API response');
    assert(sampleSkill.name === 'Laravel', `Skill name matches: "${sampleSkill.name}"`);
    assert(sampleSkill.category === 'Backend Systems', `Skill category matches: "${sampleSkill.category}"`);
    assert(sampleSkill.colorHex === '#FF9A3D', `Skill colorHex normalized: "${sampleSkill.colorHex}"`);
    assert(typeof sampleSkill.desc === 'string' && sampleSkill.desc.length > 0, `Skill desc present: "${sampleSkill.desc}"`);
    assert(typeof sampleSkill.orbitRadius === 'number' && sampleSkill.orbitRadius === 12.2, `Skill orbitRadius normalized as number: ${sampleSkill.orbitRadius}`);
    assert(typeof sampleSkill.orbitSpeed === 'number' && sampleSkill.orbitSpeed > 0, `Skill orbitSpeed normalized as number: ${sampleSkill.orbitSpeed}`);

    // 5. Database Consistency Verification
    const [dbRows] = await pool.query('SELECT COUNT(*) as count FROM skills');
    assert(dbRows[0].count === 21, `MySQL skills table row count matches API count (21 records)`);

    // 6. Controlled Live MySQL Mutation Test
    console.log(`\nTesting live database mutation on Laravel skill...`);
    const [origRows] = await pool.query('SELECT description FROM skills WHERE name = "Laravel" LIMIT 1');
    const originalDesc = origRows[0].description;
    const testDesc = `DYNAMIC TECHSTACK TEST ${Date.now()}`;

    // Mutate in DB
    await pool.query('UPDATE skills SET description = ? WHERE name = "Laravel"', [testDesc]);

    // Query API to prove live dynamic consumption from MySQL
    const mutatedRes = await fetch('http://localhost:5000/api/portfolio/all');
    const mutatedJson = await mutatedRes.json();
    const mutatedLaravel = mutatedJson.data.skills.find(s => s.name === 'Laravel');
    assert(mutatedLaravel.desc === testDesc, `Live API returned mutated description from MySQL: "${mutatedLaravel.desc}"`);

    // Direct /api/skills endpoint check
    const mutatedDirectRes = await fetch('http://localhost:5000/api/skills');
    const mutatedDirectJson = await mutatedDirectRes.json();
    const mutatedDirectLaravel = mutatedDirectJson.data.find(s => s.name === 'Laravel');
    assert(mutatedDirectLaravel.description === testDesc, `Direct /api/skills returned mutated description from MySQL`);

    // Restore original description in DB
    await pool.query('UPDATE skills SET description = ? WHERE name = "Laravel"', [originalDesc]);

    // Verify restored description
    const restoredRes = await fetch('http://localhost:5000/api/portfolio/all');
    const restoredJson = await restoredRes.json();
    const restoredLaravel = restoredJson.data.skills.find(s => s.name === 'Laravel');
    assert(restoredLaravel.desc === originalDesc, `Original Laravel description successfully restored in MySQL: "${restoredLaravel.desc}"`);

    console.log(`\nTechStack dynamic MySQL data flow 100% verified!`);

  } catch (err) {
    assert(false, `Unexpected test error: ${err.message}`);
  } finally {
    console.log(`\n================================================================`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log('================================================================');
    await pool.end();
    if (failed > 0) process.exit(1);
  }
}

runTechStackVerification();
