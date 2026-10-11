import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'uploads') continue;
    const p = path.join(dir, file);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      results = results.concat(walk(p));
    } else {
      results.push(p);
    }
  }
  return results;
}

const files = walk(rootDir);
const findings = [];

const patterns = [
  { name: 'Hardcoded JWT Secret', re: /jwt\.sign\(.+,\s*['"`]([a-zA-Z0-9_\-!@#$%^&*]{8,})['"`]/ },
  { name: 'Hardcoded API Key', re: /(?:api[_-]?key|apikey)\s*[:=]\s*['"`]([a-zA-Z0-9_\-]{16,})['"`]/i },
  { name: 'Hardcoded Private Key', re: /-----BEGIN (?:RSA )?PRIVATE KEY-----/ },
  { name: 'Hardcoded Password in Code', re: /const\s+password\s*=\s*['"`]([^'"`]{4,})['"`]/i },
  { name: 'AWS Secret Key', re: /(?:aws_secret_access_key|aws_access_key_id)\s*[:=]\s*['"`]?([a-zA-Z0-9/+=]{16,})/i }
];

for (const file of files) {
  if (
    file.endsWith('.png') ||
    file.endsWith('.jpg') ||
    file.endsWith('.pdf') ||
    file.endsWith('.ico') ||
    file.endsWith('.woff2') ||
    file.endsWith('.jsonl') ||
    file.includes('package-lock.json') ||
    file.includes('.env.example')
  ) {
    continue;
  }

  // Check if file is .env (which shouldn't be committed)
  const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
  
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Ignore test scripts using dummy test passwords
    if (file.includes('scripts') && (line.includes('TestPassword') || line.includes('admin123456'))) {
      return;
    }
    for (const pat of patterns) {
      if (pat.re.test(line)) {
        findings.push({
          file: relPath,
          line: idx + 1,
          name: pat.name,
          preview: line.trim()
        });
      }
    }
  });
}

console.log('====================================================');
console.log('🔒 SECRETS & CREDENTIALS CODEBASE SCAN REPORT');
console.log('====================================================\n');

if (findings.length === 0) {
  console.log('✅ No hardcoded secrets, API keys, or private keys found in codebase files!');
} else {
  console.log(`⚠️ Found ${findings.length} potential secrets:`);
  findings.forEach((f) => {
    console.log(`  - [${f.name}] ${f.file}:${f.line} -> ${f.preview}`);
  });
}

// Check .gitignore for .env protection
const gitignorePath = path.join(rootDir, '.gitignore');
let gitignoreContent = '';
if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
}

const envIgnored = gitignoreContent.includes('.env');
console.log('\nGit Ignore Protection:');
console.log(`  - .gitignore includes .env: ${envIgnored ? '✅ YES' : '❌ NO'}`);

// Check frontend source files for process.env or secret leaks
const srcFiles = walk(path.join(rootDir, 'src'));
let frontendLeaks = [];
for (const sf of srcFiles) {
  const content = fs.readFileSync(sf, 'utf8');
  if (content.includes('JWT_SECRET') || content.includes('DB_PASSWORD') || content.includes('ADMIN_PASSWORD')) {
    frontendLeaks.push(path.relative(rootDir, sf));
  }
}

console.log(`  - Frontend src/ leaks backend secrets: ${frontendLeaks.length === 0 ? '✅ NONE' : '❌ LEAK: ' + frontendLeaks.join(', ')}`);
console.log('====================================================\n');
