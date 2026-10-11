import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Enterprise Rate Limiting Architecture
 * Week 12 Dynamic Portfolio - Hassaan Ali Akbar
 * 
 * Configurable tiered rate limiters:
 * 1. Public Endpoints: Moderate limits (default: 300 req / 15 min)
 * 2. Contact Inquiries: Moderate-strict limits (default: 15 req / 60 min)
 * 3. Authenticated Admin Actions: Loose limits (default: 1000 req / 15 min)
 * 4. Authentication Endpoints: Combined Per-IP and Per-Account exponential backoff.
 */

// Configurable thresholds with environment variable overrides
export const RATE_CONFIG = {
  PUBLIC_WINDOW_MS: parseInt(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS || '900000', 10), // 15 min
  PUBLIC_MAX: parseInt(process.env.RATE_LIMIT_PUBLIC_MAX || '300', 10),

  CONTACT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_CONTACT_WINDOW_MS || '3600000', 10), // 60 min
  CONTACT_MAX: parseInt(process.env.RATE_LIMIT_CONTACT_MAX || '15', 10),

  ADMIN_WINDOW_MS: parseInt(process.env.RATE_LIMIT_ADMIN_WINDOW_MS || '900000', 10), // 15 min
  ADMIN_MAX: parseInt(process.env.RATE_LIMIT_ADMIN_MAX || '1000', 10),

  AUTH_WINDOW_MS: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '900000', 10), // 15 min
  AUTH_MAX_IP: parseInt(process.env.RATE_LIMIT_AUTH_MAX_IP || '20', 10),
  AUTH_MAX_ACCOUNT: parseInt(process.env.RATE_LIMIT_AUTH_MAX_ACCOUNT || '5', 10),
};

// 1. Moderate Public Endpoints Limiter
export const publicLimiter = rateLimit({
  windowMs: RATE_CONFIG.PUBLIC_WINDOW_MS,
  max: RATE_CONFIG.PUBLIC_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests to public endpoints. Please slow down and try again later.'
  }
});

// 2. Contact Inquiries Limiter (prevents spam abuse)
export const contactLimiter = rateLimit({
  windowMs: RATE_CONFIG.CONTACT_WINDOW_MS,
  max: RATE_CONFIG.CONTACT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact submissions from your network. Please try again later.'
  }
});

// 3. Authenticated Admin Actions Limiter (Loose limits)
export const adminLimiter = rateLimit({
  windowMs: RATE_CONFIG.ADMIN_WINDOW_MS,
  max: RATE_CONFIG.ADMIN_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Administrative request threshold exceeded. Please try again later.'
  }
});

// ==================== AUTHENTICATION EXPONENTIAL BACKOFF ====================

// In-memory tracking stores for IP and Account
const ipAttempts = new Map();     // ip -> { count: number, cooldownUntil: number, lastAttempt: number }
const accountAttempts = new Map(); // email -> { count: number, cooldownUntil: number, lastAttempt: number }

// Cleanup expired entries periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of ipAttempts.entries()) {
    if (val.cooldownUntil < now && now - val.lastAttempt > RATE_CONFIG.AUTH_WINDOW_MS) {
      ipAttempts.delete(key);
    }
  }
  for (const [key, val] of accountAttempts.entries()) {
    if (val.cooldownUntil < now && now - val.lastAttempt > RATE_CONFIG.AUTH_WINDOW_MS) {
      accountAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

/**
 * Calculate exponential backoff duration in seconds based on consecutive failures
 */
function getBackoffSeconds(failures) {
  if (failures <= 3) return 0;       // 1-3 failures: no cooldown
  if (failures === 4) return 15;     // 4 failures: 15s
  if (failures === 5) return 30;     // 5 failures: 30s
  if (failures === 6) return 60;     // 6 failures: 1m
  if (failures === 7) return 300;    // 7 failures: 5m
  return 900;                        // 8+ failures: 15m
}

/**
 * Record a failed authentication attempt for both IP and Account
 */
export function recordAuthFailure(ip, rawEmail) {
  const now = Date.now();

  // Track IP
  if (ip) {
    const ipData = ipAttempts.get(ip) || { count: 0, cooldownUntil: 0, lastAttempt: 0 };
    ipData.count += 1;
    ipData.lastAttempt = now;
    const backoffSec = getBackoffSeconds(ipData.count);
    if (backoffSec > 0) {
      ipData.cooldownUntil = now + (backoffSec * 1000);
    }
    ipAttempts.set(ip, ipData);
  }

  // Track Account
  if (rawEmail && typeof rawEmail === 'string') {
    const emailKey = rawEmail.trim().toLowerCase();
    const acctData = accountAttempts.get(emailKey) || { count: 0, cooldownUntil: 0, lastAttempt: 0 };
    acctData.count += 1;
    acctData.lastAttempt = now;
    const backoffSec = getBackoffSeconds(acctData.count);
    if (backoffSec > 0) {
      acctData.cooldownUntil = now + (backoffSec * 1000);
    }
    accountAttempts.set(emailKey, acctData);
  }
}

/**
 * Record a successful authentication attempt (clears backoff immediately)
 */
export function recordAuthSuccess(ip, rawEmail) {
  if (ip) {
    ipAttempts.delete(ip);
  }
  if (rawEmail && typeof rawEmail === 'string') {
    accountAttempts.delete(rawEmail.trim().toLowerCase());
  }
}

/**
 * Reset authentication limits for an IP and/or email (e.g. for testing)
 */
export function resetAuthLimits(ip, rawEmail) {
  if (ip) {
    ipAttempts.delete(ip);
  }
  if (rawEmail && typeof rawEmail === 'string') {
    accountAttempts.delete(rawEmail.trim().toLowerCase());
  }
}

/**
 * Authentication Middleware: Enforces Per-IP and Per-Account exponential backoff
 */
export function authExponentialBackoff(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const email = (req.body?.email || req.body?.currentEmail || '').trim().toLowerCase();

  // 1. Check IP cooldown
  if (ip && ipAttempts.has(ip)) {
    const ipData = ipAttempts.get(ip);
    if (ipData.cooldownUntil > now) {
      const remainingSec = Math.ceil((ipData.cooldownUntil - now) / 1000);
      res.setHeader('Retry-After', remainingSec);
      return res.status(429).json({
        success: false,
        message: `Too many login attempts from your network. Please wait ${remainingSec} seconds before trying again.`,
        retryAfter: remainingSec,
        backoffType: 'ip'
      });
    }
  }

  // 2. Check Account cooldown
  if (email && accountAttempts.has(email)) {
    const acctData = accountAttempts.get(email);
    if (acctData.cooldownUntil > now) {
      const remainingSec = Math.ceil((acctData.cooldownUntil - now) / 1000);
      res.setHeader('Retry-After', remainingSec);
      return res.status(429).json({
        success: false,
        message: `Too many failed login attempts for this account. Please wait ${remainingSec} seconds before trying again.`,
        retryAfter: remainingSec,
        backoffType: 'account'
      });
    }
  }

  next();
}
