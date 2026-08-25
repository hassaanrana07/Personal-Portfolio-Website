import React from 'react';
import { Heart, MessageCircle, Share2, Bell, MessageSquare, Flame } from 'lucide-react';

export default function SocialPreview() {
  return (
    <div className="w-full h-full bg-[#111625] text-slate-200 p-3 rounded-lg border border-slate-800 flex flex-col justify-between select-none overflow-hidden text-xs">
      {/* Top Header & Stories */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-rose-400">
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500/20" />
            <span>Vyra</span>
            <span className="text-[10px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20 font-mono">LIVE</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <MessageSquare className="w-3.5 h-3.5 hover:text-rose-400 cursor-pointer" />
            <Bell className="w-3.5 h-3.5 hover:text-rose-400 cursor-pointer" />
          </div>
        </div>

        {/* Stories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {['You', 'Alex', 'Sara', 'Dev', 'Maya'].map((name, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full p-[1.5px] ${i === 0 ? 'bg-gradient-to-tr from-rose-500 via-purple-500 to-orange-400' : 'bg-slate-700'}`}>
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-[10px] font-bold text-rose-300">
                  {name[0]}
                </div>
              </div>
              <span className="text-[9px] text-slate-400 truncate w-7 text-center">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Post Feed Item */}
      <div className="bg-[#182035] rounded-md p-2.5 border border-slate-700/50 my-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center font-bold text-[10px] text-white">
            H
          </div>
          <div>
            <div className="font-semibold text-slate-200 text-[11px] leading-tight">Hassaan Rana</div>
            <div className="text-[9px] text-slate-400">Full-Stack Dev &bull; Just now</div>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
          Building real-time WebSockets with Socket.IO &amp; React! 🚀
        </p>

        {/* Post Banner */}
        <div className="h-16 w-full rounded bg-gradient-to-r from-purple-900/60 via-rose-900/40 to-slate-900 border border-purple-500/20 flex items-center justify-center text-[10px] text-purple-200 font-mono gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          WebSocket Feed Connected
        </div>

        {/* Engagement Actions */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
          <div className="flex items-center gap-1 text-rose-400 font-medium cursor-pointer">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>142</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-slate-200">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>28</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-slate-200">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </div>
        </div>
      </div>

      {/* Bottom Status / Messages Navigation */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 px-1">
        <span className="text-rose-400 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> 3 Direct Messages
        </span>
        <span className="text-slate-500 font-mono">12 Notifications</span>
      </div>
    </div>
  );
}
