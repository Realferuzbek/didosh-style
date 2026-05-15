"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  id?: string;
  sizes: string[];
  selected: string | null;
  onSelect: (size: string) => void;
  hasError?: boolean;
}

const SIZE_GUIDE = [
  ["XS", "80–84", "60–64"],
  ["S", "84–88", "64–68"],
  ["M", "88–92", "68–72"],
  ["L", "92–96", "72–76"],
  ["XL", "96–100", "76–80"],
  ["XXL", "100–106", "80–86"],
];

export default function SizeSelector({ id, sizes, selected, onSelect, hasError }: SizeSelectorProps) {
  const [showGuide, setShowGuide] = useState(false);
  return (
    <motion.div
      id={id}
      className="space-y-2"
      animate={hasError ? { x: [0, -6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-1">
  <span className="text-[15px] font-semibold text-brand-dark">O&#39;lcham tanlang:</span>
        <button
          type="button"
          className="text-[12px] text-brand-deeprose underline font-medium"
          onClick={() => setShowGuide(true)}
        >
          O&#39;lchamlar jadvali →
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {sizes.map((size) => (
          <motion.button
            key={size}
            type="button"
            className={cn(
              "min-w-[48px] h-11 rounded-xl border-2 flex items-center justify-center text-[14px] font-medium transition-all duration-150",
              selected === size
                ? "bg-brand-deeprose text-white border-brand-deeprose shadow-md"
                : "bg-white text-brand-dark border-brand-border hover:border-brand-rose"
            )}
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelect(size)}
          >
            {size}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-400 mt-2"
          >
            ⚠️ Iltimos, o&#39;lchamni tanlang
          </motion.p>
        )}
      </AnimatePresence>
      {/* Size guide modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-t-3xl w-full max-w-md mx-auto p-6 pb-8 border border-brand-border"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-display text-lg font-semibold">O&#39;lchamlar jadvali</span>
                <button
                  className="text-brand-muted text-xl font-bold px-2"
                  onClick={() => setShowGuide(false)}
                  aria-label="Yopish"
                >
                  ×
                </button>
              </div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-brand-blush">
                    <th className="py-2 px-2 font-medium">O&#39;lcham</th>
                    <th className="py-2 px-2 font-medium">Ko&#39;krak (sm)</th>
                    <th className="py-2 px-2 font-medium">Bel (sm)</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_GUIDE.map(([size, chest, waist], i) => (
                    <tr key={size} className={i % 2 === 0 ? "bg-white" : "bg-brand-blush"}>
                      <td className="py-2 px-2 text-center font-semibold">{size}</td>
                      <td className="py-2 px-2 text-center">{chest}</td>
                      <td className="py-2 px-2 text-center">{waist}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
