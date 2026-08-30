import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import TechStack from './components/TechStack';
import Projects from './components/Projects';
import Services from './components/Services';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CaseStudyView from './components/CaseStudyView';

export default function App() {
  const [activeCaseStudySlug, setActiveCaseStudySlug] = useState(null);

  // Sync with location hash or path (e.g. #projects/rentbro, /projects/brickbeam)
  useEffect(() => {
    const handleHashOrPathChange = () => {
      const hash = window.location.hash; // e.g. #projects/rentbro
      const path = window.location.pathname; // e.g. /projects/rentbro

      if (hash.startsWith('#projects/')) {
        const slug = hash.replace('#projects/', '').trim();
        if (slug) setActiveCaseStudySlug(slug);
      } else if (path.startsWith('/projects/')) {
        const slug = path.replace('/projects/', '').trim();
        if (slug) setActiveCaseStudySlug(slug);
      }
    };

    handleHashOrPathChange();
    window.addEventListener('hashchange', handleHashOrPathChange);
    return () => window.removeEventListener('hashchange', handleHashOrPathChange);
  }, []);

  const handleOpenCaseStudySlug = (slug) => {
    setActiveCaseStudySlug(slug);
    window.location.hash = `projects/${slug}`;
  };

  const handleBackToProjects = () => {
    setActiveCaseStudySlug(null);
    window.location.hash = 'projects';
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f2f2f0] font-sans selection:bg-white/20 selection:text-[#f2f2f0] relative">
      {/* Single Unified Navbar */}
      <Navbar />

      {activeCaseStudySlug ? (
        <CaseStudyView
          projectSlug={activeCaseStudySlug}
          onBack={handleBackToProjects}
          onNavigateSlug={handleOpenCaseStudySlug}
        />
      ) : (
        <main>
          <Hero />
          <About />
          <Services />
          <TechStack />
          <Projects onOpenCaseStudySlug={handleOpenCaseStudySlug} />
          <Experience />
          <Contact />
        </main>
      )}

      <Footer />
    </div>
  );
}
