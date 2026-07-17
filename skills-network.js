/* ============================================================
   HASSAAN DEV PORTFOLIO — skills-network.js
   Pure Vanilla JS + Canvas physics-driven skills constellation.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".constellation-container");
  const canvas = document.getElementById("skillsConstellation");
  if (!container || !canvas) return;

  const ctx = canvas.getContext("2d");
  const tooltip = document.getElementById("constellationTooltip");

  // --- CATEGORY CONFIGURATION ---
  const categories = {
    frontend: {
      color: "rgb(168, 85, 247)", // Purple
      colorHex: "#a855f7",
      label: "Frontend"
    },
    backend: {
      color: "rgb(6, 182, 212)",  // Teal
      colorHex: "#06b6d4",
      label: "Backend"
    },
    tools: {
      color: "rgb(245, 158, 11)",   // Amber
      colorHex: "#f59e0b",
      label: "Tools & DevOps"
    },
    design: {
      color: "rgb(255, 107, 107)",  // Coral
      colorHex: "#ff6b6b",
      label: "Design"
    }
  };

  // --- SKILLS DATASET ---
  // Normalized homeX and homeY represent coordinates on a 0.0 - 1.0 grid.
  // Central/largest node is Laravel (Backend, 92% proficiency).
  const skillsData = [
    { name: "Laravel 12", category: "backend", proficiency: 92, years: 3.5, related: ["PHP", "MySQL", "PostgreSQL", "Inertia.js", "Redis Caching", "Composer", "RESTful APIs", "JWT Auth", "RBAC", "WebSockets"], homeX: 0.5, homeY: 0.5, isCentral: true },
    { name: "PHP", category: "backend", proficiency: 88, years: 3.5, related: ["Laravel 12", "Composer", "MySQL", "XAMPP"], homeX: 0.32, homeY: 0.4 },
    { name: "JavaScript (ES6+)", category: "frontend", proficiency: 88, years: 3, related: ["Vue.js 3", "React.js", "Node.js/Express.js", "HTML5", "CSS3"], homeX: 0.62, homeY: 0.18 },
    { name: "HTML5", category: "design", proficiency: 90, years: 4, related: ["CSS3", "JavaScript (ES6+)", "Bootstrap"], homeX: 0.78, homeY: 0.18 },
    { name: "CSS3", category: "design", proficiency: 88, years: 4, related: ["HTML5", "Tailwind CSS", "Bootstrap"], homeX: 0.86, homeY: 0.26 },
    { name: "Vue.js 3", category: "frontend", proficiency: 90, years: 2.5, related: ["JavaScript (ES6+)", "Inertia.js", "Vite", "npm/npx", "Tailwind CSS", "Bootstrap", "Chart.js"], homeX: 0.68, homeY: 0.38 },
    { name: "React.js", category: "frontend", proficiency: 85, years: 2, related: ["JavaScript (ES6+)", "Inertia.js", "Vite", "npm/npx", "Tailwind CSS", "Bootstrap", "Chart.js"], homeX: 0.68, homeY: 0.62 },
    { name: "Inertia.js", category: "frontend", proficiency: 82, years: 2, related: ["Laravel 12", "Vue.js 3", "React.js"], homeX: 0.5, homeY: 0.28 },
    { name: "Node.js/Express.js", category: "backend", proficiency: 78, years: 2, related: ["JavaScript (ES6+)", "WebSockets", "RESTful APIs", "JWT Auth", "npm/npx"], homeX: 0.48, homeY: 0.12 },
    { name: "Tailwind CSS", category: "design", proficiency: 88, years: 2.5, related: ["CSS3", "Vue.js 3", "React.js"], homeX: 0.84, homeY: 0.46 },
    { name: "Bootstrap", category: "design", proficiency: 85, years: 3, related: ["HTML5", "CSS3", "Vue.js 3", "React.js"], homeX: 0.82, homeY: 0.36 },
    { name: "Vite", category: "tools", proficiency: 80, years: 2, related: ["Vue.js 3", "React.js", "npm/npx", "HTML5"], homeX: 0.84, homeY: 0.64 },
    { name: "Chart.js", category: "design", proficiency: 75, years: 1.5, related: ["Vue.js 3", "React.js", "JavaScript (ES6+)"], homeX: 0.78, homeY: 0.78 },
    { name: "WebSockets", category: "backend", proficiency: 75, years: 1.5, related: ["Laravel 12", "Node.js/Express.js", "RESTful APIs"], homeX: 0.35, homeY: 0.1 },
    { name: "RESTful APIs", category: "backend", proficiency: 88, years: 3, related: ["Laravel 12", "Node.js/Express.js", "JWT Auth", "RBAC", "WebSockets"], homeX: 0.34, homeY: 0.25 },
    { name: "JWT Auth", category: "backend", proficiency: 85, years: 2.5, related: ["Laravel 12", "Node.js/Express.js", "RESTful APIs", "RBAC"], homeX: 0.2, homeY: 0.3 },
    { name: "RBAC", category: "backend", proficiency: 85, years: 2.5, related: ["Laravel 12", "RESTful APIs", "JWT Auth"], homeX: 0.2, homeY: 0.15 },
    { name: "Redis Caching", category: "tools", proficiency: 75, years: 1.5, related: ["Laravel 12", "Node.js/Express.js"], homeX: 0.5, homeY: 0.7 },
    { name: "MySQL", category: "backend", proficiency: 87, years: 3, related: ["Laravel 12", "PHP", "PostgreSQL", "XAMPP"], homeX: 0.34, homeY: 0.58 },
    { name: "PostgreSQL", category: "backend", proficiency: 80, years: 2, related: ["Laravel 12", "Node.js/Express.js", "MySQL"], homeX: 0.2, homeY: 0.68 },
    { name: "Git/GitHub", category: "tools", proficiency: 90, years: 3, related: ["Laravel 12", "Vue.js 3", "React.js", "Node.js/Express.js"], homeX: 0.64, homeY: 0.88 },
    { name: "Composer", category: "tools", proficiency: 85, years: 3, related: ["Laravel 12", "PHP", "XAMPP"], homeX: 0.32, homeY: 0.82 },
    { name: "npm/npx", category: "tools", proficiency: 88, years: 3, related: ["Vue.js 3", "React.js", "Node.js/Express.js", "Vite"], homeX: 0.48, homeY: 0.88 },
    { name: "XAMPP", category: "tools", proficiency: 85, years: 3.5, related: ["PHP", "MySQL", "Composer"], homeX: 0.18, homeY: 0.48 }
  ];

  // --- STATE VARIABLES ---
  let width = container.clientWidth;
  let height = container.clientHeight;
  let nodes = [];
  let links = [];
  let pulses = [];
  let bgStars = [];
  
  // Interactive variables
  let mouse = { x: width / 2, y: height / 2, rawX: width / 2, rawY: height / 2, isOverCanvas: false };
  let parallax = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let hoveredNode = null;
  let activeNode = null;
  let draggedNode = null;
  let lastTime = performance.now();

  // Physics constraints
  const kRestoring = 0.04; // Spring force pulling back to target (rest) positions
  const kLink = 0.012;     // Spring force of links between nodes
  const damping = 0.84;    // Drag coefficient/friction
  const ambientFreq = 0.001; // Speed of ambient drift
  const parallaxStrength = 0.035; // Constellation parallax factor
  const starParallaxStrength = 0.015; // Background stars parallax factor

  // --- COORDINATE MAPPINGS (RESPONSIVE) ---
  const desktopCoords = {
    "Laravel 12": { x: 0.5, y: 0.5 },
    "PHP": { x: 0.32, y: 0.4 },
    "MySQL": { x: 0.34, y: 0.58 },
    "PostgreSQL": { x: 0.2, y: 0.68 },
    "RESTful APIs": { x: 0.34, y: 0.25 },
    "JWT Auth": { x: 0.2, y: 0.3 },
    "RBAC": { x: 0.2, y: 0.15 },
    "WebSockets": { x: 0.35, y: 0.1 },
    "Node.js/Express.js": { x: 0.48, y: 0.12 },
    "XAMPP": { x: 0.18, y: 0.48 },
    "Vue.js 3": { x: 0.68, y: 0.38 },
    "React.js": { x: 0.68, y: 0.62 },
    "Inertia.js": { x: 0.5, y: 0.28 },
    "JavaScript (ES6+)": { x: 0.62, y: 0.18 },
    "HTML5": { x: 0.78, y: 0.18 },
    "CSS3": { x: 0.86, y: 0.26 },
    "Tailwind CSS": { x: 0.84, y: 0.46 },
    "Bootstrap": { x: 0.82, y: 0.36 },
    "Chart.js": { x: 0.78, y: 0.78 },
    "Redis Caching": { x: 0.5, y: 0.7 },
    "Composer": { x: 0.32, y: 0.82 },
    "npm/npx": { x: 0.48, y: 0.88 },
    "Git/GitHub": { x: 0.64, y: 0.88 },
    "Vite": { x: 0.84, y: 0.64 }
  };

  const mobileCoords = {
    "Laravel 12": { x: 0.5, y: 0.48 },
    "WebSockets": { x: 0.18, y: 0.14 },
    "PHP": { x: 0.18, y: 0.24 },
    "MySQL": { x: 0.18, y: 0.34 },
    "PostgreSQL": { x: 0.18, y: 0.44 },
    "RESTful APIs": { x: 0.18, y: 0.54 },
    "JWT Auth": { x: 0.18, y: 0.64 },
    "RBAC": { x: 0.18, y: 0.74 },
    "XAMPP": { x: 0.18, y: 0.84 },
    "JavaScript (ES6+)": { x: 0.5, y: 0.1 },
    "Inertia.js": { x: 0.5, y: 0.2 },
    "Node.js/Express.js": { x: 0.5, y: 0.3 },
    "Redis Caching": { x: 0.5, y: 0.64 },
    "Composer": { x: 0.5, y: 0.73 },
    "npm/npx": { x: 0.5, y: 0.82 },
    "Git/GitHub": { x: 0.5, y: 0.91 },
    "HTML5": { x: 0.82, y: 0.1 },
    "CSS3": { x: 0.82, y: 0.2 },
    "Vue.js 3": { x: 0.82, y: 0.3 },
    "React.js": { x: 0.82, y: 0.4 },
    "Bootstrap": { x: 0.82, y: 0.52 },
    "Tailwind CSS": { x: 0.82, y: 0.64 },
    "Vite": { x: 0.82, y: 0.76 },
    "Chart.js": { x: 0.82, y: 0.87 }
  };

  // --- INITIALIZE CONSTELLATION ---
  function init() {
    width = container.clientWidth;
    const isMobile = width < 768;
    const coordsMap = isMobile ? mobileCoords : desktopCoords;

    // --- BRAND LOGO PATHS ---
    const logoPaths = {
      "Laravel 12": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg",
      "PHP": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg",
      "JavaScript (ES6+)": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
      "HTML5": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
      "CSS3": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg",
      "Vue.js 3": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg",
      "React.js": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
      "Inertia.js": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/inertiadotjs.svg",
      "Node.js/Express.js": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
      "Tailwind CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
      "Bootstrap": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg",
      "Vite": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/vite.svg",
      "Chart.js": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/chartdotjs.svg",
      "WebSockets": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/socketdotio.svg",
      "RESTful APIs": "https://img.icons8.com/color/48/api.png",
      "JWT Auth": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/jsonwebtokens.svg",
      "RBAC": "https://img.icons8.com/color/48/checked-user-share.png",
      "Redis Caching": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg",
      "MySQL": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg",
      "PostgreSQL": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
      "Git/GitHub": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg",
      "Composer": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/composer/composer-original.svg",
      "npm/npx": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/npm/npm-original-wordmark.svg",
      "XAMPP": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/xampp.svg"
    };

    // Create Nodes
    nodes = skillsData.map((s, idx) => {
      // Get responsive coordinates
      const coords = coordsMap[s.name] || { x: s.homeX, y: s.homeY };
      const homeX = coords.x;
      const homeY = coords.y;

      // Map proficiency (70-95%) to radius (14px - 26px) for logo readability
      const minRadius = 14;
      const maxRadius = 26;
      const radius = minRadius + (s.proficiency - 70) * ((maxRadius - minRadius) / 25);
      
      const targetX = homeX * width;
      const targetY = homeY * height;

      // Unique frequencies and offsets for the ambient star drift
      const driftSpeed = 0.6 + Math.random() * 0.8;
      const driftPhaseX = Math.random() * Math.PI * 2;
      const driftPhaseY = Math.random() * Math.PI * 2;
      const driftAmp = 6 + Math.random() * 6; // 6px to 12px drift range

      // Pre-load original brand logo image
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = logoPaths[s.name] || "https://img.icons8.com/color/48/star.png";

      const nodeObj = {
        id: idx,
        name: s.name,
        category: s.category,
        proficiency: s.proficiency,
        years: s.years,
        related: s.related,
        isCentral: s.isCentral || false,
        radius: radius,
        // Home positions
        homeX: homeX,
        homeY: homeY,
        // Physics variables
        x: targetX,
        y: targetY,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        scale: 1.0,           // Transitioning scale multiplier (smooth hover state)
        glowOpacity: 0.15,    // Transitioning glow opacity (smooth hover glow)
        driftSpeed,
        driftPhaseX,
        driftPhaseY,
        driftAmp,
        pulseScale: 1.0,
        logoLoaded: false,
        logoImg: logoImg
      };

      logoImg.onload = () => {
        nodeObj.logoLoaded = true;
      };

      return nodeObj;
    });

    // Create unique bidirectional links
    const linkKeys = new Set();
    nodes.forEach(n1 => {
      n1.related.forEach(relName => {
        const n2 = nodes.find(node => node.name.toLowerCase() === relName.toLowerCase());
        if (n2) {
          const key = n1.id < n2.id ? `${n1.id}-${n2.id}` : `${n2.id}-${n1.id}`;
          if (!linkKeys.has(key)) {
            linkKeys.add(key);
            
            // Initial distance between their home positions serves as spring rest length
            const dx = (n2.homeX - n1.homeX) * width;
            const dy = (n2.homeY - n1.homeY) * height;
            const restLength = Math.sqrt(dx * dx + dy * dy);

            links.push({
              source: n1.id,
              target: n2.id,
              restLength: restLength,
              opacity: 0.1
            });
          }
        }
      });
    });

    // Create background stars
    bgStars = [];
    const numStars = Math.floor((width * height) / 5000); // Scaled to screen size
    for (let i = 0; i < numStars; i++) {
      bgStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.5 + Math.random() * 1.2,
        alpha: 0.15 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.003
      });
    }

    resize();
  }

  // Handle Resize & Retinal Sharpness
  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const isMobile = width < 768;
    const coordsMap = isMobile ? mobileCoords : desktopCoords;

    // Update positions and link rest lengths on resize to prevent snap jumps
    nodes.forEach(node => {
      const coords = coordsMap[node.name] || { x: node.homeX, y: node.homeY };
      node.homeX = coords.x;
      node.homeY = coords.y;
    });

    links.forEach(link => {
      const n1 = nodes[link.source];
      const n2 = nodes[link.target];
      const dx = (n2.homeX - n1.homeX) * width;
      const dy = (n2.homeY - n1.homeY) * height;
      link.restLength = Math.sqrt(dx * dx + dy * dy);
    });

    // Re-distribute background stars to fill new space
    bgStars = [];
    const numStars = Math.floor((width * height) / 5500);
    for (let i = 0; i < numStars; i++) {
      bgStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.5 + Math.random() * 1.2,
        alpha: 0.15 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.003
      });
    }
  }

  window.addEventListener("resize", resize);

  // --- CORE PHYSICS & ANIMATION ---
  function tick(time) {
    const dt = Math.min((time - lastTime) / 16.666, 3); // Cap dt to prevent physics explosion
    lastTime = time;

    updatePhysics(time * 0.001, dt);
    draw(time);
    
    requestAnimationFrame(tick);
  }

  function updatePhysics(timeSec, dt) {
    const isMobile = width < 768;

    // 1. Calculate target state and interpolate transitions for smooth hover/clicks
    nodes.forEach(node => {
      const isHovered = hoveredNode === node;
      const isActive = activeNode === node;
      const isRelatedToActive = activeNode && activeNode.related.includes(node.name);

      let targetScale = 1.0;
      let targetGlow = 0.15;

      if (isHovered) {
        targetScale = 1.2;
        targetGlow = 0.6;
      } else if (isActive) {
        targetScale = 1.15;
        targetGlow = 0.5;
      } else if (isRelatedToActive) {
        targetScale = 1.05;
        targetGlow = 0.35;
      }

      // Smooth interpolation (lerp)
      node.scale += (targetScale - node.scale) * 0.12 * dt;
      node.glowOpacity += (targetGlow - node.glowOpacity) * 0.12 * dt;
    });

    // 2. Add separation force to guarantee no text overlaps
    const minDist = isMobile ? 68 : 88;
    const kRepulse = 0.06;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < minDist && dist > 1) {
          const force = (minDist - dist) * kRepulse;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          
          if (n1 !== draggedNode) {
            n1.vx -= fx * 0.5 * dt;
            n1.vy -= fy * 0.5 * dt;
          }
          if (n2 !== draggedNode) {
            n2.vx += fx * 0.5 * dt;
            n2.vy += fy * 0.5 * dt;
          }
        }
      }
    }

    // 3. Calculate accelerations for restoring forces
    nodes.forEach(node => {
      if (node === draggedNode) {
        node.vx = 0;
        node.vy = 0;
        return; // Position is directly driven by mouse
      }

      let ax = 0;
      let ay = 0;

      // Spring force pulling back to restoring target position
      const targetX = node.homeX * width;
      const targetY = node.homeY * height;
      
      ax += (targetX - node.x) * kRestoring;
      ay += (targetY - node.y) * kRestoring;

      // Ambient drift (gently breathing stars)
      ax += Math.sin(timeSec * node.driftSpeed + node.driftPhaseX) * node.driftAmp * 0.003;
      ay += Math.cos(timeSec * node.driftSpeed + node.driftPhaseY) * node.driftAmp * 0.003;

      node.ax = ax;
      node.ay = ay;
    });

    // 4. Add connection spring forces
    links.forEach(link => {
      const n1 = nodes[link.source];
      const n2 = nodes[link.target];

      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        const delta = dist - link.restLength;
        const force = delta * kLink;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (n1 !== draggedNode) {
          n1.ax += fx;
          n1.ay += fy;
        }
        if (n2 !== draggedNode) {
          n2.ax -= fx;
          n2.ay -= fy;
        }
      }
    });

    // 5. Integrate acceleration and velocity
    nodes.forEach(node => {
      if (node === draggedNode) return;

      node.vx += node.ax * dt;
      node.vy += node.ay * dt;
      node.vx *= Math.pow(damping, dt);
      node.vy *= Math.pow(damping, dt);

      node.x += node.vx * dt;
      node.y += node.vy * dt;

      // Pulse scaling decay
      if (node.pulseScale > 1.0) {
        node.pulseScale -= 0.015 * dt;
      } else {
        node.pulseScale = 1.0;
      }

      // Hard boundaries to keep star nodes inside the canvas padding
      const pad = node.radius + 15;
      if (node.x < pad) { node.x = pad; node.vx *= -0.5; }
      if (node.x > width - pad) { node.x = width - pad; node.vx *= -0.5; }
      if (node.y < pad) { node.y = pad; node.vy *= -0.5; }
      if (node.y > height - pad) { node.y = height - pad; node.vy *= -0.5; }
    });

    // 6. Update Parallax Interpolation (Lerp)
    if (mouse.isOverCanvas) {
      parallax.targetX = (mouse.rawX - width / 2) * parallaxStrength;
      parallax.targetY = (mouse.rawY - height / 2) * parallaxStrength;
    } else {
      // Return slowly to center when mouse leaves
      parallax.targetX = 0;
      parallax.targetY = 0;
    }
    parallax.x += (parallax.targetX - parallax.x) * 0.06 * dt;
    parallax.y += (parallax.targetY - parallax.y) * 0.06 * dt;

    // 7. Update active pulses zipping along vector paths
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.progress += p.speed * 0.015 * dt;
      if (p.progress >= 1.0) {
        // Pulse reached target! Trigger brief pulse impact scale-up
        p.toNode.pulseScale = 1.25;
        pulses.splice(i, 1);
      }
    }
  }

  // --- DRAWING ROUTINES ---
  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    const isMobile = width < 768;

    // 1. Draw Background Stars (drifting slowly with their own depth parallax)
    const starParaX = parallax.x * (starParallaxStrength / parallaxStrength);
    const starParaY = parallax.y * (starParallaxStrength / parallaxStrength);
    
    bgStars.forEach(star => {
      const t = time * star.speed + star.phase;
      // Breathe opacity
      const opacity = star.alpha * (0.6 + Math.sin(t) * 0.4);
      
      // Add star parallax
      let sx = star.x + starParaX;
      let sy = star.y + starParaY;

      // Wrap-around screen bounds for stars
      if (sx < 0) sx += width;
      if (sx > width) sx -= width;
      if (sy < 0) sy += height;
      if (sy > height) sy -= height;

      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Draw Connector Vector Lines
    links.forEach(link => {
      const n1 = nodes[link.source];
      const n2 = nodes[link.target];

      const x1 = n1.x + parallax.x;
      const y1 = n1.y + parallax.y;
      const x2 = n2.x + parallax.x;
      const y2 = n2.y + parallax.y;

      const isN1Active = activeNode && (activeNode.id === n1.id || activeNode.related.includes(n1.name));
      const isN2Active = activeNode && (activeNode.id === n2.id || activeNode.related.includes(n2.name));
      const isConnectionActive = activeNode && ((activeNode.id === n1.id && n1.related.includes(n2.name)) || 
                                                (activeNode.id === n2.id && n2.related.includes(n1.name)));

      const isN1Hovered = hoveredNode && (hoveredNode.id === n1.id);
      const isN2Hovered = hoveredNode && (hoveredNode.id === n2.id);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      if (isConnectionActive) {
        // Glowing active connection line
        const cat = categories[activeNode.category];
        ctx.strokeStyle = cat.color.replace("rgb", "rgba").replace(")", ", 0.55)");
        ctx.lineWidth = 1.8;
        ctx.shadowColor = cat.colorHex;
        ctx.shadowBlur = 6;
      } else if (isN1Hovered || isN2Hovered) {
        // Highlighted line connected to hovered node
        const activeHovered = isN1Hovered ? n1 : n2;
        const cat = categories[activeHovered.category];
        ctx.strokeStyle = cat.color.replace("rgb", "rgba").replace(")", ", 0.35)");
        ctx.lineWidth = 1.2;
      } else {
        // Idle thin connection line
        ctx.strokeStyle = "rgba(255, 255, 255, 0.065)";
        ctx.lineWidth = 0.8;
      }

      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow blur immediately
    });

    // 3. Draw Zipping Neon Pulse Particles
    pulses.forEach(p => {
      const x1 = p.fromNode.x + parallax.x;
      const y1 = p.fromNode.y + parallax.y;
      const x2 = p.toNode.x + parallax.x;
      const y2 = p.toNode.y + parallax.y;

      const cx = x1 + (x2 - x1) * p.progress;
      const cy = y1 + (y2 - y1) * p.progress;

      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      
      // Draw neon glow around pulse dot
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 4. Draw Star Nodes
    nodes.forEach(node => {
      const drawX = node.x + parallax.x;
      const drawY = node.y + parallax.y;

      const isHovered = hoveredNode === node;
      const isActive = activeNode === node;
      const isRelatedToActive = activeNode && activeNode.related.includes(node.name);

      const cat = categories[node.category];

      // Render radius using smoothly interpolated scale property
      const renderRadius = node.radius * node.scale * node.pulseScale;

      // Step A: Draw soft radial halo/glow (using smoothly interpolated glowOpacity)
      ctx.beginPath();
      const glowGrd = ctx.createRadialGradient(
        drawX, drawY, renderRadius * 0.1,
        drawX, drawY, renderRadius * (isHovered || isActive || isRelatedToActive ? 3.0 : 2.0)
      );
      
      const glowOpacity = node.glowOpacity;

      glowGrd.addColorStop(0, cat.color.replace("rgb", "rgba").replace(")", `, ${glowOpacity})`));
      glowGrd.addColorStop(0.4, cat.color.replace("rgb", "rgba").replace(")", `, ${glowOpacity * 0.3})`));
      glowGrd.addColorStop(1, "rgba(8, 8, 20, 0)");
      ctx.fillStyle = glowGrd;
      ctx.arc(drawX, drawY, renderRadius * 3.0, 0, Math.PI * 2);
      ctx.fill();

      // Step B: Draw Star Outer Shell Ring
      ctx.beginPath();
      ctx.arc(drawX, drawY, renderRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(10, 10, 26, 0.8)";
      ctx.fill();
      
      ctx.lineWidth = isHovered || isActive ? 2.0 : 1.2;
      ctx.strokeStyle = isHovered || isActive || isRelatedToActive ? cat.color : cat.color.replace("rgb", "rgba").replace(")", ", 0.5)");
      ctx.stroke();

      // Step C: Draw Star Bright Core Nucleus or Brand Logo
      if (node.logoLoaded) {
        // Draw centered logo inside the circle
        const imgSize = renderRadius * 1.25; // 1.25 covers the inner core nicely
        
        ctx.save();
        // Set glow shadows if hovered/active
        if (isHovered || isActive || isRelatedToActive) {
          ctx.shadowColor = cat.color;
          ctx.shadowBlur = 10;
        }
        ctx.drawImage(node.logoImg, drawX - imgSize / 2, drawY - imgSize / 2, imgSize, imgSize);
        ctx.restore();
      } else {
        // Fallback: white/colored nucleus dot
        ctx.beginPath();
        const nucleusRadius = Math.max(2.5, renderRadius * 0.22);
        ctx.arc(drawX, drawY, nucleusRadius, 0, Math.PI * 2);
        ctx.fillStyle = isHovered || isActive ? "#ffffff" : cat.color.replace("rgb", "rgba").replace(")", ", 0.85)");
        
        if (isHovered || isActive || isRelatedToActive) {
          ctx.shadowColor = cat.color;
          ctx.shadowBlur = 12;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadows
      }

      // Step D: Draw Label text underneath the node (using responsive responsive font size)
      ctx.beginPath();
      ctx.font = `500 ${isMobile ? "10px" : (node.isCentral ? "13px" : "11px")} 'JetBrains Mono', monospace`;
      ctx.fillStyle = isHovered || isActive ? "#ffffff" : isRelatedToActive ? "rgba(255, 255, 255, 0.8)" : "#9ca3af";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(node.name, drawX, drawY + renderRadius + 8);
    });

    // Update Floating Tooltip Position
    if (hoveredNode) {
      const tooltipX = hoveredNode.x + parallax.x;
      const tooltipY = hoveredNode.y + parallax.y;
      
      tooltip.style.left = `${tooltipX}px`;
      tooltip.style.top = `${tooltipY}px`;

      // Auto-flip tooltip if node is too close to the top of the canvas bounding box
      if (tooltipY < 130) {
        tooltip.style.transform = "translate(-50%, 25px) scale(1)";
      } else {
        tooltip.style.transform = "translate(-50%, -125%) scale(1)";
      }
    }
  }

  // --- INTERACTION EVENT HANDLERS ---

  // Coordinate normalizer relative to canvas
  function getMouseCoords(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  // Collision detection: Check if mouse is over any node
  function detectNodeAt(x, y) {
    // Parallax correction: mouse positions are checked against real canvas layout coordinates
    // Adjust mouse coords backward against current parallax offset to check collision with actual physics positions
    const adjustedX = x - parallax.x;
    const adjustedY = y - parallax.y;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const dx = adjustedX - node.x;
      const dy = adjustedY - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Add a generous click/hover padding around nodes (12px) to make interactions easier on small touch devices
      if (distance < node.radius + 12) {
        return node;
      }
    }
    return null;
  }

  function handlePointerDown(e) {
    const coords = getMouseCoords(e);
    const node = detectNodeAt(coords.x, coords.y);
    
    if (node) {
      draggedNode = node;
      activeNode = node;
      
      // Spawn fast, neon zipping pulses towards all related companion nodes
      spawnPulses(node);
      
      // Prevent scrolling on mobile touches when dragging nodes
      if (e.cancelable) e.preventDefault();
    } else {
      // Clear active connection highlight when clicking empty spaces
      activeNode = null;
    }
  }

  function spawnPulses(sourceNode) {
    pulses = []; // Clear current active pulses
    sourceNode.related.forEach(relName => {
      const targetNode = nodes.find(n => n.name.toLowerCase() === relName.toLowerCase());
      if (targetNode) {
        pulses.push({
          fromNode: sourceNode,
          toNode: targetNode,
          progress: 0.0,
          speed: 1.8 + Math.random() * 0.8, // Completes in about 0.4s
          color: categories[sourceNode.category].color
        });
      }
    });
  }

  function handlePointerMove(e) {
    const coords = getMouseCoords(e);
    mouse.rawX = coords.x;
    mouse.rawY = coords.y;
    mouse.isOverCanvas = true;

    if (draggedNode) {
      // Direct drag mapping: Corrected for current parallax offset to match physics frame coordinates
      draggedNode.x = coords.x - parallax.x;
      draggedNode.y = coords.y - parallax.y;
      
      // Keep inside boundary during drag
      const pad = draggedNode.radius + 15;
      draggedNode.x = Math.max(pad, Math.min(width - pad, draggedNode.x));
      draggedNode.y = Math.max(pad, Math.min(height - pad, draggedNode.y));
      
      // Move tooltip along with dragged item
      updateTooltip(draggedNode);
    } else {
      // Hover detection
      const node = detectNodeAt(coords.x, coords.y);
      if (node !== hoveredNode) {
        hoveredNode = node;
        if (node) {
          container.style.cursor = "pointer";
          updateTooltip(node);
          tooltip.classList.add("active");
        } else {
          container.style.cursor = "grab";
          tooltip.classList.remove("active");
        }
      }
    }
  }

  function handlePointerUp() {
    draggedNode = null;
  }

  function updateTooltip(node) {
    document.getElementById("tooltipName").textContent = node.name;
    
    const cat = categories[node.category];
    const catBadge = document.getElementById("tooltipCategory");
    catBadge.textContent = cat.label;
    catBadge.style.backgroundColor = cat.colorHex;
  }

  // --- ATTACH LISTENERS ---
  
  // Mouse Listeners
  container.addEventListener("mouseenter", () => { mouse.isOverCanvas = true; });
  container.addEventListener("mouseleave", () => {
    mouse.isOverCanvas = false;
    hoveredNode = null;
    tooltip.classList.remove("active");
    draggedNode = null;
    container.style.cursor = "grab";
  });
  
  container.addEventListener("mousedown", handlePointerDown);
  window.addEventListener("mousemove", handlePointerMove);
  window.addEventListener("mouseup", handlePointerUp);

  // Touch Listeners
  container.addEventListener("touchstart", (e) => {
    mouse.isOverCanvas = true;
    handlePointerDown(e);
  }, { passive: false });
  
  container.addEventListener("touchmove", (e) => {
    handlePointerMove(e);
  }, { passive: false });
  
  container.addEventListener("touchend", () => {
    handlePointerUp();
  });

  // --- BOOTSTRAP INITIALIZATION ---
  init();
  requestAnimationFrame(tick);
});
