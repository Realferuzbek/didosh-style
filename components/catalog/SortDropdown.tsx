"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { label: "Eng yangi", value: "newest" },
  { label: "Arzon avval", value: "price-asc" },
  { label: "Qimmat avval", value: "price-desc" },
  { label: "Chegirmalisi avval", value: "discount" },
];

interface SortDropdownProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-1 bg-white border border-brand-border rounded-xl px-3 py-1.5 text-[13px] font-medium text-brand-dark active:scale-95 transition-all"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        Saralash <ChevronDown size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 z-20 bg-white rounded-2xl shadow-card-hover border border-brand-border p-1 min-w-[170px]"
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2.5 rounded-xl text-sm text-brand-dark hover:bg-brand-blush transition-all",
                  value === opt.value && "font-semibold"
                )}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                tabIndex={0}
              >
                {opt.label}
                {value === opt.value && <Check size={18} className="text-brand-deeprose ml-2" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
