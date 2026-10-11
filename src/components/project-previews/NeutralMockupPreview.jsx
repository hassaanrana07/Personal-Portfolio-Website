import React from 'react';
import { Terminal, Cpu, Database, Activity, CheckCircle2 } from 'lucide-react';

export default function NeutralMockupPreview({ projectName = 'System Architecture', accentColor = '#FF9A3D' }) {
  return (
    <div className="w-full h-full bg-[#100E0D] text-[#F5F1EC] p-4 rounded-xl border border-white/10 flex flex-col justify-between select-none overflow-hidden text-xs font-mono">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2 font-bold tracking-tight text-[#F5F1EC]">
            <Terminal className="w-4 h-4 text-[#FF9A3D]" />
            <span className="truncate">{projectName}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>Operational</span>
          </div>
        </div>

        {/* System Metric Nodes */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/03 p-2 rounded-lg border border-white/05">
            <div className="text-[10px] text-[#9A9088] flex items-center gap-1 mb-0.5">
              <Cpu className="w-3 h-3 text-[#FF9A3D]" /> Engine Status
            </div>
            <div className="font-bold text-[#F5F1EC] text-xs">Active &bull; Node.js</div>
          </div>
          <div className="bg-white/03 p-2 rounded-lg border border-white/05">
            <div className="text-[10px] text-[#9A9088] flex items-center gap-1 mb-0.5">
              <Database className="w-3 h-3 text-[#FF5722]" /> Cluster DB
            </div>
            <div className="font-bold text-[#F5F1EC] text-xs">MySQL 8.0 &bull; 99.9%</div>
          </div>
        </div>
      </div>

      {/* Pipeline Status Checklist */}
      <div className="space-y-1.5 bg-[#141210] p-2.5 rounded-lg border border-white/05 text-[11px]">
        <div className="flex items-center justify-between text-[#B5AEA8]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> REST / GraphQL Endpoints
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">200 OK</span>
        </div>
        <div className="flex items-center justify-between text-[#B5AEA8]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> State Hydration Pipeline
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Ready</span>
        </div>
        <div className="flex items-center justify-between text-[#F5F1EC] font-medium">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#FF9A3D]" /> Interactive UI Viewport
          </span>
          <span className="text-[10px] text-[#FF9A3D] font-mono">Standby</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-white/05 flex items-center justify-between text-[10px] text-[#9A9088]">
        <span>Latency: &lt;18ms</span>
        <span className="text-[#FF9A3D]">Production Environment</span>
      </div>
    </div>
  );
}
