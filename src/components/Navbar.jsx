import React, { useState, useEffect } from 'react';
import { Menu, X, Github } from 'lucide-react';
import { scrollToSection } from '../utils/scrollToSection';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'about', label: 'Story' },
    { id: 'services', label: 'Services' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Jobs' },
    { id: 'contact', label: 'Message' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <nav
      id="mainNav"
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 transition-colors duration-300 rounded-2xl border border-white/10 ${
        isScrolled ? 'py-3 border-white/20 shadow-2xl bg-[#0f0f0f]/95' : 'py-4 bg-[#0f0f0f]/85'
      }`}
    >
      <div className="px-6 flex items-center justify-between">
        {/* Brand Logo - Hassaan Ali Rana */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, 'hero')}
          className="font-sora font-extrabold text-lg sm:text-xl text-[#f2f2f0] flex items-center gap-2 flex-shrink-0 cursor-pointer select-none"
        >
          <span className="text-[#8a8a8a] font-mono">&gt;_</span>
          <span>Hassaan</span>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wider text-[#f2f2f0]">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              className="text-[#f2f2f0] cursor-pointer"
            >
              {link.label}
            </a>
          ))}

          {/* GitHub Link */}
          <a
            href="https://github.com/hassaanrana07"
            target="_blank"
            rel="noreferrer"
            className="text-[#f2f2f0] cursor-pointer flex items-center gap-1.5 border border-white/15 px-3 py-1.5 rounded-lg bg-white/05"
          >
            <Github className="w-3.5 h-3.5 text-[#f2f2f0]" />
            <span>GitHub</span>
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#f2f2f0] p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pt-4 pb-6 space-y-4 border-t border-white/10 mt-3 bg-[#141414] rounded-b-2xl">
          <div>
            <div className="mono-text text-[10px] uppercase tracking-widest text-[#8a8a8a] mb-3 font-bold">
              SITE INDEX
            </div>
            <div className="flex flex-col space-y-2 font-mono text-sm">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className="text-[#f2f2f0] py-1"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <div className="mono-text text-[10px] uppercase tracking-widest text-[#8a8a8a] mb-3 font-bold">
              FIND ME
            </div>
            <a
              href="https://github.com/hassaanrana07"
              target="_blank"
              rel="noreferrer"
              className="text-[#f2f2f0] font-mono text-sm flex items-center gap-2"
            >
              <Github className="w-4 h-4 text-[#f2f2f0]" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
