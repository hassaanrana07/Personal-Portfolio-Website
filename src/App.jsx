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
import LoadingScreen from './components/LoadingScreen';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import { useAdminAuth } from './hooks/useAdminAuth';
import { usePortfolioData } from './hooks/usePortfolioData';
import { Loader2 } from 'lucide-react';

function getInitialRouteState() {
  if (typeof window === 'undefined') {
    return { isAdmin: false, mode: null, caseStudy: null };
  }
  const hash = (window.location.hash || '').toLowerCase();
  const path = (window.location.pathname || '').toLowerCase();

  const isSetup = (
    hash === '#setup' || 
    hash === '#/setup' || 
    hash === '#admin-setup' || 
    hash === '#admin/setup' || 
    path === '/setup' || 
    path === '/admin/setup'
  );

  const isAdmin = (
    isSetup ||
    hash === '#admin' || 
    hash === '#/admin' || 
    hash.startsWith('#admin/') || 
    path === '/admin' || 
    path.startsWith('/admin/')
  );

  let caseStudy = null;
  if (!isAdmin) {
    if (hash.startsWith('#projects/')) {
      caseStudy = hash.replace('#projects/', '').trim();
    } else if (hash.startsWith('#project/')) {
      caseStudy = hash.replace('#project/', '').trim();
    } else if (hash.startsWith('#product/')) {
      caseStudy = hash.replace('#product/', '').trim();
    } else if (hash.startsWith('#case-study/')) {
      caseStudy = hash.replace('#case-study/', '').trim();
    } else if (path.startsWith('/projects/')) {
      caseStudy = path.replace('/projects/', '').trim();
    } else if (path.startsWith('/project/')) {
      caseStudy = path.replace('/project/', '').trim();
    }
  }

  return {
    isAdmin,
    mode: isSetup ? 'setup' : (isAdmin ? 'login' : null),
    caseStudy
  };
}

export default function App() {
  const [initialRoute] = useState(getInitialRouteState);
  const [activeCaseStudySlug, setActiveCaseStudySlug] = useState(initialRoute.caseStudy);
  const [isAdminRoute, setIsAdminRoute] = useState(initialRoute.isAdmin);
  const [requestedAuthMode, setRequestedAuthMode] = useState(initialRoute.mode);
  const [isLoading, setIsLoading] = useState(true);

  const { admin, isAuthenticated, loading: authLoading, error: authError, login, setupAdmin, updateAccount, logout } = useAdminAuth();
  const { loading: portfolioLoading } = usePortfolioData();

  // Sync with location hash or path (e.g. #project/brickbeam, #projects/brickbeam, #admin, #setup)
  useEffect(() => {
    const handleHashOrPathChange = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();

      const isSetup = (
        hash === '#setup' || 
        hash === '#/setup' || 
        hash === '#admin-setup' || 
        hash === '#admin/setup' || 
        path === '/setup' || 
        path === '/admin/setup'
      );

      const isAdmin = (
        isSetup ||
        hash === '#admin' || 
        hash === '#/admin' || 
        hash.startsWith('#admin/') || 
        path === '/admin' || 
        path.startsWith('/admin/')
      );

      if (isAdmin) {
        setIsAdminRoute(true);
        setRequestedAuthMode(isSetup ? 'setup' : 'login');
        setActiveCaseStudySlug(null);
      } else if (hash.startsWith('#projects/')) {
        setIsAdminRoute(false);
        setRequestedAuthMode(null);
        const slug = hash.replace('#projects/', '').trim();
        if (slug) setActiveCaseStudySlug(slug);
      } else if (hash.startsWith('#project/')) {
        setIsAdminRoute(false);
        setRequestedAuthMode(null);
        const slug = hash.replace('#project/', '').trim();
        if (slug) setActiveCaseStudySlug(slug);
      } else if (hash.startsWith('#product/')) {
        setIsAdminRoute(false);
        setRequestedAuthMode(null);
        const slug = hash.replace('#product/', '').trim();
        if (slug) setActiveCaseStudySlug(slug);
      } else if (hash.startsWith('#case-study/')) {
        setIsAdminRoute(false);
        setRequestedAuthMode(null);
        const slug = hash.replace('#case-study/', '').trim();
        if (slug) setActiveCaseStudySlug(slug);
      } else if (path.startsWith('/projects/')) {
        setIsAdminRoute(false);
        setRequestedAuthMode(null);
        const slug = path.replace('/projects/', '').trim();
        if (slug) setActiveCaseStudySlug(slug);
      } else if (path.startsWith('/project/')) {
        setIsAdminRoute(false);
        setRequestedAuthMode(null);
        const slug = path.replace('/project/', '').trim();
        if (slug) setActiveCaseStudySlug(slug);
      } else {
        setIsAdminRoute(false);
        setRequestedAuthMode(null);
        setActiveCaseStudySlug(null);
      }
    };

    handleHashOrPathChange();
    window.addEventListener('hashchange', handleHashOrPathChange);
    window.addEventListener('popstate', handleHashOrPathChange);
    return () => {
      window.removeEventListener('hashchange', handleHashOrPathChange);
      window.removeEventListener('popstate', handleHashOrPathChange);
    };
  }, []);

  const handleOpenCaseStudySlug = (slug) => {
    setIsAdminRoute(false);
    setActiveCaseStudySlug(slug);
    window.location.hash = `project/${slug}`;
  };

  const handleBackToProjects = () => {
    setIsAdminRoute(false);
    setActiveCaseStudySlug(null);
    // Cleanly transition URL to root without leaving stale #project or #projects hash
    window.history.pushState(null, '', window.location.pathname.startsWith('/project') ? '/' : window.location.pathname);
    setTimeout(() => {
      const el = document.getElementById('projects');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleNavigateSection = (sectionId) => {
    setIsAdminRoute(false);
    setActiveCaseStudySlug(null);
    if (sectionId === 'home' || sectionId === 'hero') {
      handleBackToHome();
      return;
    }
    
    // Clean root URL path if coming from /project/:slug
    if (window.location.pathname.startsWith('/project')) {
      window.history.pushState(null, '', '/');
    }
    
    // Allow DOM to update if we were inside a case study
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const handleBackToHome = () => {
    setIsAdminRoute(false);
    setActiveCaseStudySlug(null);
    // Strip any hash or trailing path so the URL is strictly root http://localhost:3000/
    const targetUrl = window.location.pathname.startsWith('/project') ? '/' : (window.location.pathname === '/' ? '/' : window.location.pathname);
    window.history.pushState(null, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPublic = () => {
    setIsAdminRoute(false);
    setActiveCaseStudySlug(null);
    window.history.pushState(null, '', '/');
  };

  // If on Admin Route, handle Auth Gate
  if (isAdminRoute) {
    if (authLoading && !admin) {
      return (
        <div className="min-h-screen w-full bg-[#0D0B0A] text-[#F5F1EC] flex flex-col items-center justify-center gap-3 font-mono">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9A3D]" />
          <span className="text-xs text-[#9A9088] uppercase tracking-wider">Verifying Session...</span>
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <AdminDashboard
          admin={admin}
          onLogout={logout}
          onUpdateAccount={updateAccount}
          onBackToPublic={handleBackToPublic}
        />
      );
    }

    return (
      <AdminLogin
        onLogin={login}
        onSetup={setupAdmin}
        onBackToPublic={handleBackToPublic}
        requestedMode={requestedAuthMode}
        loading={authLoading}
        error={authError}
      />
    );
  }

  // Public Portfolio View with Loading Screen Overlay
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f2f2f0] font-sans selection:bg-white/20 selection:text-[#f2f2f0] relative">
      {/* Full-Screen Animated Loading Screen (Initial page load & full refresh) */}
      {isLoading && (
        <LoadingScreen isDataReady={!portfolioLoading} onComplete={() => setIsLoading(false)} />
      )}

      {/* Single Unified Navbar with Capsule & Urdu Calligraphy Emblem */}
      <Navbar onResetHome={handleBackToHome} onNavigateSection={handleNavigateSection} />

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
