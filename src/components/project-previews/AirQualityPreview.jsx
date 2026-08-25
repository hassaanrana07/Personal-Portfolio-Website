import React from 'react';
import { Activity, Radio, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

export default function AirQualityPreview() {
  return (
    <div className="w-full h-full bg-[#0a151d] text-cyan-100 p-3 rounded-lg border border-cyan-900/40 flex flex-col justify-between select-none overflow-hidden text-xs relative">
      {/* Background Radar Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#00D4FF_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-900/30 pb-2 relative z-10">
        <div className="flex items-center gap-1.5 font-bold tracking-tight text-cyan-300">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>AirSense</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>LIVE</span>
        </div>
      </div>

      {/* Radar Map & AQI Circle */}
      <div className="my-2 flex items-center justify-between gap-2 relative z-10">
        {/* Radar Nodes Box */}
        <div className="w-24 h-24 bg-[#0e1d28] rounded-lg border border-cyan-500/20 relative flex items-center justify-center overflow-hidden">
          {/* Radar Circles */}
          <div className="w-20 h-20 rounded-full border border-cyan-500/20 absolute"></div>
          <div className="w-12 h-12 rounded-full border border-cyan-500/30 absolute"></div>
          
          {/* Node Markers */}
          <MapPin className="w-3.5 h-3.5 text-cyan-400 absolute top-2 left-3 animate-pulse" />
          <MapPin className="w-3.5 h-3.5 text-emerald-400 absolute bottom-3 right-4 animate-pulse" />
          <MapPin className="w-3.5 h-3.5 text-cyan-300 absolute top-7 right-2 animate-pulse" />
          <MapPin className="w-3.5 h-3.5 text-teal-400 absolute bottom-2 left-4 animate-pulse" />

          {/* Sweeping Radar Line Effect */}
          <div className="w-full h-full absolute top-0 left-0 bg-gradient-to-tr from-cyan-500/20 to-transparent origin-bottom-left animate-spin" style={{ animationDuration: '4s' }}></div>
        </div>

        {/* Big AQI Score Box */}
        <div className="flex-1 bg-[#0f212e] p-2 rounded-lg border border-cyan-500/30 flex flex-col items-center justify-center text-center">
          <div className="text-[9px] text-cyan-400/80 font-mono uppercase tracking-wider">Air Quality Index</div>
          <div className="text-3xl font-extrabold text-emerald-400 my-0.5 tracking-tight font-mono">42</div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
            <ShieldCheck className="w-3 h-3" />
            <span>GOOD</span>
          </div>
        </div>
      </div>

      {/* Threshold Alert Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-cyan-950/40 to-slate-900 p-1.5 rounded border border-amber-500/30 flex items-center justify-between text-[10px] text-amber-200 relative z-10">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="truncate">PM2.5 Sensor Array Online</span>
        </div>
        <Radio className="w-3 h-3 text-cyan-400 flex-shrink-0" />
      </div>
    </div>
  );
}
