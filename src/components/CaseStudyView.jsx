import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Github, FolderTree, Database, Cpu, ShieldCheck } from 'lucide-react';
import { projects } from '../data/projects';
import SocialPreview from './project-previews/SocialPreview';
import CmsPreview from './project-previews/CmsPreview';
import ProjectManagementPreview from './project-previews/ProjectManagementPreview';
import AirQualityPreview from './project-previews/AirQualityPreview';
import ConstructionPreview from './project-previews/ConstructionPreview';
import RealEstatePreview from './project-previews/RealEstatePreview';

export default function CaseStudyView({ projectSlug, onBack, onNavigateSlug }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [projectSlug]);

  // Retrieve project by slug
  const projectIndex = projects.findIndex((p) => p.slug === projectSlug || p.id === projectSlug);
  const project = projects[projectIndex];

  // If invalid project slug requested: clean error state
  if (!project) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-[#f2f2f0] flex flex-col items-center justify-center p-8 font-mono">
        <div className="space-y-4 text-center max-w-md">
          <div className="text-4xl font-sora font-extrabold text-[#f2f2f0]">Project Not Found</div>
          <p className="text-xs sm:text-sm text-[#8a8a8a]">
            The requested project slug "{projectSlug}" could not be located in the portfolio.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 border border-white/20 px-6 py-3 text-xs text-[#f2f2f0] hover:text-[#8a8a8a] transition-colors cursor-pointer font-bold mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>&larr; Back to Projects</span>
          </button>
        </div>
      </div>
    );
  }

  const cs = project.caseStudy || {};
  const totalProjects = projects.length;
  const prevProject = projects[(projectIndex - 1 + totalProjects) % totalProjects];
  const nextProject = projects[(projectIndex + 1) % totalProjects];

  const renderPreviewComponent = () => {
    switch (project.preview) {
      case 'social':
        return <SocialPreview />;
      case 'cms':
        return <CmsPreview />;
      case 'management':
        return <ProjectManagementPreview />;
      case 'airquality':
        return <AirQualityPreview />;
      case 'construction':
        return <ConstructionPreview />;
      case 'realestate':
        return <RealEstatePreview />;
      default:
        return <ConstructionPreview />;
    }
  };

  return (
    <article className="min-h-screen bg-[#0f0f0f] text-[#f2f2f0] pt-24 pb-32">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 space-y-16">
        
        {/* Minimal Editorial Back Navigation */}
        <div className="flex items-center justify-between border-b border-[#f2f2f0]/15 pb-6 font-mono text-xs text-[#8a8a8a]">
          <button
            onClick={onBack}
            className="hover:text-[#f2f2f0] transition-colors flex items-center gap-2 cursor-pointer font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>&larr; Back to Projects</span>
          </button>

          <span>PROJECT {project.number} / 0{totalProjects}</span>
        </div>

        {/* SECTION 5: CASE STUDY HEADER & TITLE */}
        <header className="space-y-6">
          <div className="font-mono text-xs uppercase tracking-widest text-[#8a8a8a] font-bold">
            PROJECT {project.number} / 0{totalProjects}
          </div>
          
          <h1 className="font-sora text-4xl sm:text-6xl font-extrabold text-[#f2f2f0] tracking-tight">
            {project.name}
          </h1>

          <p className="font-mono text-base sm:text-lg text-[#b8b8b5]">
            {project.subtitle}
          </p>

          {/* 3-5 Line Project Description */}
          <p className="text-sm sm:text-base text-[#b8b8b5] leading-relaxed max-w-3xl">
            {project.description}
          </p>

          {/* Primary Action: GitHub ONLY (NO fake Live Demo) */}
          <div className="pt-2 flex items-center gap-6 font-mono text-xs">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="text-[#f2f2f0] hover:text-[#8a8a8a] transition-colors font-bold flex items-center gap-2 border border-white/20 px-6 py-3 bg-[#161616]"
              >
                <Github className="w-4 h-4" />
                <span>GitHub Repository &rarr;</span>
              </a>
            )}
          </div>
        </header>

        {/* SECTION 6: PROJECT METADATA BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-[#f2f2f0]/15 bg-[#161616] font-mono text-xs">
          <div>
            <span className="text-[#8a8a8a] uppercase text-[10px] tracking-wider block font-bold mb-1">
              PROJECT TYPE
            </span>
            <span className="text-[#f2f2f0] font-medium">{project.type}</span>
          </div>

          <div>
            <span className="text-[#8a8a8a] uppercase text-[10px] tracking-wider block font-bold mb-1">
              ROLE
            </span>
            <span className="text-[#f2f2f0] font-medium">{project.role || "Developer"}</span>
          </div>

          <div>
            <span className="text-[#8a8a8a] uppercase text-[10px] tracking-wider block font-bold mb-1">
              TECH STACK
            </span>
            <span className="text-[#f2f2f0] font-medium">{project.technologies.join(" · ")}</span>
          </div>

          <div>
            <span className="text-[#8a8a8a] uppercase text-[10px] tracking-wider block font-bold mb-1">
              GITHUB
            </span>
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="text-[#f2f2f0] hover:underline flex items-center gap-1 font-bold"
            >
              <span>GitHub &rarr;</span>
            </a>
          </div>
        </div>

        {/* SECTION 7: LARGE UNBOXED PROJECT VISUAL AREA */}
        <div className="w-full h-[320px] sm:h-[480px] border border-[#f2f2f0]/15 bg-[#161616] overflow-hidden relative shadow-2xl">
          {renderPreviewComponent()}
        </div>

        {/* SECTION 8: 01 — OVERVIEW */}
        <section className="space-y-4 pt-8 border-t border-[#f2f2f0]/15">
          <div className="font-mono text-xs text-[#8a8a8a] uppercase tracking-widest font-bold">
            01 &mdash; Overview
          </div>
          <h2 className="font-sora text-2xl font-bold text-[#f2f2f0]">System Context & Purpose</h2>
          <div className="text-sm sm:text-base text-[#b8b8b5] leading-relaxed space-y-4 max-w-3xl">
            <p>{cs.overview}</p>
            {cs.problem && (
              <div className="border-l-2 border-[#8a8a8a] pl-4 py-1 space-y-1 font-mono text-xs sm:text-sm">
                <span className="text-[#f2f2f0] font-bold block uppercase">Problem Statement</span>
                <p className="text-[#b8b8b5]">{cs.problem}</p>
              </div>
            )}
            {cs.solution && (
              <div className="border-l-2 border-[#f2f2f0] pl-4 py-1 space-y-1 font-mono text-xs sm:text-sm">
                <span className="text-[#f2f2f0] font-bold block uppercase">Engineering Resolution</span>
                <p className="text-[#b8b8b5]">{cs.solution}</p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 9: 02 — KEY FEATURES */}
        {cs.features && cs.features.length > 0 && (
          <section className="space-y-6 pt-8 border-t border-[#f2f2f0]/15">
            <div className="font-mono text-xs text-[#8a8a8a] uppercase tracking-widest font-bold">
              02 &mdash; Key Features
            </div>
            <h2 className="font-sora text-2xl font-bold text-[#f2f2f0]">Core Capabilities</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              {cs.features.map((feat, idx) => (
                <div key={idx} className="space-y-2 font-mono text-xs sm:text-sm">
                  <div className="text-[#8a8a8a] font-bold text-base font-sora">
                    0{idx + 1}
                  </div>
                  <div className="text-[#f2f2f0] font-bold text-sm">
                    {typeof feat === 'string' ? feat : feat.title}
                  </div>
                  {typeof feat === 'object' && feat.desc && (
                    <p className="text-[#b8b8b5] text-xs leading-relaxed">
                      {feat.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 10: 03 — TECHNICAL ARCHITECTURE */}
        {cs.architecture && (
          <section className="space-y-6 pt-8 border-t border-[#f2f2f0]/15">
            <div className="font-mono text-xs text-[#8a8a8a] uppercase tracking-widest font-bold">
              03 &mdash; Technical Architecture
            </div>
            <h2 className="font-sora text-2xl font-bold text-[#f2f2f0] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#8a8a8a]" />
              <span>Verified System Stack</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs border border-[#f2f2f0]/15 p-6 bg-[#161616]">
              <div>
                <span className="text-[#8a8a8a] block uppercase text-[10px] font-bold mb-1">Frontend</span>
                <span className="text-[#f2f2f0]">{cs.architecture.frontend}</span>
              </div>
              <div>
                <span className="text-[#8a8a8a] block uppercase text-[10px] font-bold mb-1">Backend</span>
                <span className="text-[#f2f2f0]">{cs.architecture.backend}</span>
              </div>
              <div>
                <span className="text-[#8a8a8a] block uppercase text-[10px] font-bold mb-1">Database</span>
                <span className="text-[#f2f2f0]">{cs.architecture.database}</span>
              </div>
              <div>
                <span className="text-[#8a8a8a] block uppercase text-[10px] font-bold mb-1">Authentication</span>
                <span className="text-[#f2f2f0]">{cs.architecture.authentication}</span>
              </div>
              <div>
                <span className="text-[#8a8a8a] block uppercase text-[10px] font-bold mb-1">APIs</span>
                <span className="text-[#f2f2f0]">{cs.architecture.apis}</span>
              </div>
              <div>
                <span className="text-[#8a8a8a] block uppercase text-[10px] font-bold mb-1">Deployment</span>
                <span className="text-[#f2f2f0]">{cs.architecture.deployment}</span>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 11: 04 — FOLDER STRUCTURE */}
        {cs.folderStructure && (
          <section className="space-y-4 pt-8 border-t border-[#f2f2f0]/15">
            <div className="font-mono text-xs text-[#8a8a8a] uppercase tracking-widest font-bold">
              04 &mdash; Structure
            </div>
            <h2 className="font-sora text-2xl font-bold text-[#f2f2f0] flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#8a8a8a]" />
              <span>Verified Repository Layout</span>
            </h2>
            
            <pre className="font-mono text-xs text-[#b8b8b5] bg-[#161616] p-6 border border-[#f2f2f0]/15 overflow-x-auto leading-relaxed select-all">
              {cs.folderStructure}
            </pre>
          </section>
        )}

        {/* SECTION 12: 05 — TECHNICAL DETAILS */}
        {cs.modules && cs.modules.length > 0 && (
          <section className="space-y-4 pt-8 border-t border-[#f2f2f0]/15">
            <div className="font-mono text-xs text-[#8a8a8a] uppercase tracking-widest font-bold">
              05 &mdash; Technical Details
            </div>
            <h2 className="font-sora text-2xl font-bold text-[#f2f2f0]">Implementation Modules</h2>

            <div className="space-y-3 font-mono text-xs sm:text-sm">
              {cs.modules.map((mod, idx) => (
                <div key={idx} className="border-b border-[#f2f2f0]/10 pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-[#f2f2f0] font-bold">{mod.name}</span>
                  <span className="text-[#8a8a8a] text-xs">{mod.desc}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 13: 06 — TECHNICAL CHALLENGES */}
        {cs.challenges && cs.challenges.length > 0 && (
          <section className="space-y-4 pt-8 border-t border-[#f2f2f0]/15">
            <div className="font-mono text-xs text-[#8a8a8a] uppercase tracking-widest font-bold">
              06 &mdash; Challenges
            </div>
            <h2 className="font-sora text-2xl font-bold text-[#f2f2f0]">Engineering Challenges</h2>

            <div className="space-y-4 font-mono text-xs sm:text-sm">
              {cs.challenges.map((c, idx) => (
                <div key={idx} className="space-y-2 bg-[#161616] p-5 border border-[#f2f2f0]/10">
                  <div className="text-[#8a8a8a] font-bold uppercase text-[11px]">CHALLENGE</div>
                  <div className="text-[#f2f2f0]">{c.challenge}</div>
                  <div className="text-[#8a8a8a] font-bold uppercase text-[11px] pt-2">SOLUTION</div>
                  <div className="text-[#b8b8b5]">{c.solution}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 14: 07 — OUTCOME & FUTURE IMPROVEMENTS */}
        <section className="space-y-6 pt-8 border-t border-[#f2f2f0]/15 font-mono text-xs sm:text-sm">
          <div className="font-mono text-xs text-[#8a8a8a] uppercase tracking-widest font-bold">
            07 &mdash; Outcome
          </div>
          <h2 className="font-sora text-2xl font-bold text-[#f2f2f0]">Production Summary</h2>
          <p className="text-[#b8b8b5] leading-relaxed max-w-3xl">
            {project.name} demonstrates full-stack software architecture, structured data models, and high-concurrency event handling across production web environments.
          </p>

          {cs.futureImprovements && cs.futureImprovements.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#f2f2f0]/10">
              <div className="text-[#f2f2f0] font-bold uppercase tracking-wider text-xs">
                WHAT I WOULD IMPROVE (FUTURE ROADMAP)
              </div>
              <ul className="space-y-2 text-[#8a8a8a]">
                {cs.futureImprovements.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span>&rarr;</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* SECTION 15: CASE STUDY NAVIGATION (PREVIOUS / NEXT) */}
        <nav className="pt-12 border-t border-[#f2f2f0]/20 flex items-center justify-between font-mono text-xs sm:text-sm text-[#f2f2f0]">
          {projectIndex > 0 ? (
            <button
              onClick={() => onNavigateSlug(prevProject.slug)}
              className="hover:text-[#8a8a8a] transition-colors flex items-center gap-2 cursor-pointer font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous &rarr; {prevProject.name}</span>
            </button>
          ) : (
            <div />
          )}

          {projectIndex < totalProjects - 1 ? (
            <button
              onClick={() => onNavigateSlug(nextProject.slug)}
              className="hover:text-[#8a8a8a] transition-colors flex items-center gap-2 cursor-pointer font-bold"
            >
              <span>Next &rarr; {nextProject.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div />
          )}
        </nav>

      </div>
    </article>
  );
}
