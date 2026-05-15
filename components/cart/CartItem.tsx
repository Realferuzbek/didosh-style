"use client";

"use client";
import Image from "next/image";
import { useCallback } from "react";
// ...existing code...
import { X, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

interface CartItemProps {
  item: {
    product_id: string;
    name: string;
    image: string;
    price: number;
    discount_price: number | null;
    size: string;
    color: string | null;
    quantity: number;
  };
}

export default function CartItem({ item }: CartItemProps) {
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const activePrice = item.discount_price ?? item.price;

  const handleRemove = useCallback(() => {
    removeItem(item.product_id, item.size);
  }, [removeItem, item.product_id, item.size]);

  const handleMinus = useCallback(() => {
    if (item.quantity > 1) updateQuantity(item.product_id, item.size, item.quantity - 1);
  }, [updateQuantity, item]);

  const handlePlus = useCallback(() => {
    updateQuantity(item.product_id, item.size, item.quantity + 1);
  }, [updateQuantity, item]);

  return (
    <div className="flex gap-3 py-4 px-4">
      <Image
        src={item.image}
        alt={item.name}
        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
        width={80}
        height={80}
        loading="lazy"
      />
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="font-body text-[14px] font-medium text-brand-dark line-clamp-2 pr-2">
            {item.name}
          </div>
          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center rounded-full text-brand-muted hover:text-brand-deeprose transition-colors"
            onClick={handleRemove}
            aria-label="O'chirish"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-brand-muted mt-1">
          {item.color && <span>{item.color}</span>}
          {item.color && <span>·</span>}
          <span>{item.size}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-7 h-7 rounded-full bg-brand-blush flex items-center justify-center disabled:opacity-50 active:scale-90"
              onClick={handleMinus}
              disabled={item.quantity === 1}
              aria-label="Kamaytirish"
            >
              <Minus size={18} />
            </button>
            <span className="text-[20px] font-semibold min-w-[24px] text-center font-body">
              {item.quantity}
            </span>
            <button
              type="button"
              className="w-7 h-7 rounded-full bg-brand-blush flex items-center justify-center active:scale-90"
              onClick={handlePlus}
              aria-label="Ko'paytirish"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="font-body text-[15px] font-semibold text-brand-deeprose">
            {formatPrice(activePrice)}
          </div>
        </div>
      </div>
    </div>
  );
}
