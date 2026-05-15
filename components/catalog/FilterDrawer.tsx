"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const PRICE_PRESETS = [
  { label: "100 000 gacha", min: null, max: 100000 },
  { label: "100–250 000", min: 100000, max: 250000 },
  { label: "250–500 000", min: 250000, max: 500000 },
  { label: "500 000 dan", min: 500000, max: null },
];

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSizes: string[];
  onSizesChange: (sizes: string[]) => void;
  priceMin: number | null;
  priceMax: number | null;
  onPriceChange: (min: number | null, max: number | null) => void;
  productCount: number;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  selectedSizes,
  onSizesChange,
  priceMin,
  priceMax,
  onPriceChange,
  productCount,
}: FilterDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on overlay click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (overlayRef.current && e.target === overlayRef.current) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [isOpen, onClose]);

  // Reset all filters
  function handleReset() {
    onSizesChange([]);
    onPriceChange(null, null);
  }

  // Handle size select
  function toggleSize(size: string) {
    if (selectedSizes.includes(size)) {
      onSizesChange(selectedSizes.filter((s) => s !== size));
    } else {
      onSizesChange([...selectedSizes, size]);
    }
  }

  // Handle price preset
  function selectPreset(preset: typeof PRICE_PRESETS[number]) {
    onPriceChange(preset.min, preset.max);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute left-0 right-0 bottom-0 bg-brand-cream rounded-t-3xl px-5 pt-4 pb-8 max-h-[75vh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="w-10 h-1 bg-brand-border rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-6">
              <div className="font-display text-[22px] font-semibold text-brand-dark">Filtrlash</div>
              <button
                className="text-[14px] text-brand-deeprose font-medium active:scale-95"
                onClick={handleReset}
              >
                Tozalash
              </button>
            </div>
            {/* Size section */}
            <div className="mb-7">
              <div className="text-[15px] font-semibold text-brand-dark mb-3">O&#39;lcham</div>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <motion.button
                    key={size}
                    type="button"
                    className={cn(
                      "w-10 h-9 flex items-center justify-center rounded-xl border text-[15px] font-medium active:scale-95 transition-all",
                      selectedSizes.includes(size)
                        ? "bg-brand-deeprose text-white border-brand-deeprose"
                        : "bg-white text-brand-dark border-brand-border"
                    )}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>
            {/* Price section */}
            <div className="mb-7">
              <div className="text-[15px] font-semibold text-brand-dark mb-3">Narx</div>
              <div className="flex gap-2 mb-3">
                <input
                  type="number"
                  min={0}
                  value={priceMin ?? ""}
                  onChange={e => onPriceChange(e.target.value ? Number(e.target.value) : null, priceMax)}
                  className="input-field py-2.5 text-sm w-full"
                  placeholder="Dan (so'm)"
                />
                <input
                  type="number"
                  min={0}
                  value={priceMax ?? ""}
                  onChange={e => onPriceChange(priceMin, e.target.value ? Number(e.target.value) : null)}
                  className="input-field py-2.5 text-sm w-full"
                  placeholder="Gacha (so'm)"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {PRICE_PRESETS.map((preset) => {
                  const selected =
                    priceMin === preset.min && priceMax === preset.max;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      className={cn(
                        "bg-white border border-brand-border rounded-full px-3 py-1 text-xs active:scale-95 transition-all",
                        selected && "bg-brand-blush border-brand-deeprose text-brand-deeprose"
                      )}
                      onClick={() => selectPreset(preset)}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Drawer footer */}
            <div className="sticky left-0 right-0 bottom-0 pt-2 bg-brand-cream pb-2 -mx-5 px-5">
              <button
                className="btn-primary"
                style={{ maxWidth: 400, margin: "0 auto" }}
                onClick={onClose}
              >
                Filtrlashni qo&#39;llash ({productCount} ta)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
