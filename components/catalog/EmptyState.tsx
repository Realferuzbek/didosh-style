"use client";

import { motion, AnimatePresence } from "framer-motion";

interface EmptyStateProps {
  searchQuery: string;
  hasFilters: boolean;
  onReset: () => void;
}

export default function EmptyState({ searchQuery, hasFilters, onReset }: EmptyStateProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="empty"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <div className="text-[56px] mb-4">🔍</div>
        <div className="font-display text-[24px] font-semibold text-brand-dark mb-2">Hech narsa topilmadi</div>
        {searchQuery ? (
          <div className="text-[15px] text-brand-muted mb-6">&quot;{searchQuery}&quot; bo&#39;yicha hech narsa topilmadi</div>
        ) : hasFilters ? (
          <div className="text-[15px] text-brand-muted mb-6">Filtrlash shartlariga mos mahsulot yo&#39;q</div>
        ) : null}
        <button
          className="btn-secondary max-w-[240px] mx-auto"
          onClick={onReset}
        >
          Filtrlarni tozalash
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
