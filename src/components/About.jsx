import React from 'react';
import { MapPin, GraduationCap, Briefcase, Settings, CheckCircle2, Github, Linkedin, Mail, Instagram } from 'lucide-react';
import { handleGlassMouseMove, handleGlassMouseLeave } from '../utils/useGlassTilt';

export default function About() {
  return (
    <section id="about" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12">
          <div className="mono-text text-xs uppercase tracking-widest text-[#FF9A3D] mb-2 font-bold">
            02 &mdash; About
          </div>
          <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-[#F5F1EC] tracking-tight">
            Who I Am
          </h2>
        </div>

        {/* Two-Column Glass Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Photo Panel (Left): Glass-framed with 16px inner padding and rounded 14px inner corners */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              className="glass w-full max-w-md p-4 flex flex-col items-center justify-between cursor-pointer"
              onMouseMove={handleGlassMouseMove}
              onMouseLeave={handleGlassMouseLeave}
            >
              <div className="w-full aspect-square rounded-[14px] overflow-hidden bg-[#171310] relative shadow-inner">
                <img
                  src="1000148492.png"
                  alt="Hassaan Ali Rana"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* Status Badge */}
              <div className="mt-4 w-full bg-white/05 border border-[#FF9A3D]/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#F5F1EC] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#FF9A3D]" />
                  <span>Open for Opportunities</span>
                </div>
                <span className="font-mono text-[10px] text-[#FFC107] bg-[#FF5722]/20 px-2 py-0.5 rounded border border-[#FF5722]/30">
                  Full-Time
                </span>
              </div>
            </div>
          </div>

          {/* Larger Glass Text Panel (Right) */}
          <div className="lg:col-span-7">
            <div
              className="glass p-8 h-full flex flex-col justify-between space-y-6 cursor-pointer"
              onMouseMove={handleGlassMouseMove}
              onMouseLeave={handleGlassMouseLeave}
            >
              <div className="space-y-4">
                <p className="text-lg font-medium text-[#F5F1EC] leading-relaxed">
                  I build scalable web applications and enterprise systems with a strong focus on clean architecture, maintainable backends and performant frontends. I specialise in Laravel for backend, React and Vue for frontend, and PostgreSQL for reliable data storage.
                </p>

                <p className="text-[#9A9088] text-sm leading-relaxed">
                  My work centres on dashboards, admin panels, authentication systems, and REST APIs for business-critical applications. I design systems to be secure, testable and scalable — implementing role-based access control, background jobs, and API integrations. I also use AI-assisted development tools to speed up iteration while keeping code quality and architecture decisions intentional.
                </p>

                <p className="text-[#9A9088] text-sm leading-relaxed">
                  Outside of development I enjoy photography as a creative hobby. While I value visual craft, my primary focus is delivering robust engineering solutions that drive business outcomes.
                </p>
              </div>

              {/* Pill-shaped Badges */}
              <div className="pt-2 border-t border-white/10 space-y-4">
                <div className="flex flex-wrap gap-2.5">
                  <span className="inline-flex items-center gap-1.5 bg-white/05 border border-white/10 text-[#9A9088] hover:text-[#FF9A3D] text-xs px-4 py-1.5 rounded-full transition-colors font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#FF9A3D]" />
                    <span>Lahore, Pakistan</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 bg-white/05 border border-white/10 text-[#9A9088] hover:text-[#FF9A3D] text-xs px-4 py-1.5 rounded-full transition-colors font-medium">
                    <GraduationCap className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span>BS Computer Science</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 bg-white/05 border border-white/10 text-[#9A9088] hover:text-[#FF9A3D] text-xs px-4 py-1.5 rounded-full transition-colors font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-[#FFC107]" />
                    <span>Enterprise Apps</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 bg-white/05 border border-white/10 text-[#9A9088] hover:text-[#FF9A3D] text-xs px-4 py-1.5 rounded-full transition-colors font-medium">
                    <Settings className="w-3.5 h-3.5 text-[#FF9A3D]" />
                    <span>REST APIs</span>
                  </span>
                </div>

                {/* Social Actions Row */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="https://github.com/hassaanrana07"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-white/05 border border-white/10 text-[#F5F1EC] hover:text-[#FF9A3D] hover:border-[#FF9A3D] text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>

                  <a
                    href="https://linkedin.com/in/hassaanaliakbar"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-white/05 border border-white/10 text-[#F5F1EC] hover:text-[#FF9A3D] hover:border-[#FF9A3D] text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>

                  <a
                    href="mailto:hassaanalee07@gmail.com"
                    className="inline-flex items-center gap-2 bg-white/05 border border-white/10 text-[#F5F1EC] hover:text-[#FF9A3D] hover:border-[#FF9A3D] text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>

                  <a
                    href="https://www.instagram.com/hassaanaleerana/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-white/05 border border-white/10 text-[#F5F1EC] hover:text-[#FF9A3D] hover:border-[#FF9A3D] text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
