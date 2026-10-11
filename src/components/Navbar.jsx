import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Settings, Code2, Folder, Briefcase, MessageSquare, Menu, X } from 'lucide-react';
import { scrollToSection } from '../utils/scrollToSection';
import calligraphyWhite from '../assets/calligraphy-hassaan-white.png';

export default function Navbar({ onResetHome, onNavigateSection }) {
  const [isInHero, setIsInHero] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Left 3 links (Desktop capsule left)
  const leftLinks = [
    { id: 'about', label: 'Stories', icon: BookOpen },
    { id: 'services', label: 'Services', icon: Settings },
    { id: 'skills', label: 'Skills', icon: Code2 },
  ];

  // Right 3 links (Desktop capsule right)
  const rightLinks = [
    { id: 'projects', label: 'Project', icon: Folder },
    { id: 'experience', label: 'Jobs', icon: Briefcase },
    { id: 'contact', label: 'Messages', icon: MessageSquare },
  ];

  // All 6 links for mobile drawer
  const allNavLinks = [...leftLinks, ...rightLinks];

  // Desktop Auto-Hide on first downward scroll:
  // Visible at page top (scrollY <= 20), hides on downward scroll, reappears at page top.
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isAtTop = currentScrollY <= 20;
      setIsInHero(isAtTop);

      // Clean trailing project hash if scrolled back to top
      if (currentScrollY < 80) {
        if (
          window.location.hash === '#projects' ||
          window.location.hash === '#project' ||
          window.location.hash === '#home' ||
          window.location.hash === '#hero'
        ) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }

      // Detect active section for active indicator
      const sections = ['home', 'about', 'services', 'skills', 'projects', 'experience', 'contact'];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 250) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Support Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Support outside click to close mobile menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !e.target.closest('#mobileNavToggle')
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      scrollToSection(id);
    }
  };

  const handleCenterLogoClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onResetHome) {
      onResetHome();
    } else if (onNavigateSection) {
      onNavigateSection('home');
    } else {
      window.history.pushState(null, '', window.location.pathname.startsWith('/project') ? '/' : '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* ================= MOBILE NAVIGATION HEADER (< md) ================= */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-[#070A12]/92 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 flex items-center justify-between shadow-lg">
        {/* Left: Urdu Logo (حسان) */}
        <a
          href="#home"
          onClick={handleCenterLogoClick}
          aria-label="حسان - Return to Hero Section"
          title="حسان (Hassaan) — Return to top"
          className="w-10 h-10 rounded-full bg-[#05070D] border-[1.5px] border-[#5EA2ED] shadow-[0_0_12px_rgba(70,160,255,0.4)] flex items-center justify-center p-1 cursor-pointer transition-transform active:scale-95 shrink-0"
        >
          <img
            src={calligraphyWhite}
            alt="حسان"
            className="w-6 h-auto object-contain drop-shadow-[0_1px_6px_rgba(255,255,255,0.7)]"
          />
        </a>

        {/* Right: Hamburger Menu Toggle Button */}
        <button
          id="mobileNavToggle"
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobileNavPanel"
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center text-[#F5F1EC] transition-colors cursor-pointer active:scale-95"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5 text-[#FF9A3D]" />
          ) : (
            <Menu className="w-5 h-5 text-[#F5F1EC]" />
          )}
        </button>
      </div>

      {/* Mobile Drawer / Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            ref={mobileMenuRef}
            id="mobileNavPanel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            className="fixed inset-x-0 top-[60px] max-h-[calc(100vh-60px)] overflow-y-auto bg-[#070A12]/98 border-b border-white/10 px-5 py-6 shadow-2xl flex flex-col gap-2 animate-in slide-in-from-top duration-200"
          >
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#8A8078] px-3 pb-1">
              Navigation
            </div>
            {allNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-mono cursor-pointer ${
                    isActive
                      ? 'bg-[#FF9A3D]/15 text-[#FF9A3D] border border-[#FF9A3D]/40 font-bold shadow-md shadow-[#FF9A3D]/10'
                      : 'text-[#C5D0DE] hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-[#FF9A3D]/20 text-[#FF9A3D]' : 'bg-white/5 text-[#E2E8F0]'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium tracking-wide">{link.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= DESKTOP NAVIGATION CAPSULE (>= md) ================= */}
      <header
        id="desktopNavWrapper"
        className={`fixed top-4 sm:top-7 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out pointer-events-none hidden md:block ${
          isInHero
            ? 'translate-y-0 opacity-100'
            : '-translate-y-28 opacity-0'
        }`}
      >
        <nav
          id="mainNav"
          aria-label="Main Desktop Navigation"
          className="pointer-events-auto relative bg-[#070A12]/92 backdrop-blur-2xl border border-[#4882C8]/40 rounded-full px-2 sm:px-4 py-1.5 sm:py-2 shadow-[0_0_35px_rgba(56,140,240,0.2),0_15px_45px_rgba(0,0,0,0.9)] flex items-center justify-between transition-all duration-300 select-none max-w-[96vw]"
        >
          {/* LEFT 3 LINKS: Stories, Services, Skills with Dividers */}
          <div className="flex items-center">
            {leftLinks.map((link, idx) => {
              const Icon = link.icon;
              const isActive = activeSection === link.id;
              const isLast = idx === leftLinks.length - 1;
              return (
                <div key={link.id} className="flex items-center">
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => handleNavClick(e, link.id)}
                    title={link.label}
                    className={`group flex flex-col items-center justify-center gap-1 px-3 sm:px-5 py-1 sm:py-1.5 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'text-white'
                        : 'text-[#C5D0DE] hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]' : 'text-[#E2E8F0] group-hover:text-white'}`} />
                    <span className="text-[10px] sm:text-[11px] font-sans font-normal tracking-wide text-center leading-none">
                      {link.label}
                    </span>
                  </a>
                  {!isLast && (
                    <div className="h-6 sm:h-7 w-[1px] bg-white/10 mx-0.5 sm:mx-1" />
                  )}
                </div>
              );
            })}
          </div>

          {/* CENTER CIRCULAR URDU CALLIGRAPHY EMBLEM (حسان) */}
          <div className="relative mx-1.5 sm:mx-3 flex items-center justify-center shrink-0">
            <a
              href="#home"
              onClick={handleCenterLogoClick}
              aria-label="حسان - Return to Hero Section"
              title="حسان (Hassaan) — Return to top"
              className="w-[62px] h-[62px] sm:w-[72px] sm:h-[72px] -my-2.5 sm:-my-3.5 rounded-full bg-[#05070D] border-[2px] sm:border-[2.5px] border-[#5EA2ED] shadow-[0_0_22px_rgba(70,160,255,0.6),inset_0_0_12px_rgba(70,160,255,0.3)] flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group relative z-20 overflow-hidden p-1 sm:p-1.5 shrink-0"
            >
              {/* Ambient inner radial glow */}
              <div className="absolute inset-0 bg-radial from-[#5EA2ED]/30 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Urdu Calligraphy Image from Exact Reference */}
              <img
                src={calligraphyWhite}
                alt="حسان"
                className="w-[44px] sm:w-[52px] h-auto max-w-[80%] object-contain transition-all duration-300 filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.75)] relative z-10"
              />
            </a>
          </div>

          {/* RIGHT 3 LINKS: Project, Jobs, Messages with Dividers */}
          <div className="flex items-center">
            {rightLinks.map((link, idx) => {
              const Icon = link.icon;
              const isActive = activeSection === link.id;
              const isFirst = idx === 0;
              return (
                <div key={link.id} className="flex items-center">
                  {!isFirst && (
                    <div className="h-6 sm:h-7 w-[1px] bg-white/10 mx-0.5 sm:mx-1" />
                  )}
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => handleNavClick(e, link.id)}
                    title={link.label}
                    className={`group flex flex-col items-center justify-center gap-1 px-3 sm:px-5 py-1 sm:py-1.5 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'text-white'
                        : 'text-[#C5D0DE] hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]' : 'text-[#E2E8F0] group-hover:text-white'}`} />
                    <span className="text-[10px] sm:text-[11px] font-sans font-normal tracking-wide text-center leading-none">
                      {link.label}
                    </span>
                  </a>
                </div>
              );
            })}
          </div>
        </nav>
      </header>
    </>
  );
}
