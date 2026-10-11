import { fallbackProfile, fallbackSkills } from '../../src/hooks/usePortfolioData.js';
import { projects as staticProjects } from '../../src/data/projects.js';
import { workExperience as staticWork, educationExperience as staticEdu } from '../../src/data/experience.js';
import { services as staticServices } from '../../src/data/services.js';

console.log('================================================================');
console.log('      WEEK 12 - PHASE 3 HYBRID HYDRATION LAYER VERIFICATION      ');
console.log('================================================================\n');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // Test 1: Fallback Profile integrity
  assert(fallbackProfile.fullName === 'Hassaan Ali Akbar', 'Fallback profile full name is "Hassaan Ali Akbar"');
  assert(Boolean(fallbackProfile.email) && fallbackProfile.email.includes('@'), 'Fallback profile email is present');
  assert(fallbackProfile.resumeUrl === '/Hassaan Ali Akbar Resume.pdf', 'Fallback profile resume URL is linked');

  // Test 2: Static Projects integrity
  assert(Array.isArray(staticProjects) && staticProjects.length >= 6, `Static projects count: ${staticProjects.length}`);
  const staticBrickBeam = staticProjects.find(p => p.slug === 'brickbeam' || p.id === 'brickbeam');
  assert(staticBrickBeam && staticBrickBeam.name === 'BrickBeam', 'Static BrickBeam project exists');

  // Test 3: Static Experience integrity
  assert(Array.isArray(staticWork) && staticWork.length >= 3, `Static work experience items: ${staticWork.length}`);
  assert(Array.isArray(staticEdu) && staticEdu.length >= 2, `Static education items: ${staticEdu.length}`);

  // Test 4: Static Services integrity
  assert(Array.isArray(staticServices) && staticServices.length >= 6, `Static services items: ${staticServices.length}`);

  // Test 5: Live Backend API Connection
  const API_URL = 'http://localhost:5000/api/portfolio/all';
  try {
    const res = await fetch(API_URL);
    assert(res.status === 200, `API ${API_URL} returns status 200 OK`);
    const json = await res.json();
    assert(json.success === true, 'API response success flag is true');
    assert(json.data && json.data.projects && json.data.projects.length >= 6, `Dynamic projects received: ${json.data?.projects?.length}`);
    
    // Check Flagship project in DB
    const dynamicProjects = json.data.projects;
    assert(dynamicProjects[0].slug === 'brickbeam', `Flagship project #01 is "${dynamicProjects[0].name}" (${dynamicProjects[0].slug})`);
    assert(dynamicProjects[0].isFeatured === true, 'Flagship project has isFeatured === true');

    // Check Skills
    assert(Array.isArray(json.data.skills) && json.data.skills.length >= 20, `Dynamic skills count: ${json.data?.skills?.length}`);

    // Check Experience
    assert(Array.isArray(json.data.experience?.work) && json.data.experience.work.length >= 3, `Dynamic work items: ${json.data.experience?.work?.length}`);
    assert(Array.isArray(json.data.experience?.education) && json.data.experience.education.length >= 2, `Dynamic education items: ${json.data.experience?.education?.length}`);

    // Check Services
    assert(Array.isArray(json.data.services) && json.data.services.length >= 6, `Dynamic services count: ${json.data?.services?.length}`);

    // Check Profile
    assert(json.data.profile?.full_name === 'Hassaan Ali Akbar', `Dynamic profile name from DB: "${json.data.profile?.full_name}"`);
  } catch (err) {
    assert(false, `Failed to query live API: ${err.message}`);
  }

  console.log(`\n================================================================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runTests();
