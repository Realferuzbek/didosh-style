"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

export default function OrderSummary() {
  const [open, setOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());

  return (
    <motion.div className="bg-white rounded-2xl border border-brand-border p-4 mb-6">
      <button
        type="button"
        className="w-full flex items-center justify-between py-2"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-body text-[15px] font-medium text-brand-dark">
          {items.length} ta mahsulot · {formatPrice(totalPrice)}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={20} />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
      >
        {open && (
          <div className="pt-2 space-y-2">
            {items.map((item) => (
              <div key={`${item.product_id}-${item.size}`} className="flex items-center gap-3">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover"
                    width={40}
                    height={40}
                    loading="lazy"
                    unoptimized
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-body text-[14px] text-brand-dark truncate">{item.name}</div>
                  <div className="text-xs text-brand-muted">{item.size} · {item.quantity} dona</div>
                </div>
                <div className="font-body text-[14px] font-semibold text-brand-deeprose">
                  {formatPrice(item.discount_price ?? item.price)}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
