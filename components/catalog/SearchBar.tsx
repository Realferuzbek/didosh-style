"use client";

import { useRef } from "react";
// ...existing code...
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="px-4 pb-3">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted">
          <Search size={18} />
        </span>
        <input
          ref={inputRef}
          type="text"
          className={cn(
            "w-full h-[46px] bg-white border border-brand-border rounded-[14px] pl-10 pr-10 text-[15px] font-body placeholder:text-brand-muted focus:border-brand-deeprose focus:ring-2 focus:ring-brand-deeprose/20 outline-none transition-all duration-150",
            value && "ring-2 ring-brand-deeprose/15"
          )}
          placeholder="Ko'ylak, kofta, yubka..."
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-deeprose p-1 rounded-full focus:outline-none"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            aria-label="Tozalash"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
