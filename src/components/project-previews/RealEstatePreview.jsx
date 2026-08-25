import React from 'react';
import { Home, Search, SlidersHorizontal, MapPin, DollarSign } from 'lucide-react';

export default function RealEstatePreview() {
  return (
    <div className="w-full h-full bg-[#0a1813] text-emerald-100 p-2.5 rounded-lg border border-emerald-900/40 flex flex-col justify-between select-none overflow-hidden text-xs">
      {/* Search Header */}
      <div>
        <div className="flex items-center justify-between pb-1.5 border-b border-emerald-900/30 mb-2">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-emerald-400">
            <Home className="w-4 h-4 text-emerald-400" />
            <span>Rent Bro</span>
          </div>
          <div className="text-[9px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
            PRMS v2
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-1 bg-[#10241d] p-1.5 rounded border border-emerald-900/30 mb-2">
          <Search className="w-3.5 h-3.5 text-emerald-400/70" />
          <input
            type="text"
            readOnly
            value="Search properties..."
            className="bg-transparent border-none text-[10px] text-slate-300 w-full focus:outline-none cursor-default"
          />
          <button className="bg-emerald-500/20 text-emerald-300 p-1 rounded hover:bg-emerald-500/30">
            <SlidersHorizontal className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-2 gap-2 my-0.5 flex-1">
        {/* Card 1 */}
        <div className="bg-[#122b21] p-1.5 rounded-lg border border-emerald-900/30 flex flex-col justify-between">
          {/* CSS Placeholder Graphic for House */}
          <div className="w-full h-12 rounded bg-gradient-to-tr from-emerald-950 via-teal-900 to-emerald-900/40 border border-emerald-500/20 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:8px_8px] opacity-20"></div>
            <div className="text-[9px] font-mono text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
              Apartment
            </div>
          </div>
          <div className="mt-1">
            <div className="font-bold text-emerald-400 text-[11px] leading-tight">$120,000</div>
            <div className="flex items-center gap-1 text-[9px] text-slate-300 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Lahore, PK</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#122b21] p-1.5 rounded-lg border border-emerald-900/30 flex flex-col justify-between">
          {/* CSS Placeholder Graphic for Villa */}
          <div className="w-full h-12 rounded bg-gradient-to-tr from-emerald-950 via-emerald-900 to-amber-900/30 border border-emerald-500/20 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:8px_8px] opacity-20"></div>
            <div className="text-[9px] font-mono text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
              Luxury House
            </div>
          </div>
          <div className="mt-1">
            <div className="font-bold text-emerald-400 text-[11px] leading-tight">$185,000</div>
            <div className="flex items-center gap-1 text-[9px] text-slate-300 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Islamabad, PK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Status Bar */}
      <div className="flex items-center justify-between text-[9px] text-emerald-300/80 pt-1.5 border-t border-emerald-900/30 px-1">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active Leases
        </span>
        <span className="font-mono text-emerald-400">Ledger Audited</span>
      </div>
    </div>
  );
}
