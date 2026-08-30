import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function TechStack() {
  const containerRef = useRef(null);
  const mountRef = useRef(null);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    
    // Deep Space Dark Canvas Background
    scene.background = new THREE.Color(0x040306);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    
    let theta = Math.PI / 4;
    let phi = Math.PI / 3;

    // Calculate required camera distance dynamically so the solar system occupies ~80% of container with safe margins
    function getRequiredCameraRadius(w, h) {
      const aspect = w / h;
      const targetCoverage = 0.80; // 80% viewport coverage (10% safe edge margin)
      const maxOrbitExtent = 21.2; // Outer orbit radius (19.0) + sprite radius & margin (2.2)
      
      const hDist = (maxOrbitExtent * Math.sin(Math.PI / 3) * 2.0) / (0.8284 * targetCoverage);
      const wDist = (maxOrbitExtent * 2.0) / (0.8284 * aspect * targetCoverage);
      
      return Math.max(34, Math.max(hDist, wDist));
    }

    let cameraRadius = getRequiredCameraRadius(width, height);

    function updateCameraPosition() {
      camera.position.x = cameraRadius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = cameraRadius * Math.cos(phi);
      camera.position.z = cameraRadius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    }
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    // Light sources
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xff9a3d, 5.0, 140);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // --- DEEP SPACE STARFIELD BACKGROUND (2800+ MULTI-COLORED STARS) ---
    const starCount = 2800;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0xffffff), // Pure white
      new THREE.Color(0xa5f3fc), // Cyan tint
      new THREE.Color(0xfef08a), // Gold tint
      new THREE.Color(0xddd6fe), // Violet tint
      new THREE.Color(0xffedd5), // Warm Amber
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 55 + Math.random() * 110;
      const u = Math.random();
      const v = Math.random();
      const thetaStar = u * 2.0 * Math.PI;
      const phiStar = Math.acos(2.0 * v - 1.0);

      starPositions[i * 3] = radius * Math.sin(phiStar) * Math.cos(thetaStar);
      starPositions[i * 3 + 1] = radius * Math.sin(phiStar) * Math.sin(thetaStar);
      starPositions[i * 3 + 2] = radius * Math.cos(phiStar);

      const pickedColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i * 3] = pickedColor.r;
      starColors[i * 3 + 1] = pickedColor.g;
      starColors[i * 3 + 2] = pickedColor.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    
    // Custom Canvas Texture for Crisp Soft Round Stars
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 32;
    starCanvas.height = 32;
    const starCtx = starCanvas.getContext('2d');
    const grad = starCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(240, 245, 255, 0.85)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    starCtx.fillStyle = grad;
    starCtx.beginPath();
    starCtx.arc(16, 16, 16, 0, Math.PI * 2);
    starCtx.fill();

    const starTexture = new THREE.CanvasTexture(starCanvas);
    const starMaterial = new THREE.PointsMaterial({
      size: 2.2,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });
    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    // --- SECONDARY FAINT TWINKLING DUST STARFIELD LAYER (1500 STARS) ---
    const dustCount = 1500;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const radius = 70 + Math.random() * 120;
      const u = Math.random();
      const v = Math.random();
      const thetaD = u * 2.0 * Math.PI;
      const phiD = Math.acos(2.0 * v - 1.0);
      dustPositions[i * 3] = radius * Math.sin(phiD) * Math.cos(thetaD);
      dustPositions[i * 3 + 1] = radius * Math.sin(phiD) * Math.sin(thetaD);
      dustPositions[i * 3 + 2] = radius * Math.cos(phiD);
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 1.2,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });
    const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustPoints);

    // --- PROCEDURAL 3D SPIRAL GALAXY (UPPER-LEFT BACKGROUND) ---
    const spiralGalaxyGroup = new THREE.Group();
    spiralGalaxyGroup.position.set(-38, 24, -50);

    const galaxyParticles = 3200;
    const galaxyGeo = new THREE.BufferGeometry();
    const galaxyPos = new Float32Array(galaxyParticles * 3);
    const galaxyCols = new Float32Array(galaxyParticles * 3);

    const galaxyColorCore = new THREE.Color(0xa855f7); // Glowing Purple
    const galaxyColorArm = new THREE.Color(0x38bdf8);  // Cyan Blue
    const galaxyColorOuter = new THREE.Color(0xf472b6); // Magenta Pink

    const arms = 3;
    for (let i = 0; i < galaxyParticles; i++) {
      const r = Math.pow(Math.random(), 2) * 18;
      const armIndex = i % arms;
      const armAngle = (armIndex * 2 * Math.PI) / arms;
      const spinAngle = r * 0.4;
      const totalAngle = armAngle + spinAngle;

      const randomX = (Math.random() - 0.5) * (18 - r) * 0.3;
      const randomY = (Math.random() - 0.5) * (18 - r) * 0.3;
      const randomZ = (Math.random() - 0.5) * (18 - r) * 0.3;

      galaxyPos[i * 3] = Math.cos(totalAngle) * r + randomX;
      galaxyPos[i * 3 + 1] = randomY;
      galaxyPos[i * 3 + 2] = Math.sin(totalAngle) * r + randomZ;

      const mixedColor = galaxyColorCore.clone();
      if (r < 6) {
        mixedColor.lerp(galaxyColorArm, r / 6);
      } else {
        mixedColor.lerp(galaxyColorOuter, (r - 6) / 12);
      }
      galaxyCols[i * 3] = mixedColor.r;
      galaxyCols[i * 3 + 1] = mixedColor.g;
      galaxyCols[i * 3 + 2] = mixedColor.b;
    }

    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPos, 3));
    galaxyGeo.setAttribute('color', new THREE.BufferAttribute(galaxyCols, 3));

    const galaxyMat = new THREE.PointsMaterial({
      size: 1.6,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const spiralGalaxyMesh = new THREE.Points(galaxyGeo, galaxyMat);
    spiralGalaxyMesh.rotation.x = Math.PI / 3;
    spiralGalaxyMesh.rotation.z = Math.PI / 6;
    spiralGalaxyGroup.add(spiralGalaxyMesh);
    scene.add(spiralGalaxyGroup);

    // --- PROCEDURAL ANDROMEDA / COSMIC NEBULA GALAXY (LOWER-RIGHT BACKGROUND) ---
    const cosmicGalaxyGroup = new THREE.Group();
    cosmicGalaxyGroup.position.set(38, -22, -55);

    const cosmicParticles = 2400;
    const cosmicGeo = new THREE.BufferGeometry();
    const cosmicPos = new Float32Array(cosmicParticles * 3);
    const cosmicCols = new Float32Array(cosmicParticles * 3);

    const cosmicCore = new THREE.Color(0xfbbf24); // Amber Gold
    const cosmicMid = new THREE.Color(0xec4899);  // Vibrant Pink
    const cosmicEdge = new THREE.Color(0x6366f1); // Indigo

    for (let i = 0; i < cosmicParticles; i++) {
      const r = Math.sqrt(Math.random()) * 22;
      const thetaC = Math.random() * Math.PI * 2;

      const spreadY = (Math.random() - 0.5) * 3.5;

      cosmicPos[i * 3] = Math.cos(thetaC) * r * 1.4;
      cosmicPos[i * 3 + 1] = spreadY;
      cosmicPos[i * 3 + 2] = Math.sin(thetaC) * r * 0.8;

      const cColor = cosmicCore.clone();
      if (r < 8) {
        cColor.lerp(cosmicMid, r / 8);
      } else {
        cColor.lerp(cosmicEdge, (r - 8) / 14);
      }
      cosmicCols[i * 3] = cColor.r;
      cosmicCols[i * 3 + 1] = cColor.g;
      cosmicCols[i * 3 + 2] = cColor.b;
    }

    cosmicGeo.setAttribute('position', new THREE.BufferAttribute(cosmicPos, 3));
    cosmicGeo.setAttribute('color', new THREE.BufferAttribute(cosmicCols, 3));

    const cosmicMat = new THREE.PointsMaterial({
      size: 1.5,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });
    const cosmicGalaxyMesh = new THREE.Points(cosmicGeo, cosmicMat);
    cosmicGalaxyMesh.rotation.x = -Math.PI / 4;
    cosmicGalaxyGroup.add(cosmicGalaxyMesh);
    scene.add(cosmicGalaxyGroup);

    // --- CELESTIAL BODY: SUBTLE MOON IN UPPER-LEFT BACKGROUND ---
    const moonGroup = new THREE.Group();
    moonGroup.position.set(-26, 20, -38);

    const moonGeo = new THREE.SphereGeometry(4.0, 32, 32);
    
    // Generate procedurally crisp crater texture for moon
    const moonCanvas = document.createElement('canvas');
    moonCanvas.width = 256;
    moonCanvas.height = 256;
    const mCtx = moonCanvas.getContext('2d');
    mCtx.fillStyle = '#6b7280';
    mCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 40; i++) {
      const cx = Math.random() * 256;
      const cy = Math.random() * 256;
      const cr = 4 + Math.random() * 18;
      const cg = mCtx.createRadialGradient(cx, cy, cr * 0.2, cx, cy, cr);
      cg.addColorStop(0, 'rgba(40, 45, 55, 0.7)');
      cg.addColorStop(0.8, 'rgba(90, 98, 112, 0.4)');
      cg.addColorStop(1, 'rgba(120, 130, 145, 0.1)');
      mCtx.fillStyle = cg;
      mCtx.beginPath();
      mCtx.arc(cx, cy, cr, 0, Math.PI * 2);
      mCtx.fill();
    }
    const moonTex = new THREE.CanvasTexture(moonCanvas);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      color: 0x8a94a6,
      roughness: 0.85,
      metalness: 0.1
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moonMesh);
    scene.add(moonGroup);

    // --- BLACK HOLE SPIRAL VORTEX IN UPPER-RIGHT BACKGROUND ---
    const bhGroup = new THREE.Group();
    bhGroup.position.set(30, 18, -45);

    // Black hole dark core
    const bhCoreGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const bhCoreMat = new THREE.MeshBasicMaterial({ color: 0x010102 });
    const bhCoreMesh = new THREE.Mesh(bhCoreGeo, bhCoreMat);
    bhGroup.add(bhCoreMesh);

    // Procedural Black Hole Spiral Vortex Canvas Texture
    const bhCanvas = document.createElement('canvas');
    bhCanvas.width = 512;
    bhCanvas.height = 512;
    const bhCtx = bhCanvas.getContext('2d');
    bhCtx.fillStyle = 'rgba(1, 1, 2, 0)';
    bhCtx.fillRect(0, 0, 512, 512);

    const bhGrad = bhCtx.createRadialGradient(256, 256, 30, 256, 256, 240);
    bhGrad.addColorStop(0, 'rgba(10, 8, 20, 0.95)');
    bhGrad.addColorStop(0.3, 'rgba(168, 85, 247, 0.35)');
    bhGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.2)');
    bhGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    bhCtx.fillStyle = bhGrad;
    bhCtx.beginPath();
    bhCtx.arc(256, 256, 240, 0, Math.PI * 2);
    bhCtx.fill();

    // Add spiral vortex arms
    bhCtx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
    bhCtx.lineWidth = 14;
    for (let a = 0; a < Math.PI * 6; a += 0.1) {
      const r = a * 12;
      const x = 256 + Math.cos(a) * r;
      const y = 256 + Math.sin(a) * r;
      if (a === 0) bhCtx.beginPath();
      bhCtx.lineTo(x, y);
    }
    bhCtx.stroke();

    const bhTex = new THREE.CanvasTexture(bhCanvas);
    const bhVortexGeo = new THREE.RingGeometry(3.6, 20, 64);
    const bhVortexMat = new THREE.MeshBasicMaterial({
      map: bhTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    const bhVortexMesh = new THREE.Mesh(bhVortexGeo, bhVortexMat);
    bhVortexMesh.rotation.x = Math.PI / 2.3;
    bhVortexMesh.rotation.y = -0.3;
    bhGroup.add(bhVortexMesh);

    scene.add(bhGroup);

    // --- CENTRAL FIERY DEVELOPER SUN SYSTEM (CLEAN GLOBE IN DARK SPACE) ---
    const sunGroup = new THREE.Group();

    // Central Developer Sun Core Mesh
    const sunGeo = new THREE.SphereGeometry(2.4, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xff9a3d,
      emissive: 0xff5722,
      emissiveIntensity: 1.4,
      roughness: 0.2,
      metalness: 0.8
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    scene.add(sunGroup);

    // --- SKILL METADATA & DESCRIPTIONS ---
    const skillDetails = {
      "HTML5": { category: "Frontend", colorHex: "#FFE9A8", desc: "Modern Semantic Markup & Web Accessibility Standards" },
      "CSS3": { category: "Frontend", colorHex: "#FFE9A8", desc: "Responsive Layouts, Custom Properties, Flexbox & Grid Systems" },
      "JavaScript": { category: "Frontend", colorHex: "#FFE9A8", desc: "ES6+ Modern Asynchronous JS Engine & Web APIs" },
      "React.js": { category: "Frontend", colorHex: "#FFE9A8", desc: "Hooks, Context API, Virtual DOM & Modular UI Components" },
      "Vue.js": { category: "Frontend", colorHex: "#FFE9A8", desc: "Vue 3 Composition API, Pinia State & Reactive Templates" },
      "Tailwind CSS": { category: "Frontend", colorHex: "#FFE9A8", desc: "Utility-First CSS Framework & Rapid Design System Architecture" },
      "Bootstrap": { category: "Frontend", colorHex: "#FFE9A8", desc: "Responsive Grid System & UI Component Frameworks" },
      "WordPress": { category: "Frontend", colorHex: "#FFE9A8", desc: "Custom Headless CMS, Theme Development & REST APIs" },
      "Node.js": { category: "Backend", colorHex: "#FF9A3D", desc: "Asynchronous Event-Driven Backend Server Runtime" },
      "Express.js": { category: "Backend", colorHex: "#FF9A3D", desc: "Fast RESTful API Services & Middleware Architecture" },
      "Laravel": { category: "Backend", colorHex: "#FF9A3D", desc: "Eloquent ORM, Blade Templates, Inertia.js & Modular Backends" },
      "PHP": { category: "Backend", colorHex: "#FF9A3D", desc: "Modern Object-Oriented Backend Engineering & Server Logic" },
      "JWT / RBAC": { category: "Backend", colorHex: "#FF9A3D", desc: "Secure JSON Web Tokens & Multi-Role Access Control Systems" },
      "PostgreSQL": { category: "Databases", colorHex: "#FF5722", desc: "Advanced Relational Database Queries, Indexing & JSON Types" },
      "MySQL": { category: "Databases", colorHex: "#FF5722", desc: "Relational Schema Architecture, Index Optimization & Transactions" },
      "MongoDB": { category: "Databases", colorHex: "#FF5722", desc: "NoSQL Document Storage, Aggregations & Flexible Data Models" },
      "Redis": { category: "Databases", colorHex: "#FF5722", desc: "In-Memory Key-Value Cache, Session Storage & Pub/Sub Messaging" },
      "Git": { category: "Tools / Cloud", colorHex: "#a855f7", desc: "Distributed Version Control, Branching & Merge Workflows" },
      "GitHub": { category: "Tools / Cloud", colorHex: "#a855f7", desc: "CI/CD Workflows, Pull Requests & Collaborative Code Review" },
      "Docker": { category: "Tools / Cloud", colorHex: "#a855f7", desc: "Containerization, Multi-Stage Dockerfiles & Compose Networks" },
      "AWS": { category: "Tools / Cloud", colorHex: "#a855f7", desc: "Cloud Deployment, S3 Bucket Assets, EC2 Instances & Infrastructure" }
    };

    // --- OFFICIAL TECHNOLOGY SVG LOGO URLS ---
    const logoPaths = {
      "React.js": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
      "Vue.js": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg",
      "JavaScript": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
      "HTML5": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
      "CSS3": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg",
      "Tailwind CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
      "Bootstrap": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg",
      "WordPress": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/wordpress/wordpress-plain.svg",
      "Laravel": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg",
      "PHP": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg",
      "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
      "Express.js": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg",
      "JWT / RBAC": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/jsonwebtokens.svg",
      "PostgreSQL": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
      "MySQL": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg",
      "Redis": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg",
      "MongoDB": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg",
      "Docker": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
      "Git": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg",
      "GitHub": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg",
      "AWS": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/amazon.svg"
    };

    // Helper: Create Combined Logo Node Texture (VIBRANT BRAND COLORS - NO WHITE OVERLAY)
    function createLogoNodeSprite(skillName, logoImg, colorHex) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.clearRect(0, 0, 128, 128);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Outer Dark Background Disc (Clean Dark Glass - NO white backdrop)
      ctx.fillStyle = 'rgba(10, 8, 14, 0.94)';
      ctx.beginPath();
      ctx.arc(64, 64, 52, 0, Math.PI * 2);
      ctx.fill();

      // Category Glowing Border Ring
      ctx.strokeStyle = colorHex || '#FF9A3D';
      ctx.lineWidth = 3.0;
      ctx.stroke();

      // Draw Crisp Official SVG Logo at 100% Saturation Authentic Brand Colors
      if (logoImg) {
        ctx.globalAlpha = 1.0;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.drawImage(logoImg, 18, 18, 92, 92);
        ctx.shadowBlur = 0;
      } else {
        // Fallback text drawing if image fails to load
        ctx.fillStyle = colorHex || '#FF9A3D';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(skillName.slice(0, 4), 64, 64);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(4.0, 4.0, 1);
      return sprite;
    }

    // --- ORBIT RINGS & STAGGERED ANGLES (PREVENTS NODE COLLISIONS) ---
    const orbitCategories = [
      {
        name: 'Frontend Core',
        colorHex: '#FFE9A8',
        colorNum: 0xffe9a8,
        radius: 5.4,
        speed: 0.008,
        angleOffset: 0,
        skills: ['HTML5', 'CSS3', 'JavaScript', 'React.js']
      },
      {
        name: 'Frontend & Frameworks',
        colorHex: '#FFE9A8',
        colorNum: 0xffe9a8,
        radius: 8.8,
        speed: 0.006,
        angleOffset: Math.PI / 4,
        skills: ['Vue.js', 'Tailwind CSS', 'Bootstrap', 'WordPress']
      },
      {
        name: 'Backend Systems',
        colorHex: '#FF9A3D',
        colorNum: 0xff9a3d,
        radius: 12.2,
        speed: 0.004,
        angleOffset: Math.PI / 5,
        skills: ['Node.js', 'Express.js', 'Laravel', 'PHP', 'JWT / RBAC']
      },
      {
        name: 'Databases',
        colorHex: '#FF5722',
        colorNum: 0xff5722,
        radius: 15.6,
        speed: 0.003,
        angleOffset: Math.PI / 3,
        skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis']
      },
      {
        name: 'Tools & Cloud',
        colorHex: '#a855f7',
        colorNum: 0xa855f7,
        radius: 19.0,
        speed: 0.0015,
        angleOffset: Math.PI / 6,
        skills: ['Git', 'GitHub', 'Docker', 'AWS']
      }
    ];

    const orbitGroups = [];
    const interactiveSprites = [];

    orbitCategories.forEach((cat) => {
      const orbitGroup = new THREE.Group();

      // Draw Orbit Ring Line
      const ringGeo = new THREE.BufferGeometry();
      const points = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const thetaAngle = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(thetaAngle) * cat.radius, 0, Math.sin(thetaAngle) * cat.radius));
      }
      ringGeo.setFromPoints(points);

      const ringMat = new THREE.LineBasicMaterial({
        color: cat.colorNum,
        transparent: true,
        opacity: 0.42
      });
      const ringLine = new THREE.Line(ringGeo, ringMat);
      orbitGroup.add(ringLine);

      // Create Technology Logo Nodes with Staggered Angular Spacing
      const count = cat.skills.length;
      cat.skills.forEach((skillName, idx) => {
        const angle = cat.angleOffset + (idx / count) * Math.PI * 2;
        const px = Math.cos(angle) * cat.radius;
        const pz = Math.sin(angle) * cat.radius;

        const info = skillDetails[skillName] || { category: cat.name, colorHex: cat.colorHex, desc: skillName };

        // Container Node Group on Orbit Path
        const nodeGroup = new THREE.Group();
        nodeGroup.position.set(px, 0, pz);
        nodeGroup.userData = {
          skillName,
          category: info.category,
          colorHex: info.colorHex,
          desc: info.desc,
          ringLine
        };

        // Invisible Raycast Target Sphere
        const hitGeo = new THREE.SphereGeometry(1.6, 8, 8);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitMesh = new THREE.Mesh(hitGeo, hitMat);
        hitMesh.userData = nodeGroup.userData;
        nodeGroup.add(hitMesh);

        // Load SVG Logo & Create Logo Node Sprite
        const logoUrl = logoPaths[skillName];
        if (logoUrl) {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            const logoNodeSprite = createLogoNodeSprite(skillName, img, info.colorHex);
            logoNodeSprite.position.set(0, 0, 0);
            nodeGroup.add(logoNodeSprite);
          };
          img.onerror = () => {
            const logoNodeSprite = createLogoNodeSprite(skillName, null, info.colorHex);
            logoNodeSprite.position.set(0, 0, 0);
            nodeGroup.add(logoNodeSprite);
          };
          img.src = logoUrl;
        }

        orbitGroup.add(nodeGroup);
        interactiveSprites.push(hitMesh);
      });

      scene.add(orbitGroup);
      orbitGroups.push({ group: orbitGroup, speed: cat.speed });
    });

    // --- CONTROLS: INTENTIONAL DRAG-TO-ROTATE (DESKTOP MOUSE & MOBILE TOUCH) ---
    let isDragging = false;
    let previousPos = { x: 0, y: 0 };

    function getPointerCoords(e) {
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    }

    function onPointerDown(e) {
      if (e.type === 'touchstart' || e.button === 0) {
        isDragging = true;
        previousPos = getPointerCoords(e);
      }
    }

    function onPointerMove(e) {
      if (isDragging) {
        const currentPos = getPointerCoords(e);
        const deltaX = currentPos.x - previousPos.x;
        const deltaY = currentPos.y - previousPos.y;

        theta += deltaX * 0.007;
        phi += deltaY * 0.007;

        phi = Math.max(0.08, Math.min(Math.PI - 0.08, phi));
        updateCameraPosition();
        previousPos = currentPos;
      }
    }

    function onPointerUp() {
      isDragging = false;
    }

    // --- RAYCASTER FOR HOVER TOOLTIP BADGES & 2D SCREEN PROJECTION ---
    const raycaster = new THREE.Raycaster();
    const mousePos = new THREE.Vector2();
    let currentHoveredGroup = null;

    function checkRaycast(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;

      mousePos.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mousePos.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mousePos, camera);
      const intersects = raycaster.intersectObjects(interactiveSprites);

      if (intersects.length > 0) {
        const hitGroup = intersects[0].object.parent;
        
        // Calculate 2D Screen Coordinates inside Container
        const worldPos = new THREE.Vector3();
        hitGroup.getWorldPosition(worldPos);
        worldPos.project(camera);

        const screenX = ((worldPos.x + 1) * rect.width) / 2;
        const screenY = ((-worldPos.y + 1) * rect.height) / 2;

        // Clamp screen positions to keep tooltip 100% inside container box
        const clampX = Math.max(85, Math.min(rect.width - 85, screenX));
        const isNearTop = screenY < 90;
        const clampY = isNearTop ? screenY + 54 : screenY - 54;

        if (currentHoveredGroup !== hitGroup) {
          if (currentHoveredGroup && currentHoveredGroup.userData.ringLine) {
            currentHoveredGroup.userData.ringLine.material.opacity = 0.42;
          }
          currentHoveredGroup = hitGroup;
          if (hitGroup.userData.ringLine) {
            hitGroup.userData.ringLine.material.opacity = 0.9;
          }
          mount.style.cursor = 'pointer';
        }

        setHoveredSkill({
          name: hitGroup.userData.skillName,
          category: hitGroup.userData.category,
          colorHex: hitGroup.userData.colorHex,
          desc: hitGroup.userData.desc,
          screenX: clampX,
          screenY: clampY,
          isBelow: isNearTop
        });
      } else {
        if (currentHoveredGroup) {
          if (currentHoveredGroup.userData.ringLine) {
            currentHoveredGroup.userData.ringLine.material.opacity = 0.42;
          }
          currentHoveredGroup = null;
          setHoveredSkill(null);
          mount.style.cursor = 'grab';
        }
      }
    }

    function handleNodeClick() {
      if (currentHoveredGroup) {
        setSelectedSkill({
          name: currentHoveredGroup.userData.skillName,
          category: currentHoveredGroup.userData.category,
          colorHex: currentHoveredGroup.userData.colorHex,
          desc: currentHoveredGroup.userData.desc
        });
      }
    }

    mount.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    mount.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    mount.addEventListener('mousemove', checkRaycast);
    mount.addEventListener('click', handleNodeClick);

    // --- ANIMATION TICK LOOP WITH HIGH-PRECISION TIMING ---
    let animFrameId;
    const startTime = performance.now();

    function animate() {
      animFrameId = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - startTime) / 1000;

      // Rotate Moon, Black Hole Vortex & Background Galaxies
      bhVortexMesh.rotation.z = -elapsedTime * 0.05;
      moonGroup.rotation.y = elapsedTime * 0.02;
      spiralGalaxyGroup.rotation.z = elapsedTime * 0.035;
      cosmicGalaxyGroup.rotation.y = elapsedTime * 0.025;

      // Rotate Orbit Rings
      orbitGroups.forEach((item) => {
        item.group.rotation.y += item.speed;
      });

      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      if (!mount) return;
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      cameraRadius = getRequiredCameraRadius(width, height);
      camera.updateProjectionMatrix();
      updateCameraPosition();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      mount.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      mount.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      mount.removeEventListener('mousemove', checkRaycast);
      mount.removeEventListener('click', handleNodeClick);
      window.removeEventListener('resize', handleResize);

      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <section id="skills" className="py-28 pt-32 relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="mono-text text-xs uppercase tracking-widest text-[#FF9A3D] mb-2 font-bold">
              04 &mdash; Skills
            </div>
            <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-[#F5F1EC] tracking-tight">
              3D Skill Solar System
            </h2>
            <p className="text-[#9A9088] text-sm mt-2 max-w-xl leading-relaxed">
              Explore my technical stack through an interactive 3D skill system. Drag to rotate and hover any skill node.
            </p>
          </div>

          {/* Cooling Color Scale Legend */}
          <div className="glass p-3 rounded-xl flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFE9A8] shadow-[0_0_8px_#FFE9A8]"></span>
              <span className="text-[#F5F1EC]">Frontend</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF9A3D] shadow-[0_0_8px_#FF9A3D]"></span>
              <span className="text-[#F5F1EC]">Backend</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722] shadow-[0_0_8px_#FF5722]"></span>
              <span className="text-[#F5F1EC]">Databases</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] shadow-[0_0_8px_#a855f7]"></span>
              <span className="text-[#F5F1EC]">Tools / Cloud</span>
            </div>
          </div>
        </div>

        {/* Three.js Solar System Container */}
        <div
          ref={containerRef}
          className="glass relative w-full h-[620px] sm:h-[700px] lg:h-[750px] rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing border border-white/10 bg-[#040306]"
        >
          {/* Mount Three.js WebGL Canvas */}
          <div ref={mountRef} className="w-full h-full block" />

          {/* Sleek Floating Glass Tooltip Card on Node Hover */}
          {hoveredSkill && (
            <div
              className="absolute z-30 pointer-events-none -translate-x-1/2 transition-all duration-150 ease-out"
              style={{ left: `${hoveredSkill.screenX}px`, top: `${hoveredSkill.screenY}px` }}
            >
              <div
                className="glass px-4 py-2.5 rounded-xl border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.88)] bg-[#0D0B0A]/95 backdrop-blur-md flex flex-col gap-1 text-xs font-sora text-[#F5F1EC] min-w-[200px] max-w-[260px] animate-fade-in"
                style={{ borderColor: `${hoveredSkill.colorHex}66` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-sm text-[#F5F1EC]">{hoveredSkill.name}</span>
                  <span
                    className="font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-white/10"
                    style={{ color: hoveredSkill.colorHex }}
                  >
                    {hoveredSkill.category}
                  </span>
                </div>
                <p className="text-[11px] text-[#9A9088] leading-tight font-sans">
                  {hoveredSkill.desc}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
