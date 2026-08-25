import React, { useState } from 'react';
import { Github, ArrowUpRight } from 'lucide-react';
import SocialPreview from './project-previews/SocialPreview';
import CmsPreview from './project-previews/CmsPreview';
import ProjectManagementPreview from './project-previews/ProjectManagementPreview';
import AirQualityPreview from './project-previews/AirQualityPreview';
import ConstructionPreview from './project-previews/ConstructionPreview';
import RealEstatePreview from './project-previews/RealEstatePreview';

export default function ProjectShowcase({ project, index, total, onOpenCaseStudy }) {
  const [hoveredTech, setHoveredTech] = useState(null);

  if (!project) return null;

  const renderPreviewComponent = () => {
    switch (project.preview) {
      case 'social':
        return <SocialPreview />;
      case 'cms':
        return <CmsPreview />;
      case 'management':
        return <ProjectManagementPreview />;
      case 'airquality':
        return <AirQualityPreview />;
      case 'construction':
        return <ConstructionPreview />;
      case 'realestate':
        return <RealEstatePreview />;
      default:
        return <ConstructionPreview />;
    }
  };

  // Map technology names to official SVG icons
  const techLogos = {
    "React": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
    "Vue": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg",
    "TypeScript": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
    "Laravel 12": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg",
    "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
    "Express": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg",
    "MySQL": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg",
    "PostgreSQL": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
    "MongoDB": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg",
    "Tailwind CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
    "WebSockets": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/socketio/socketio-original.svg",
    "Socket.IO": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/socketio/socketio-original.svg",
    "Redis": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg",
    "Inertia.js": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg",
    "Chart.js": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/chartdotjs.svg",
    "Stripe": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/stripe.svg"
  };

  return (
    <div className="w-full bg-[#161616] p-6 sm:p-10 border border-[#f2f2f0]/15 text-[#f2f2f0] shadow-2xl flex flex-col justify-between max-h-[84vh] overflow-y-auto">
      
      {/* Top Header: Project Counter */}
      <div className="flex items-center justify-between font-mono text-xs text-[#8a8a8a] pb-3 border-b border-[#f2f2f0]/10 flex-shrink-0">
        <span className="uppercase tracking-widest text-[#f2f2f0] font-bold">
          PROJECT {project.number || "01"}
        </span>
        <span>
          {project.number || "01"} / 0{total}
        </span>
      </div>

      {/* Middle Grid: Large Visual Left/Top, Information Right/Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-4 items-center">
        
        {/* Large Visual Preview Box (Dominant Frame) */}
        <div className="lg:col-span-7 h-[260px] sm:h-[340px] border border-[#f2f2f0]/15 bg-[#0f0f0f] overflow-hidden relative shadow-inner">
          {renderPreviewComponent()}
        </div>

        {/* Project Information Side */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <h3 className="font-sora text-2xl sm:text-4xl font-extrabold text-[#f2f2f0] tracking-tight">
              {project.name}
            </h3>
            <p className="font-mono text-xs sm:text-sm text-[#b8b8b5] mt-1">
              {project.subtitle}
            </p>
          </div>

          {/* 4–5 Line Detailed Technical Description */}
          <p className="text-xs sm:text-sm text-[#b8b8b5] leading-relaxed">
            {project.description}
          </p>

          {/* Technology Logos & Tooltips */}
          <div className="pt-3 border-t border-[#f2f2f0]/10 font-mono text-xs space-y-2">
            <div className="text-[#8a8a8a] uppercase text-[10px] tracking-wider font-bold">
              Tech Stack & Architectural Components
            </div>
            
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {(project.technologies || []).map((tech, idx) => {
                const logoUrl = techLogos[tech];
                return (
                  <div
                    key={idx}
                    className="relative group cursor-pointer flex items-center gap-1.5 border border-white/10 px-2.5 py-1 rounded bg-[#0f0f0f] opacity-75 hover:opacity-100 transition-all hover:scale-105"
                    onMouseEnter={() => setHoveredTech(tech)}
                    onMouseLeave={() => setHoveredTech(null)}
                  >
                    {logoUrl ? (
                      <img src={logoUrl} alt={tech} className="w-4 h-4 object-contain filter grayscale contrast-125 hover:grayscale-0 transition-all" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#f2f2f0]"></span>
                    )}
                    <span className="text-[11px] text-[#f2f2f0]">{tech}</span>

                    {/* Tooltip */}
                    {hoveredTech === tech && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0f0f0f] text-[#f2f2f0] border border-white/20 text-[10px] px-2 py-0.5 whitespace-nowrap z-30 shadow-lg font-mono pointer-events-none">
                        {tech}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Actions Bar (GitHub & View Case Study ONLY - No static Next preview) */}
      <div className="flex items-center gap-6 pt-3 border-t border-[#f2f2f0]/10 font-mono text-xs flex-shrink-0">
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="text-[#f2f2f0] hover:text-[#8a8a8a] transition-colors font-bold flex items-center gap-1.5 border border-white/15 px-4 py-2 bg-[#0f0f0f]"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub &rarr;</span>
          </a>
        )}

        <button
          onClick={() => onOpenCaseStudy(project)}
          className="text-[#f2f2f0] hover:text-[#8a8a8a] transition-colors font-bold flex items-center gap-1.5 border border-white/15 px-4 py-2 bg-[#0f0f0f] cursor-pointer"
        >
          <span>View Case Study &rarr;</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
