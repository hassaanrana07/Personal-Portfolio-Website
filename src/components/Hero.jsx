import React from 'react';
import heroPortraitCutout from '../assets/hero-portrait-cutout.png';

export default function Hero() {
  return (
    <section id="home" className="relative h-[100dvh] w-full overflow-hidden bg-[#0f0f0f] text-[#f2f2f0] flex flex-col justify-between pt-24 pb-8">
      
      {/* --- LAYER 10: SINGLE HORIZONTAL LINE MARQUEE BACKGROUND ("Hassaan Ali Rana" - Moving Right-to-Left in Soft Light Grey) --- */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-10 select-none pointer-events-none w-full">
        <div className="animate-marquee-left flex w-max flex-nowrap whitespace-nowrap">
          {/* Group 1 */}
          <div className="flex shrink-0 items-center">
            <span className="text-[16vw] sm:text-[13vw] font-sora font-extrabold uppercase tracking-tighter text-[#d8d8d4] pr-12 leading-none opacity-35 whitespace-nowrap inline-block">
              Hassaan Ali Rana &nbsp;&mdash;&nbsp;
            </span>
            <span className="text-[16vw] sm:text-[13vw] font-sora font-extrabold uppercase tracking-tighter text-[#d8d8d4] pr-12 leading-none opacity-35 whitespace-nowrap inline-block">
              Hassaan Ali Rana &nbsp;&mdash;&nbsp;
            </span>
          </div>
          {/* Group 2 (Identical Duplicate for 100% Mathematical Seamless Loop) */}
          <div className="flex shrink-0 items-center">
            <span className="text-[16vw] sm:text-[13vw] font-sora font-extrabold uppercase tracking-tighter text-[#d8d8d4] pr-12 leading-none opacity-35 whitespace-nowrap inline-block">
              Hassaan Ali Rana &nbsp;&mdash;&nbsp;
            </span>
            <span className="text-[16vw] sm:text-[13vw] font-sora font-extrabold uppercase tracking-tighter text-[#d8d8d4] pr-12 leading-none opacity-35 whitespace-nowrap inline-block">
              Hassaan Ali Rana &nbsp;&mdash;&nbsp;
            </span>
          </div>
        </div>
      </div>

      {/* --- LAYER 20: FOREGROUND PORTRAIT SUBJECT CUTOUT --- */}
      <div className="absolute inset-0 flex items-end justify-center z-20 pointer-events-none pt-12">
        <img
          src={heroPortraitCutout}
          alt="Hassaan Ali Rana - Full Stack Developer"
          className="h-[88%] sm:h-[92%] w-auto max-w-full object-contain object-bottom filter contrast-[1.03] brightness-[0.96] drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
        />
      </div>

      {/* Spacer to push footer to bottom of 100dvh viewport */}
      <div className="flex-1" />

      {/* --- LAYER 30: FOOTER & MONOCHROME BOTTOM RULE --- */}
      <footer className="relative z-30 w-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col gap-4">
        {/* White/Cream Horizontal Rule */}
        <div className="border-t border-[#f2f2f0]/20 w-full" />

        {/* 3-Line Monochrome Footer Copy */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 font-mono text-xs sm:text-sm text-[#f2f2f0]">
          {/* Left Column */}
          <div className="space-y-0.5 leading-snug">
            <div className="text-[#f2f2f0]">Full Stack Developer</div>
            <div className="text-[#b8b8b5]">Creative Problem Solver</div>
            <div className="text-[#8a8a8a]">Building Digital Experiences</div>
          </div>

          {/* Right Column */}
          <div className="text-left sm:text-right space-y-0.5 leading-snug">
            <div className="text-[#f2f2f0]">Based in Pakistan</div>
            <div className="text-[#8a8a8a]">Available for opportunities</div>
          </div>
        </div>
      </footer>

    </section>
  );
}
