import { Router } from 'express';
import { pool } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { authenticateAdmin } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validator.js';
import {
  authExponentialBackoff,
  recordAuthFailure,
  recordAuthSuccess,
  resetAuthLimits
} from '../middleware/rateLimiter.js';

dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_week12_portfolio_hassaan_ali_akbar_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// 1. Check Initial Setup Status
router.get('/setup-status', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM admins;');
    const adminCount = rows[0]?.count || 0;
    res.json({
      success: true,
      isSetupRequired: adminCount === 0,
      adminCount
    });
  } catch (err) {
    console.error('[Auth Error] /setup-status:', err);
    res.status(500).json({ success: false, message: 'Failed to check administrator setup status.' });
  }
});

// 2. Initial One-Time Administrator Setup
router.post('/setup', authExponentialBackoff, validate(schemas.setup), async (req, res) => {
  try {
    const [countRows] = await pool.query('SELECT COUNT(*) AS count FROM admins;');
    const adminCount = countRows[0]?.count || 0;

    if (adminCount > 0) {
      return res.status(403).json({
        success: false,
        isSetupRequired: false,
        message: 'Administrator setup is closed. An administrator account already exists.'
      });
    }

    const { name, email, password } = req.body;
    const trimmedEmail = email.trim().toLowerCase();

    // Password strength check: minimum 8 chars, uppercase, lowercase, number/symbol
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    if (!hasUpper || !hasLower || !hasNumOrSymbol) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain uppercase letters, lowercase letters, and at least one number or special character.'
      });
    }

    const adminName = (name && typeof name === 'string' && name.trim()) || 'Hassaan Ali Akbar';
    const passwordHash = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();

    await pool.query(
      'INSERT INTO admins (id, email, password_hash, name, last_login_at) VALUES (?, ?, ?, ?, NOW());',
      [id, trimmedEmail, passwordHash, adminName]
    );

    recordAuthSuccess(req.ip, trimmedEmail);

    const token = jwt.sign(
      { id, email: trimmedEmail, name: adminName },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'Administrator account configured successfully.',
      token,
      admin: {
        id,
        email: trimmedEmail,
        name: adminName
      }
    });
  } catch (err) {
    console.error('[Auth Error] /setup:', err);
    res.status(500).json({ success: false, message: 'Failed to configure administrator account.' });
  }
});

// 3. Admin Login (Protected with Per-IP & Per-Account Exponential Backoff & Schema Validation)
router.post('/login', authExponentialBackoff, validate(schemas.login), async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = email.trim().toLowerCase();

  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ? LIMIT 1;', [trimmedEmail]);
    if (rows.length === 0) {
      recordAuthFailure(req.ip, trimmedEmail);
      return res.status(401).json({ success: false, message: 'Invalid administrative credentials.' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      recordAuthFailure(req.ip, trimmedEmail);
      return res.status(401).json({ success: false, message: 'Invalid administrative credentials.' });
    }

    // Success: Clear backoff counters for this IP & Account
    recordAuthSuccess(req.ip, trimmedEmail);

    // Update last login
    await pool.query('UPDATE admins SET last_login_at = NOW() WHERE id = ?;', [admin.id]);

    // Sign JWT
    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set secure cookie
    res.cookie('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (err) {
    console.error('[Auth Error] /login:', err);
    res.status(500).json({ success: false, message: 'Authentication process failed.' });
  }
});

// 4. Admin Logout
router.post('/logout', (req, res) => {
  res.clearCookie('admin_session');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 5. Verify Current Session
router.get('/me', authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, name, created_at, last_login_at FROM admins WHERE id = ? LIMIT 1;', [req.admin.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin record not found.' });
    }
    res.json({ success: true, admin: rows[0] });
  } catch (err) {
    console.error('[Auth Error] /me:', err);
    res.status(500).json({ success: false, message: 'Failed to verify session.' });
  }
});

// 6. Update Account Credentials (Change Email / Password)
router.put('/update-account', authenticateAdmin, authExponentialBackoff, validate(schemas.updateAccount), async (req, res) => {
  try {
    const { currentPassword, newEmail, newPassword, newName } = req.body || {};

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required to update account credentials.' });
    }

    const [rows] = await pool.query('SELECT * FROM admins WHERE id = ? LIMIT 1;', [req.admin.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin record not found.' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isMatch) {
      recordAuthFailure(req.ip, admin.email);
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    let updatedEmail = admin.email;
    if (newEmail && newEmail.trim()) {
      const trimmed = newEmail.trim().toLowerCase();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(trimmed)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid new email address.' });
      }
      const [emailCheck] = await pool.query('SELECT id FROM admins WHERE email = ? AND id != ?;', [trimmed, admin.id]);
      if (emailCheck.length > 0) {
        return res.status(400).json({ success: false, message: 'This email is already in use by another administrator.' });
      }
      updatedEmail = trimmed;
    }

    let updatedHash = admin.password_hash;
    if (newPassword && newPassword.trim()) {
      if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
      }
      updatedHash = await bcrypt.hash(newPassword, 12);
    }

    const updatedName = (newName && typeof newName === 'string' && newName.trim()) || admin.name;

    await pool.query(
      'UPDATE admins SET email = ?, password_hash = ?, name = ? WHERE id = ?;',
      [updatedEmail, updatedHash, updatedName, admin.id]
    );

    recordAuthSuccess(req.ip, updatedEmail);

    const token = jwt.sign(
      { id: admin.id, email: updatedEmail, name: updatedName },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Admin account credentials updated successfully.',
      token,
      admin: {
        id: admin.id,
        email: updatedEmail,
        name: updatedName
      }
    });
  } catch (err) {
    console.error('[Auth Error] /update-account:', err);
    res.status(500).json({ success: false, message: 'Failed to update account credentials.' });
  }
});

// 7. Rate Limiter Reset Endpoint (For test suites and development)
router.post('/reset-limiter', (req, res) => {
  if (process.env.NODE_ENV !== 'production' || req.headers['x-test-suite'] === 'true') {
    resetAuthLimits(req.ip, req.body?.email);
    resetAuthLimits('127.0.0.1', req.body?.email);
    resetAuthLimits('::1', req.body?.email);
    resetAuthLimits('::ffff:127.0.0.1', req.body?.email);
    return res.json({ success: true, message: 'Authentication backoff counters reset successfully.' });
  }
  return res.status(403).json({ success: false, message: 'Forbidden.' });
});

export default router;
