import { spawn } from 'child_process';
import assert from 'assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'http://localhost:3000';
const DEBUG_PORT = 9225;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log('================================================================');
  console.log('  HERO SPACING + ANIMATED NAME + LOADING SCREEN FINAL QA TEST   ');
  console.log('================================================================\n');

  // Launch headless Chrome
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--no-sandbox',
    '--disable-gpu',
    TARGET_URL
  ]);

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await sleep(400);
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (res.ok) {
        const targetsRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
        const targets = await targetsRes.json();
        const pageTarget = targets.find(t => t.type === 'page');
        if (pageTarget && pageTarget.webSocketDebuggerUrl) {
          wsUrl = pageTarget.webSocketDebuggerUrl;
          break;
        }
      }
    } catch (e) {
      // Chrome starting up
    }
  }

  if (!wsUrl) {
    chromeProcess.kill();
    throw new Error('Could not connect to Chrome DevTools protocol.');
  }

  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const pendingRequests = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject } = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise((resolve) => ws.onopen = resolve);

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');
  await sendCommand('DOM.enable');

  let passedTests = 0;
  let totalTests = 0;

  function report(pass, desc) {
    totalTests++;
    if (pass) {
      passedTests++;
      console.log(`[PASS ✅] ${desc}`);
    } else {
      console.log(`[FAIL ❌] ${desc}`);
    }
  }

  // ==================== TEST 1: LOADING SCREEN COUNTER & DESIGN ====================
  console.log('\n--- 1. Testing Loading Screen Counter & Behavior on Page Refresh ---');

  await sendCommand('Page.navigate', { url: TARGET_URL });

  // Sample loading screen states during hydration
  const sampledValues = [];
  for (let i = 0; i < 25; i++) {
    await sleep(60);
    try {
      const sampleEval = await sendCommand('Runtime.evaluate', {
        expression: `(() => {
          const counterEl = document.querySelector('[data-testid="loading-percentage"]');
          if (!counterEl) return null;
          const text = counterEl.textContent.trim();
          const percent = text !== '' ? parseInt(text, 10) : null;
          const isNegative = (percent !== null && (percent < 0 || text.startsWith('-')));
          return { percent, isNegative };
        })()`,
        returnByValue: true
      });
      if (sampleEval.result?.value) {
        sampledValues.push(sampleEval.result.value);
      }
    } catch (e) {
      // Execution context reloading
    }
  }

  // Verify no negative percentage numbers were sampled
  const foundNegative = sampledValues.some(s => s.isNegative);
  report(!foundNegative, 'Never displayed negative numbers (-10, -9, -15) during loading');

  const validPercents = sampledValues.filter(s => s.percent !== null).map(s => s.percent);
  const allInRange = validPercents.length > 0 && validPercents.every(p => p >= 0 && p <= 100);
  report(allInRange, `All sampled counter values within [0%, 100%] (Sampled: ${validPercents.slice(0, 8).join('%, ')}%...)`);

  // Wait for loading screen to complete and transition out
  let homeVisible = false;
  let loadingExited = false;
  for (let i = 0; i < 35; i++) {
    await sleep(100);
    try {
      const completionEval = await sendCommand('Runtime.evaluate', {
        expression: `(() => {
          const homeSection = document.getElementById('home');
          const loadingOverlay = document.querySelector('[class*="z-[99999]"]');
          return {
            homeVisible: Boolean(homeSection),
            loadingExited: !loadingOverlay
          };
        })()`,
        returnByValue: true
      });
      if (completionEval.result?.value) {
        homeVisible = completionEval.result.value.homeVisible;
        loadingExited = completionEval.result.value.loadingExited;
        if (loadingExited && homeVisible) break;
      }
    } catch (e) {}
  }

  report(homeVisible, 'Portfolio content displayed cleanly after loading complete');
  report(loadingExited, 'Loading screen smoothly exited with zero residual overlay');

  // ==================== TEST 2: HERO RESPONSIVENESS & SHOULDER WIDTH ====================
  const viewports = [
    { name: 'Small Mobile', width: 320, height: 640, isMobile: true },
    { name: 'Standard Mobile (iPhone SE)', width: 375, height: 667, isMobile: true },
    { name: 'Modern Mobile (iPhone 14)', width: 390, height: 844, isMobile: true },
    { name: 'Large Mobile (iPhone Pro Max)', width: 430, height: 932, isMobile: true },
    { name: 'Tablet Portrait (iPad)', width: 768, height: 1024, isMobile: false },
    { name: 'Tablet Landscape / Small Laptop', width: 1024, height: 768, isMobile: false },
    { name: 'Standard Laptop (13-14 inch)', width: 1280, height: 800, isMobile: false },
    { name: 'Large Laptop / Desktop (FHD)', width: 1440, height: 900, isMobile: false },
    { name: 'Full HD Desktop Monitor', width: 1920, height: 1080, isMobile: false }
  ];

  for (const vp of viewports) {
    console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);

    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.width <= 768
    });

    await sleep(350);

    const evalResult = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const homeSection = document.getElementById('home');
        if (!homeSection) return { error: 'No #home section found' };

        const bodyText = homeSection.innerText || '';
        const hasHiIm = /hi,?\\s*i['’]?m/i.test(bodyText);

        const marqueeEl = homeSection.querySelector('.animate-marquee-left');
        const hasMarquee = Boolean(marqueeEl);
        const marqueeText = marqueeEl ? marqueeEl.innerText : '';
        const hasNameInMarquee = /hassaan/i.test(marqueeText);

        // Track container rect of animated name
        const trackContainer = marqueeEl ? marqueeEl.parentElement : null;
        const trackRect = trackContainer ? trackContainer.getBoundingClientRect() : null;
        const trackWidth = trackRect ? trackRect.width : 0;
        const trackCenterY = trackRect ? (trackRect.top + trackRect.height / 2) : 0;

        const imageEl = homeSection.querySelector('img[src*="hero-portrait-cutout"]');
        const imgRect = imageEl ? imageEl.getBoundingClientRect() : null;

        // Shoulder ratio: vertical center of marquee relative to image height
        const shoulderRatio = (imgRect && trackRect && imgRect.height > 0)
          ? ((trackCenterY - imgRect.top) / imgRect.height)
          : null;

        const titleEl = Array.from(homeSection.querySelectorAll('*')).find(el => (el.innerText || '').trim() === 'Full Stack Developer');
        const titleRect = titleEl ? titleEl.getBoundingClientRect() : null;

        // Vertical gap between bottom of portrait cutout and "Full Stack Developer" heading
        const verticalGap = (imgRect && titleRect) ? Math.round(titleRect.top - imgRect.bottom) : null;

        const scrollWidth = document.documentElement.scrollWidth;
        const windowWidth = window.innerWidth;
        const hasHorizontalOverflow = scrollWidth > windowWidth;

        return {
          hasHiIm,
          hasMarquee,
          hasNameInMarquee,
          trackWidth,
          trackCenterY,
          shoulderRatio,
          imgWidth: imgRect ? imgRect.width : 0,
          imgHeight: imgRect ? imgRect.height : 0,
          verticalGap,
          scrollWidth,
          windowWidth,
          hasHorizontalOverflow
        };
      })()`,
      returnByValue: true
    });

    const res = evalResult.result.value;
    if (res.error) {
      report(false, `Error: ${res.error}`);
      continue;
    }

    report(!res.hasHiIm, `"HI, I'M" is completely absent at ${vp.width}px`);
    report(res.hasMarquee && res.hasNameInMarquee, `Continuous animated name active at ${vp.width}px`);
    report(!res.hasHorizontalOverflow, `Zero horizontal scrolling (scrollWidth: ${res.scrollWidth}px <= ${res.windowWidth}px)`);

    if (vp.isMobile) {
      // Mobile: Animated name should cover shoulder width (between ~200px and ~350px, NOT full 100vw)
      const isShoulderWidth = res.trackWidth >= 200 && res.trackWidth <= 350;
      report(isShoulderWidth, `Animated name covers shoulder width (${Math.round(res.trackWidth)}px vs image ${Math.round(res.imgWidth)}px) at ${vp.width}px`);

      // Mobile: Vertical gap between image and "Full Stack Developer" heading should be compact
      const isCompactGap = res.verticalGap !== null && res.verticalGap < 50;
      report(isCompactGap, `Full Stack Developer heading is close to hero composition (gap: ${res.verticalGap}px) at ${vp.width}px`);
    } else {
      // Desktop & Tablet: Full width marquee is preserved at shoulder level
      report(res.trackWidth >= vp.width * 0.9, `Desktop full-bleed marquee preserved (${Math.round(res.trackWidth)}px) at ${vp.width}px`);

      // Shoulder level alignment: marquee center must be in upper-body/shoulder region (25% - 45% of image height)
      const isAtShoulderLevel = res.shoulderRatio !== null && res.shoulderRatio >= 0.20 && res.shoulderRatio <= 0.45;
      report(isAtShoulderLevel, `Animated name aligned at shoulder level (position: ${Math.round(res.shoulderRatio * 100)}% down image height) at ${vp.width}px`);
    }
  }

  // Cleanup
  ws.close();
  chromeProcess.kill();

  console.log('\n================================================================');
  console.log(`Final QA Test Results: ${passedTests} passed, ${totalTests - passedTests} failed`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
