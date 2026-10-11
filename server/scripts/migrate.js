import { pool, ensureDatabase } from '../db.js';

export async function runMigrations() {
  console.log('[Migration] Starting MySQL 8 schema migration...');
  await ensureDatabase();

  const conn = await pool.getConnection();
  try {
    // 1. Admins Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(150) NOT NULL DEFAULT 'Hassaan Ali Akbar',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at DATETIME NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Profile Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS profile (
        id VARCHAR(36) PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL DEFAULT 'Hassaan Ali Akbar',
        title VARCHAR(150) NOT NULL DEFAULT 'Full-Stack Developer',
        tagline TEXT NULL,
        bio TEXT NOT NULL,
        location VARCHAR(100) DEFAULT 'Lahore, Pakistan',
        email VARCHAR(255) DEFAULT 'hassaanalee07@gmail.com',
        phone VARCHAR(50) DEFAULT '+92-313-456-3723',
        status_text VARCHAR(100) DEFAULT 'Open for Opportunities',
        status_badge VARCHAR(50) DEFAULT 'Full-Time',
        github_url VARCHAR(255) DEFAULT 'https://github.com/hassaanrana07',
        linkedin_url VARCHAR(255) DEFAULT 'https://linkedin.com/in/hassaanaliakbar',
        instagram_url VARCHAR(255) DEFAULT 'https://www.instagram.com/hassaanaleerana/',
        resume_url VARCHAR(255) DEFAULT '/Hassaan Ali Akbar Resume.pdf',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure columns exist if table was previously created
    const [profCols] = await conn.query(`SHOW COLUMNS FROM profile;`);
    const profColNames = profCols.map((c) => c.Field);
    if (!profColNames.includes('status_text')) {
      await conn.query(`ALTER TABLE profile ADD COLUMN status_text VARCHAR(100) DEFAULT 'Open for Opportunities';`);
    }
    if (!profColNames.includes('status_badge')) {
      await conn.query(`ALTER TABLE profile ADD COLUMN status_badge VARCHAR(50) DEFAULT 'Full-Time';`);
    }
    if (!profColNames.includes('instagram_url')) {
      await conn.query(`ALTER TABLE profile ADD COLUMN instagram_url VARCHAR(255) DEFAULT 'https://www.instagram.com/hassaanaleerana/';`);
    }

    // 3. Projects Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(36) PRIMARY KEY,
        slug VARCHAR(100) NOT NULL UNIQUE,
        number VARCHAR(10) NOT NULL,
        name VARCHAR(150) NOT NULL,
        subtitle VARCHAR(255) NULL,
        category VARCHAR(100) NOT NULL,
        project_type VARCHAR(100) NOT NULL,
        role VARCHAR(100) DEFAULT 'Developer',
        accent_color VARCHAR(20) DEFAULT '#FF9A3D',
        is_featured BOOLEAN DEFAULT FALSE,
        is_published BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INT NOT NULL DEFAULT 0,
        image_url VARCHAR(500) NULL,
        description TEXT NOT NULL,
        technologies JSON NOT NULL,
        github_url VARCHAR(500) NULL,
        live_url VARCHAR(500) NULL,
        preview_type VARCHAR(50) DEFAULT '',
        case_study JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_projects_sort (sort_order),
        INDEX idx_projects_slug (slug),
        INDEX idx_projects_pub (is_published)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure columns exist on projects table
    const [projCols] = await conn.query(`SHOW COLUMNS FROM projects;`);
    const projColNames = projCols.map((c) => c.Field);
    if (!projColNames.includes('is_published')) {
      await conn.query(`ALTER TABLE projects ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT TRUE;`);
      console.log('[Migration] Added is_published column to projects table.');
    }

    // 4. Skills Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id VARCHAR(36) PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        color_hex VARCHAR(20) DEFAULT '#FF9A3D',
        description TEXT NULL,
        logo_url VARCHAR(500) NULL,
        orbit_radius DECIMAL(4,1) DEFAULT 5.4,
        orbit_speed DECIMAL(6,4) DEFAULT 0.0050,
        sort_order INT DEFAULT 0,
        INDEX idx_skills_cat (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Experience Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS experience (
        id VARCHAR(36) PRIMARY KEY,
        type ENUM('work', 'education') NOT NULL,
        period VARCHAR(100) NOT NULL,
        role VARCHAR(150) NOT NULL,
        organization VARCHAR(150) NOT NULL,
        location VARCHAR(100) NULL,
        description TEXT NOT NULL,
        tags JSON NOT NULL,
        color_theme VARCHAR(20) DEFAULT 'cyan',
        sort_order INT DEFAULT 0,
        INDEX idx_exp_type (type, sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Services Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        short_desc TEXT NOT NULL,
        full_desc TEXT NULL,
        icon_name VARCHAR(50) DEFAULT 'code',
        sort_order INT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Contact Messages Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        ip_address VARCHAR(45) NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_msg_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('[Migration] All 7 MySQL 8 tables created/verified successfully.');
  } finally {
    conn.release();
  }
}

// Execute directly if run via CLI
if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Migration Error]', err);
      process.exit(1);
    });
}
