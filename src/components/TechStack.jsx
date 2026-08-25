import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';
import { handleGlassMouseMove, handleGlassMouseLeave } from '../utils/useGlassTilt';

export default function TechStack() {
  const containerRef = useRef(null);
  const mountRef = useRef(null);
  const [hoveredSkill, setHoveredSkill] = useState(null);

  // Camera zoom control ref functions
  const zoomInRef = useRef(() => {});
  const zoomOutRef = useRef(() => {});
  const resetCameraRef = useRef(() => {});

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    
    // Initial camera position
    let cameraRadius = 34;
    let theta = Math.PI / 4;
    let phi = Math.PI / 3;

    function updateCameraPosition() {
      camera.position.x = cameraRadius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = cameraRadius * Math.cos(phi);
      camera.position.z = cameraRadius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    }
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // Light sources
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xff9a3d, 3.5, 100);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // --- SUN (CENTER DEVELOPER CORE) ---
    const sunGroup = new THREE.Group();
    const sunGeo = new THREE.SphereGeometry(2.4, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xff9a3d,
      emissive: 0xff5722,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.8
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    // Sun Glow Halo Mesh
    const glowGeo = new THREE.SphereGeometry(2.9, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffc107,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    sunGroup.add(glowMesh);

    scene.add(sunGroup);

    // Helper: Create Text Billboard Sprite
    function createTextSprite(text, textColorHex = '#F5F1EC') {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 256, 64);
      ctx.font = 'Bold 22px "JetBrains Mono", monospace';
      ctx.fillStyle = textColorHex;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 32);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(4.2, 1.05, 1);
      return sprite;
    }

    // Sun Title Billboard Sprite
    const sunSprite = createTextSprite("Core Developer", "#FFC107");
    sunSprite.position.set(0, 3.4, 0);
    sunGroup.add(sunSprite);

    // --- OFFICIAL TECHNOLOGY SVG LOGO URLS ---
    const logoPaths = {
      "React.js": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
      "Vue.js 3": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg",
      "JavaScript": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
      "CSS3": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg",
      "Tailwind CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
      "Laravel 12": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg",
      "PHP": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg",
      "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
      "Express.js": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg",
      "PostgreSQL": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
      "MySQL": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg",
      "Redis": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg",
      "MongoDB": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg",
      "Docker": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
      "Git / GitHub": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg",
      "Vite": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/vite.svg",
      "Vercel": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/vercel.svg"
    };

    // Helper: Create Combined Logo + Name Texture (CRISP CONTRAST - LOW GLASS FROST)
    function createLogoNodeSprite(skillName, logoImg, colorHex) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 256, 180);

      // Draw High-Contrast Background Circle under Logo
      ctx.fillStyle = 'rgba(23, 19, 16, 0.75)';
      ctx.beginPath();
      ctx.arc(128, 58, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colorHex || '#FF9A3D';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Crisp Official SVG Logo at Center (80x80)
      if (logoImg) {
        ctx.globalAlpha = 1.0;
        ctx.drawImage(logoImg, 88, 18, 80, 80);
      }

      // Draw Technology Name Text Directly Below Logo
      ctx.font = 'Bold 20px "JetBrains Mono", monospace';
      ctx.fillStyle = colorHex || '#F5F1EC';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.shadowColor = '#0D0B0A';
      ctx.shadowBlur = 6;
      ctx.fillText(skillName, 128, 116);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(5.2, 3.65, 1);
      return sprite;
    }

    // --- ORBIT RINGS & PLANET SYSTEMS ---
    const orbitCategories = [
      {
        name: 'Frontend',
        colorHex: '#FFE9A8',
        colorNum: 0xffe9a8,
        radius: 7.2,
        speed: 0.008,
        skills: ['React.js', 'Vue.js 3', 'JavaScript', 'CSS3', 'Tailwind CSS']
      },
      {
        name: 'Backend',
        colorHex: '#FF9A3D',
        colorNum: 0xff9a3d,
        radius: 11.4,
        speed: 0.005,
        skills: ['Laravel 12', 'PHP', 'Node.js', 'Express.js']
      },
      {
        name: 'Databases',
        colorHex: '#FF5722',
        colorNum: 0xff5722,
        radius: 15.6,
        speed: 0.003,
        skills: ['PostgreSQL', 'MySQL', 'Redis', 'MongoDB']
      },
      {
        name: 'Tools & Cloud',
        colorHex: '#C43A1F',
        colorNum: 0xc43a1f,
        radius: 19.8,
        speed: 0.0015,
        skills: ['Docker', 'Git / GitHub', 'Vite', 'Vercel']
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
        opacity: 0.35
      });
      const ringLine = new THREE.Line(ringGeo, ringMat);
      orbitGroup.add(ringLine);

      // Create Technology Logo Nodes
      const count = cat.skills.length;
      cat.skills.forEach((skillName, idx) => {
        const angle = (idx / count) * Math.PI * 2;
        const px = Math.cos(angle) * cat.radius;
        const pz = Math.sin(angle) * cat.radius;

        // Container Node Group on Orbit Path
        const nodeGroup = new THREE.Group();
        nodeGroup.position.set(px, 0, pz);
        nodeGroup.userData = {
          skillName,
          category: cat.name,
          colorHex: cat.colorHex
        };

        // Invisible Raycast Target Sphere
        const hitGeo = new THREE.SphereGeometry(1.2, 8, 8);
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
            const logoNodeSprite = createLogoNodeSprite(skillName, img, cat.colorHex);
            logoNodeSprite.position.set(0, 0, 0);
            nodeGroup.add(logoNodeSprite);
          };
          img.src = logoUrl;
        } else {
          const textSprite = createTextSprite(skillName, cat.colorHex);
          textSprite.position.set(0, 0, 0);
          nodeGroup.add(textSprite);
        }

        orbitGroup.add(nodeGroup);
        interactiveSprites.push(hitMesh);
      });

      scene.add(orbitGroup);
      orbitGroups.push({ group: orbitGroup, speed: cat.speed });
    });

    // --- CONTROLS: ORBIT CAMERA & ZOOM ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    function onMouseDown(e) {
      if (e.button === 0) {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    }

    function onMouseMove(e) {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        theta -= deltaX * 0.008;
        phi -= deltaY * 0.008;

        phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
        updateCameraPosition();
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    }

    function onMouseUp() {
      isDragging = false;
    }

    function onWheel(e) {
      e.preventDefault();
      cameraRadius += e.deltaY * 0.03;
      cameraRadius = Math.max(12, Math.min(55, cameraRadius));
      updateCameraPosition();
    }

    zoomInRef.current = () => {
      cameraRadius = Math.max(12, cameraRadius - 5);
      updateCameraPosition();
    };

    zoomOutRef.current = () => {
      cameraRadius = Math.min(55, cameraRadius + 5);
      updateCameraPosition();
    };

    resetCameraRef.current = () => {
      cameraRadius = 34;
      theta = Math.PI / 4;
      phi = Math.PI / 3;
      updateCameraPosition();
    };

    // --- RAYCASTER FOR LOGO NODE HOVER TOOLTIPS ---
    const raycaster = new THREE.Raycaster();
    const mousePos = new THREE.Vector2();
    let currentHoveredGroup = null;

    function checkRaycast(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mousePos, camera);
      const intersects = raycaster.intersectObjects(interactiveSprites);

      if (intersects.length > 0) {
        const hitGroup = intersects[0].object.parent;
        if (currentHoveredGroup !== hitGroup) {
          if (currentHoveredGroup) {
            currentHoveredGroup.scale.set(1, 1, 1);
          }
          currentHoveredGroup = hitGroup;
          hitGroup.scale.set(1.35, 1.35, 1.35);
          setHoveredSkill({
            name: hitGroup.userData.skillName,
            category: hitGroup.userData.category,
            colorHex: hitGroup.userData.colorHex
          });
          mount.style.cursor = 'pointer';
        }
      } else {
        if (currentHoveredGroup) {
          currentHoveredGroup.scale.set(1, 1, 1);
          currentHoveredGroup = null;
          setHoveredSkill(null);
          mount.style.cursor = 'grab';
        }
      }
    }

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    mount.addEventListener('wheel', onWheel, { passive: false });
    mount.addEventListener('mousemove', checkRaycast);

    // --- ANIMATION TICK LOOP ---
    let animFrameId;
    let clock = new THREE.Clock();

    function animate() {
      animFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Sun pulse animation
      const sunPulse = 1 + Math.sin(elapsedTime * 2) * 0.04;
      sunMesh.scale.set(sunPulse, sunPulse, sunPulse);
      glowMesh.scale.set(sunPulse, sunPulse, sunPulse);

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
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      mount.removeEventListener('wheel', onWheel);
      mount.removeEventListener('mousemove', checkRaycast);
      window.removeEventListener('resize', handleResize);

      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <section id="skills" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="mono-text text-xs uppercase tracking-widest text-[#FF9A3D] mb-2 font-bold">
              03 &mdash; Skills
            </div>
            <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-[#F5F1EC] tracking-tight">
              3D Skill Solar System
            </h2>
            <p className="text-[#9A9088] text-sm mt-2 max-w-xl leading-relaxed">
              Orbital planetary system featuring high-definition SVG technology logos. Drag to orbit the camera, scroll to zoom, and hover any skill node.
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
              <span className="w-2.5 h-2.5 rounded-full bg-[#C43A1F] shadow-[0_0_8px_#C43A1F]"></span>
              <span className="text-[#F5F1EC]">Tools/Cloud</span>
            </div>
          </div>
        </div>

        {/* Three.js Solar System Container */}
        <div
          ref={containerRef}
          className="glass relative w-full h-[580px] sm:h-[650px] rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing border border-white/10"
          onMouseMove={handleGlassMouseMove}
          onMouseLeave={handleGlassMouseLeave}
        >
          {/* Mount Three.js WebGL Canvas */}
          <div ref={mountRef} className="w-full h-full block" />

          {/* Hover Floating Glass Tooltip */}
          {hoveredSkill && (
            <div className="absolute top-6 left-6 glass px-4 py-2.5 pointer-events-none flex items-center gap-2 border border-white/20 animate-fade-in z-20 bg-[#0D0B0A]/90 backdrop-blur-md">
              <Info className="w-4 h-4 text-[#FF9A3D]" />
              <div className="text-xs">
                <span className="font-sora font-bold text-[#F5F1EC] block">{hoveredSkill.name}</span>
                <span className="font-mono text-[10px] uppercase font-bold" style={{ color: hoveredSkill.colorHex }}>
                  {hoveredSkill.category} Orbit
                </span>
              </div>
            </div>
          )}

          {/* Zoom Controls Overlay */}
          <div className="absolute bottom-6 right-6 flex items-center gap-2 z-20">
            <button
              onClick={() => zoomInRef.current()}
              className="glass-btn w-10 h-10 flex items-center justify-center text-[#F5F1EC]"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => zoomOutRef.current()}
              className="glass-btn w-10 h-10 flex items-center justify-center text-[#F5F1EC]"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => resetCameraRef.current()}
              className="glass-btn w-10 h-10 flex items-center justify-center text-[#F5F1EC]"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
