"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, string> = {
  "Pushti":   "#F9B4C8",
  "Oq":       "#F8F8F8",
  "Qora":     "#1A1A1A",
  "Ko'k":     "#6BA3D6",
  "Sariq":    "#F5D060",
  "Qizil":    "#D44040",
  "Lila":     "#B57DC8",
  "Bej":      "#D4B896",
  "Kulrang":  "#9A9A9A",
  "Yashil":   "#6BBF8C",
};

interface ColorSelectorProps {
  colors: string[];
  selected: string | null;
  onSelect: (color: string) => void;
}

export default function ColorSelector({ colors, selected, onSelect }: ColorSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="text-[15px] font-semibold text-brand-dark font-body mb-2">
        Rang: <span className="text-brand-deeprose">{selected}</span>
      </div>
      <div className="flex gap-3">
        {colors.map((color) => (
          <motion.button
            key={color}
            type="button"
            className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
              selected === color
                ? "ring-2 ring-offset-2 ring-brand-deeprose scale-110 border-brand-deeprose"
                : "ring-1 ring-brand-border border-transparent"
            )}
            style={{ backgroundColor: COLOR_MAP[color] || "#E8B4C8" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(color)}
            aria-label={color}
          >
            {/* visually hidden color name for a11y */}
            <span className="sr-only">{color}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
