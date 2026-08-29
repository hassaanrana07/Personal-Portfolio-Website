import React, { useState } from 'react';

export default function Services() {
  const [selectedServiceTitle, setSelectedServiceTitle] = useState(null);

  const serviceOfferings = [
    { title: "FULL STACK DEVELOPMENT", desc: "End-to-End Web Applications" },
    { title: "FRONTEND ARCHITECTURE", desc: "React · Vue · Modern UI/UX" },
    { title: "BACKEND ENGINEERING", desc: "Laravel 12 · Node.js · Express" },
    { title: "DATABASE SYSTEMS", desc: "MySQL · PostgreSQL · MongoDB" },
    { title: "CMS & SAAS PLATFORMS", desc: "Headless Content Engines & RBAC" },
    { title: "REAL-TIME WEBSOCKETS", desc: "Low-Latency Event Streaming" },
    { title: "ENTERPRISE DASHBOARDS", desc: "Data Analytics & Workflows" },
    { title: "RESTFUL API ARCHITECTURE", desc: "Secure JSON Microservices" },
    { title: "CLOUD DEPLOYMENT", desc: "Nginx · Linux VPS · CI/CD" },
  ];

  const handleServiceClick = (title) => {
    // Toggle selection: click selected service again to unselect & resume scrolling
    if (selectedServiceTitle === title) {
      setSelectedServiceTitle(null);
    } else {
      setSelectedServiceTitle(title);
    }
  };

  const isPaused = selectedServiceTitle !== null;

  return (
    <section id="services" className="py-20 relative bg-[#0f0f0f] border-y border-[#f2f2f0]/15 overflow-hidden text-[#f2f2f0]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 mb-8 flex items-center justify-between">
        <div className="mono-text text-xs uppercase tracking-widest text-[#8a8a8a] font-bold">
          03 &mdash; Services & Capabilities
        </div>

        {selectedServiceTitle && (
          <button
            onClick={() => setSelectedServiceTitle(null)}
            className="font-mono text-xs text-[#efeee9] hover:text-[#8a8a8a] transition-colors cursor-pointer"
          >
            [Selected: {selectedServiceTitle} &bull; Click to Resume Scrolling]
          </button>
        )}
      </div>

      {/* Continuous Horizontal Marquee/Slider (Moving Right -> Left, Hover/Click Pauses, Text Brightens to #efeee9) */}
      <div className="w-full overflow-hidden select-none py-6 bg-[#161616] group">
        <div
          className="animate-marquee-left group-hover:[animation-play-state:paused] flex items-center space-x-12 whitespace-nowrap"
          style={{ animationPlayState: isPaused ? 'paused' : undefined }}
        >
          {/* Double map for seamless infinite looping */}
          {[...serviceOfferings, ...serviceOfferings].map((service, idx) => {
            const isSelected = selectedServiceTitle === service.title;
            return (
              <div
                key={idx}
                onClick={() => handleServiceClick(service.title)}
                className="flex items-center space-x-12 flex-shrink-0 cursor-pointer group/item transition-all duration-300"
              >
                <div className="flex flex-col">
                  <span
                    className={`font-sora text-xl sm:text-3xl font-extrabold tracking-tight transition-colors duration-300 ${
                      isSelected
                        ? 'text-[#efeee9]'
                        : 'text-[#8a8a8a] group-hover/item:text-[#efeee9]'
                    }`}
                  >
                    {service.title}
                  </span>
                  <span
                    className={`font-mono text-xs transition-colors duration-300 mt-0.5 ${
                      isSelected
                        ? 'text-[#f2f2f0]'
                        : 'text-[#8a8a8a]/70 group-hover/item:text-[#f2f2f0]'
                    }`}
                  >
                    {service.desc}
                  </span>
                </div>
                <span className="text-[#8a8a8a] font-mono text-2xl select-none">&bull;</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
