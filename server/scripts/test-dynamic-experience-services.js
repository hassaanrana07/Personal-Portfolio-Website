import { pool } from '../db.js';
import { workExperience as staticWork, educationExperience as staticEdu } from '../../src/data/experience.js';
import { services as staticServices } from '../../src/data/services.js';

console.log('================================================================');
console.log('  WEEK 12 - PHASE 3 STEP 3 DYNAMIC EXPERIENCE & SERVICES TEST   ');
console.log('================================================================\n');

async function runExperienceServicesVerification() {
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
    assert(Array.isArray(staticWork) && staticWork.length === 3, `Static work fallback count: ${staticWork.length}`);
    assert(Array.isArray(staticEdu) && staticEdu.length === 2, `Static education fallback count: ${staticEdu.length}`);
    assert(Array.isArray(staticServices) && staticServices.length === 11, `Static services fallback count: ${staticServices.length}`);

    // 2. Experience Live API Check
    const expRes = await fetch('http://localhost:5000/api/experience');
    assert(expRes.status === 200, 'GET /api/experience returns 200 OK');
    const expJson = await expRes.json();
    assert(expJson.success === true, 'Experience API indicates success: true');
    assert(Array.isArray(expJson.data.work) && expJson.data.work.length === 3, `Dynamic work items returned: ${expJson.data.work.length}`);
    assert(Array.isArray(expJson.data.education) && expJson.data.education.length === 2, `Dynamic education items returned: ${expJson.data.education.length}`);

    // Check specific experience work items
    const ronnie = expJson.data.work.find(w => w.organization === 'Ronnie Ridge Technology');
    assert(ronnie && Array.isArray(ronnie.tags) && ronnie.tags.includes('Laravel'), 'Ronnie Ridge Technology work record parsed with tags array');

    const fentix = expJson.data.work.find(w => w.organization === 'FentixTech');
    assert(fentix && fentix.role.includes('Web Developer'), 'FentixTech work record found');

    const codiveo = expJson.data.work.find(w => w.organization === 'Codiveo');
    assert(codiveo && codiveo.role.includes('Frontend Developer Intern'), 'Codiveo work record found');

    // Check education items
    const vu = expJson.data.education.find(e => e.organization.includes('Virtual University'));
    assert(vu && vu.role === 'BS Computer Science', 'Virtual University BS Computer Science record found');

    // 3. Services Live API Check
    const servRes = await fetch('http://localhost:5000/api/services');
    assert(servRes.status === 200, 'GET /api/services returns 200 OK');
    const servJson = await servRes.json();
    assert(servJson.success === true, 'Services API indicates success: true');
    assert(Array.isArray(servJson.data) && servJson.data.length === 6, `Dynamic services count matches DB (6 items, got ${servJson.data.length})`);
    assert(servJson.data[0].title && servJson.data[0].short_desc, 'Service record has title and short_desc');

    // 4. Aggregated Portfolio API Check
    const allRes = await fetch('http://localhost:5000/api/portfolio/all');
    assert(allRes.status === 200, 'GET /api/portfolio/all returns 200 OK');
    const allJson = await allRes.json();
    assert(Array.isArray(allJson.data.experience?.work) && allJson.data.experience.work.length === 3, 'Aggregated payload contains 3 normalized work items');
    assert(Array.isArray(allJson.data.experience?.education) && allJson.data.experience.education.length === 2, 'Aggregated payload contains 2 normalized education items');
    assert(Array.isArray(allJson.data.services) && allJson.data.services.length === 6, 'Aggregated payload contains 6 normalized services');

    // 5. Experience Dynamic Mutation Test
    console.log(`\nTesting live database mutation on Experience (Ronnie Ridge Technology)...`);
    const [origWorkRows] = await pool.query('SELECT description FROM experience WHERE organization = "Ronnie Ridge Technology" LIMIT 1');
    const origExpDesc = origWorkRows[0].description;
    const testExpDesc = `DYNAMIC MUTATION TEST ${Date.now()}: Enterprise microservices and real-time systems.`;

    await pool.query('UPDATE experience SET description = ? WHERE organization = "Ronnie Ridge Technology"', [testExpDesc]);

    const mutatedExpRes = await fetch('http://localhost:5000/api/portfolio/all');
    const mutatedExpJson = await mutatedExpRes.json();
    const mutatedRonnie = mutatedExpJson.data.experience.work.find(w => w.organization === 'Ronnie Ridge Technology' || w.company === 'Ronnie Ridge Technology');
    assert(mutatedRonnie.description === testExpDesc, `Live API returned mutated description from MySQL: "${mutatedRonnie.description}"`);

    // Restore original description
    await pool.query('UPDATE experience SET description = ? WHERE organization = "Ronnie Ridge Technology"', [origExpDesc]);
    const restoredExpRes = await fetch('http://localhost:5000/api/portfolio/all');
    const restoredExpJson = await restoredExpRes.json();
    const restoredRonnie = restoredExpJson.data.experience.work.find(w => w.organization === 'Ronnie Ridge Technology' || w.company === 'Ronnie Ridge Technology');
    assert(restoredRonnie.description === origExpDesc, `Original experience description successfully restored in MySQL`);

    // 6. Services Dynamic Mutation Test
    console.log(`\nTesting live database mutation on Services...`);
    const [origServRows] = await pool.query('SELECT id, title FROM services ORDER BY sort_order ASC LIMIT 1');
    const serviceId = origServRows[0].id;
    const origServTitle = origServRows[0].title;
    const testServTitle = `MUTATED SERVICE ${Date.now()}`;

    await pool.query('UPDATE services SET title = ? WHERE id = ?', [testServTitle, serviceId]);

    const mutatedServRes = await fetch('http://localhost:5000/api/portfolio/all');
    const mutatedServJson = await mutatedServRes.json();
    const mutatedService = mutatedServJson.data.services.find(s => s.id === serviceId);
    assert(mutatedService.title === testServTitle, `Live API returned mutated service title from MySQL: "${mutatedService.title}"`);

    // Restore original service title
    await pool.query('UPDATE services SET title = ? WHERE id = ?', [origServTitle, serviceId]);
    const restoredServRes = await fetch('http://localhost:5000/api/portfolio/all');
    const restoredServJson = await restoredServRes.json();
    const restoredService = restoredServJson.data.services.find(s => s.id === serviceId);
    assert(restoredService.title === origServTitle, `Original service title successfully restored in MySQL`);

    console.log(`\nExperience and Services dynamic integration 100% verified!`);

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

runExperienceServicesVerification();
