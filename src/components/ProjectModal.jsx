import React, { useEffect } from 'react';
import { X, Github, ArrowLeft, ArrowRight, FolderTree, Database, ShieldCheck, Cpu } from 'lucide-react';
import { projects } from '../data/projects';

export default function ProjectModal({ project, onClose, onSelectProject }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [project]);

  const currentIndex = projects.findIndex((p) => p.id === project.id);
  const prevProject = projects[(currentIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(currentIndex + 1) % projects.length];

  const cs = project.caseStudy || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md overflow-y-auto p-4 sm:p-8">
      
      {/* Full-Viewport Monochrome Technical Case Study Document Container */}
      <div className="bg-[#0f0f0f] border border-[#f2f2f0]/20 text-[#f2f2f0] w-full max-w-5xl min-h-[90vh] my-auto p-6 sm:p-12 relative shadow-2xl space-y-12">
        
        {/* Sticky Top Header Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-[#f2f2f0]/20 font-mono text-xs text-[#8a8a8a]">
          <div>
            <span className="text-[#f2f2f0] font-bold uppercase tracking-widest mr-3">
              TECHNICAL CASE STUDY
            </span>
            <span>PROJECT {project.number} / 06</span>
          </div>

          <button
            onClick={onClose}
            className="text-[#f2f2f0] hover:text-[#8a8a8a] transition-colors p-1 cursor-pointer flex items-center gap-1 font-mono"
            aria-label="Close Case Study"
          >
            <span>Close</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Title Header */}
        <div className="space-y-4">
          <div className="mono-text text-xs text-[#8a8a8a] uppercase tracking-widest">
            {project.type || project.category}
          </div>
          <h1 className="font-sora text-3xl sm:text-5xl font-extrabold text-[#f2f2f0] tracking-tight">
            {project.name}
          </h1>
          <p className="font-mono text-sm sm:text-base text-[#b8b8b5]">
            {project.subtitle}
          </p>

          {/* External Links Bar (GitHub Only) */}
          <div className="pt-2 flex items-center gap-6 font-mono text-xs">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="text-[#f2f2f0] hover:text-[#8a8a8a] transition-colors font-bold flex items-center gap-1.5 border border-white/20 px-4 py-2"
              >
                <Github className="w-4 h-4" />
                <span>GitHub Repository &rarr;</span>
              </a>
            )}
          </div>
        </div>

        {/* SECTION 1: OVERVIEW & PROBLEM / SOLUTION */}
        <div className="space-y-6 pt-4 border-t border-[#f2f2f0]/10">
          <h2 className="font-sora text-xl font-bold text-[#f2f2f0]">1. System Overview</h2>
          <p className="text-sm sm:text-base text-[#b8b8b5] leading-relaxed">
            {cs.overview || project.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-2 border-l-2 border-[#8a8a8a] pl-4">
              <div className="font-mono text-xs uppercase text-[#8a8a8a] font-bold">The Problem</div>
              <p className="text-xs sm:text-sm text-[#b8b8b5] leading-relaxed">
                {cs.problem}
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-[#f2f2f0] pl-4">
              <div className="font-mono text-xs uppercase text-[#f2f2f0] font-bold">Engineering Solution</div>
              <p className="text-xs sm:text-sm text-[#b8b8b5] leading-relaxed">
                {cs.solution}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: KEY FEATURES */}
        {cs.features && cs.features.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[#f2f2f0]/10">
            <h2 className="font-sora text-xl font-bold text-[#f2f2f0]">2. Key Functionality & Features</h2>
            <ul className="space-y-2.5 font-mono text-xs sm:text-sm text-[#b8b8b5]">
              {cs.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#f2f2f0] font-bold select-none">&mdash;</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* SECTION 3: TECHNICAL ARCHITECTURE */}
        {cs.architecture && (
          <div className="space-y-6 pt-6 border-t border-[#f2f2f0]/10">
            <h2 className="font-sora text-xl font-bold text-[#f2f2f0] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#8a8a8a]" />
              <span>3. Technical Architecture</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs border border-[#f2f2f0]/15 p-6 bg-[#161616]">
              <div>
                <span className="text-[#8a8a8a] block uppercase text-[11px] font-bold mb-1">Frontend Layer</span>
                <span className="text-[#f2f2f0]">{cs.architecture.frontend}</span>
              </div>
              <div>
                <span className="text-[#8a8a8a] block uppercase text-[11px] font-bold mb-1">Backend Core</span>
                <span className="text-[#f2f2f0]">{cs.architecture.backend}</span>
              </div>
              <div>
                <span className="text-[#8a8a8a] block uppercase text-[11px] font-bold mb-1">Database Engine</span>
                <span className="text-[#f2f2f0]">{cs.architecture.database}</span>
              </div>
              <div>
                <span className="text-[#8a8a8a] block uppercase text-[11px] font-bold mb-1">Authentication</span>
                <span className="text-[#f2f2f0]">{cs.architecture.authentication}</span>
              </div>
              <div>
                <span className="text-[#8a8a8a] block uppercase text-[11px] font-bold mb-1">API Dispatches</span>
                <span className="text-[#f2f2f0]">{cs.architecture.apis}</span>
              </div>
              <div>
                <span className="text-[#8a8a8a] block uppercase text-[11px] font-bold mb-1">Deployment</span>
                <span className="text-[#f2f2f0]">{cs.architecture.deployment}</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: REAL CODEBASE FOLDER STRUCTURE */}
        {cs.folderStructure && (
          <div className="space-y-4 pt-6 border-t border-[#f2f2f0]/10">
            <h2 className="font-sora text-xl font-bold text-[#f2f2f0] flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#8a8a8a]" />
              <span>4. Codebase Directory Structure</span>
            </h2>
            <pre className="font-mono text-xs text-[#b8b8b5] bg-[#161616] p-6 border border-[#f2f2f0]/15 overflow-x-auto leading-relaxed select-all">
              {cs.folderStructure}
            </pre>
          </div>
        )}

        {/* SECTION 5: MAJOR FUNCTIONS / MODULES */}
        {cs.modules && cs.modules.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[#f2f2f0]/10">
            <h2 className="font-sora text-xl font-bold text-[#f2f2f0]">5. Major Engineering Modules</h2>
            <div className="space-y-3 font-mono text-xs sm:text-sm">
              {cs.modules.map((mod, idx) => (
                <div key={idx} className="border-b border-[#f2f2f0]/10 pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-[#f2f2f0] font-bold">{mod.name}</span>
                  <span className="text-[#8a8a8a] text-xs">{mod.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: DATABASE / DATA MODEL */}
        {cs.dataModel && cs.dataModel.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[#f2f2f0]/10">
            <h2 className="font-sora text-xl font-bold text-[#f2f2f0] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#8a8a8a]" />
              <span>6. Data Model & Primary Entities</span>
            </h2>
            <div className="border border-[#f2f2f0]/15 overflow-x-auto bg-[#161616] p-4 font-mono text-xs">
              {cs.dataModel.map((item, idx) => (
                <div key={idx} className="py-2 border-b border-[#f2f2f0]/10 last:border-b-0 flex flex-col sm:flex-row justify-between gap-2">
                  <span className="text-[#f2f2f0] font-bold uppercase">{item.table}</span>
                  <span className="text-[#8a8a8a]">{item.details}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 7: AUTHENTICATION & RBAC */}
        {cs.auth && (
          <div className="space-y-3 pt-6 border-t border-[#f2f2f0]/10">
            <h2 className="font-sora text-xl font-bold text-[#f2f2f0] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#8a8a8a]" />
              <span>7. Authentication & Security Governance</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#b8b8b5] font-mono leading-relaxed">
              {cs.auth}
            </p>
          </div>
        )}

        {/* SECTION 8: TECHNICAL DECISIONS */}
        {cs.decisions && cs.decisions.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[#f2f2f0]/10">
            <h2 className="font-sora text-xl font-bold text-[#f2f2f0]">8. Architectural Decisions & Rationale</h2>
            <div className="space-y-4 font-mono text-xs sm:text-sm">
              {cs.decisions.map((dec, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-[#f2f2f0] font-bold">&bull; {dec.title}</div>
                  <div className="text-[#8a8a8a] pl-4">{dec.rationale}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 9: CHALLENGES & SOLUTIONS */}
        {cs.challenges && cs.challenges.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[#f2f2f0]/10">
            <h2 className="font-sora text-xl font-bold text-[#f2f2f0]">9. Engineering Challenges & Resolutions</h2>
            <div className="space-y-4 font-mono text-xs sm:text-sm">
              {cs.challenges.map((c, idx) => (
                <div key={idx} className="space-y-1 bg-[#161616] p-4 border border-[#f2f2f0]/10">
                  <div className="text-[#8a8a8a] font-bold">CHALLENGE: {c.challenge}</div>
                  <div className="text-[#f2f2f0]">SOLUTION: {c.solution}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 10: FUTURE IMPROVEMENTS */}
        {cs.futureImprovements && cs.futureImprovements.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-[#f2f2f0]/10">
            <h2 className="font-sora text-xl font-bold text-[#f2f2f0]">10. Future Enhancements</h2>
            <ul className="space-y-2 font-mono text-xs sm:text-sm text-[#b8b8b5]">
              {cs.futureImprovements.map((imp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#8a8a8a]">&rarr;</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* SECTION 11: PROJECT NAVIGATION (PREVIOUS / NEXT) */}
        <div className="pt-8 border-t border-[#f2f2f0]/20 flex items-center justify-between font-mono text-xs sm:text-sm text-[#f2f2f0]">
          <button
            onClick={() => onSelectProject(prevProject)}
            className="hover:text-[#8a8a8a] transition-colors flex items-center gap-2 cursor-pointer font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>&larr; Previous ({prevProject.name})</span>
          </button>

          <button
            onClick={() => onSelectProject(nextProject)}
            className="hover:text-[#8a8a8a] transition-colors flex items-center gap-2 cursor-pointer font-bold"
          >
            <span>Next ({nextProject.name}) &rarr;</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
