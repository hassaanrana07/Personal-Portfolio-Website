import React from 'react';
import { ArrowDownRight, FileText, Mail } from 'lucide-react';
import { scrollToSection } from '../utils/scrollToSection';
import { usePortfolioData } from '../hooks/usePortfolioData';
import heroPortraitCutout from '../assets/hero-portrait-cutout.png';

export default function Hero() {
  const { profile } = usePortfolioData();

  const fullName = profile?.fullName || 'Hassaan Ali Akbar';
  const title = profile?.title || 'Full Stack Developer';
  const tagline = profile?.tagline || 'Creative Problem Solver';
  const headline = profile?.headline || 'Building Scalable Web Systems';
  const location = profile?.location || 'Pakistan';
  const statusText = profile?.statusText || 'Available for opportunities';
  const rawResumeUrl = profile?.resumeUrl || profile?.resume_url || '/Hassaan Ali Akbar Resume.pdf';
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const resumeUrl = (rawResumeUrl.startsWith('http://') || rawResumeUrl.startsWith('https://'))
    ? rawResumeUrl
    : rawResumeUrl.startsWith('/uploads')
      ? `${apiBase}${rawResumeUrl}`
      : rawResumeUrl;

  const locationText = location.toLowerCase().includes('pakistan') || location.toLowerCase().includes('based in')
    ? (location.toLowerCase().startsWith('based in') ? location : `Based in ${location}`)
    : `Based in ${location}`;

  return (
    <section
      id="home"
      className="relative min-h-[100dvh] md:h-[100dvh] w-full overflow-hidden bg-[#0f0f0f] text-[#f2f2f0] flex flex-col justify-center md:justify-between pt-12 xs:pt-14 sm:pt-18 md:pt-24 pb-3 sm:pb-5 md:pb-6 select-none gap-3 xs:gap-4 md:gap-0"
    >
      {/* --- LAYER 10: CONTINUOUS HORIZONTAL MARQUEE BACKGROUND --- */}
      {/* Responsively covers shoulder width on mobile/tablet, full-bleed at neck-to-shoulder level on desktop */}
      <div className="absolute top-[38%] sm:top-[40%] md:top-[46%] left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 -translate-y-1/2 flex items-center justify-center md:justify-start overflow-hidden z-10 select-none pointer-events-none w-[240px] sm:w-[330px] md:w-full md:inset-x-0 md:min-h-[16vw]">
        <div className="animate-marquee-left flex w-max flex-nowrap whitespace-nowrap">
          {/* Group 1 */}
          <div className="flex shrink-0 items-center">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={`g1-${i}`}
                className="text-2xl xs:text-3xl sm:text-4xl md:text-[13vw] lg:text-[12.5vw] font-sora font-extrabold uppercase tracking-tight text-[#d8d8d4] pl-1 md:pl-2 pr-6 xs:pr-8 sm:pr-10 md:pr-12 leading-none md:leading-[1.15] py-1 md:py-3 opacity-35 md:opacity-35 whitespace-nowrap inline-flex items-center"
              >
                {fullName} &nbsp;&mdash;&nbsp;
              </span>
            ))}
          </div>
          {/* Group 2 (Identical Duplicate for 100% Mathematical Seamless Loop) */}
          <div className="flex shrink-0 items-center">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={`g2-${i}`}
                className="text-2xl xs:text-3xl sm:text-4xl md:text-[13vw] lg:text-[12.5vw] font-sora font-extrabold uppercase tracking-tight text-[#d8d8d4] pl-1 md:pl-2 pr-6 xs:pr-8 sm:pr-10 md:pr-12 leading-none md:leading-[1.15] py-1 md:py-3 opacity-35 md:opacity-35 whitespace-nowrap inline-flex items-center"
              >
                {fullName} &nbsp;&mdash;&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* --- LAYER 20: FOREGROUND PORTRAIT SUBJECT CUTOUT --- */}
      <div className="relative z-20 flex-initial md:flex-1 w-full min-h-0 flex items-center md:items-end justify-center pointer-events-none my-0 md:my-0">
        <img
          src={heroPortraitCutout}
          alt={`${fullName} - ${title}`}
          className="h-[270px] xs:h-[300px] sm:h-[360px] md:h-[92%] lg:h-[95%] w-auto max-w-[260px] xs:max-w-[290px] sm:max-w-[350px] md:max-w-full object-contain object-bottom filter contrast-[1.03] brightness-[0.96] drop-shadow-[0_15px_45px_rgba(0,0,0,0.85)]"
        />
      </div>

      {/* --- LAYER 30: FOOTER & MONOCHROME BOTTOM RULE WITH CTAs --- */}
      <footer className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 flex flex-col gap-2 sm:gap-2.5 md:gap-4">
        {/* White/Cream Horizontal Rule */}
        <div className="border-t border-[#f2f2f0]/20 w-full" />

        {/* 3-Column Footer Layout: Left Bio, Center CTAs, Right Location */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 font-mono text-xs sm:text-sm text-[#f2f2f0] text-center md:text-left">
          {/* Left Column: Title, Tagline, Headline */}
          <div className="space-y-0.5 leading-snug">
            <div className="text-[#f2f2f0] font-bold text-xs sm:text-sm">{title}</div>
            <div className="text-[#b8b8b5] text-[11px] sm:text-xs">{tagline}</div>
            {headline && (
              <div className="text-[#8a8a8a] text-[10px] sm:text-[11px] md:text-xs">
                {headline}
              </div>
            )}
          </div>

          {/* Center Column: Professional Call-To-Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 py-0.5">
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('projects');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#FF9A3D] text-[#0D0B0A] hover:bg-[#ffaa5a] transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#FF9A3D]/20 cursor-pointer"
            >
              <span>View Projects</span>
              <ArrowDownRight className="w-3.5 h-3.5" />
            </a>

            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/15 text-[#f2f2f0] border border-white/20 hover:border-white/40 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <FileText className="w-3.5 h-3.5 text-[#FF9A3D]" />
              <span>Resume</span>
            </a>

            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-white/05 hover:bg-white/10 text-[#b8b8b5] hover:text-[#f2f2f0] border border-white/10 hover:border-white/30 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact</span>
            </a>
          </div>

          {/* Right Column: Location & Status */}
          <div className="text-center md:text-right space-y-0.5 leading-snug">
            <div className="text-[#f2f2f0] text-xs sm:text-sm">{locationText}</div>
            <div className="text-[#8a8a8a] text-[11px] sm:text-xs">{statusText}</div>
          </div>
        </div>
      </footer>
    </section>
  );
}
