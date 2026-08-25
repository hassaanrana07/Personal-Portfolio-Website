import React from 'react';
import { Github, Linkedin, Mail, Instagram } from 'lucide-react';
import { handleGlassMouseMove, handleGlassMouseLeave } from '../utils/useGlassTilt';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 text-xs text-[#9A9088] relative z-10">
      <div
        className="glass max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer"
        onMouseMove={handleGlassMouseMove}
        onMouseLeave={handleGlassMouseLeave}
      >
        
        {/* Brand */}
        <div className="mono-text">
          <span className="text-[#FF9A3D] font-mono font-bold">&gt;_</span> hassaan.dev &mdash;{' '}
          <span className="text-[#9A9088]">Molten Glass System &bull; Three.js 3D Engine</span>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/hassaanrana07"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="w-8 h-8 rounded-lg bg-white/05 border border-white/10 flex items-center justify-center text-[#9A9088] hover:text-[#FF9A3D] hover:border-[#FF9A3D] transition-all"
          >
            <Github className="w-3.5 h-3.5" />
          </a>

          <a
            href="https://linkedin.com/in/hassaanaliakbar"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="w-8 h-8 rounded-lg bg-white/05 border border-white/10 flex items-center justify-center text-[#9A9088] hover:text-[#FF9A3D] hover:border-[#FF9A3D] transition-all"
          >
            <Linkedin className="w-3.5 h-3.5" />
          </a>

          <a
            href="mailto:hassaanalee07@gmail.com"
            aria-label="Email"
            className="w-8 h-8 rounded-lg bg-white/05 border border-white/10 flex items-center justify-center text-[#9A9088] hover:text-[#FF9A3D] hover:border-[#FF9A3D] transition-all"
          >
            <Mail className="w-3.5 h-3.5" />
          </a>

          <a
            href="https://www.instagram.com/hassaanaleerana/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="w-8 h-8 rounded-lg bg-white/05 border border-white/10 flex items-center justify-center text-[#9A9088] hover:text-[#FF9A3D] hover:border-[#FF9A3D] transition-all"
          >
            <Instagram className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-[#9A9088] font-mono">
          &copy; {currentYear} Hassaan Ali Akbar
        </div>

      </div>
    </footer>
  );
}
