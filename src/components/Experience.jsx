import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import usePortfolioData from '../hooks/usePortfolioData';
import { Briefcase, GraduationCap, Calendar, MapPin, Sparkles, Layers } from 'lucide-react';
import { handleGlassMouseMove, handleGlassMouseLeave } from '../utils/useGlassTilt';
import { sortExperienceList } from '../utils/experienceSorter';

export default function Experience() {
  const { workExperience, educationExperience } = usePortfolioData();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'work' | 'education'

  // Combine and normalize all experience records into a unified chronological timeline
  const allTimelineItems = useMemo(() => {
    const workItems = sortExperienceList((workExperience || []).map((w, i) => ({
      ...w,
      category: 'work',
      categoryLabel: 'Work Experience',
      icon: Briefcase,
      accentColor: '#FF9A3D',
      key: `work-${w.id || i}`
    })));

    const eduItems = sortExperienceList((educationExperience || []).map((e, i) => ({
      ...e,
      category: 'education',
      categoryLabel: 'Education',
      icon: GraduationCap,
      accentColor: '#a855f7',
      company: e.institution || e.company,
      key: `edu-${e.id || i}`
    })));

    if (activeTab === 'work') return workItems;
    if (activeTab === 'education') return eduItems;

    // All tab: chronological order across work and education
    return sortExperienceList([...workItems, ...eduItems]);
  }, [workExperience, educationExperience, activeTab]);

  return (
    <section id="experience" className="py-24 relative overflow-hidden bg-[#0c0c0c] text-[#f2f2f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div>
            <div className="mono-text text-xs uppercase tracking-widest text-[#FF9A3D] mb-2 font-bold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF9A3D]" />
              <span>06 &mdash; Journey So Far</span>
            </div>
            <h2 className="font-sora text-3xl sm:text-5xl font-extrabold text-[#F5F1EC] tracking-tight">
              Education & Work Experience
            </h2>
            <p className="text-[#9A9088] text-sm mt-2 max-w-xl font-mono">
              Professional software engineering milestones, production architectures, and academic computer science background.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#141416] border border-white/10 rounded-xl font-mono text-xs select-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                activeTab === 'all'
                  ? 'bg-[#FF9A3D] text-[#0D0B0A] shadow-md shadow-[#FF9A3D]/20'
                  : 'text-[#8A8A8A] hover:text-[#F5F1EC]'
              }`}
            >
              All ({workExperience.length + educationExperience.length})
            </button>
            <button
              onClick={() => setActiveTab('work')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                activeTab === 'work'
                  ? 'bg-[#FF9A3D] text-[#0D0B0A] shadow-md shadow-[#FF9A3D]/20'
                  : 'text-[#8A8A8A] hover:text-[#F5F1EC]'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>Work ({workExperience.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                activeTab === 'education'
                  ? 'bg-[#FF9A3D] text-[#0D0B0A] shadow-md shadow-[#FF9A3D]/20'
                  : 'text-[#8A8A8A] hover:text-[#F5F1EC]'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>Education ({educationExperience.length})</span>
            </button>
          </div>
        </motion.div>

        {/* 2-COLUMN ALTERNATING EDITORIAL TIMELINE */}
        <div className="relative max-w-5xl mx-auto">
          {/* Desktop Center Vertical Spine */}
          <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 -translate-x-1/2 w-0.5 bg-gradient-to-b from-[#FF9A3D] via-white/20 to-transparent pointer-events-none" />

          {/* Mobile Left-Hand Timeline Spine */}
          <div className="lg:hidden absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#FF9A3D] via-white/20 to-transparent pointer-events-none" />

          <div className="space-y-6 lg:space-y-10">
            {allTimelineItems.map((item, index) => {
              const isEven = index % 2 === 0;
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.key || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 1, 0.5, 1] }}
                  className={`relative flex flex-col lg:flex-row items-stretch lg:items-center ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } pl-10 lg:pl-0`}
                >
                  {/* Timeline Node Dot (Centered on desktop, Left-aligned on mobile) */}
                  <div
                    className="absolute left-4 lg:left-1/2 -translate-x-1/2 top-6 w-4 h-4 rounded-full bg-[#0D0B0A] border-2 shadow-lg z-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-125"
                    style={{ borderColor: item.accentColor, boxShadow: `0 0 14px ${item.accentColor}60` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.accentColor }} />
                  </div>

                  {/* Half-Width Card Container (Reduced gap: lg:pr-6 / lg:pl-6) */}
                  <div className={`w-full lg:w-1/2 ${isEven ? 'lg:pr-6' : 'lg:pl-6'}`}>
                    <div
                      className="glass bg-[#141416]/85 p-5 sm:p-6 rounded-2xl border border-white/10 hover:border-[#FF9A3D]/40 transition-all duration-300 shadow-xl hover:-translate-y-1 group cursor-default relative overflow-hidden"
                      onMouseMove={handleGlassMouseMove}
                      onMouseLeave={handleGlassMouseLeave}
                    >
                      {/* Ambient corner glow */}
                      <div
                        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none opacity-10 group-hover:opacity-25 transition-opacity"
                        style={{ backgroundColor: item.accentColor }}
                      />

                      {/* Top Meta Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        {/* Category & Period Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 border"
                            style={{
                              backgroundColor: `${item.accentColor}15`,
                              borderColor: `${item.accentColor}40`,
                              color: item.accentColor
                            }}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{item.categoryLabel}</span>
                          </span>

                          <span className="text-xs font-mono text-[#FF9A3D] font-bold inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{item.period}</span>
                          </span>
                        </div>

                        {/* Location Tag */}
                        {item.location && (
                          <span className="text-[10px] font-mono text-[#8A8A8A] bg-white/05 px-2.5 py-0.5 rounded-md border border-white/10 inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#FF9A3D]" />
                            <span>{item.location}</span>
                          </span>
                        )}
                      </div>

                      {/* Role & Company/Institution */}
                      <h3 className="font-sora text-lg sm:text-xl font-bold text-[#F5F1EC] group-hover:text-[#FF9A3D] transition-colors leading-snug">
                        {item.role}
                      </h3>
                      
                      <div className="text-xs sm:text-sm font-semibold text-[#b8b8b5] mt-1 mb-3 flex items-center gap-2">
                        <span className="text-[#FF9A3D]">&bull;</span>
                        <span>{item.company}</span>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-[#8A8A8A] leading-relaxed mb-4">
                        {item.description}
                      </p>

                      {/* Skill / Technology Pills */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
                          {item.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="bg-white/05 hover:bg-white/10 border border-white/10 text-[#F5F1EC] text-[10px] font-mono px-2.5 py-0.5 rounded-md transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Empty Spacer Half on Desktop (allows odd count without breaking layout) */}
                  <div className="hidden lg:block w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
