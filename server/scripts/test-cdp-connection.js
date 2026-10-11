import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const tempProfileDir = path.join(os.tmpdir(), `chrome_test_${Date.now()}`);
fs.mkdirSync(tempProfileDir, { recursive: true });

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const chromeProcess = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  `--user-data-dir=${tempProfileDir}`,
  '--disable-gpu',
  '--no-sandbox',
  '--disable-extensions',
  '--disable-background-networking',
  'http://localhost:3000'
], { stdio: 'ignore' });

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function testConnection() {
  console.log('Testing Chrome CDP connection on port 9222...');
  for (let i = 0; i < 15; i++) {
    await sleep(500);
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        const json = await res.json();
        console.log('[SUCCESS] Connected to Chrome CDP:', json.Browser);
        console.log('WebSocket URL:', json.webSocketDebuggerUrl);

        // Fetch targets/pages
        const targetsRes = await fetch('http://127.0.0.1:9222/json/list');
        const targets = await targetsRes.json();
        console.log('Open Targets:', targets.map(t => ({ title: t.title, url: t.url })));

        chromeProcess.kill();
        fs.rmSync(tempProfileDir, { recursive: true, force: true });
        return;
      }
    } catch (err) {
      // retry
    }
  }
  console.error('Failed to connect to Chrome CDP');
  chromeProcess.kill();
}

testConnection();
