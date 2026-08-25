import React from 'react';
import { Building2, CheckCircle2, Circle, Clock, HardHat } from 'lucide-react';

export default function ConstructionPreview() {
  return (
    <div className="w-full h-full bg-[#18140f] text-amber-100 p-3 rounded-lg border border-amber-900/40 flex flex-col justify-between select-none overflow-hidden text-xs">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-amber-900/30 mb-2">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-amber-400">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>BrickBeam</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-mono">
            <HardHat className="w-3 h-3 text-amber-400" />
            <span>Phase 3</span>
          </div>
        </div>

        {/* Construction Overall Progress */}
        <div className="bg-[#241d16] p-2 rounded border border-amber-900/30 mb-2">
          <div className="flex justify-between items-center text-[10px] mb-1">
            <span className="font-semibold text-slate-200">Main Building Sector A</span>
            <span className="font-mono text-amber-400 font-bold">72%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400 h-full rounded-full w-[72%]"></div>
          </div>
        </div>
      </div>

      {/* Workflow Phase Checklist */}
      <div className="space-y-1.5 my-1 bg-[#1f1a13] p-2 rounded border border-amber-900/20 text-[10px]">
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Site Planning &amp; Permits
          </span>
          <span className="text-[9px] text-emerald-400 font-mono">✓ Done</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Foundation Concrete
          </span>
          <span className="text-[9px] text-emerald-400 font-mono">✓ Done</span>
        </div>
        <div className="flex items-center justify-between text-amber-200 font-medium">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" /> Steel Structure Framing
          </span>
          <span className="text-[9px] text-amber-400 font-mono">● Active</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Circle className="w-3.5 h-3.5 text-slate-600" /> Exterior Finishing
          </span>
          <span className="text-[9px] text-slate-500 font-mono">○ Pending</span>
        </div>
      </div>

      {/* Resource Allocation Footer */}
      <div className="flex items-center justify-between bg-[#282119] px-2.5 py-1.5 rounded border border-amber-900/30 text-[10px]">
        <span className="text-amber-300/80 font-mono">Allocated Resources</span>
        <span className="font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
          24 Units / 5 Heavy Equip
        </span>
      </div>
    </div>
  );
}
