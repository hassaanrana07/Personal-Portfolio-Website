import React from 'react';
import { CheckCircle2, Clock, Layers, ArrowUpRight } from 'lucide-react';

export default function ProjectManagementPreview() {
  return (
    <div className="w-full h-full bg-[#13111c] text-purple-100 p-3 rounded-lg border border-purple-900/40 flex flex-col justify-between select-none overflow-hidden text-xs">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-purple-900/30 mb-2">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-purple-300">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>ProjectFlow</span>
          </div>
          <div className="flex items-center gap-1 bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded text-[9px] border border-purple-500/20 font-mono">
            <span>Sprint 42</span>
          </div>
        </div>

        {/* Stats counters */}
        <div className="flex items-center justify-between bg-[#1b1728] p-2 rounded border border-purple-900/30 mb-2 text-[10px]">
          <div className="text-center">
            <div className="text-purple-300/60 font-mono">Total</div>
            <div className="font-bold text-slate-100 text-[11px]">24</div>
          </div>
          <div className="h-4 w-px bg-purple-900/40"></div>
          <div className="text-center">
            <div className="text-purple-400 font-mono">Active</div>
            <div className="font-bold text-purple-300 text-[11px]">18</div>
          </div>
          <div className="h-4 w-px bg-purple-900/40"></div>
          <div className="text-center">
            <div className="text-emerald-400 font-mono">Done</div>
            <div className="font-bold text-emerald-300 text-[11px]">06</div>
          </div>
        </div>
      </div>

      {/* Progress Bars List */}
      <div className="space-y-2 my-1">
        {/* Project 1 */}
        <div>
          <div className="flex justify-between items-center text-[10px] mb-1">
            <span className="font-medium text-slate-200">Website Redesign</span>
            <span className="font-mono text-purple-400">80%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-400 h-full rounded-full w-[80%] transition-all duration-500"></div>
          </div>
        </div>

        {/* Project 2 */}
        <div>
          <div className="flex justify-between items-center text-[10px] mb-1">
            <span className="font-medium text-slate-200">Mobile App Build</span>
            <span className="font-mono text-purple-400">60%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-400 h-full rounded-full w-[60%] transition-all duration-500"></div>
          </div>
        </div>

        {/* Project 3 */}
        <div>
          <div className="flex justify-between items-center text-[10px] mb-1">
            <span className="font-medium text-slate-200">API Integration</span>
            <span className="font-mono text-purple-400">45%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-400 h-full rounded-full w-[45%] transition-all duration-500"></div>
          </div>
        </div>
      </div>

      {/* Deadline Widget */}
      <div className="bg-gradient-to-r from-purple-950/60 to-slate-900 p-2 rounded border border-purple-500/30 flex items-center justify-between text-[10px] mt-1">
        <div className="flex items-center gap-1.5 text-purple-200">
          <Clock className="w-3.5 h-3.5 text-purple-400 animate-spin-slow" />
          <div>
            <div className="font-semibold text-slate-100 leading-none">Friday Milestone</div>
            <div className="text-[9px] text-purple-300/70 mt-0.5">Dashboard Release</div>
          </div>
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
      </div>
    </div>
  );
}
