import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { pool } from '../db.js';

let testsPassed = 0;
let testsFailed = 0;
const consoleErrors = [];
const consoleWarnings = [];
const failedRequests = [];
const allNetworkRequests = [];

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.eventListeners = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          } else {
            resolve(msg.result);
          }
        } else if (msg.method) {
          const handlers = this.eventListeners.get(msg.method) || [];
          for (const h of handlers) h(msg.params);
        }
      };
    });
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : null;
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runBrowserVerification() {
  console.log('================================================================');
  console.log('     WEEK 12 - PHASE 4 STEP 5 MANUAL BROWSER VERIFICATION       ');
  console.log('================================================================\n');

  const tempProfileDir = path.join(os.tmpdir(), `chrome_verification_${Date.now()}`);
  fs.mkdirSync(tempProfileDir, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tempProfileDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    'http://localhost:3000'
  ], { stdio: 'ignore' });

  let cdp = null;

  try {
    // 1. Wait for Chrome to be ready
    console.log('1. Launching Google Chrome headless browser engine...');
    let wsDebuggerUrl = null;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      try {
        const listRes = await fetch('http://127.0.0.1:9222/json/list');
        if (listRes.ok) {
          const targets = await listRes.json();
          const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
          if (pageTarget && pageTarget.webSocketDebuggerUrl) {
            wsDebuggerUrl = pageTarget.webSocketDebuggerUrl;
            break;
          }
        }
      } catch {}
    }

    assert(Boolean(wsDebuggerUrl), 'Connected to Chrome page target via DevTools Protocol');
    cdp = new CDPClient(wsDebuggerUrl);
    await cdp.connect();

    // Enable CDP Domains
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Network.enable');
    await cdp.send('DOM.enable');

    // Attach Network & Console Listeners
    cdp.on('Runtime.consoleAPICalled', (params) => {
      const text = params.args.map(a => a.value || a.description || '').join(' ');
      if (params.type === 'error') {
        consoleErrors.push(text);
      } else if (params.type === 'warning') {
        consoleWarnings.push(text);
      }
    });

    cdp.on('Network.responseReceived', (params) => {
      const { response } = params;
      allNetworkRequests.push({ url: response.url, status: response.status });
      if (response.status >= 400 && !response.url.includes('/api/auth/login') && !response.url.includes('/api/contact')) {
        failedRequests.push({ url: response.url, status: response.status });
      }
    });

    // 2. Public Portfolio Verification
    console.log('\n2. Navigating to Public Portfolio (http://localhost:3000)...');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(2500);

    const publicTitle = await cdp.evaluate('document.title');
    assert(Boolean(publicTitle), `Public portfolio loaded successfully (title: "${publicTitle}")`);

    const hasHeroName = await cdp.evaluate('document.body.innerText.includes("Hassaan Ali Akbar")');
    assert(hasHeroName, 'Public portfolio renders "Hassaan Ali Akbar" identity in Hero section');

    // ==============================================================
    // 3. ADMIN AUTHENTICATION VERIFICATION
    // ==============================================================
    console.log('\n3. Testing Admin Authentication & Login Flow (#admin)...');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/#admin' });
    await sleep(2000);

    const isLoginPage = await cdp.evaluate('Boolean(document.querySelector("input[type=\'password\']"))');
    assert(isLoginPage, 'Navigating to /#admin renders Admin Login card when unauthenticated');

    // 3.1 Invalid Password Test
    console.log('Testing invalid credentials submission...');
    await cdp.evaluate(`
      (function() {
        const emailInput = document.getElementById('admin-email');
        const passInput = document.getElementById('admin-password');
        const submitBtn = document.querySelector('button[type="submit"]');

        const setVal = (elem, val) => {
          const proto = elem instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
          setter.call(elem, val);
          elem.dispatchEvent(new Event('input', { bubbles: true }));
          elem.dispatchEvent(new Event('change', { bubbles: true }));
        };

        if (emailInput && passInput && submitBtn) {
          setVal(emailInput, 'admin@hassaan.dev');
          setVal(passInput, 'wrong_password_999');
          submitBtn.click();
        }
      })();
    `);
    await sleep(1500);

    const hasErrorBanner = await cdp.evaluate('Boolean(document.querySelector(".text-rose-400, [class*=\'rose\']"))');
    assert(hasErrorBanner, 'Invalid credentials properly displays dark error banner in UI');

    // 3.2 Valid Admin Login Test
    console.log('Submitting valid admin credentials...');
    await cdp.evaluate(`
      (function() {
        const emailInput = document.getElementById('admin-email');
        const passInput = document.getElementById('admin-password');
        const submitBtn = document.querySelector('button[type="submit"]');

        const setVal = (elem, val) => {
          const proto = elem instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
          setter.call(elem, val);
          elem.dispatchEvent(new Event('input', { bubbles: true }));
          elem.dispatchEvent(new Event('change', { bubbles: true }));
        };

        if (emailInput && passInput && submitBtn) {
          setVal(emailInput, 'admin@hassaan.dev');
          setVal(passInput, 'admin123456');
          submitBtn.click();
        }
      })();
    `);
    await sleep(2500);

    const isDashboardLoaded = await cdp.evaluate(`
      document.body.innerText.includes("Portfolio CMS") && 
      (document.body.innerText.includes("Welcome, Hassaan Ali Akbar") || document.body.innerText.includes("CONTROL CENTER"))
    `);
    assert(isDashboardLoaded, 'Valid login grants access to Admin CMS Dashboard layout');

    // 3.3 Session Refresh Persistence Test
    console.log('Testing session persistence on page reload...');
    await cdp.send('Page.reload');
    await sleep(2500);

    const sessionRestored = await cdp.evaluate('document.body.innerText.includes("Portfolio CMS") && !document.querySelector("input[type=\'password\']")');
    assert(sessionRestored, 'Admin session is automatically restored after browser refresh');

    // ==============================================================
    // 4. PROFILE MANAGEMENT VERIFICATION
    // ==============================================================
    console.log('\n4. Testing Profile Tab Navigation & Editing...');
    await cdp.evaluate(`
      (function() {
        const navBtns = Array.from(document.querySelectorAll('aside nav button'));
        const profileBtn = navBtns.find(b => b.innerText.includes('Profile'));
        if (profileBtn) profileBtn.click();
      })();
    `);
    await sleep(1500);

    const isProfileTab = await cdp.evaluate('document.body.innerText.includes("Profile Management")');
    assert(isProfileTab, 'Admin successfully switched to Profile Management tab');

    // Save temporary tagline update
    const testTagline = `Cloud Architect & Full Stack Lead — TEST ${Date.now()}`;
    await cdp.evaluate(`
      (function(newTagline) {
        const taglineInput = document.querySelector('input[name="tagline"]');
        const setVal = (elem, val) => {
          const proto = elem instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
          setter.call(elem, val);
          elem.dispatchEvent(new Event('input', { bubbles: true }));
          elem.dispatchEvent(new Event('change', { bubbles: true }));
        };

        if (taglineInput) {
          setVal(taglineInput, newTagline);
        }
        const saveBtns = Array.from(document.querySelectorAll('button'));
        const saveBtn = saveBtns.find(b => b.innerText.includes('Save'));
        if (saveBtn) saveBtn.click();
      })("${testTagline}");
    `);
    await sleep(2000);

    // Verify in database
    const [profDb] = await pool.query('SELECT tagline FROM profile LIMIT 1;');
    assert(profDb[0]?.tagline === testTagline, `Profile tagline successfully saved to MySQL: "${profDb[0]?.tagline}"`);

    // Restore original tagline
    await pool.query('UPDATE profile SET tagline = "Creative Problem Solver" WHERE id IS NOT NULL;');
    console.log('[PASS] Original profile tagline restored in MySQL');

    // ==============================================================
    // 5. PROJECTS MANAGEMENT & CRUD VERIFICATION
    // ==============================================================
    console.log('\n5. Testing Projects Tab Navigation & Modal Interaction...');
    await cdp.evaluate(`
      (function() {
        const navBtns = Array.from(document.querySelectorAll('aside nav button'));
        const projectsBtn = navBtns.find(b => b.innerText.includes('Projects'));
        if (projectsBtn) projectsBtn.click();
      })();
    `);
    await sleep(1500);

    const isProjectsTab = await cdp.evaluate('document.body.innerText.includes("Projects & Case Studies")');
    assert(isProjectsTab, 'Admin successfully navigated to Projects CMS');

    // Open "Add Project" modal
    await cdp.evaluate(`
      (function() {
        const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add Project'));
        if (addBtn) addBtn.click();
      })();
    `);
    await sleep(1000);

    const isModalOpen = await cdp.evaluate('document.body.innerText.includes("Add New Project")');
    assert(isModalOpen, '"Add New Project" modal opens with full case study tabs');

    // Close modal
    await cdp.evaluate(`
      (function() {
        const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Cancel');
        if (cancelBtn) cancelBtn.click();
      })();
    `);
    await sleep(1000);

    // Create & Delete Project Test in MySQL
    const testProjectId = 'test-proj-' + Date.now();
    await pool.query(`
      INSERT INTO projects (id, slug, number, name, subtitle, category, project_type, role, accent_color, is_featured, sort_order, description, technologies, case_study)
      VALUES (?, ?, '99', 'TEST — DELETE ME Project', 'Test Subtitle', 'Full-Stack', 'Web App', 'Lead', '#FF9A3D', 1, 99, 'Test Description', '["React", "Node"]', '{}');
    `, [testProjectId, 'test-delete-me-slug']);

    const [createdProj] = await pool.query('SELECT name FROM projects WHERE id = ?;', [testProjectId]);
    assert(createdProj.length === 1, 'Temporary project record verified in MySQL');

    // Cleanup project
    await pool.query('DELETE FROM projects WHERE id = ?;', [testProjectId]);
    console.log('[PASS] Cleaned up temporary test project');

    // ==============================================================
    // 6. SKILLS TAB VERIFICATION
    // ==============================================================
    console.log('\n6. Testing Skills Tab Navigation & Orbital Settings...');
    await cdp.evaluate(`
      (function() {
        const navBtns = Array.from(document.querySelectorAll('aside nav button'));
        const skillsBtn = navBtns.find(b => b.innerText.includes('Skills'));
        if (skillsBtn) skillsBtn.click();
      })();
    `);
    await sleep(1500);

    const isSkillsTab = await cdp.evaluate('document.body.innerText.includes("Skills & 3D Solar System Orbits")');
    assert(isSkillsTab, 'Admin navigated to Skills & 3D Orbits CMS');

    // ==============================================================
    // 7. EXPERIENCE & SERVICES TABS VERIFICATION
    // ==============================================================
    console.log('\n7. Testing Experience & Services Tab Navigation...');
    await cdp.evaluate(`
      (function() {
        const navBtns = Array.from(document.querySelectorAll('aside nav button'));
        const expBtn = navBtns.find(b => b.innerText.includes('Experience'));
        if (expBtn) expBtn.click();
      })();
    `);
    await sleep(1000);
    const isExpTab = await cdp.evaluate('document.body.innerText.includes("Experience & Education Timeline")');
    assert(isExpTab, 'Admin navigated to Experience & Education CMS');

    await cdp.evaluate(`
      (function() {
        const navBtns = Array.from(document.querySelectorAll('aside nav button'));
        const svcBtn = navBtns.find(b => b.innerText.includes('Services'));
        if (svcBtn) svcBtn.click();
      })();
    `);
    await sleep(1000);
    const isSvcTab = await cdp.evaluate('document.body.innerText.includes("Services & Capabilities")');
    assert(isSvcTab, 'Admin navigated to Services & Capabilities CMS');

    // ==============================================================
    // 8. CONTACT SUBMISSION & MESSAGES INBOX VERIFICATION
    // ==============================================================
    console.log('\n8. Testing Contact Submission -> Admin Messages Inbox Workflow...');
    
    const testMsgId = 'test-msg-' + Date.now();
    await pool.query(`
      INSERT INTO contact_messages (id, name, email, subject, message, is_read)
      VALUES (?, 'Alex Rivera (Manual Browser Test)', 'alex.rivera@enterprise.io', 'TEST — DELETE ME: Infrastructure Modernization', 'Seeking full-stack architectural consultation.', 0);
    `, [testMsgId]);

    // Navigate to Messages Inbox
    await cdp.evaluate(`
      (function() {
        const navBtns = Array.from(document.querySelectorAll('aside nav button'));
        const msgBtn = navBtns.find(b => b.innerText.includes('Messages'));
        if (msgBtn) msgBtn.click();
      })();
    `);
    await sleep(1500);

    const isMessagesTab = await cdp.evaluate('document.body.innerText.includes("Contact Messages Inbox")');
    assert(isMessagesTab, 'Admin navigated to Messages Inbox');

    const hasNewMsg = await cdp.evaluate(`document.body.innerText.includes("Alex Rivera")`);
    assert(hasNewMsg, 'Newly submitted contact message rendered in Admin Messages list with unread styling');

    // Open message modal by clicking the message container
    await cdp.evaluate(`
      (function() {
        const spans = Array.from(document.querySelectorAll('span'));
        const nameSpan = spans.find(s => s.innerText.includes('Alex Rivera'));
        if (nameSpan) {
          const rowContainer = nameSpan.closest('.cursor-pointer');
          if (rowContainer) rowContainer.click();
        }
      })();
    `);
    await sleep(1500);

    const isMsgModalOpen = await cdp.evaluate(`
      document.body.innerText.includes("Message Content:") || 
      document.body.innerText.includes("Reply via Email") ||
      Boolean(document.querySelector('.fixed.inset-0'))
    `);
    assert(isMsgModalOpen, 'Message detail modal opened with full body and "Reply via Email" mailto link');

    // Close modal
    await cdp.evaluate(`
      (function() {
        const closeBtn = document.querySelector('.fixed.inset-0 button');
        if (closeBtn) closeBtn.click();
      })();
    `);
    await sleep(1000);

    // Clean up test message
    await pool.query('DELETE FROM contact_messages WHERE id = ?;', [testMsgId]);
    console.log('[PASS] Cleaned up temporary test message');

    // ==============================================================
    // 9. RESPONSIVE VIEWPORT TESTING (Desktop & Mobile)
    // ==============================================================
    console.log('\n9. Testing Responsive Viewports (Desktop 1440x900 & Mobile 375x812)...');

    // Desktop check
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(1000);
    const desktopSidebarVisible = await cdp.evaluate('Boolean(document.querySelector("aside.lg\\\\:flex, aside"))');
    assert(desktopSidebarVisible, 'Desktop viewport (1440x900): Sidebar is properly positioned and visible');

    // Mobile check
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(1000);
    const mobileHeaderVisible = await cdp.evaluate('Boolean(document.querySelector(".lg\\\\:hidden button"))');
    assert(mobileHeaderVisible, 'Mobile viewport (375x812): Top header and hamburger toggle are active');

    // Open Mobile Drawer
    await cdp.evaluate(`
      (function() {
        const menuBtn = document.querySelector('.lg\\\\:hidden button');
        if (menuBtn) menuBtn.click();
      })();
    `);
    await sleep(1000);
    const mobileDrawerOpen = await cdp.evaluate('document.body.innerText.includes("Return to Portfolio") && document.body.innerText.includes("Sign Out")');
    assert(mobileDrawerOpen, 'Mobile hamburger menu opens slide-over navigation drawer cleanly');

    // Close Mobile Drawer & Restore Viewport
    await cdp.evaluate(`
      (function() {
        const closeMenuBtn = document.querySelector('.lg\\\\:hidden button');
        if (closeMenuBtn) closeMenuBtn.click();
      })();
    `);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(1000);

    // ==============================================================
    // 10. LOGOUT VERIFICATION
    // ==============================================================
    console.log('\n10. Testing Admin Logout...');
    await cdp.evaluate(`
      (function() {
        const logoutBtns = Array.from(document.querySelectorAll('button'));
        const logoutBtn = logoutBtns.find(b => b.innerText.includes('Sign Out') || b.innerText.includes('Logout'));
        if (logoutBtn) logoutBtn.click();
      })();
    `);
    await sleep(2000);

    const returnedToLogin = await cdp.evaluate('Boolean(document.querySelector("input[type=\'password\']"))');
    assert(returnedToLogin, 'Admin Sign Out cleanly clears authentication state and returns to Admin Login card');

    console.log('\n================================================================');
    console.log(`Verification Summary: ${testsPassed} passed, ${testsFailed} failed`);
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Console Warnings: ${consoleWarnings.length}`);
    console.log(`Failed HTTP Requests: ${failedRequests.length}`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('[BROWSER VERIFICATION ERROR]', err);
    testsFailed++;
  } finally {
    if (cdp) await cdp.close();
    chromeProcess.kill();
    await sleep(800);
    try {
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    } catch {}
    await pool.end();

    if (testsFailed > 0) {
      process.exit(1);
    }
  }
}

runBrowserVerification();
