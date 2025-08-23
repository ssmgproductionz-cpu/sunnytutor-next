'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Toast({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => { if (!open) return; const id = setTimeout(onClose, 2400); return () => clearTimeout(id); }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="rounded-2xl border bg-white shadow-lg px-4 py-3 text-sm">
        {children}
      </motion.div>
    </div>
  );
}
