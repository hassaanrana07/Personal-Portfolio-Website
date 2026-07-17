/* ============================================================
   HASSAAN DEV PORTFOLIO v2 — main.js
   Typewriter · Navbar · Smooth Scroll · Reveal · Filter
   Constellation Canvas · Contact Form
   ============================================================ */

/* ── 1. TYPEWRITER ────────────────────────────────────────── */
(function () {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const roles = ['Full-Stack Developer','Laravel Engineer','Vue.js Specialist','React.js Developer','API Architect'];
  let ri = 0, ci = 0, del = false;
  function type() {
    const cur = roles[ri];
    el.textContent = del ? cur.slice(0, --ci) : cur.slice(0, ++ci);
    if (!del && ci === cur.length) { del = true; return setTimeout(type, 1800); }
    if (del && ci === 0)           { del = false; ri = (ri + 1) % roles.length; return setTimeout(type, 400); }
    setTimeout(type, del ? 48 : 88);
  }
  setTimeout(type, 600);
})();

/* ── 2. NAVBAR SCROLL + ACTIVE LINK ──────────────────────── */
(function () {
  const nav   = document.getElementById('mainNav');
  const links = document.querySelectorAll('.nav-link[href^="#"]');
  function tick() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    const y = window.scrollY + 110;
    document.querySelectorAll('section[id]').forEach(s => {
      const link = document.querySelector(`.nav-link[href="#${s.id}"]`);
      if (!link) return;
      const active = y >= s.offsetTop && y < s.offsetTop + s.offsetHeight;
      link.classList.toggle('active', active);
    });
  }
  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();

/* ── 3. SMOOTH SCROLL ─────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    const nb = document.getElementById('navMenu');
    if (nb && nb.classList.contains('show')) document.querySelector('.navbar-toggler').click();
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
});

/* ── 4. SCROLL REVEAL ─────────────────────────────────────── */
(function () {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const siblings = [...en.target.parentElement.children].filter(c => c.classList.contains('reveal'));
      const idx = siblings.indexOf(en.target);
      setTimeout(() => en.target.classList.add('visible'), idx * 70);
      obs.unobserve(en.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  els.forEach(el => obs.observe(el));
})();

/* ── 5. PROJECT FILTER ────────────────────────────────────── */
(function () {
  const btns  = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.project-item');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      items.forEach(item => {
        item.classList.toggle('hidden', f !== 'all' && item.dataset.category !== f);
      });
    });
  });
})();

/* ── 6. CONTACT FORM ──────────────────────────────────────── */
function handleContact() {
  const get   = id => document.getElementById(id);
  const name  = get('contactName'), email = get('contactEmail');
  const subj  = get('contactSubject'), msg  = get('contactMessage');
  const errEl = get('form-error'), sucEl = get('form-success'), btn = get('sendBtn');
  errEl.classList.add('d-none');
  if ([name,email,subj,msg].some(f => !f.value.trim())) {
    errEl.textContent = 'Please fill in all fields.'; errEl.classList.remove('d-none'); return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    errEl.textContent = 'Please enter a valid email.'; errEl.classList.remove('d-none'); return;
  }
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = 'Send Message <i class="bi bi-send ms-2"></i>';
    sucEl.classList.remove('d-none');
    [name,email,subj,msg].forEach(f => f.value = '');
    setTimeout(() => sucEl.classList.add('d-none'), 5000);
  }, 1400);
}

/* ── 7. FOOTER YEAR ───────────────────────────────────────── */
(function(){ const el=document.getElementById('year'); if(el) el.textContent=new Date().getFullYear(); })();

/* ── 8. HERO ENTRANCE ─────────────────────────────────────── */
(function(){
  const hc = document.querySelector('.hero-content');
  if(!hc) return;
  hc.style.cssText = 'opacity:0;transform:translateY(22px);transition:opacity .9s ease,transform .9s ease';
  setTimeout(() => { hc.style.opacity='1'; hc.style.transform='translateY(0)'; }, 250);
})();

/* ══════════════════════════════════════════════════════════
   9. CONSTELLATION CANVAS
══════════════════════════════════════════════════════════ */
(function () {
  const canvas  = document.getElementById('constellation');
  if (!canvas) return;
  const tooltip = document.getElementById('skill-tooltip');
  const ctx     = canvas.getContext('2d');

  /* ── Skill data ─────────────────────────────────────────── */
  const SKILLS = [
    /* Backend */
    { id:'laravel',    label:'Laravel 12',   cat:'backend',  pct:92, icon:'⚙' },
    { id:'php',        label:'PHP',           cat:'backend',  pct:88, icon:'🐘' },
    { id:'nodejs',     label:'Node.js',       cat:'backend',  pct:78, icon:'⬡' },
    { id:'express',    label:'Express.js',    cat:'backend',  pct:75, icon:'🚂' },
    { id:'jwt',        label:'JWT / RBAC',    cat:'backend',  pct:85, icon:'🔐' },
    /* Frontend */
    { id:'vuejs',      label:'Vue.js 3',      cat:'frontend', pct:90, icon:'💚' },
    { id:'reactjs',    label:'React.js',      cat:'frontend', pct:85, icon:'⚛' },
    { id:'inertia',    label:'Inertia.js',    cat:'frontend', pct:80, icon:'🔗' },
    { id:'tailwind',   label:'Tailwind CSS',  cat:'frontend', pct:88, icon:'🎨' },
    { id:'bootstrap',  label:'Bootstrap 5',   cat:'frontend', pct:90, icon:'🅱' },
    { id:'js',         label:'JavaScript',    cat:'frontend', pct:87, icon:'JS' },
    /* Database */
    { id:'mysql',      label:'MySQL',         cat:'database', pct:88, icon:'🗄' },
    { id:'postgres',   label:'PostgreSQL',    cat:'database', pct:80, icon:'🐘' },
    { id:'redis',      label:'Redis',         cat:'database', pct:76, icon:'🔴' },
    { id:'mongodb',    label:'MongoDB',       cat:'database', pct:70, icon:'🍃' },
    /* Tools */
    { id:'git',        label:'Git / GitHub',  cat:'tools',    pct:90, icon:'🌿' },
    { id:'vite',       label:'Vite',          cat:'tools',    pct:82, icon:'⚡' },
    { id:'websockets', label:'WebSockets',    cat:'tools',    pct:76, icon:'🔌' },
    { id:'netlify',    label:'Netlify',       cat:'tools',    pct:84, icon:'🚀' },
  ];

  /* ── Connections (pairs of ids) ─────────────────────────── */
  const EDGES = [
    ['laravel','php'],['laravel','mysql'],['laravel','redis'],
    ['laravel','vuejs'],['laravel','inertia'],['laravel','jwt'],
    ['laravel','websockets'],['nodejs','express'],['nodejs','mongodb'],
    ['nodejs','jwt'],['vuejs','inertia'],['vuejs','js'],
    ['reactjs','js'],['reactjs','vite'],['tailwind','vuejs'],
    ['tailwind','reactjs'],['bootstrap','js'],['mysql','postgres'],
    ['redis','websockets'],['git','netlify'],['vite','js'],
  ];

  const CAT_COLORS = {
    backend:  { fill:'#00D4FF', glow:'rgba(0,212,255,0.35)',  dim:'rgba(0,212,255,0.12)' },
    frontend: { fill:'#7C3AED', glow:'rgba(124,58,237,0.35)', dim:'rgba(124,58,237,0.12)' },
    database: { fill:'#F59E0B', glow:'rgba(245,158,11,0.35)', dim:'rgba(245,158,11,0.12)' },
    tools:    { fill:'#10B981', glow:'rgba(16,185,129,0.35)', dim:'rgba(16,185,129,0.12)' },
  };

  /* ── Layout: place nodes in a loose force-inspired grid ─── */
  function buildLayout(W, H) {
    /* Use seeded positions so they look intentional */
    const positions = [
      [0.18,0.25],[0.28,0.70],[0.35,0.42],[0.20,0.55],[0.48,0.18],
      [0.60,0.30],[0.72,0.22],[0.55,0.50],[0.78,0.60],[0.65,0.72],
      [0.45,0.78],[0.82,0.35],[0.25,0.85],[0.88,0.70],[0.50,0.62],
      [0.38,0.15],[0.70,0.85],[0.85,0.15],[0.12,0.45],
    ];
    return SKILLS.map((s, i) => ({
      ...s,
      x: positions[i][0] * W,
      y: positions[i][1] * H,
      r: 6 + (s.pct / 100) * 10,   /* radius from proficiency */
      vx: 0, vy: 0,
      hover: false,
    }));
  }

  let nodes = [];
  let W = 0, H = 0;
  let mouse = { x: -999, y: -999 };
  let raf;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = Math.round(rect.width);
    H = canvas.height = Math.round(rect.height);
    nodes = buildLayout(W, H);
  }

  /* ── Edge helper ────────────────────────────────────────── */
  function getEdge(a, b) {
    return EDGES.some(([x,y]) => (x===a&&y===b)||(x===b&&y===a));
  }

  /* ── Draw ───────────────────────────────────────────────── */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    const hoveredNode = nodes.find(n => n.hover);

    /* Lines */
    EDGES.forEach(([aid, bid]) => {
      const a = nodes.find(n => n.id === aid);
      const b = nodes.find(n => n.id === bid);
      if (!a || !b) return;

      const connected = hoveredNode
        ? (hoveredNode.id === aid || hoveredNode.id === bid)
        : false;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);

      if (hoveredNode) {
        if (connected) {
          /* Highlighted edge */
          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, CAT_COLORS[a.cat].fill + '99');
          grad.addColorStop(1, CAT_COLORS[b.cat].fill + '99');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.03)';
          ctx.lineWidth = 0.5;
          ctx.setLineDash([]);
        }
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });

    /* Nodes */
    nodes.forEach(n => {
      const c    = CAT_COLORS[n.cat];
      const isH  = n.hover;
      const fade = hoveredNode && !isH && !getEdge(n.id, hoveredNode?.id) ? 0.2 : 1;

      ctx.globalAlpha = fade;

      /* Glow */
      if (isH) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        g.addColorStop(0, c.glow);
        g.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      }

      /* Outer ring */
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + (isH ? 4 : 2), 0, Math.PI * 2);
      ctx.strokeStyle = c.fill + (isH ? 'cc' : '55');
      ctx.lineWidth = isH ? 2 : 1;
      ctx.stroke();

      /* Inner fill */
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = isH ? c.fill : c.dim;
      ctx.fill();

      /* Proficiency arc */
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 5, -Math.PI / 2, -Math.PI / 2 + (n.pct / 100) * Math.PI * 2);
      ctx.strokeStyle = c.fill + 'aa';
      ctx.lineWidth = 2;
      ctx.stroke();

      /* Label */
      ctx.globalAlpha = fade;
      ctx.font = `${isH ? '600 ' : ''}${isH ? 11 : 10}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = isH ? c.fill : 'rgba(140,163,192,0.85)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(n.label, n.x, n.y + n.r + 8);

      ctx.globalAlpha = 1;
    });
  }

  /* ── Hover detection ────────────────────────────────────── */
  function detectHover(mx, my) {
    let found = false;
    nodes.forEach(n => {
      const dx = mx - n.x, dy = my - n.y;
      n.hover = dx * dx + dy * dy <= (n.r + 8) ** 2;
      if (n.hover) found = n;
    });
    return found;
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx   = e.clientX - rect.left;
    const my   = e.clientY - rect.top;
    const hit  = detectHover(mx, my);

    if (hit) {
      canvas.style.cursor = 'pointer';
      tooltip.textContent = `${hit.label} — ${hit.pct}%`;
      tooltip.classList.add('show');
      /* Position tooltip, keep it within canvas */
      let tx = mx + 14, ty = my - 36;
      if (tx + 160 > W) tx = mx - 170;
      if (ty < 8) ty = my + 14;
      tooltip.style.left = tx + 'px';
      tooltip.style.top  = ty + 'px';
    } else {
      canvas.style.cursor = 'crosshair';
      tooltip.classList.remove('show');
    }
  });

  canvas.addEventListener('mouseleave', () => {
    nodes.forEach(n => n.hover = false);
    tooltip.classList.remove('show');
  });

  /* ── Gentle float animation ─────────────────────────────── */
  const FLOAT_SPEED = 0.0004;
  const offsets     = SKILLS.map((_, i) => i * 0.7);

  function animate(t) {
    nodes.forEach((n, i) => {
      const base = buildLayout(W, H)[i];
      n.x = base.x + Math.sin(t * FLOAT_SPEED + offsets[i]) * 3;
      n.y = base.y + Math.cos(t * FLOAT_SPEED * 0.8 + offsets[i]) * 2.5;
    });
    draw();
    raf = requestAnimationFrame(animate);
  }

  /* ── Init ───────────────────────────────────────────────── */
  const skillSection = document.getElementById('skills');
  let started = false;

  const startObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      resize();
      raf = requestAnimationFrame(animate);
      startObs.disconnect();
    }
  }, { threshold: 0.1 });

  startObs.observe(skillSection);

  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    resize();
    raf = requestAnimationFrame(animate);
  });

})();

/* ── 10. PROJECT DETAIL MODAL HANDLER & SIMPLE DIAGRAM RENDER ── */
(function(){
  const caseBtns = document.querySelectorAll('.btn-case');
  if(!caseBtns.length) return;

  const modalEl = document.getElementById('projectDetailModal');
  const modalTitle = document.getElementById('projectDetailTitle');
  const repoLink = document.getElementById('projectRepoLink');
  const demoLink = document.getElementById('projectDemoLink');
  const overview = document.getElementById('projectOverview');
  const problem = document.getElementById('projectProblem');
  const solution = document.getElementById('projectSolution');
  const features = document.getElementById('projectFeatures');
  const lessons = document.getElementById('projectLessons');
  const techList = document.getElementById('projectTechList');
  const diagramEl = document.getElementById('projectDiagram');

  const PROJECTS = {
    brickbeam: {
      title: 'BrickBeam Enterprise CMS',
      repo: 'https://github.com/hassaanrana07/brickbeam',
      demo: 'https://brickbeam.hassaan.dev',
      overview: 'A high-performance enterprise content management and resource-planning system engineered for construction firms.',
      problem: 'Fragmented team management, lack of granular permissions (RBAC), and inaccurate automated client lead qualification leading to slow quote delivery and lost sales.',
      solution: 'Engineered a centralized Laravel 12 application with a Vue.js and Inertia.js frontend. Implemented custom predictive lead scoring algorithms and Redis-backed caching pipelines to reduce load times by over 40% under high concurrency.',
      features: [
        'Granular Role-Based Access Control (RBAC) supporting multi-department operations.',
        'Custom lead scoring engine for automated qualification.',
        'Portfolio manager and automated cost-estimation dashboard.',
        'High-efficiency caching layer leveraging Redis for database query optimization.',
        'Fully optimized SEO metadata management system and integrated dark mode interface.'
      ],
      lessons: 'Designing with Inertia.js eliminates the overhead of separate API routing, while background job queues are essential to handle heavy cost calculations and mail dispatches asynchronously.',
      tech: ['Laravel 12', 'Vue.js 3', 'Inertia.js', 'Redis', 'MySQL', 'Vite', 'Bootstrap 5'],
      diagram: ['Vue.js UI', '↓ (Inertia.js)', 'Laravel API', '↓ (Eloquent ORM)', 'Redis Caching', '↓', 'MySQL Database']
    },
    airsense: {
      title: 'AirSense Real-Time AQI Platform',
      repo: 'https://github.com/hassaanrana07/airsense',
      demo: 'https://airsense.hassaan.dev',
      overview: 'An IoT-integrated environmental dashboard that processes and visualizes air quality index (AQI) data in real time.',
      problem: 'Delayed reporting of localized air pollutant concentrations, preventing industrial operations and smart-city systems from reacting instantly to hazardous atmospheric developments.',
      solution: 'Built a real-time event pipeline using React.js and a Node.js/Express backend communicating via WebSockets. Connected background workers to continuous pollutant feeds to stream sub-second updates, paired with a persistent user configuration for instant alerts.',
      features: [
        'Zero-latency real-time AQI monitoring dashboard powered by WebSockets.',
        'Interactive geographical maps visualizing sensor node coordinates and statuses.',
        'Historical data charting and predictive AQI forecasting using Chart.js.',
        'Multi-channel notification pipeline sending automated email and browser push alerts.',
        'Custom user dashboard with favorite locations and responsive layouts.'
      ],
      lessons: 'WebSocket state management requires robust error handling for connection dropping, and rate-limiting alerts is critical to avoid flooding subscriber inboxes during volatile weather fluctuations.',
      tech: ['React.js', 'Node.js', 'Express.js', 'WebSockets', 'Chart.js', 'Tailwind CSS', 'PostgreSQL'],
      diagram: ['IoT Sensors', '↓', 'WebSocket Server', '↓ (Express.js)', 'React Client', '↓', 'PostgreSQL / Charts']
    },
    rentbro: {
      title: 'RentBro PRMS',
      repo: 'https://github.com/hassaanrana07/rentbro',
      demo: 'https://rentbro.hassaan.dev',
      overview: 'An end-to-end Property Rental Management System (PRMS) built to manage leases, audit accounts, and coordinate repair operations.',
      problem: 'High operational overhead and billing errors due to manual spreadsheet tracking of lease contracts, tenant payments, and building maintenance schedules.',
      solution: 'Built a structured Model-View-Controller (MVC) application using Laravel 12 and MySQL. Leveraged strict database constraints and database transactions to ensure ledger auditability, paired with automated payment notifications.',
      features: [
        'Comprehensive property, unit, and tenant inventory management.',
        'Digital contract tracking with automated lease renewal and expiration notices.',
        'Payment tracking, digital ledger auditing, and invoice generation.',
        'Multi-tier dashboard interface customized for Admins, Property Managers, and Tenants.',
        'Maintenance request ticketing system tracking repair statuses and material costs.'
      ],
      lessons: 'Database integrity is vital for financial ledgers; implementing MySQL transactions prevents partial data writes and guarantees payment logging reliability.',
      tech: ['Laravel 12', 'MySQL', 'Bootstrap 5', 'Blade templates', 'Eloquent ORM'],
      diagram: ['Tenant/Manager Portal', '↓', 'Laravel Controller', '↓ (Eloquent)', 'Database Transactions', '↓', 'MySQL Database']
    },
    catalog: {
      title: 'Product Catalog Management System',
      repo: 'https://github.com/hassaanrana07/product-catalog',
      demo: 'https://catalog.hassaan.dev',
      overview: 'A secure, high-throughput product catalog and inventory administration interface.',
      problem: 'E-commerce back offices frequently experience race conditions and unauthorized catalog modifications when scaling up inventory volumes.',
      solution: 'Developed a secure RESTful API utilizing Node.js, Express, and MongoDB. Secured endpoints with JWT authentication and custom role-based middleware, and implemented highly optimized index queries for fast product discovery.',
      features: [
        'Secure stateful authorization using JSON Web Tokens (JWT) stored in HTTP-only cookies.',
        'Full CRUD administrative actions with strict Admin vs. Editor permissions.',
        'High-performance text search indexing with advanced fuzzy matching.',
        'Automated image upload and storage system with file type validation.',
        'Paginated API responses and advanced product filtering options.'
      ],
      lessons: 'Storing JWT tokens securely in HTTP-only cookies prevents cross-site scripting (XSS) vulnerabilities, and database indexing is mandatory on fields used frequently in search queries to keep responses under 50ms.',
      tech: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JWT', 'Tailwind CSS', 'Mongoose'],
      diagram: ['React Client', '↓ (JWT in Headers)', 'Express Auth Middleware', '↓', 'Mongoose / Indexes', '↓', 'MongoDB Atlas']
    },
    portfolio: {
      title: 'Personal Developer Portfolio',
      repo: 'https://github.com/hassaanrana07/Personal-Portfolio-Website',
      demo: 'https://hassaan.dev',
      overview: 'An interactive 3D portfolio demonstrating advanced frontend engineering techniques and visual physics integrations.',
      problem: 'Standard portfolios are static, failing to convey the deep frontend capability, performance focus, and interactive design skills expected of high-caliber engineers.',
      solution: 'Built a responsive developer portfolio using React.js, Vite, and Tailwind CSS. Implemented a custom 2D spring-mass physics simulation in an HTML5 canvas for the skills constellation and leveraged GPU-accelerated CSS transforms for the holographic cards.',
      features: [
        'Spring-mass canvas physics simulation displaying a interactive skills web.',
        '3D-tilt holographic cards utilizing mouse tracking and dynamic gradient shimmer shaders.',
        'Optimized bundle sizing with Vite, achieving Near-100 Lighthouse performance scores.',
        'Fully responsive grid layout adapting fluidly from mobile to ultra-wide displays.',
        'Strategic search engine optimization (SEO) mapping with custom metadata tags.'
      ],
      lessons: 'Optimizing Canvas redraws using requestAnimationFrame prevents CPU spikes and ensures smooth 60fps animations even on mobile devices.',
      tech: ['React.js', 'Tailwind CSS', 'Vite', 'HTML5 Canvas', 'Vanilla JS', 'Bootstrap 5'],
      diagram: ['User Interaction', '↓', 'Canvas Rendering / CSS 3D', '↓', 'GPU Acceleration', '↓', 'High-Performance UI']
    },
    furnivo: {
      title: 'Furnivo E-Commerce Storefront',
      repo: 'https://github.com/hassaanrana07/furnivo',
      demo: 'https://furnivo.hassaan.dev',
      overview: 'A high-fidelity, lightning-fast e-commerce shopping experience focused on instant user interactions.',
      problem: 'Traditional e-commerce flows lose up to 10% of conversions for every 100ms of lag in search results, catalog filters, or cart updates.',
      solution: 'Engineered a lightweight, zero-dependency client-side storefront using HTML5, CSS3, and Vanilla JavaScript. Utilized local browser caches (LocalStorage) and optimized array search algorithms to perform all operations instantly.',
      features: [
        'Instantaneous client-side text search and multi-facet attribute filters.',
        'Persistent shopping cart leveraging LocalStorage for session recovery.',
        'Dynamic product catalog grid with responsive picture elements.',
        'Fluid micro-interactions, hover effects, and loading states built with pure CSS.'
      ],
      lessons: 'Direct DOM manipulation with optimized event listeners is extremely fast for standard client catalogs, proving that lightweight vanilla JS can out-perform heavy frameworks in single-page catalog scenarios.',
      tech: ['HTML5', 'CSS3', 'Vanilla JavaScript', 'LocalStorage', 'Bootstrap 5'],
      diagram: ['User Input', '↓', 'Vanilla JS Events', '↓ (Array Filters)', 'LocalStorage Sync', '↓', 'Dynamic DOM Render']
    }
  };

  function clearList(el){ while(el.firstChild) el.removeChild(el.firstChild); }

  function renderDiagram(arr){
    diagramEl.innerHTML = '';
    arr.forEach((n,i)=>{
      const node = document.createElement('div');
      node.className = 'diag-node mono-text';
      node.textContent = n;
      diagramEl.appendChild(node);
      if(i < arr.length-1){
        const arrow = document.createElement('div'); arrow.className='diag-arrow'; arrow.textContent='↓';
        diagramEl.appendChild(arrow);
      }
    });
  }

  caseBtns.forEach(b=> b.addEventListener('click', e=>{
    e.preventDefault();
    const key = b.dataset.project;
    const p = PROJECTS[key];
    if(!p) return;
    modalTitle.textContent = p.title;
    repoLink.href = p.repo;
    demoLink.href = p.demo;
    overview.textContent = p.overview;
    problem.textContent = p.problem;
    solution.textContent = p.solution;
    clearList(features); p.features.forEach(f=>{ const li=document.createElement('li'); li.textContent=f; features.appendChild(li); });
    lessons.textContent = p.lessons;
    clearList(techList); p.tech.forEach(t=>{ const li=document.createElement('li'); li.textContent=t; techList.appendChild(li); });
    renderDiagram(p.diagram);
    const bs = new bootstrap.Modal(modalEl); bs.show();
  }));

})();