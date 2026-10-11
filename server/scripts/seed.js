import { pool } from '../db.js';
import { runMigrations } from './migrate.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function seedDatabase() {
  await runMigrations();
  console.log('[Seed] Starting database population...');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Clear existing data
    await conn.query('DELETE FROM admins;');
    await conn.query('DELETE FROM profile;');
    await conn.query('DELETE FROM projects;');
    await conn.query('DELETE FROM skills;');
    await conn.query('DELETE FROM experience;');
    await conn.query('DELETE FROM services;');

    // 2. Seed Default Admin
    const adminPasswordHash = await bcrypt.hash('admin123456', 12);
    await conn.query(
      `INSERT INTO admins (id, email, password_hash, name) VALUES (?, ?, ?, ?)`,
      [crypto.randomUUID(), 'admin@hassaan.dev', adminPasswordHash, 'Hassaan Ali Akbar']
    );

    // 3. Seed Profile
    const fullBio = `I build scalable web applications and enterprise systems with a strong focus on clean architecture, maintainable backends and performant frontends. I specialise in Laravel for backend, React and Vue for frontend, and PostgreSQL for reliable data storage.

My work centres on dashboards, admin panels, authentication systems, and REST APIs for business-critical applications. I design systems to be secure, testable and scalable — implementing role-based access control, background jobs, and API integrations. I also use AI-assisted development tools to speed up iteration while keeping code quality and architecture decisions intentional.

Outside of development I enjoy photography as a creative hobby. While I value visual craft, my primary focus is delivering robust engineering solutions that drive business outcomes.`;

    await conn.query(
      `INSERT INTO profile (id, full_name, title, tagline, bio, location, email, phone, status_text, status_badge, github_url, linkedin_url, instagram_url, resume_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        'Hassaan Ali Akbar',
        'Full Stack Developer',
        'Creative Problem Solver',
        fullBio,
        'Lahore, Pakistan',
        'hassaanalee07@gmail.com',
        '+92-313-456-3723',
        'Open for Opportunities',
        'Full-Time',
        'https://github.com/hassaanrana07',
        'https://linkedin.com/in/hassaanaliakbar',
        'https://www.instagram.com/hassaanaleerana/',
        '/Hassaan Ali Akbar Resume.pdf'
      ]
    );

    // 4. Seed Projects (BrickBeam elevated to #01 Flagship)
    const projects = [
      {
        slug: 'brickbeam',
        number: '01',
        name: 'BrickBeam',
        subtitle: 'Construction Operations & Resource Management System',
        category: 'Full-Stack Web Application',
        project_type: 'Full-Stack Web Application',
        role: 'Lead Developer',
        accent_color: '#f59e0b',
        is_featured: true,
        sort_order: 1,
        image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
        description: 'BrickBeam is an enterprise construction operations management platform designed to centralize building projects, task tracking, site material allocation, contractor sign-offs, and budget performance into a unified system.',
        technologies: ['Laravel 12', 'React', 'MySQL 8.0', 'Redis', 'Tailwind CSS'],
        github_url: 'https://github.com/hassaanrana07/BrickBeam-Construction-Management-System-',
        live_url: null,
        preview_type: 'construction',
        case_study: {
          overview: 'BrickBeam centralizes civil project site management, resource allocation, and contractor phase completions for construction enterprises.',
          problem: 'Paper-based site logs, manual material estimates, and fragmented contractor spreadsheets lead to budget overruns, inventory theft, and delayed milestone sign-offs.',
          solution: 'Engineered a structured relational workflow engine in Laravel 12 and React tracking building phases from Planning to Finishing, backed by automated material cost estimation algorithms.',
          features: [
            { title: 'Phase-based Construction Pipeline', desc: 'Tracking building milestones across 4 distinct phases (Planning, Foundation, Structure, Finishing).' },
            { title: 'Material Inventory Counter', desc: 'Real-time site stock allocation logs and usage variance counters.' },
            { title: 'Contractor Sign-off Workflows', desc: 'Automated project completion percentages and sign-off verification.' },
            { title: 'Multi-Department RBAC', desc: 'Role-based permissions for Engineers, Contractors, and Site Managers.' }
          ],
          architecture: {
            frontend: 'React SPA with Tailwind CSS, Inertia.js client routing, and custom progress gauges.',
            backend: 'Laravel 12 MVC Framework handling business rules, validation, and REST dispatches.',
            database: 'MySQL 8.0 with InnoDB engine enforcing foreign key constraints and transactional integrity.',
            authentication: 'Laravel Sanctum session security with HTTP-only cookie persistence.',
            apis: 'RESTful JSON API endpoints for resource management and phase completions.',
            deployment: 'Nginx reverse proxy on Ubuntu Linux with Automated Artisan migration pipelines.'
          },
          folderStructure: `BrickBeam/\n├── app/\n│   ├── Http/Controllers/\n│   │   ├── ProjectController.php\n│   │   ├── MaterialInventoryController.php\n│   │   └── PhaseCompletionController.php\n│   ├── Models/\n│   │   ├── Project.php\n│   │   ├── Material.php\n│   │   └── SiteResource.php\n│   └── Services/\n│       └── BudgetCalculatorService.php\n├── database/\n├── resources/js/`,
          modules: [
            { name: 'Project Pipeline Engine', desc: 'Manages building milestones across 4 distinct phases with completion calculations.' },
            { name: 'Material Procurement Ledger', desc: 'Tracks bulk material stock dispatches, site arrivals, and usage variances.' },
            { name: 'Contractor RBAC Service', desc: 'Enforces role-based permissions preventing unauthorized site sign-offs.' }
          ],
          dataModel: [
            { table: 'projects', details: 'id, name, client_id, total_budget, status, start_date, end_date' },
            { table: 'project_phases', details: 'id, project_id, phase_name, progress_percentage, signoff_by' },
            { table: 'materials', details: 'id, project_id, material_name, quantity_allocated, unit_cost' }
          ],
          auth: 'Laravel Sanctum RBAC governing 3 user levels: Administrator, Site Engineer, and Contractor.',
          decisions: [
            { title: 'Laravel 12 + React with Inertia.js', rationale: 'Eliminates duplicate API serialization code while preserving full single-page application fluidity.' }
          ],
          challenges: [
            { challenge: 'Concurrent material updates by site engineers caused inventory count mismatches.', solution: 'Applied pessimistic DB row locking (lockForUpdate()) during transaction commits.' }
          ],
          futureImprovements: [
            'BIM 3D CAD model viewer integration inside the project phase dashboard.',
            'Offline-first mobile PWA synchronization for remote construction sites.'
          ]
        }
      },
      {
        slug: 'rentbro',
        number: '02',
        name: 'RentBro',
        subtitle: 'Property & Rental Management System',
        category: 'Full-Stack Web Application',
        project_type: 'Full-Stack Web Application',
        role: 'Developer',
        accent_color: '#10b981',
        is_featured: false,
        sort_order: 2,
        image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
        description: 'RentBro is a centralized property and rental management platform engineered to streamline real estate inventory listings, tenant lease auditing, digital payment ledgers, and site maintenance tracking.',
        technologies: ['Laravel 12', 'React', 'MySQL 8.0', 'Tailwind CSS'],
        github_url: 'https://github.com/hassaanrana07/Rent-Bro-Property-and-Rental-Management-System',
        live_url: null,
        preview_type: 'realestate',
        case_study: {
          overview: 'RentBro simplifies property management by providing automated lease tracking, tenant communication portals, maintenance ticketing, and financial collection auditing for multi-unit real estate portfolios.',
          problem: 'Property managers managing multiple residential units struggle with manual lease expiry tracking, uncollected rent balances, and unorganized paper maintenance tickets.',
          solution: 'Developed an intuitive real estate portal in Laravel 12 and React with automated lease renewal dispatches, digital financial ledgers, and structured property catalog filters.',
          features: [
            { title: 'Property Inventory Catalog', desc: 'Catalog with pricing badges, location metadata, and unit availability tags.' },
            { title: 'Lease Auditing Engine', desc: 'Tenant lease tracking with automated payment and renewal notifications.' },
            { title: 'Maintenance Request Ticketing', desc: 'Ticketing portal connecting tenants directly with property managers.' },
            { title: 'Financial Ledger Audit Log', desc: 'Ledger tracking for rent collections and security deposits.' }
          ],
          architecture: {
            frontend: 'React SPA with Tailwind CSS and custom financial chart visualizers.',
            backend: 'Laravel 12 MVC handling lease calculations and notification queues.',
            database: 'MySQL relational schema with spatial indexing for property locations.',
            authentication: 'Session-based multi-guard authentication for Landlords and Tenants.',
            apis: 'REST APIs powering tenant dashboards and property search filters.',
            deployment: 'Cloud Linux VPS with Redis queue workers for email dispatches.'
          },
          folderStructure: `RentBro/\n├── app/\n│   ├── Http/Controllers/\n│   │   ├── PropertyController.php\n│   │   ├── LeaseController.php\n│   │   └── MaintenanceTicketController.php\n│   ├── Models/\n│   │   ├── Property.php\n│   │   ├── Tenant.php\n│   │   └── Lease.php\n│   └── Notifications/LeaseExpiryNotification.php\n└── resources/js/\n    ├── Pages/Properties/\n    └── Pages/Tenants/`,
          modules: [
            { name: 'Property Catalog Engine', desc: 'Manages active property listings, photos, amenities, and rental rates.' },
            { name: 'Lease Audit Ledger', desc: 'Calculates tenant payment balances, overdue fees, and lease end dates.' },
            { name: 'Maintenance Ticketing Gateway', desc: 'Routes tenant maintenance issues directly to assigned property managers.' }
          ],
          dataModel: [
            { table: 'properties', details: 'id, title, address, monthly_rent, status, unit_type' },
            { table: 'leases', details: 'id, property_id, tenant_id, start_date, end_date, rent_amount' },
            { table: 'payments', details: 'id, lease_id, amount_paid, payment_date, transaction_status' }
          ],
          auth: 'Multi-guard session authentication keeping tenant self-service portals isolated from administrative financial ledgers.',
          decisions: [
            { title: 'Relational Schema Design', rationale: 'Strict foreign key constraints ensure historical financial payments remain preserved even when tenant accounts deactivate.' }
          ],
          challenges: [
            { challenge: 'Slow property search response times across large property catalogs.', solution: 'Added compound database indexing on (status, city, monthly_rent).' }
          ],
          futureImprovements: [
            'Stripe & local payment gateway integration for direct tenant rent payments.',
            'Automated PDF lease agreement generation and digital signature support.'
          ]
        }
      },
      {
        slug: 'airsense',
        number: '03',
        name: 'AirSense',
        subtitle: 'Real-Time Environmental & Atmospheric Network',
        category: 'Data / IoT Monitoring Network',
        project_type: 'Data / IoT Monitoring Application',
        role: 'Developer',
        accent_color: '#06b6d4',
        is_featured: false,
        sort_order: 3,
        image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        description: 'AirSense is an environmental monitoring network built to process live atmospheric sensor telemetry, deliver geographical radar maps, track pollutant metrics (PM2.5/PM10), and issue automated threshold alerts.',
        technologies: ['React', 'Node.js', 'WebSockets', 'Chart.js', 'Tailwind CSS'],
        github_url: 'https://github.com/hassaanrana07/AirSense-Real-Time-Air-Quality-Monitoring---Alert-System',
        live_url: null,
        preview_type: 'airquality',
        case_study: {
          overview: 'AirSense monitors localized atmospheric pollution sensors to provide immediate air quality and meteorological safety data for urban regions.',
          problem: 'Legacy weather reporting services refresh at 60-minute intervals, missing sudden pollution spikes and micro-climate shifts.',
          solution: 'Constructed a live telemetry pipeline connecting sensor streams directly to a React monitoring dashboard with real-time AQI calculations and Chart.js trend graphs.',
          features: [
            { title: 'Live AQI Score Gauge', desc: 'Real-time atmospheric risk score gauges with color-coded alerts.' },
            { title: 'Geographical Sensor Radar', desc: 'Interactive radar map displaying active sensor node coordinates.' },
            { title: 'Automated Threshold Alerts', desc: 'Push notification dispatches triggered by PM2.5 / PM10 spikes.' },
            { title: 'Historical Trend Graphs', desc: 'Pollutant trend analysis powered by Chart.js canvas rendering.' }
          ],
          architecture: {
            frontend: 'React SPA with Chart.js canvas rendering and Tailwind CSS.',
            backend: 'Node.js WebSocket streaming server for sensor ingestion.',
            database: 'Time-series database schema for high-frequency telemetry logs.',
            authentication: 'API Key authorization for sensor hardware nodes.',
            apis: 'WebSocket event stream + REST endpoints for historical analytics.',
            deployment: 'Cloud Linux instance running Node.js telemetry services.'
          },
          folderStructure: `AirSense/\n├── client/\n│   ├── src/\n│   │   ├── components/AQIGauge.jsx\n│   │   ├── components/TelemetryChart.jsx\n│   │   └── services/weatherApi.js\n└── server/\n    └── telemetryServer.js`,
          modules: [
            { name: 'Telemetry Ingestor', desc: 'Receives raw sensor packets and calculates instantaneous Air Quality Indices.' },
            { name: 'Trend Visualizer', desc: 'Renders historical pollutant graphs with Chart.js canvas components.' }
          ],
          dataModel: [
            { table: 'sensor_telemetry', details: 'id, node_id, pm25, pm10, temp, humidity, timestamp' }
          ],
          auth: 'API key validation for incoming hardware sensor telemetry transmissions.',
          decisions: [
            { title: 'Chart Render Throttling', rationale: 'Throttling canvas redraws to 60fps prevents UI freezing during rapid sensor data bursts.' }
          ],
          challenges: [
            { challenge: 'High-frequency sensor updates caused React component re-render bottlenecks.', solution: 'Moved raw telemetry parsing to Web Workers and decoupled state commits.' }
          ],
          futureImprovements: [
            'Machine learning predictive weather and AQI forecast modeling.',
            'SMS and push notification integrations for emergency pollution alerts.'
          ]
        }
      },
      {
        slug: 'vyra',
        number: '04',
        name: 'Vyra',
        subtitle: 'Real-Time Social Network Platform',
        category: 'Real-Time Social Platform',
        project_type: 'Full-Stack Web Application',
        role: 'Developer',
        accent_color: '#a855f7',
        is_featured: false,
        sort_order: 4,
        image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80',
        description: 'Vyra is a full-stack social networking application engineered for low-latency real-time interactions, live direct messaging, story circles, user presence tracking, and instant feed updates using WebSockets.',
        technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.IO'],
        github_url: 'https://github.com/hassaanrana07/vyra-social-network',
        live_url: null,
        preview_type: 'social',
        case_study: {
          overview: 'Vyra is a high-throughput social networking application designed for low-latency engagement, WebSocket messaging, and live user interactions.',
          problem: 'Traditional social apps using periodic HTTP polling consume unnecessary server bandwidth and introduce multi-second latency for direct messages.',
          solution: 'Engineered an event-driven WebSocket architecture using Node.js and Socket.IO. Paired with React client state sync, enabling sub-second messaging and instant notifications.',
          features: [
            { title: 'Ephemeral Story Circles', desc: 'Story circles with automated 24-hour expiration lifecycle.' },
            { title: 'Interactive Social Feed', desc: 'Post creation, likes, comment threads, and media embedding.' },
            { title: 'WebSocket Direct Messaging', desc: 'Real-time low-latency direct message channels powered by Socket.IO.' },
            { title: 'User Presence Tracking', desc: 'Live user presence indicators and instant notification dispatches.' }
          ],
          architecture: {
            frontend: 'React with Tailwind CSS and Socket.IO client event listeners.',
            backend: 'Node.js & Express asynchronous server handling REST & WebSocket channels.',
            database: 'MongoDB document store with Mongoose ODM indexing.',
            authentication: 'JSON Web Tokens (JWT) stored in secure HTTP-only cookies.',
            apis: 'REST API routes for user management + WebSockets for real-time dispatches.',
            deployment: 'Node.js environment with PM2 process manager.'
          },
          folderStructure: `Vyra/\n├── client/\n│   ├── src/\n│   │   ├── components/Chat/\n│   │   ├── components/Feed/\n│   │   └── context/SocketContext.jsx\n└── server/\n    ├── controllers/\n    ├── socket/chatSocket.js\n    └── models/User.js`,
          modules: [
            { name: 'WebSocket Gateway', desc: 'Manages live client connection states, channel subscriptions, and presence.' },
            { name: 'Social Feed Engine', desc: 'Handles post creation, like toggles, comment threads, and media uploads.' },
            { name: 'JWT Auth Guard', desc: 'Secures REST routes and verifies socket handshake connection tokens.' }
          ],
          dataModel: [
            { table: 'users', details: 'id, username, email, avatar, online_status' },
            { table: 'posts', details: 'id, author_id, content, likes_count, comments_array' },
            { table: 'messages', details: 'id, sender_id, receiver_id, text, timestamp' }
          ],
          auth: 'JWT authentication with socket token verification on initial connection handshake.',
          decisions: [
            { title: 'WebSocket Event Architecture', rationale: 'Eliminates HTTP polling overhead, delivering instant messages and presence alerts.' }
          ],
          challenges: [
            { challenge: 'Socket disconnections caused missed message notifications during unstable network states.', solution: 'Implemented client-side event acknowledgment queues with server event sequence IDs.' }
          ],
          futureImprovements: [
            'WebRTC audio and video calling support.',
            'End-to-end encryption (E2EE) for private direct message channels.'
          ]
        }
      },
      {
        slug: 'projectflow',
        number: '05',
        name: 'ProjectFlow',
        subtitle: 'Project & Task Management Platform',
        category: 'Project Management Platform',
        project_type: 'Full-Stack Web Application',
        role: 'Developer',
        accent_color: '#6366f1',
        is_featured: false,
        sort_order: 5,
        image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        description: 'ProjectFlow optimizes team task execution by offering a clean, distraction-free productivity dashboard focused on project velocities, milestone progress bars, and status badges in a Linear-inspired workflow.',
        technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS'],
        github_url: 'https://github.com/hassaanrana07/ProjectFlow-Project-Management-System',
        live_url: null,
        preview_type: 'management',
        case_study: {
          overview: 'ProjectFlow is a project management tool providing task tracking, milestone deadlines, and status badges in a high-efficiency dark interface.',
          problem: 'Heavy enterprise management platforms suffer from clutter, slow reload times, and cumbersome user flows that decrease developer velocity.',
          solution: 'Built a sleek dark-themed React application with optimistic state updates and modular progress tracking components.',
          features: [
            { title: 'Linear-Inspired Interface', desc: 'Clean dark productivity layout with fast keyboard navigation.' },
            { title: 'Interactive Progress Gauges', desc: 'Project progress bars calculating real-time completion percentages.' },
            { title: 'Milestone Deadline Tracking', desc: 'Status badges (Planning, In Progress, Review, Completed).' },
            { title: 'Instant Filter & Search', desc: 'Fast client-side task filter and search capabilities.' }
          ],
          architecture: {
            frontend: 'React with TypeScript, Tailwind CSS, and optimistic UI state hooks.',
            backend: 'Node.js & Express REST API handling task CRUD and project boards.',
            database: 'MongoDB document store for flexible project schemas.',
            authentication: 'JWT session authentication.',
            apis: 'RESTful JSON API endpoints.',
            deployment: 'Cloud Linux VPS.'
          },
          folderStructure: `ProjectFlow/\n├── src/\n│   ├── components/Tasks/\n│   ├── components/Projects/\n│   ├── pages/Dashboard.tsx\n│   └── services/api.ts\n└── server/\n    ├── routes/taskRoutes.ts\n    └── models/Task.ts`,
          modules: [
            { name: 'Task Engine', desc: 'Manages task lifecycle states, assignments, and priority badges.' },
            { name: 'Progress Calculator', desc: 'Computes overall milestone completions automatically.' }
          ],
          dataModel: [
            { table: 'projects', details: 'id, title, category, progress, status, due_date' },
            { table: 'tasks', details: 'id, project_id, title, priority, status, assigned_to' }
          ],
          auth: 'JWT authentication protecting task endpoints.',
          decisions: [
            { title: 'Optimistic State Updates', rationale: 'Decoupling visual UI updates from API commits creates an instant response feel.' }
          ],
          challenges: [
            { challenge: 'UI lag when rendering large lists of task items.', solution: 'Implemented list virtualization for task feeds.' }
          ],
          futureImprovements: [
            'Kanban board drag-and-drop view mode.',
            'GitHub commit integration linking pull requests to project tasks.'
          ]
        }
      },
      {
        slug: 'contenthub',
        number: '06',
        name: 'ContentHub',
        subtitle: 'Enterprise Content & Multi-Tenant SaaS Engine',
        category: 'CMS / Multi-Tenant SaaS',
        project_type: 'CMS / Multi-Creator Platform',
        role: 'Developer',
        accent_color: '#ff9a3d',
        is_featured: false,
        sort_order: 6,
        image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        description: 'ContentHub CMS is an enterprise-grade headless content management engine designed for multi-tenant publishing, content performance analytics, and granular role-based access control.',
        technologies: ['Laravel 12', 'React', 'PostgreSQL', 'Redis', 'Inertia.js'],
        github_url: 'https://github.com/hassaanrana07/ContentHub-CMS-Multi-Creator-Platform',
        live_url: null,
        preview_type: 'cms',
        case_study: {
          overview: 'ContentHub CMS delivers enterprise publishing workflows, multi-tenant governance, and real-time content engagement analytics for media organizations.',
          problem: 'Fragmented publishing tools force content teams to rely on manual developer dispatches for simple site updates while lacking aggregated traffic metrics.',
          solution: 'Constructed a high-concurrency Laravel backend paired with a React frontend via Inertia.js. Integrated Redis caching to serve published content payloads with sub-50ms latency.',
          features: [
            { title: 'Granular RBAC Governance', desc: 'Role-Based Access Control supporting Editor, Manager, and Admin roles.' },
            { title: 'Visual Block Content Builder', desc: 'Content builder with revision history and draft publishing queues.' },
            { title: 'Real-Time Engagement Analytics', desc: 'Dashboard tracking page views, user engagement, and author metrics.' },
            { title: 'Redis-Backed Content Caching', desc: 'Caching layer for sub-50ms public JSON content API delivery.' }
          ],
          architecture: {
            frontend: 'React with Inertia.js for full single-page application interactivity.',
            backend: 'Laravel 12 application processing editorial dispatches and background tasks.',
            database: 'PostgreSQL relational store with JSONB document support for flexible content schemas.',
            authentication: 'Laravel Sanctum tokens for API clients and session authentication for admins.',
            apis: 'Headless REST and JSON content delivery APIs.',
            deployment: 'Dockerized containers deployed on Linux with Redis cache clusters.'
          },
          folderStructure: `ContentHub/\n├── app/\n│   ├── Http/Controllers/\n│   │   ├── ArticleController.php\n│   │   └── AnalyticsController.php\n│   ├── Services/\n│   │   └── RedisCacheService.php\n│   └── Models/Article.php\n└── resources/js/\n    ├── Components/Editor/\n    └── Pages/Dashboard/`,
          modules: [
            { name: 'Visual Content Builder', desc: 'Enables authors to compose multi-block articles with live preview.' },
            { name: 'RBAC Governance Engine', desc: 'Controls permissions for content drafting, review, and publishing.' },
            { name: 'Redis Content Cache', desc: 'Serves published article payloads directly from memory.' }
          ],
          dataModel: [
            { table: 'articles', details: 'id, title, slug, content_json, author_id, status, published_at' },
            { table: 'roles_permissions', details: 'id, role_name, permissions_json' }
          ],
          auth: 'Sanctum session security with granular permission checks on every editorial controller route.',
          decisions: [
            { title: 'PostgreSQL JSONB Storage', rationale: 'Allows dynamic content block structures without requiring complex SQL migration changes.' }
          ],
          challenges: [
            { challenge: 'Database queries for analytics dashboards slowed during high traffic spikes.', solution: 'Implemented background Redis queue aggregations running every 60 seconds.' }
          ],
          futureImprovements: [
            'AI-assisted article summary and automatic SEO tag generation.',
            'Multi-language localization translation engine.'
          ]
        }
      }
    ];

    for (const p of projects) {
      await conn.query(
        `INSERT INTO projects (id, slug, number, name, subtitle, category, project_type, role, accent_color, is_featured, sort_order, image_url, description, technologies, github_url, live_url, preview_type, case_study)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          p.slug,
          p.number,
          p.name,
          p.subtitle,
          p.category,
          p.project_type,
          p.role,
          p.accent_color,
          p.is_featured,
          p.sort_order,
          p.image_url,
          p.description,
          JSON.stringify(p.technologies),
          p.github_url,
          p.live_url,
          p.preview_type,
          JSON.stringify(p.case_study)
        ]
      );
    }

    // 5. Seed Skills
    const skills = [
      { name: 'HTML5', category: 'Frontend Core', color_hex: '#FFE9A8', desc: 'Modern Semantic Markup & Web Accessibility Standards', radius: 5.4, speed: 0.008 },
      { name: 'CSS3', category: 'Frontend Core', color_hex: '#FFE9A8', desc: 'Responsive Layouts, Custom Properties, Flexbox & Grid Systems', radius: 5.4, speed: 0.008 },
      { name: 'JavaScript', category: 'Frontend Core', color_hex: '#FFE9A8', desc: 'ES6+ Modern Asynchronous JS Engine & Web APIs', radius: 5.4, speed: 0.008 },
      { name: 'React.js', category: 'Frontend Core', color_hex: '#FFE9A8', desc: 'Hooks, Context API, Virtual DOM & Modular UI Components', radius: 5.4, speed: 0.008 },
      { name: 'Vue.js', category: 'Frontend & Frameworks', color_hex: '#FFE9A8', desc: 'Vue 3 Composition API, Pinia State & Reactive Templates', radius: 8.8, speed: 0.006 },
      { name: 'Tailwind CSS', category: 'Frontend & Frameworks', color_hex: '#FFE9A8', desc: 'Utility-First CSS Framework & Rapid Design System Architecture', radius: 8.8, speed: 0.006 },
      { name: 'Bootstrap', category: 'Frontend & Frameworks', color_hex: '#FFE9A8', desc: 'Responsive Grid System & UI Component Frameworks', radius: 8.8, speed: 0.006 },
      { name: 'WordPress', category: 'Frontend & Frameworks', color_hex: '#FFE9A8', desc: 'Custom Headless CMS, Theme Development & REST APIs', radius: 8.8, speed: 0.006 },
      { name: 'Node.js', category: 'Backend Systems', color_hex: '#FF9A3D', desc: 'Asynchronous Event-Driven Backend Server Runtime', radius: 12.2, speed: 0.004 },
      { name: 'Express.js', category: 'Backend Systems', color_hex: '#FF9A3D', desc: 'Fast RESTful API Services & Middleware Architecture', radius: 12.2, speed: 0.004 },
      { name: 'Laravel', category: 'Backend Systems', color_hex: '#FF9A3D', desc: 'Eloquent ORM, Blade Templates, Inertia.js & Modular Backends', radius: 12.2, speed: 0.004 },
      { name: 'PHP', category: 'Backend Systems', color_hex: '#FF9A3D', desc: 'Modern Object-Oriented Backend Engineering & Server Logic', radius: 12.2, speed: 0.004 },
      { name: 'JWT / RBAC', category: 'Backend Systems', color_hex: '#FF9A3D', desc: 'Secure JSON Web Tokens & Multi-Role Access Control Systems', radius: 12.2, speed: 0.004 },
      { name: 'MySQL', category: 'Databases', color_hex: '#FF5722', desc: 'Relational Schema Architecture, Index Optimization & Transactions', radius: 15.6, speed: 0.003 },
      { name: 'PostgreSQL', category: 'Databases', color_hex: '#FF5722', desc: 'Advanced Relational Database Queries, Indexing & JSON Types', radius: 15.6, speed: 0.003 },
      { name: 'MongoDB', category: 'Databases', color_hex: '#FF5722', desc: 'NoSQL Document Storage, Aggregations & Flexible Data Models', radius: 15.6, speed: 0.003 },
      { name: 'Redis', category: 'Databases', color_hex: '#FF5722', desc: 'In-Memory Key-Value Cache, Session Storage & Pub/Sub Messaging', radius: 15.6, speed: 0.003 },
      { name: 'Git', category: 'Tools / Cloud', color_hex: '#a855f7', desc: 'Distributed Version Control, Branching & Merge Workflows', radius: 19.0, speed: 0.0015 },
      { name: 'GitHub', category: 'Tools / Cloud', color_hex: '#a855f7', desc: 'CI/CD Workflows, Pull Requests & Collaborative Code Review', radius: 19.0, speed: 0.0015 },
      { name: 'Docker', category: 'Tools / Cloud', color_hex: '#a855f7', desc: 'Containerization, Multi-Stage Dockerfiles & Compose Networks', radius: 19.0, speed: 0.0015 },
      { name: 'AWS', category: 'Tools / Cloud', color_hex: '#a855f7', desc: 'Cloud Deployment, S3 Bucket Assets, EC2 Instances & Infrastructure', radius: 19.0, speed: 0.0015 }
    ];

    for (let i = 0; i < skills.length; i++) {
      const s = skills[i];
      await conn.query(
        `INSERT INTO skills (id, category, name, color_hex, description, orbit_radius, orbit_speed, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), s.category, s.name, s.color_hex, s.desc, s.radius, s.speed, i + 1]
      );
    }

    // 6. Seed Experience
    const experiences = [
      {
        type: 'work',
        period: 'Dec 2025 - Apr 2026',
        role: 'Full-Stack Web Developer',
        organization: 'Ronnie Ridge Technology',
        location: 'Lahore, PK',
        description: 'Building enterprise web applications using Laravel, Vue.js, React, and Inertia.js. Working on multi-role RBAC systems, real-time dashboards, and scalable backends.',
        tags: ['PHP', 'Laravel', 'React.js', 'Vue.js', 'MySQL', 'Tailwind'],
        color_theme: 'cyan',
        sort_order: 1
      },
      {
        type: 'work',
        period: 'May 2026 - Jun 2026',
        role: 'Task-Based Web Developer (Internship)',
        organization: 'FentixTech',
        location: 'Remote',
        description: 'Completed structured web development tasks, integrated RESTful APIs, and deployed responsive React applications following Git branching conventions.',
        tags: ['React.js', 'HTML5', 'CSS3', 'REST APIs', 'Git', 'Netlify'],
        color_theme: 'purple',
        sort_order: 2
      },
      {
        type: 'work',
        period: 'May — Aug 2024',
        role: 'Frontend Developer Intern',
        organization: 'Codiveo',
        location: 'Lahore, PK',
        description: 'Worked on frontend development using HTML, CSS, JavaScript, and Bootstrap. Built responsive layouts and UI components for 3+ live client projects.',
        tags: ['HTML/CSS', 'JavaScript', 'Bootstrap', 'Tailwind'],
        color_theme: 'cyan',
        sort_order: 3
      },
      {
        type: 'education',
        period: '2022 — Present',
        role: 'BS Computer Science',
        organization: 'Virtual University of Pakistan',
        location: 'Lahore, Pakistan',
        description: 'Studying Data Structures, OOP, Discrete Mathematics, Data Communications, Software Engineering, and Database Management Systems.',
        tags: ['Data Structures', 'OOP', 'DBMS', 'Software Eng'],
        color_theme: 'purple',
        sort_order: 1
      },
      {
        type: 'education',
        period: 'Self-Learning — Ongoing',
        role: 'AI-Assisted Development',
        organization: 'Continuous Engineering',
        location: 'Online',
        description: 'Actively mastering AI tools (Antigravity, Cursor, Copilot) to accelerate prototyping, code review, workflow automation, and architecture design.',
        tags: ['Antigravity', 'n8n', 'Cursor', 'AI Tools'],
        color_theme: 'purple',
        sort_order: 2
      }
    ];

    for (const exp of experiences) {
      await conn.query(
        `INSERT INTO experience (id, type, period, role, organization, location, description, tags, color_theme, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), exp.type, exp.period, exp.role, exp.organization, exp.location, exp.description, JSON.stringify(exp.tags), exp.color_theme, exp.sort_order]
      );
    }

    // 7. Seed Services
    const services = [
      { title: 'Full-Stack Web Application Development', short_desc: 'End-to-End Web Applications', full_desc: 'Building complete web apps end to end using Laravel, React, and Vue, from database design through to a working, deployed product.', icon_name: 'code', sort_order: 1 },
      { title: 'Custom Admin Panels & Dashboards', short_desc: 'Data Analytics & Workflows', full_desc: 'Role-based dashboards with analytics, lead management, and content control, built for teams that need to manage their own data.', icon_name: 'columns', sort_order: 2 },
      { title: 'REST API Design & Development', short_desc: 'Secure JSON Microservices', full_desc: 'Clean, documented APIs built with Laravel or Node.js/Express, ready to plug into a mobile app, frontend, or third-party service.', icon_name: 'braces', sort_order: 3 },
      { title: 'Real-Time Applications', short_desc: 'Low-Latency Event Streaming', full_desc: 'Live dashboards, notifications, and data feeds built with WebSockets, so users see updates the moment they happen.', icon_name: 'lightning', sort_order: 4 },
      { title: 'CMS & Multi-Tenant SaaS Platforms', short_desc: 'Headless Content Engines & RBAC', full_desc: 'Enterprise multi-tenant CMS engines with role-based access control and cached content dispatches.', icon_name: 'layers', sort_order: 5 },
      { title: 'Cloud Deployment & DevOps', short_desc: 'Nginx · Linux VPS · CI/CD', full_desc: 'Configuring production web servers, automated deployment pipelines, and database management.', icon_name: 'server', sort_order: 6 }
    ];

    for (const s of services) {
      await conn.query(
        `INSERT INTO services (id, title, short_desc, full_desc, icon_name, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), s.title, s.short_desc, s.full_desc, s.icon_name, s.sort_order]
      );
    }

    await conn.commit();
    console.log('[Seed] Database successfully populated with initial records.');
  } catch (err) {
    await conn.rollback();
    console.error('[Seed Error] Failed to seed database:', err);
    throw err;
  } finally {
    conn.release();
  }
}

// Execute directly if run via CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
