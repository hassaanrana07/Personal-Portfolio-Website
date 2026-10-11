import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, GraduationCap, Briefcase, Settings, CheckCircle2, Github, Linkedin, Mail, Instagram } from 'lucide-react';
import { handleGlassMouseMove, handleGlassMouseLeave } from '../utils/useGlassTilt';
import { usePortfolioData } from '../hooks/usePortfolioData';
import aboutPortrait from '../assets/about-portrait.jpg';

const fallbackBioParagraphs = [
  "I build scalable web applications and enterprise systems with a strong focus on clean architecture, maintainable backends and performant frontends. I specialise in Laravel for backend, React and Vue for frontend, and PostgreSQL for reliable data storage.",
  "My work centres on dashboards, admin panels, authentication systems, and REST APIs for business-critical applications. I design systems to be secure, testable and scalable — implementing role-based access control, background jobs, and API integrations. I also use AI-assisted development tools to speed up iteration while keeping code quality and architecture decisions intentional.",
  "Outside of development I enjoy photography as a creative hobby. While I value visual craft, my primary focus is delivering robust engineering solutions that drive business outcomes."
];

export default function About() {
  const { profile } = usePortfolioData();

  const fullName = profile?.fullName || 'Hassaan Ali Akbar';
  const statusText = profile?.statusText || 'Open for Opportunities';
  const statusBadge = profile?.statusBadge || 'Full-Time';
  const location = profile?.location || 'Lahore, Pakistan';
  const githubUrl = profile?.githubUrl || 'https://github.com/hassaanrana07';
  const linkedinUrl = profile?.linkedinUrl || 'https://linkedin.com/in/hassaanaliakbar';
  const email = profile?.email || 'hassaanalee07@gmail.com';
  const instagramUrl = profile?.instagramUrl || 'https://www.instagram.com/hassaanaleerana/';

  const bioParagraphs = useMemo(() => {
    if (!profile?.bio) return fallbackBioParagraphs;
    const split = profile.bio.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    return split.length > 0 ? split : fallbackBioParagraphs;
  }, [profile?.bio]);

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="mb-12"
        >
          <div className="mono-text text-xs uppercase tracking-widest text-[#FF9A3D] mb-2 font-bold">
            02 &mdash; About
          </div>
          <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-[#F5F1EC] tracking-tight">
            Who I Am
          </h2>
        </motion.div>

        {/* Two-Column Glass Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Photo Panel (Left): Glass-framed with 16px inner padding and rounded 14px inner corners */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-5 flex justify-center"
          >
            <div
              className="glass w-full max-w-md p-4 flex flex-col items-center justify-between cursor-pointer group"
              onMouseMove={handleGlassMouseMove}
              onMouseLeave={handleGlassMouseLeave}
            >
              <div className="w-full aspect-square rounded-[14px] overflow-hidden bg-[#171310] relative shadow-inner">
                <img
                  src={aboutPortrait}
                  alt={fullName}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Status Badge */}
              <div className="mt-4 w-full bg-white/05 border border-[#FF9A3D]/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs transition-colors group-hover:border-[#FF9A3D]/50">
                <div className="flex items-center gap-2 text-[#F5F1EC] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#FF9A3D]" />
                  <span>{statusText}</span>
                </div>
                <span className="font-mono text-[10px] text-[#FFC107] bg-[#FF5722]/20 px-2 py-0.5 rounded border border-[#FF5722]/30">
                  {statusBadge}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Larger Glass Text Panel (Right) */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-7"
          >
            <div
              className="glass p-8 h-full flex flex-col justify-between space-y-6 cursor-pointer"
              onMouseMove={handleGlassMouseMove}
              onMouseLeave={handleGlassMouseLeave}
            >
              <div className="space-y-4">
                {bioParagraphs.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={
                      idx === 0
                        ? "text-lg font-medium text-[#F5F1EC] leading-relaxed"
                        : "text-[#9A9088] text-sm leading-relaxed"
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Pill-shaped Badges */}
              <div className="pt-2 border-t border-white/10 space-y-4">
                <div className="flex flex-wrap gap-2.5">
                  <span className="inline-flex items-center gap-1.5 bg-white/05 border border-white/10 text-[#9A9088] hover:text-[#FF9A3D] text-xs px-4 py-1.5 rounded-full transition-all duration-200 hover:scale-105 font-medium cursor-default">
                    <MapPin className="w-3.5 h-3.5 text-[#FF9A3D]" />
                    <span>{location}</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 bg-white/05 border border-white/10 text-[#9A9088] hover:text-[#FF9A3D] text-xs px-4 py-1.5 rounded-full transition-all duration-200 hover:scale-105 font-medium cursor-default">
                    <GraduationCap className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span>BS Computer Science</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 bg-white/05 border border-white/10 text-[#9A9088] hover:text-[#FF9A3D] text-xs px-4 py-1.5 rounded-full transition-all duration-200 hover:scale-105 font-medium cursor-default">
                    <Briefcase className="w-3.5 h-3.5 text-[#FFC107]" />
                    <span>Enterprise Apps</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 bg-white/05 border border-white/10 text-[#9A9088] hover:text-[#FF9A3D] text-xs px-4 py-1.5 rounded-full transition-all duration-200 hover:scale-105 font-medium cursor-default">
                    <Settings className="w-3.5 h-3.5 text-[#FF9A3D]" />
                    <span>REST APIs</span>
                  </span>
                </div>

                {/* Social Actions Row */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <motion.a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-2 bg-white/05 border border-white/10 text-[#F5F1EC] hover:text-[#FF9A3D] hover:border-[#FF9A3D] text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </motion.a>

                  <motion.a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-2 bg-white/05 border border-white/10 text-[#F5F1EC] hover:text-[#FF9A3D] hover:border-[#FF9A3D] text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </motion.a>

                  <motion.a
                    href={`mailto:${email}`}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-2 bg-white/05 border border-white/10 text-[#F5F1EC] hover:text-[#FF9A3D] hover:border-[#FF9A3D] text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </motion.a>

                  <motion.a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-2 bg-white/05 border border-white/10 text-[#F5F1EC] hover:text-[#FF9A3D] hover:border-[#FF9A3D] text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </motion.a>
                </div>
              </div>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
