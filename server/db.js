import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create initial pool
export const pool = mysql.createPool(dbConfig);

// Helper to ensure portfolio_db database exists
export async function ensureDatabase() {
  const rootConn = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password
  });

  try {
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`[MySQL 8] Database '${dbConfig.database}' verified/created.`);
  } finally {
    await rootConn.end();
  }
}

// Helper to test pool connection
export async function testConnection() {
  try {
    await ensureDatabase();
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT VERSION() AS version, CURRENT_TIMESTAMP AS server_time;');
    conn.release();
    console.log(`[MySQL 8] Connected successfully to MySQL ${rows[0].version} at ${rows[0].server_time}`);
    return { success: true, version: rows[0].version, server_time: rows[0].server_time };
  } catch (err) {
    console.error('[MySQL 8] Database connection failed:', err.message);
    throw err;
  }
}

export default pool;
