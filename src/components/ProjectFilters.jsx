import React from 'react';
import { projectFilters } from '../data/projects';

export default function ProjectFilters({ activeFilter, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {projectFilters.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-white/10 text-[#FF9A3D] border border-[#FF9A3D] shadow-[0_0_12px_rgba(255,154,61,0.2)] font-mono'
                : 'glass-btn px-4 py-2 text-[#9A9088] hover:text-[#F5F1EC] font-mono'
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
