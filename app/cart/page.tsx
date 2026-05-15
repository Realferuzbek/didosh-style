"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import CartItem from "@/components/cart/CartItem";
import EmptyCart from "@/components/cart/EmptyCart";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const totalItems = useCartStore((s) => s.totalItems());
  const clearCart = useCartStore((s) => s.clearCart);

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-brand-cream/90 backdrop-blur-xl h-[52px] flex items-center justify-between px-4 border-b border-brand-border/40">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-brand-blush active:scale-95"
        >
          <ChevronLeft size={22} className="text-brand-dark" />
        </button>
        <span className="font-display text-[18px] font-semibold text-brand-dark">
          Savatcha <span className="text-brand-muted font-normal">({totalItems} ta)</span>
        </span>
        {items.length > 0 ? (
          <button
            className="text-[12px] text-brand-deeprose font-medium hover:underline px-2 py-1 rounded active:scale-95"
            onClick={clearCart}
            aria-label="Hammasini o'chirish"
          >
            Hammasini o&#39;chirish
          </button>
        ) : (
          <span className="w-8" />
        )}
      </header>

      {/* Cart items list */}
      <main className="flex-1 overflow-y-auto pb-32">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={`${item.product_id}-${item.size}`}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CartItem item={item} />
              <div className="h-px bg-brand-border/60 mx-4" />
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      {/* Sticky summary bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-brand-border/50 px-4 py-3 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[15px] font-medium text-brand-dark">Jami:</span>
          <span className="text-[20px] font-bold text-brand-deeprose">{formatPrice(totalPrice)}</span>
        </div>
        <div className="text-xs text-brand-muted mb-2">Yetkazib berish narxi keyinroq</div>
        <button
          className="btn-primary"
          onClick={() => router.push("/checkout")}
        >
          Buyurtma rasmiylashtirish →
        </button>
      </div>
    </div>
  );
}
