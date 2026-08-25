import React from 'react';
import { workExperience, educationExperience } from '../data/experience';
import { Briefcase, GraduationCap, Calendar, MapPin } from 'lucide-react';
import { handleGlassMouseMove, handleGlassMouseLeave } from '../utils/useGlassTilt';

export default function Experience() {
  return (
    <section id="experience" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-14">
          <div className="mono-text text-xs uppercase tracking-widest text-[#FF9A3D] mb-2 font-bold">
            06 &mdash; Experience
          </div>
          <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-[#F5F1EC] tracking-tight">
            Journey So Far
          </h2>
          <p className="text-[#9A9088] text-sm mt-1 max-w-xl">
            Detailed timeline of my professional software engineering roles and computer science education background.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* WORK HISTORY COLUMN */}
          <div>
            <div className="flex items-center gap-3 mb-8 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/05 border border-[#FF9A3D]/30 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[#FF9A3D]" />
              </div>
              <div>
                <h3 className="font-sora text-lg font-bold text-[#F5F1EC] uppercase tracking-wider">
                  Work Experience
                </h3>
                <span className="mono-text text-xs text-[#9A9088]">Software Engineering Roles</span>
              </div>
            </div>

            <div className="relative pl-6 space-y-8 border-l-2 border-[#FF9A3D]/40">
              {workExperience.map((item, index) => (
                <div key={index} className="relative group">
                  {/* Glowing Accent Dot */}
                  <div className="absolute -left-[31px] top-2 w-3.5 h-3.5 rounded-full bg-[#0D0B0A] border-2 border-[#FF9A3D] shadow-[0_0_12px_#FF9A3D] group-hover:scale-125 group-hover:bg-[#FF9A3D] transition-all"></div>

                  {/* Card Content */}
                  <div
                    className="glass p-6 rounded-2xl transition-all duration-300 group-hover:-translate-y-1 shadow-xl cursor-pointer border border-white/10"
                    onMouseMove={handleGlassMouseMove}
                    onMouseLeave={handleGlassMouseLeave}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="mono-text text-xs text-[#FF9A3D] font-bold inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.period}</span>
                      </span>
                      <span className="mono-text text-[10px] text-[#9A9088] bg-white/05 px-2.5 py-0.5 rounded-md border border-white/10 inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#FF5722]" />
                        <span>{item.location || 'Lahore, PK'}</span>
                      </span>
                    </div>

                    <h4 className="font-sora text-lg font-bold text-[#F5F1EC] group-hover:text-[#FF9A3D] transition-colors">
                      {item.role}
                    </h4>
                    <div className="text-xs font-semibold text-[#FFC107] mt-0.5 mb-3">
                      {item.company}
                    </div>

                    <p className="text-xs text-[#9A9088] leading-relaxed mb-4">
                      {item.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-white/05 border border-white/10 text-[#F5F1EC] text-[10px] font-mono px-2.5 py-0.5 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EDUCATION COLUMN */}
          <div>
            <div className="flex items-center gap-3 mb-8 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/05 border border-[#FF5722]/30 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#FF5722]" />
              </div>
              <div>
                <h3 className="font-sora text-lg font-bold text-[#F5F1EC] uppercase tracking-wider">
                  Education
                </h3>
                <span className="mono-text text-xs text-[#9A9088]">Academic Qualifications</span>
              </div>
            </div>

            <div className="relative pl-6 space-y-8 border-l-2 border-[#FF5722]/40">
              {educationExperience.map((item, index) => (
                <div key={index} className="relative group">
                  {/* Glowing Accent Dot */}
                  <div className="absolute -left-[31px] top-2 w-3.5 h-3.5 rounded-full bg-[#0D0B0A] border-2 border-[#FF5722] shadow-[0_0_12px_#FF5722] group-hover:scale-125 group-hover:bg-[#FF5722] transition-all"></div>

                  {/* Card Content */}
                  <div
                    className="glass p-6 rounded-2xl transition-all duration-300 group-hover:-translate-y-1 shadow-xl cursor-pointer border border-white/10"
                    onMouseMove={handleGlassMouseMove}
                    onMouseLeave={handleGlassMouseLeave}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="mono-text text-xs text-[#FF5722] font-bold inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.period}</span>
                      </span>
                    </div>

                    <h4 className="font-sora text-lg font-bold text-[#F5F1EC] group-hover:text-[#FF5722] transition-colors">
                      {item.role}
                    </h4>
                    <div className="text-xs font-semibold text-[#FF5722] mt-0.5 mb-3">
                      {item.institution}
                    </div>

                    <p className="text-xs text-[#9A9088] leading-relaxed mb-4">
                      {item.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-white/05 border border-white/10 text-[#F5F1EC] text-[10px] font-mono px-2.5 py-0.5 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
