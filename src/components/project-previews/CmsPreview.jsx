import React from 'react';
import { LayoutDashboard, FileText, Users, Image, TrendingUp } from 'lucide-react';

export default function CmsPreview() {
  return (
    <div className="w-full h-full bg-[#161412] text-amber-100 p-2.5 rounded-lg border border-amber-900/30 flex gap-2 select-none overflow-hidden text-xs">
      {/* Sidebar Nav */}
      <div className="w-20 bg-[#1e1b18] rounded border border-amber-900/20 p-2 flex flex-col justify-between flex-shrink-0">
        <div>
          <div className="font-bold text-[11px] text-amber-400 mb-3 flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-amber-500"></div>
            <span>ContentHub</span>
          </div>
          <div className="space-y-1 text-[10px]">
            <div className="flex items-center gap-1.5 p-1 rounded bg-amber-500/20 text-amber-300 font-medium">
              <LayoutDashboard className="w-3 h-3 text-amber-400" />
              <span>Dash</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded text-amber-200/60 hover:text-amber-200">
              <FileText className="w-3 h-3" />
              <span>Posts</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded text-amber-200/60 hover:text-amber-200">
              <Users className="w-3 h-3" />
              <span>Users</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded text-amber-200/60 hover:text-amber-200">
              <Image className="w-3 h-3" />
              <span>Media</span>
            </div>
          </div>
        </div>
        <div className="text-[9px] text-amber-500/60 font-mono">v12.4 Enterprise</div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-amber-900/20">
          <div>
            <div className="font-semibold text-slate-100 text-[11px]">Dashboard Overview</div>
            <div className="text-[9px] text-amber-400/70">Real-Time CMS Metrics</div>
          </div>
          <div className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[9px] border border-amber-500/30">
            Publish Ready
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-1.5 my-1.5">
          <div className="bg-[#211d19] p-1.5 rounded border border-amber-900/30 text-center">
            <div className="text-[9px] text-amber-300/60 uppercase font-mono">Users</div>
            <div className="font-bold text-amber-400 text-[12px] leading-tight">1,248</div>
          </div>
          <div className="bg-[#211d19] p-1.5 rounded border border-amber-900/30 text-center">
            <div className="text-[9px] text-amber-300/60 uppercase font-mono">Posts</div>
            <div className="font-bold text-amber-300 text-[12px] leading-tight">86</div>
          </div>
          <div className="bg-[#211d19] p-1.5 rounded border border-amber-900/30 text-center">
            <div className="text-[9px] text-amber-300/60 uppercase font-mono">Drafts</div>
            <div className="font-bold text-amber-500 text-[12px] leading-tight">24</div>
          </div>
        </div>

        {/* Analytics SVG Chart Area */}
        <div className="bg-[#1f1b17] p-2 rounded border border-amber-900/30 flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-amber-200/80 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3 text-amber-400" /> Page Views Analytics
            </span>
            <span className="text-[9px] text-amber-400 font-mono">+24.8%</span>
          </div>

          {/* SVG Line Curve */}
          <div className="w-full h-14 relative flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 200 50">
              <defs>
                <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,40 Q25,10 50,25 T100,15 T150,30 T200,5 L200,50 L0,50 Z"
                fill="url(#amberGrad)"
              />
              <path
                d="M0,40 Q25,10 50,25 T100,15 T150,30 T200,5"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="200" cy="5" r="3" fill="#FBBF24" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
