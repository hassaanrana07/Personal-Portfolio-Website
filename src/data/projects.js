export const projectFilters = [
  "All",
  "Full-Stack",
  "Real-Time",
  "CMS / SaaS",
  "Management",
  "Data / Monitoring"
];

export const projects = [
  {
    id: "rentbro",
    number: "01",
    slug: "rentbro",
    name: "RentBro",
    subtitle: "Property & Rental Management System",
    category: "Full-Stack Web Application",
    type: "Full-Stack Web Application",
    role: "Developer",
    description: "RentBro is a centralized property and rental management platform engineered to streamline real estate inventory listings, tenant lease auditing, digital payment ledgers, and site maintenance tracking. It provides landlords and property managers with real-time financial tracking and tenant portals.",
    technologies: ["Laravel 12", "React", "MySQL", "Tailwind CSS"],
    github: "https://github.com/hassaanrana07/Rent-Bro-Property-and-Rental-Management-System",
    live: null,
    preview: "realestate",
    caseStudy: {
      overview: "RentBro simplifies property management by providing automated lease tracking, tenant communication portals, maintenance ticketing, and financial collection auditing for multi-unit real estate portfolios.",
      problem: "Property managers managing multiple residential units struggle with manual lease expiry tracking, uncollected rent balances, and unorganized paper maintenance tickets.",
      solution: "Developed an intuitive real estate portal in Laravel 12 and React with automated lease renewal dispatches, digital financial ledgers, and structured property catalog filters.",
      features: [
        { title: "Property Inventory Catalog", desc: "Catalog with pricing badges, location metadata, and unit availability tags." },
        { title: "Lease Auditing Engine", desc: "Tenant lease tracking with automated payment and renewal notifications." },
        { title: "Maintenance Request Ticketing", desc: "Ticketing portal connecting tenants directly with property managers." },
        { title: "Financial Ledger Audit Log", desc: "Ledger tracking for rent collections and security deposits." }
      ],
      architecture: {
        frontend: "React SPA with Tailwind CSS and custom financial chart visualizers.",
        backend: "Laravel 12 MVC handling lease calculations and notification queues.",
        database: "MySQL relational schema with spatial indexing for property locations.",
        authentication: "Session-based multi-guard authentication for Landlords and Tenants.",
        apis: "REST APIs powering tenant dashboards and property search filters.",
        deployment: "Cloud Linux VPS with Redis queue workers for email dispatches."
      },
      folderStructure: `RentBro/
├── app/
│   ├── Http/Controllers/
│   │   ├── PropertyController.php
│   │   ├── LeaseController.php
│   │   └── MaintenanceTicketController.php
│   ├── Models/
│   │   ├── Property.php
│   │   ├── Tenant.php
│   │   └── Lease.php
│   └── Notifications/LeaseExpiryNotification.php
└── resources/js/
    ├── Pages/Properties/
    └── Pages/Tenants/`,
      modules: [
        { name: "Property Catalog Engine", desc: "Manages active property listings, photos, amenities, and rental rates." },
        { name: "Lease Audit Ledger", desc: "Calculates tenant payment balances, overdue fees, and lease end dates." },
        { name: "Maintenance Ticketing Gateway", desc: "Routes tenant maintenance issues directly to assigned property managers." }
      ],
      dataModel: [
        { table: "properties", details: "id, title, address, monthly_rent, status, unit_type" },
        { table: "leases", details: "id, property_id, tenant_id, start_date, end_date, rent_amount" },
        { table: "payments", details: "id, lease_id, amount_paid, payment_date, transaction_status" }
      ],
      auth: "Multi-guard session authentication keeping tenant self-service portals isolated from administrative financial ledgers.",
      decisions: [
        { title: "Relational Schema Design", rationale: "Strict foreign key constraints ensure historical financial payments remain preserved even when tenant accounts deactivate." }
      ],
      challenges: [
        { challenge: "Slow property search response times across large property catalogs.", solution: "Added compound database indexing on (status, city, monthly_rent)." }
      ],
      futureImprovements: [
        "Stripe & local payment gateway integration for direct tenant rent payments.",
        "Automated PDF lease agreement generation and digital signature support."
      ]
    }
  },
  {
    id: "brickbeam",
    number: "02",
    slug: "brickbeam",
    name: "BrickBeam",
    subtitle: "Construction Resource & Operations Management Platform",
    category: "Full-Stack Web Application",
    type: "Full-Stack Web Application",
    role: "Developer",
    description: "BrickBeam is a construction management platform designed to organize projects, tasks, teams, building site budgets, and financial performance in one centralized system. It eliminates paper-based site logs and manual material estimates, providing real-time workflow phase tracking and automated inventory ledgers.",
    technologies: ["Laravel 12", "React", "MySQL", "Tailwind CSS"],
    github: "https://github.com/hassaanrana07/BrickBeam-Construction-Management-System-",
    live: null,
    preview: "construction",
    caseStudy: {
      overview: "BrickBeam centralizes civil project site management, resource allocation, and contractor phase completions for construction enterprises. It resolves project cost overruns and site material misplacements by providing automated procurement ledgers and milestone sign-offs.",
      problem: "Paper-based site logs, manual material estimates, and fragmented contractor spreadsheets lead to budget overruns, inventory theft, and delayed milestone sign-offs.",
      solution: "Engineered a structured relational workflow engine in Laravel 12 and React tracking building phases from Planning to Finishing, backed by automated material cost estimation algorithms and MySQL ACID transaction locks.",
      features: [
        { title: "Phase-based Construction Pipeline", desc: "Tracking building milestones across 4 distinct phases (Planning, Foundation, Structure, Finishing)." },
        { title: "Material Inventory Counter", desc: "Real-time site stock allocation logs and usage variance counters." },
        { title: "Contractor Sign-off Workflows", desc: "Automated project completion percentages and sign-off verification." },
        { title: "Multi-Department RBAC", desc: "Role-based permissions for Engineers, Contractors, and Site Managers." }
      ],
      architecture: {
        frontend: "React SPA with Tailwind CSS, Inertia.js client routing, and custom progress gauges.",
        backend: "Laravel 12 MVC Framework handling business rules, validation, and REST dispatches.",
        database: "MySQL 8.0 with InnoDB engine enforcing foreign key constraints and transactional integrity.",
        authentication: "Laravel Sanctum session security with HTTP-only cookie persistence.",
        apis: "RESTful JSON API endpoints for resource management and phase completions.",
        deployment: "Nginx reverse proxy on Ubuntu Linux with Automated Artisan migration pipelines."
      },
      folderStructure: `BrickBeam/
├── app/
│   ├── Http/Controllers/
│   │   ├── ProjectController.php
│   │   ├── MaterialInventoryController.php
│   │   └── PhaseCompletionController.php
│   ├── Models/
│   │   ├── Project.php
│   │   ├── Material.php
│   │   └── SiteResource.php
│   └── Services/
│       └── BudgetCalculatorService.php
├── database/
│   ├── migrations/
│   └── seeders/
└── resources/js/
    ├── Components/
    ├── Pages/Projects/
    └── Layouts/`,
      modules: [
        { name: "Project Pipeline Engine", desc: "Manages building milestones across 4 distinct phases with completion calculations." },
        { name: "Material Procurement Ledger", desc: "Tracks bulk material stock dispatches, site arrivals, and usage variances." },
        { name: "Contractor RBAC Service", desc: "Enforces role-based permissions preventing unauthorized site sign-offs." }
      ],
      dataModel: [
        { table: "projects", details: "id, name, client_id, total_budget, status, start_date, end_date" },
        { table: "project_phases", details: "id, project_id, phase_name, progress_percentage, signoff_by" },
        { table: "materials", details: "id, project_id, material_name, quantity_allocated, unit_cost" }
      ],
      auth: "Laravel Sanctum RBAC governing 3 user levels: Administrator, Site Engineer, and Contractor.",
      decisions: [
        { title: "Laravel 12 + React with Inertia.js", rationale: "Eliminates duplicate API serialization code while preserving full single-page application fluidity." },
        { title: "MySQL InnoDB Transactions", rationale: "Prevents site inventory quantities from desynchronizing during high-frequency concurrent material updates." }
      ],
      challenges: [
        { challenge: "Concurrent material updates by site engineers caused inventory count mismatches.", solution: "Applied pessimistic DB row locking (lockForUpdate()) during transaction commits." }
      ],
      futureImprovements: [
        "BIM 3D CAD model viewer integration inside the project phase dashboard.",
        "Offline-first mobile PWA synchronization for remote construction sites with weak cellular coverage."
      ]
    }
  },
  {
    id: "airsense",
    number: "03",
    slug: "airsense",
    name: "AirSense",
    subtitle: "Real-Time Environmental & Atmospheric Monitoring Network",
    category: "Data / IoT Monitoring Application",
    type: "Data / IoT Monitoring Application",
    role: "Developer",
    description: "AirSense is an environmental monitoring network built to process live atmospheric sensor telemetry, deliver geographical radar maps, track pollutant metrics (PM2.5/PM10), and issue automated threshold alert dispatches in real-time.",
    technologies: ["React", "Node.js", "WebSockets", "Chart.js", "Tailwind CSS"],
    github: "https://github.com/hassaanrana07/AirSense-Real-Time-Air-Quality-Monitoring---Alert-System",
    live: null,
    preview: "airquality",
    caseStudy: {
      overview: "AirSense monitors localized atmospheric pollution sensors to provide immediate air quality and meteorological safety data for urban regions.",
      problem: "Legacy weather reporting services refresh at 60-minute intervals, missing sudden pollution spikes and micro-climate shifts.",
      solution: "Constructed a live telemetry pipeline connecting sensor streams directly to a React monitoring dashboard with real-time AQI calculations and Chart.js trend graphs.",
      features: [
        { title: "Live AQI Score Gauge", desc: "Real-time atmospheric risk score gauges with color-coded alerts." },
        { title: "Geographical Sensor Radar", desc: "Interactive radar map displaying active sensor node coordinates." },
        { title: "Automated Threshold Alerts", desc: "Push notification dispatches triggered by PM2.5 / PM10 spikes." },
        { title: "Historical Trend Graphs", desc: "Pollutant trend analysis powered by Chart.js canvas rendering." }
      ],
      architecture: {
        frontend: "React SPA with Chart.js canvas rendering and Tailwind CSS.",
        backend: "Node.js WebSocket streaming server for sensor ingestion.",
        database: "Time-series database schema for high-frequency telemetry logs.",
        authentication: "API Key authorization for sensor hardware nodes.",
        apis: "WebSocket event stream + REST endpoints for historical analytics.",
        deployment: "Cloud Linux instance running Node.js telemetry services."
      },
      folderStructure: `AirSense/
├── client/
│   ├── src/
│   │   ├── components/AQIGauge.jsx
│   │   ├── components/TelemetryChart.jsx
│   │   └── services/weatherApi.js
└── server/
    └── telemetryServer.js`,
      modules: [
        { name: "Telemetry Ingestor", desc: "Receives raw sensor packets and calculates instantaneous Air Quality Indices." },
        { name: "Trend Visualizer", desc: "Renders historical pollutant graphs with Chart.js canvas components." }
      ],
      dataModel: [
        { table: "sensor_telemetry", details: "id, node_id, pm25, pm10, temp, humidity, timestamp" }
      ],
      auth: "API key validation for incoming hardware sensor telemetry transmissions.",
      decisions: [
        { title: "Chart Render Throttling", rationale: "Throttling canvas redraws to 60fps prevents UI freezing during rapid sensor data bursts." }
      ],
      challenges: [
        { challenge: "High-frequency sensor updates caused React component re-render bottlenecks.", solution: "Moved raw telemetry parsing to Web Workers and decoupled state commits." }
      ],
      futureImprovements: [
        "Machine learning predictive weather and AQI forecast modeling.",
        "SMS and push notification integrations for emergency pollution alerts."
      ]
    }
  },
  {
    id: "vyra",
    number: "04",
    slug: "vyra",
    name: "Vyra",
    subtitle: "Real-Time Social Network Platform",
    category: "Full-Stack Web Application",
    type: "Full-Stack Web Application",
    role: "Developer",
    description: "Vyra is a full-stack social networking application engineered for low-latency real-time interactions, live direct messaging, story circles, user presence tracking, and instant feed updates using WebSockets.",
    technologies: ["React", "Node.js", "Express", "MongoDB", "Socket.IO"],
    github: "https://github.com/hassaanrana07/vyra-social-network",
    live: null,
    preview: "social",
    caseStudy: {
      overview: "Vyra is a high-throughput social networking application designed for low-latency engagement, WebSocket messaging, and live user interactions.",
      problem: "Traditional social apps using periodic HTTP polling consume unnecessary server bandwidth and introduce multi-second latency for direct messages.",
      solution: "Engineered an event-driven WebSocket architecture using Node.js and Socket.IO. Paired with React client state sync, enabling sub-second messaging and instant notifications.",
      features: [
        { title: "Ephemeral Story Circles", desc: "Story circles with automated 24-hour expiration lifecycle." },
        { title: "Interactive Social Feed", desc: "Post creation, likes, comment threads, and media embedding." },
        { title: "WebSocket Direct Messaging", desc: "Real-time low-latency direct message channels powered by Socket.IO." },
        { title: "User Presence Tracking", desc: "Live user presence indicators and instant notification dispatches." }
      ],
      architecture: {
        frontend: "React with Tailwind CSS and Socket.IO client event listeners.",
        backend: "Node.js & Express asynchronous server handling REST & WebSocket channels.",
        database: "MongoDB document store with Mongoose ODM indexing.",
        authentication: "JSON Web Tokens (JWT) stored in secure HTTP-only cookies.",
        apis: "REST API routes for user management + WebSockets for real-time dispatches.",
        deployment: "Node.js environment with PM2 process manager."
      },
      folderStructure: `Vyra/
├── client/
│   ├── src/
│   │   ├── components/Chat/
│   │   ├── components/Feed/
│   │   └── context/SocketContext.jsx
└── server/
    ├── controllers/
    ├── socket/chatSocket.js
    └── models/User.js`,
      modules: [
        { name: "WebSocket Gateway", desc: "Manages live client connection states, channel subscriptions, and presence." },
        { name: "Social Feed Engine", desc: "Handles post creation, like toggles, comment threads, and media uploads." },
        { name: "JWT Auth Guard", desc: "Secures REST routes and verifies socket handshake connection tokens." }
      ],
      dataModel: [
        { table: "users", details: "id, username, email, avatar, online_status" },
        { table: "posts", details: "id, author_id, content, likes_count, comments_array" },
        { table: "messages", details: "id, sender_id, receiver_id, text, timestamp" }
      ],
      auth: "JWT authentication with socket token verification on initial connection handshake.",
      decisions: [
        { title: "WebSocket Event Architecture", rationale: "Eliminates HTTP polling overhead, delivering instant messages and presence alerts." }
      ],
      challenges: [
        { challenge: "Socket disconnections caused missed message notifications during unstable network states.", solution: "Implemented client-side event acknowledgment queues with server event sequence IDs." }
      ],
      futureImprovements: [
        "WebRTC audio and video calling support.",
        "End-to-end encryption (E2EE) for private direct message channels."
      ]
    }
  },
  {
    id: "projectflow",
    number: "05",
    slug: "projectflow",
    name: "ProjectFlow",
    subtitle: "Project & Task Management Platform",
    category: "Full-Stack Web Application",
    type: "Full-Stack Web Application",
    role: "Developer",
    description: "ProjectFlow optimizes team task execution by offering a clean, distraction-free productivity dashboard focused on project velocities, milestone progress bars, and status badges in a Linear-inspired workflow.",
    technologies: ["React", "TypeScript", "Node.js", "Express", "Tailwind CSS"],
    github: "https://github.com/hassaanrana07/ProjectFlow-Project-Management-System",
    live: null,
    preview: "management",
    caseStudy: {
      overview: "ProjectFlow is a project management tool providing task tracking, milestone deadlines, and status badges in a high-efficiency dark interface.",
      problem: "Heavy enterprise management platforms suffer from clutter, slow reload times, and cumbersome user flows that decrease developer velocity.",
      solution: "Built a sleek dark-themed React application with optimistic state updates and modular progress tracking components.",
      features: [
        { title: "Linear-Inspired Interface", desc: "Clean dark productivity layout with fast keyboard navigation." },
        { title: "Interactive Progress Gauges", desc: "Project progress bars calculating real-time completion percentages." },
        { title: "Milestone Deadline Tracking", desc: "Status badges (Planning, In Progress, Review, Completed)." },
        { title: "Instant Filter & Search", desc: "Fast client-side task filter and search capabilities." }
      ],
      architecture: {
        frontend: "React with TypeScript, Tailwind CSS, and optimistic UI state hooks.",
        backend: "Node.js & Express REST API handling task CRUD and project boards.",
        database: "MongoDB document store for flexible project schemas.",
        authentication: "JWT session authentication.",
        apis: "RESTful JSON API endpoints.",
        deployment: "Cloud Linux VPS."
      },
      folderStructure: `ProjectFlow/
├── src/
│   ├── components/Tasks/
│   ├── components/Projects/
│   ├── pages/Dashboard.tsx
│   └── services/api.ts
└── server/
    ├── routes/taskRoutes.ts
    └── models/Task.ts`,
      modules: [
        { name: "Task Engine", desc: "Manages task lifecycle states, assignments, and priority badges." },
        { name: "Progress Calculator", desc: "Computes overall milestone completions automatically." }
      ],
      dataModel: [
        { table: "projects", details: "id, title, category, progress, status, due_date" },
        { table: "tasks", details: "id, project_id, title, priority, status, assigned_to" }
      ],
      auth: "JWT authentication protecting task endpoints.",
      decisions: [
        { title: "Optimistic State Updates", rationale: "Decoupling visual UI updates from API commits creates an instant response feel." }
      ],
      challenges: [
        { challenge: "UI lag when rendering large lists of task items.", solution: "Implemented list virtualization for task feeds." }
      ],
      futureImprovements: [
        "Kanban board drag-and-drop view mode.",
        "GitHub commit integration linking pull requests to project tasks."
      ]
    }
  },
  {
    id: "contenthub",
    number: "06",
    slug: "contenthub",
    name: "ContentHub",
    subtitle: "Enterprise Content & Multi-Tenant SaaS Platform",
    category: "CMS / Multi-Creator Platform",
    type: "CMS / Multi-Creator Platform",
    role: "Developer",
    description: "ContentHub CMS is an enterprise-grade headless content management engine designed for multi-tenant publishing, content performance analytics, and granular role-based access control. It enables editorial teams to author, schedule, and distribute content with sub-50ms query dispatches.",
    technologies: ["Laravel 12", "React", "PostgreSQL", "Redis", "Inertia.js"],
    github: "https://github.com/hassaanrana07/ContentHub-CMS-Multi-Creator-Platform",
    live: null,
    preview: "cms",
    caseStudy: {
      overview: "ContentHub CMS delivers enterprise publishing workflows, multi-tenant governance, and real-time content engagement analytics for media organizations.",
      problem: "Fragmented publishing tools force content teams to rely on manual developer dispatches for simple site updates while lacking aggregated traffic metrics.",
      solution: "Constructed a high-concurrency Laravel backend paired with a React frontend via Inertia.js. Integrated Redis caching to serve published content payloads with sub-50ms latency.",
      features: [
        { title: "Granular RBAC Governance", desc: "Role-Based Access Control supporting Editor, Manager, and Admin roles." },
        { title: "Visual Block Content Builder", desc: "Content builder with revision history and draft publishing queues." },
        { title: "Real-Time Engagement Analytics", desc: "Dashboard tracking page views, user engagement, and author metrics." },
        { title: "Redis-Backed Content Caching", desc: "Caching layer for sub-50ms public JSON content API delivery." }
      ],
      architecture: {
        frontend: "React with Inertia.js for full single-page application interactivity.",
        backend: "Laravel 12 application processing editorial dispatches and background tasks.",
        database: "PostgreSQL relational store with JSONB document support for flexible content schemas.",
        authentication: "Laravel Sanctum tokens for API clients and session authentication for admins.",
        apis: "Headless REST and JSON content delivery APIs.",
        deployment: "Dockerized containers deployed on Linux with Redis cache clusters."
      },
      folderStructure: `ContentHub/
├── app/
│   ├── Http/Controllers/
│   │   ├── ArticleController.php
│   │   └── AnalyticsController.php
│   ├── Services/
│   │   └── RedisCacheService.php
│   └── Models/Article.php
└── resources/js/
    ├── Components/Editor/
    └── Pages/Dashboard/`,
      modules: [
        { name: "Visual Content Builder", desc: "Enables authors to compose multi-block articles with live preview." },
        { name: "RBAC Governance Engine", desc: "Controls permissions for content drafting, review, and publishing." },
        { name: "Redis Content Cache", desc: "Serves published article payloads directly from memory." }
      ],
      dataModel: [
        { table: "articles", details: "id, title, slug, content_json, author_id, status, published_at" },
        { table: "roles_permissions", details: "id, role_name, permissions_json" }
      ],
      auth: "Sanctum session security with granular permission checks on every editorial controller route.",
      decisions: [
        { title: "PostgreSQL JSONB Storage", rationale: "Allows dynamic content block structures without requiring complex SQL migration changes." }
      ],
      challenges: [
        { challenge: "Database queries for analytics dashboards slowed during high traffic spikes.", solution: "Implemented background Redis queue aggregations running every 60 seconds." }
      ],
      futureImprovements: [
        "AI-assisted article summary and automatic SEO tag generation.",
        "Multi-language localization translation engine."
      ]
    }
  }
];
