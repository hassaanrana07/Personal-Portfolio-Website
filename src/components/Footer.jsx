import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Instagram } from 'lucide-react';
import { handleGlassMouseMove, handleGlassMouseLeave } from '../utils/useGlassTilt';
import { usePortfolioData } from '../hooks/usePortfolioData';

export default function Footer() {
  const { profile } = usePortfolioData();
  const currentYear = new Date().getFullYear();

  const fullName = profile?.fullName || 'Hassaan Ali Akbar';
  const githubUrl = profile?.githubUrl || 'https://github.com/hassaanrana07';
  const linkedinUrl = profile?.linkedinUrl || 'https://linkedin.com/in/hassaanaliakbar';
  const email = profile?.email || 'hassaanalee07@gmail.com';
  const instagramUrl = profile?.instagramUrl || 'https://www.instagram.com/hassaanaleerana/';

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
          <motion.a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Profile"
            title="GitHub"
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="w-8 h-8 rounded-lg bg-white/05 border border-white/10 flex items-center justify-center text-[#9A9088] hover:text-[#FF9A3D] hover:border-[#FF9A3D] transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
          </motion.a>

          <motion.a
            href={linkedinUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="w-8 h-8 rounded-lg bg-white/05 border border-white/10 flex items-center justify-center text-[#9A9088] hover:text-[#FF9A3D] hover:border-[#FF9A3D] transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5" />
          </motion.a>

          <motion.a
            href={`mailto:${email}`}
            aria-label="Email"
            title="Email"
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="w-8 h-8 rounded-lg bg-white/05 border border-white/10 flex items-center justify-center text-[#9A9088] hover:text-[#FF9A3D] hover:border-[#FF9A3D] transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
          </motion.a>

          <motion.a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            title="Instagram"
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="w-8 h-8 rounded-lg bg-white/05 border border-white/10 flex items-center justify-center text-[#9A9088] hover:text-[#FF9A3D] hover:border-[#FF9A3D] transition-colors"
          >
            <Instagram className="w-3.5 h-3.5" />
          </motion.a>
        </div>

        {/* Copyright */}
        <div className="text-[#9A9088] font-mono">
          &copy; {currentYear} {fullName}
        </div>

      </div>
    </footer>
  );
}
