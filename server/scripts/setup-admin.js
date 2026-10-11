import readline from 'readline';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { pool, ensureDatabase } from '../db.js';

function askQuestion(query, hidden = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    if (!hidden) {
      rl.question(query, (ans) => {
        rl.close();
        resolve(ans.trim());
      });
    } else {
      process.stdout.write(query);
      const stdin = process.stdin;
      const oldRaw = stdin.isRaw;
      if (stdin.setRawMode) stdin.setRawMode(true);
      stdin.resume();
      let pass = '';

      const onData = (ch) => {
        const c = ch.toString('utf8');
        if (c === '\n' || c === '\r' || c === '\u0004') {
          stdin.removeListener('data', onData);
          if (stdin.setRawMode) stdin.setRawMode(oldRaw);
          stdin.pause();
          rl.close();
          process.stdout.write('\n');
          resolve(pass.trim());
        } else if (c === '\u0003') {
          // Ctrl+C
          process.exit(1);
        } else if (c === '\u007F' || c === '\b') {
          // Backspace
          if (pass.length > 0) {
            pass = pass.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          pass += c;
          process.stdout.write('*');
        }
      };

      stdin.on('data', onData);
    }
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) parsed.email = args[++i];
    if (args[i] === '--password' && args[i + 1]) parsed.password = args[++i];
    if (args[i] === '--name' && args[i + 1]) parsed.name = args[++i];
    if (args[i] === '--force') parsed.force = true;
  }
  return parsed;
}

export async function setupAdminCLI() {
  console.log('================================================================');
  console.log('       HASSAAN ALI AKBAR - SECURE ADMINISTRATOR SETUP CLI       ');
  console.log('================================================================\n');

  await ensureDatabase();
  const conn = await pool.getConnection();

  try {
    const [existing] = await conn.query('SELECT id, email, name, created_at FROM admins;');
    const cliArgs = parseArgs();

    let email = cliArgs.email;
    let password = cliArgs.password;
    let name = cliArgs.name;

    if (existing.length > 0 && !cliArgs.force) {
      console.log(`[INFO] An administrator account already exists:`);
      console.log(`  - Name:  ${existing[0].name}`);
      console.log(`  - Email: ${existing[0].email}`);
      console.log(`  - Registered: ${existing[0].created_at}\n`);

      const proceed = await askQuestion('Do you want to update/reset the administrator password? (y/N): ');
      if (!proceed.toLowerCase().startsWith('y')) {
        console.log('\n[ABORTED] No changes were made to existing administrator account.');
        return;
      }
    }

    // Prompt for Name if missing
    if (!name) {
      name = await askQuestion(`Enter Administrator Full Name (default: ${existing[0]?.name || 'Hassaan Ali Akbar'}): `);
      if (!name) name = existing[0]?.name || 'Hassaan Ali Akbar';
    }

    // Prompt for Email if missing
    if (!email) {
      email = await askQuestion(`Enter Administrator Email (default: ${existing[0]?.email || 'hassaanalee07@gmail.com'}): `);
      if (!email) email = existing[0]?.email || 'hassaanalee07@gmail.com';
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      console.error('\n[ERROR] Invalid email address format. Setup aborted.');
      process.exit(1);
    }

    // Prompt for Password if missing
    if (!password) {
      password = await askQuestion('Enter New Administrator Password (min 8 characters): ', true);
      const confirmPassword = await askQuestion('Confirm New Administrator Password: ', true);

      if (password !== confirmPassword) {
        console.error('\n[ERROR] Passwords do not match. Setup aborted.');
        process.exit(1);
      }
    }

    if (password.length < 8) {
      console.error('\n[ERROR] Password must be at least 8 characters long for security. Setup aborted.');
      process.exit(1);
    }

    console.log('\n[PROCESSING] Hashing password securely with bcrypt (cost factor 12)...');
    const passwordHash = await bcrypt.hash(password, 12);

    if (existing.length > 0) {
      await conn.query(
        'UPDATE admins SET email = ?, password_hash = ?, name = ? WHERE id = ?;',
        [trimmedEmail, passwordHash, name, existing[0].id]
      );
      console.log('\n[SUCCESS] Administrator account updated successfully in MySQL!');
    } else {
      const id = crypto.randomUUID();
      await conn.query(
        'INSERT INTO admins (id, email, password_hash, name, last_login_at) VALUES (?, ?, ?, ?, NOW());',
        [id, trimmedEmail, passwordHash, name]
      );
      console.log('\n[SUCCESS] First administrator account created successfully in MySQL!');
    }

    console.log(`\nAdministrator Details:`);
    console.log(`  - Name:  ${name}`);
    console.log(`  - Email: ${trimmedEmail}`);
    console.log(`  - Password Hash: ${passwordHash.substring(0, 15)}... (Bcrypt Cost 12 verified)`);
    console.log(`\nYou can now log in at http://localhost:3000/#admin\n`);
  } catch (err) {
    console.error('\n[ERROR] Failed to configure administrator account:', err.message);
    throw err;
  } finally {
    conn.release();
  }
}

if (process.argv[1] && process.argv[1].endsWith('setup-admin.js')) {
  setupAdminCLI()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
