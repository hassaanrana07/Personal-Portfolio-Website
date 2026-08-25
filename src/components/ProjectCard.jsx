import React from 'react';
import { motion, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import SocialPreview from './project-previews/SocialPreview';
import CmsPreview from './project-previews/CmsPreview';
import ProjectManagementPreview from './project-previews/ProjectManagementPreview';
import AirQualityPreview from './project-previews/AirQualityPreview';
import ConstructionPreview from './project-previews/ConstructionPreview';
import RealEstatePreview from './project-previews/RealEstatePreview';

export default function ProjectCard({ project, index, totalCards, progress, range, targetScale, onOpenCaseStudySlug }) {
  // Compute depth scale reduction as user scrolls past card
  const scale = useTransform(progress, range, [1, targetScale]);

  const renderMainPreview = () => {
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

  const actionUrl = project.liveUrl || project.github;
  const actionLabel = project.liveUrl ? 'LIVE PROJECT' : 'VIEW PROJECT';

  return (
    <div className="sticky top-24 md:top-32 flex items-center justify-center mb-16">
      <motion.div
        style={{ scale }}
        className="w-full max-w-6xl bg-[#0C0C0C] border-2 border-[#D7E2EA] rounded-[40px] sm:rounded-[50px] md:rounded-[60px] p-4 sm:p-6 md:p-8 shadow-2xl min-h-[85vh] flex flex-col justify-between overflow-hidden relative"
      >
        {/* CARD HEADER */}
        <div className="space-y-6">
          
          {/* Top Row: Large Number & Action Button */}
          <div className="flex items-start justify-between gap-4 border-b border-[#D7E2EA]/20 pb-4">
            
            {/* Number & Type / Name */}
            <div className="flex items-baseline gap-4 sm:gap-6 flex-wrap">
              <span className="font-sora font-black text-[#D7E2EA] text-[clamp(3rem,10vw,140px)] leading-none select-none">
                {project.number}
              </span>

              <div className="space-y-1">
                <span className="font-mono text-xs uppercase tracking-widest text-[#8a8a8a] font-bold block">
                  {project.type}
                </span>
                <h3 className="font-sora text-2xl sm:text-4xl font-extrabold text-[#f2f2f0] tracking-tight uppercase">
                  {project.name}
                </h3>
              </div>
            </div>

            {/* Action Pill Button (LIVE PROJECT or VIEW PROJECT) */}
            {actionUrl && (
              <a
                href={actionUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border-2 border-[#D7E2EA] text-[#D7E2EA] hover:bg-[#D7E2EA]/10 px-5 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-widest transition-colors flex-shrink-0"
              >
                <span>{actionLabel}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* 2-3 Line Description */}
          <p className="text-xs sm:text-sm text-[#b8b8b5] leading-relaxed max-w-3xl font-sans">
            {project.description}
          </p>

          {/* Technology Stack Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
            {(project.technologies || []).map((tech, idx) => (
              <span
                key={idx}
                className="border border-[#D7E2EA]/40 px-3 py-1 text-[11px] text-[#D7E2EA] font-mono rounded-full bg-[#161616]"
              >
                {tech}
              </span>
            ))}
          </div>

        </div>

        {/* PROJECT VISUAL AREA (40% Left / 60% Right Composition on Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6 items-stretch flex-1">
          
          {/* Left Column (40% / 5 cols) — Stacked Preview Sub-Frames */}
          <div className="hidden md:flex md:col-span-5 flex-col gap-4">
            <div className="flex-1 bg-[#161616] border border-[#D7E2EA]/20 rounded-[30px] sm:rounded-[40px] overflow-hidden relative group hover:scale-[1.01] transition-transform duration-500 p-4 flex flex-col justify-between">
              <div className="font-mono text-[10px] uppercase text-[#8a8a8a] tracking-wider">SYSTEM ARCHITECTURE</div>
              <div className="text-xs font-mono text-[#f2f2f0] font-bold">{project.subtitle}</div>
              <div className="text-[11px] font-mono text-[#8a8a8a]">{project.category}</div>
            </div>

            <div className="flex-1 bg-[#161616] border border-[#D7E2EA]/20 rounded-[30px] sm:rounded-[40px] overflow-hidden relative group hover:scale-[1.01] transition-transform duration-500 p-4 flex items-center justify-between">
              <span className="font-mono text-xs text-[#D7E2EA] font-bold">Read Case Study Details</span>
              <button
                onClick={() => onOpenCaseStudySlug && onOpenCaseStudySlug(project.slug)}
                className="text-[#f2f2f0] hover:text-[#8a8a8a] text-xs font-mono font-bold underline cursor-pointer"
              >
                Case Study &rarr;
              </button>
            </div>
          </div>

          {/* Right Column (60% / 7 cols) — Main Tall Project Screenshot Frame */}
          <div className="md:col-span-7 h-[280px] sm:h-[360px] md:h-auto border border-[#D7E2EA]/30 bg-[#0f0f0f] rounded-[30px] sm:rounded-[40px] md:rounded-[50px] overflow-hidden relative shadow-inner group hover:scale-[1.01] transition-transform duration-500">
            {renderMainPreview()}
          </div>

        </div>

      </motion.div>
    </div>
  );
}
