import React, { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { projects } from '../data/projects';
import ProjectCard from './ProjectCard';

export default function Projects({ onOpenCaseStudySlug }) {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  return (
    <section
      ref={containerRef}
      id="projects"
      className="relative z-20 bg-[#0C0C0C] text-[#f2f2f0] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 pt-20 pb-32"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADING: "PROJECTS" */}
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mono-text text-xs uppercase tracking-widest text-[#8a8a8a] font-bold"
          >
            05 &mdash; Featured Case Studies
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-sora font-black uppercase text-center tracking-tighter leading-none text-[clamp(3rem,12vw,160px)]"
            style={{
              background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            PROJECTS
          </motion.h2>
        </div>

        {/* FRAMER MOTION STICKY CARD STACKING SHOWCASE */}
        <div className="relative space-y-4">
          {projects.map((project, idx) => {
            const targetScale = 1 - (projects.length - 1 - idx) * 0.03;
            const startRange = idx / projects.length;

            return (
              <ProjectCard
                key={project.id}
                project={project}
                index={idx}
                totalCards={projects.length}
                progress={scrollYProgress}
                range={[startRange, 1]}
                targetScale={targetScale}
                onOpenCaseStudySlug={onOpenCaseStudySlug}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
}
