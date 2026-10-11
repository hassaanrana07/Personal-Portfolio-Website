import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { testConnection } from './db.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import { publicLimiter, contactLimiter, adminLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// 0. Static Uploads Serving with Security Headers (Nosniff & Sandbox to prevent script execution)
app.use('/uploads', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsDir, {
  fallthrough: false,
  index: false,
  dotfiles: 'ignore'
}));

// 1. Enterprise Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", 'http://localhost:5000', 'http://localhost:3000', 'https://hassaanalirana.netlify.app']
    }
  }
}));

// 2. CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'https://hassaanalirana.netlify.app',
  CLIENT_URL
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow fallback for local development only
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Tiered Rate Limiting
app.use('/api/contact', contactLimiter);
app.use('/api/admin', adminLimiter);
app.use('/api', publicLimiter);

// 5. System Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    res.json({
      status: 'ok',
      service: 'Hassaan Ali Akbar Portfolio Backend API',
      database: 'MySQL 8.0',
      db_version: dbStatus.version,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (err) {
    console.error('[Health Check Error]', err);
    res.status(503).json({
      status: 'error',
      message: 'Service temporarily unavailable. Database connection could not be established.'
    });
  }
});

// 6. Mount Application Routes
app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// 7. Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' not found.` });
});

// 8. Global Error Handler (Zero Information Leakage: Never leak stack traces, internal paths or DB errors)
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    name: err.name,
    message: err.message,
    stack: err.stack
  });

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File size exceeds maximum allowed limit.' });
    }
    return res.status(400).json({ success: false, message: 'Upload error: ' + err.code });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON request payload format.' });
  }

  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ success: false, message: 'Cross-Origin Request blocked.' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.status === 400 ? (err.message || 'Bad request.') : 'An unexpected internal error occurred. Please try again later.'
  });
});

// 9. Start Server
async function startServer() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Portfolio Backend Service running on port ${PORT}`);
      console.log(`📡 Public API: http://localhost:${PORT}/api/portfolio/all`);
      console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database: MySQL 8.0 on port 3306 (portfolio_db)`);
      console.log(`🔒 Security: Rate Limiting & Content Validation Active`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to initialize server due to database connectivity error:', err);
    process.exit(1);
  }
}

startServer();
