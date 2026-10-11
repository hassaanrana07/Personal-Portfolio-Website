import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import calligraphyWhite from '../assets/calligraphy-hassaan-white.png';

export default function LoadingScreen({ onComplete, isDataReady = true }) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const isDataReadyRef = useRef(isDataReady);

  useEffect(() => {
    isDataReadyRef.current = isDataReady;
  }, [isDataReady]);

  useEffect(() => {
    let animId;
    let startTime = null;
    let finishTriggered = false;
    let currentPercent = 0;

    // Guaranteed clamp: strictly 0 to 100, whole integer
    const clamp = (val) => Math.max(0, Math.min(100, Math.round(val)));

    // Maximum safety ceiling timeout: 2.2s guarantees completion even if network is slow/offline
    const maxSafetyTime = 2200;

    const tick = (currentTime) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const elapsed = Math.max(0, currentTime - startTime);
      const isReady = isDataReadyRef.current || elapsed >= maxSafetyTime;

      if (!isReady) {
        // Stage 1 & 2: Staged controlled progression advancing smoothly towards ~85%
        // ~25% at 200ms, ~60% at 500ms, ~85% at 900ms
        const stagedT = Math.min(elapsed / 1100, 1);
        const stagedTarget = (1 - Math.pow(1 - stagedT, 2.5)) * 88;
        currentPercent = Math.max(currentPercent, stagedTarget);
      } else {
        // Stage 3: Data is ready -> accelerate smoothly towards 100%
        currentPercent += Math.max(2.5, (100 - currentPercent) * 0.24);
      }

      const displayVal = clamp(currentPercent);
      setProgress(displayVal);

      if (displayVal < 100) {
        animId = requestAnimationFrame(tick);
      } else if (!finishTriggered) {
        finishTriggered = true;
        setProgress(100);
        // Brief clean hold at 100% so the user sees completion, then smooth fade
        setTimeout(() => {
          setIsFinished(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 450);
        }, 180);
      }
    };

    animId = requestAnimationFrame(tick);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="portfolio-loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
          className="fixed inset-0 z-[99999] bg-[#0C0C0C] text-[#F5F1EC] flex flex-col items-center justify-center p-6 select-none font-mono"
        >
          {/* Subtle Ambient Radial Glow Backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-[#FF9A3D]/08 rounded-full blur-[130px] pointer-events-none" />

          {/* Central Branding Stage */}
          <div className="flex flex-col items-center justify-center text-center space-y-6 z-10 max-w-sm w-full">
            {/* Centered Urdu Calligraphy (حسان) Emblem */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative flex items-center justify-center"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#141416] border border-white/15 flex items-center justify-center shadow-[0_0_35px_rgba(255,154,61,0.2)] relative">
                <img
                  src={calligraphyWhite}
                  alt="حسان"
                  className="w-16 sm:w-20 h-auto object-contain filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.35)]"
                />
                {/* Subtle outer orbital ring */}
                <div className="absolute -inset-2 rounded-full border border-dashed border-[#FF9A3D]/30 animate-[spin_20s_linear_infinite]" />
              </div>
            </motion.div>

            {/* Large Animated Numerical Percentage Counter (0% ... 100%) */}
            <div className="pt-1">
              <div className="font-sora text-6xl sm:text-7xl font-black tracking-tight text-[#f2f2f0] flex items-baseline justify-center">
                <span data-testid="loading-percentage">{progress}</span>
                <span className="text-2xl sm:text-3xl text-[#FF9A3D] font-bold ml-1">%</span>
              </div>
            </div>

            {/* Synchronized Smooth Progress Bar */}
            <div className="w-52 sm:w-60 space-y-2 pt-1">
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-[#FF5722] via-[#FF9A3D] to-[#FFC107] rounded-full transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
