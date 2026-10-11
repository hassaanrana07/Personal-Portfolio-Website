import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function AdminToast({ toast, onClose }) {
  useEffect(() => {
    if (toast && toast.autoClose !== false) {
      const timer = setTimeout(() => {
        onClose();
      }, toast.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isInfo = !isSuccess && !isError;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md max-w-md ${
          isSuccess
            ? 'bg-[#0E2018]/90 border-emerald-500/40 text-emerald-300'
            : isError
            ? 'bg-[#250F12]/90 border-rose-500/40 text-rose-300'
            : 'bg-[#151311]/90 border-[#FF9A3D]/40 text-[#FF9A3D]'
        }`}
      >
        <div className="shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {isInfo && <Info className="w-5 h-5 text-[#FF9A3D]" />}
        </div>

        <div className="text-xs font-mono font-medium leading-snug flex-1">
          {toast.message}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
