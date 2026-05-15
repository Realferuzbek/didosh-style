"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface AddToCartBarProps {
  price: number;
  discountPrice: number | null;
  onAddToCart: () => void;
  addedToCart: boolean;
  disabled?: boolean;
}

export default function AddToCartBar({ price, discountPrice, onAddToCart, addedToCart, disabled }: AddToCartBarProps) {
  const activePrice = discountPrice ?? price;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-brand-border/50 px-4 py-3 pb-[env(safe-area-inset-bottom)] flex items-center justify-between gap-3" style={{ willChange: 'transform' }}>
      <div className="flex flex-col min-w-[90px]">
        <span className="text-[12px] text-brand-muted font-body">Jami:</span>
        <span className="text-[20px] font-bold text-brand-deeprose font-body">{formatPrice(activePrice)}</span>
      </div>
      <div className="flex-1 flex justify-end">
        <AnimatePresence mode="wait">
          {!addedToCart ? (
            <motion.button
              key="add"
              type="button"
              className="btn-primary flex-1 flex items-center justify-center gap-2 max-w-[340px]"
              onClick={onAddToCart}
              disabled={disabled}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ transitionProperty: 'background, color', transitionDuration: '300ms' }}
            >
              <ShoppingBag size={20} />
              Savatchaga qo&#39;shish
            </motion.button>
          ) : (
            <motion.button
              key="added"
              type="button"
              className="flex-1 flex items-center justify-center gap-2 max-w-[340px] bg-green-500 text-white font-body font-semibold rounded-btn px-6 py-3.5 text-base shadow active:scale-95 transition-colors duration-300"
              disabled
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Check size={20} />
              Savatchaga qo&#39;shildi ✓
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
