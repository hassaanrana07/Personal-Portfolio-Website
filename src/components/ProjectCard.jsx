import React, { useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import { ArrowUpRight, ExternalLink, Github, Sparkles, BookOpen, Layers } from 'lucide-react';
import SocialPreview from './project-previews/SocialPreview';
import CmsPreview from './project-previews/CmsPreview';
import ProjectManagementPreview from './project-previews/ProjectManagementPreview';
import AirQualityPreview from './project-previews/AirQualityPreview';
import ConstructionPreview from './project-previews/ConstructionPreview';
import RealEstatePreview from './project-previews/RealEstatePreview';

export default function ProjectCard({ project, index, totalCards, progress, range, targetScale, onOpenCaseStudySlug }) {
  const scale = useTransform(progress, range, [1, targetScale]);
  const [viewMode, setViewMode] = useState('image'); // 'image' or 'interactive'
  const [imgError, setImgError] = useState(false);

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

  const primaryUrl = project.live || project.github;
  const primaryLabel = project.live ? 'Live Demo' : 'View Code';
  const PrimaryIcon = project.live ? ExternalLink : Github;

  const accentColor = project.accentColor || '#FF9A3D';

  return (
    <div className="sticky top-20 md:top-24 flex items-center justify-center mb-16 px-2">
      <motion.div
        style={{ scale }}
        className="w-full max-w-6xl bg-[#0d0b0a]/95 backdrop-blur-xl border border-white/15 hover:border-white/30 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden relative group transition-all duration-300 hover:-translate-y-1"
      >
        {/* Top Accent Gradient Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 opacity-80 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, ${accentColor}, transparent 80%)` }}
        />

        {/* MAIN CARD CONTENT GRID: 2 COLUMNS (45% LEFT / 55% RIGHT) ON DESKTOP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT COLUMN (5 COLS / 45%) — PROJECT METADATA & INFORMATION */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Top Row: Featured Badge + Large Project Number */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="font-sora font-black text-[clamp(2.5rem,6vw,76px)] leading-none select-none tracking-tight"
                  style={{ color: accentColor }}
                >
                  {project.number}
                </span>

                {project.isFeatured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 text-[#F5F1EC] border border-white/20">
                    <Sparkles className="w-3 h-3 text-[#FFE9A8]" />
                    Featured
                  </span>
                )}
              </div>

              {/* Category Pill Badge */}
              <span
                className="px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider border bg-black/40"
                style={{ color: accentColor, borderColor: `${accentColor}44` }}
              >
                {project.category}
              </span>
            </div>

            {/* Project Name & Subtitle */}
            <div>
              <h3 className="font-sora text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F5F1EC] tracking-tight uppercase group-hover:text-white transition-colors">
                {project.name}
              </h3>
              <p className="font-mono text-xs text-[#9A9088] mt-1.5 font-medium">
                {project.subtitle}
              </p>
            </div>

            {/* Concise Description (Max 3 lines, high contrast) */}
            <p className="text-xs sm:text-sm text-[#B5AEA8] leading-relaxed font-sans line-clamp-3">
              {project.description}
            </p>

            {/* Technology Stack Pills */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8a8a8a] font-bold block">
                TECHNOLOGY STACK
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {(project.technologies || []).map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-[11px] font-mono font-medium rounded-lg bg-white/5 border border-white/10 text-[#F5F1EC] group-hover:border-white/20 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons: Primary Link & Case Study */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {primaryUrl && (
                <a
                  href={primaryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-[#0D0B0A] transition-all transform active:scale-95 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  <PrimaryIcon className="w-4 h-4" />
                  <span>{primaryLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}

              {project.github && project.live && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider border border-white/20 text-[#F5F1EC] hover:bg-white/10 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              )}

              <button
                onClick={() => onOpenCaseStudySlug && onOpenCaseStudySlug(project.slug)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider border border-white/20 text-[#F5F1EC] hover:bg-white/10 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#FF9A3D]" />
                <span>Case Study</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN (7 COLS / 55%) — macOS DARK BROWSER MOCKUP WITH REFERENCE IMAGE */}
          <div className="lg:col-span-7">
            <div
              className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 bg-[#08080a] relative group/preview shadow-2xl transition-all duration-500 hover:scale-[1.02] flex flex-col"
            >
              {/* macOS Window Top Control Bar */}
              <div className="bg-[#121014] border-b border-white/10 px-4 py-2.5 flex items-center justify-between z-20 relative">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-sm" />
                </div>
                <div className="bg-[#040306] border border-white/10 rounded-md px-3 py-1 text-[11px] font-mono text-[#8a8a8a] max-w-[200px] sm:max-w-[280px] truncate text-center font-medium">
                  https://{project.slug}.dev/app
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewMode(viewMode === 'image' ? 'interactive' : 'image');
                    }}
                    className="p-1 rounded text-[10px] font-mono font-bold uppercase text-[#8a8a8a] hover:text-[#F5F1EC] hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Toggle Reference Image / Live UI"
                  >
                    <Layers className="w-3 h-3" />
                    <span className="hidden sm:inline">{viewMode === 'image' && !imgError ? 'Reference' : 'Interactive'}</span>
                  </button>
                </div>
              </div>

              {/* Main Preview Container Viewport */}
              <div
                className="w-full h-[320px] sm:h-[380px] lg:h-[420px] relative overflow-hidden cursor-pointer"
                onClick={() => onOpenCaseStudySlug && onOpenCaseStudySlug(project.slug)}
              >
                {viewMode === 'image' && !imgError && project.image ? (
                  /* High-Resolution Reference Screenshot Image */
                  <div className="w-full h-full relative overflow-hidden bg-[#040306]">
                    <img
                      src={project.image}
                      alt={`${project.name} Reference Screenshot`}
                      className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover/preview:scale-105 filter brightness-90 group-hover/preview:brightness-105"
                      onError={() => setImgError(true)}
                      loading="lazy"
                    />

                    {/* Gradient Overlay for Vignette effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                    {/* Floating UI Category Badge overlay */}
                    <div className="absolute top-4 right-4 bg-[#0D0B0A]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-[10px] font-mono font-bold text-[#F5F1EC] flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                      <span>HD MOCKUP PREVIEW</span>
                    </div>
                  </div>
                ) : (
                  /* Interactive UI Render Preview Component */
                  <div className="w-full h-full transform transition-transform duration-700 ease-out group-hover/preview:scale-[1.02]">
                    {renderMainPreview()}
                  </div>
                )}

                {/* Hover Dark Gradient Overlay with View Action Pill */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-end justify-between p-6 z-10">
                  <span className="font-mono text-xs text-[#F5F1EC] font-bold">
                    {project.name} &mdash; {project.category}
                  </span>

                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider text-[#0D0B0A] shadow-xl transform translate-y-2 group-hover/preview:translate-y-0 transition-all duration-300"
                    style={{ backgroundColor: accentColor }}
                  >
                    <span>Open Case Study</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
