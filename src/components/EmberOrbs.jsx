import React from 'react';

export default function EmberOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Orb 1: Top Left Viewport Anchor */}
      <div className="fixed -top-[100px] -left-[120px] w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,#FFC107_0%,#FF5722_60%,transparent_100%)] opacity-30 filter blur-[90px] animate-ember-float-1"></div>

      {/* Orb 2: Right Middle Viewport Anchor */}
      <div className="fixed top-1/2 -right-[140px] -translate-y-1/2 w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle,#FF5722_0%,#FF9A3D_65%,transparent_100%)] opacity-28 filter blur-[90px] animate-ember-float-2"></div>

      {/* Orb 3: Bottom Left Viewport Anchor */}
      <div className="fixed -bottom-[100px] left-[30%] w-[440px] h-[440px] rounded-full bg-[radial-gradient(circle,#FF9A3D_0%,#C43A1F_70%,transparent_100%)] opacity-32 filter blur-[90px] animate-ember-float-3"></div>
    </div>
  );
}
