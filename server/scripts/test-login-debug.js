import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
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

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : null;
  }

  async close() {
    if (this.ws) this.ws.close();
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function debugLogin() {
  const tempDir = path.join(os.tmpdir(), `chrome_debug_${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tempDir}`,
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:3000/#admin'
  ], { stdio: 'ignore' });

  await sleep(2000);
  const targets = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const page = targets.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
  const cdp = new CDPClient(page.webSocketDebuggerUrl);
  await cdp.connect();

  await sleep(1500);
  console.log('Page loaded, evaluating login inputs...');

  const inputCheck = await cdp.evaluate(`
    (function() {
      const email = document.getElementById('admin-email');
      const pass = document.getElementById('admin-password');
      const btn = document.querySelector('button[type="submit"]');
      return { hasEmail: Boolean(email), hasPass: Boolean(pass), hasBtn: Boolean(btn) };
    })()
  `);
  console.log('Input check:', inputCheck);

  const fillResult = await cdp.evaluate(`
    (async function() {
      const email = document.getElementById('admin-email');
      const pass = document.getElementById('admin-password');
      const btn = document.querySelector('button[type="submit"]');

      const setVal = (elem, val) => {
        const proto = elem instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
        const set = Object.getOwnPropertyDescriptor(proto, 'value').set;
        set.call(elem, val);
        elem.dispatchEvent(new Event('input', { bubbles: true }));
        elem.dispatchEvent(new Event('change', { bubbles: true }));
      };

      setVal(email, 'admin@hassaan.dev');
      setVal(pass, 'admin123456');

      btn.click();
      return { emailVal: email.value, passVal: pass.value };
    })()
  `);
  console.log('Fill result:', fillResult);

  await sleep(2500);

  const afterSubmit = await cdp.evaluate(`
    (function() {
      return {
        text: document.body.innerText.substring(0, 300),
        hasDashboard: document.body.innerText.includes('Portfolio CMS'),
        hasOverview: document.body.innerText.includes('Overview'),
        hasError: document.querySelector('.text-rose-400') ? document.querySelector('.text-rose-400').innerText : null
      };
    })()
  `);
  console.log('After submit status:', afterSubmit);

  await cdp.close();
  proc.kill();
  await sleep(500);
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
}

debugLogin();
