"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { formatPrice, discountPercent } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const activePrice = product.discount_price ?? product.price;
  return (
    <div className="space-y-3">
      {/* Badges */}
      <motion.div
        className="flex gap-2 mb-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {product.discount_price && (
          <span className="badge-sale">-{discountPercent(product.price, product.discount_price)}%</span>
        )}
        {product.is_featured && (
          <span className="badge-new">Yangi</span>
        )}
      </motion.div>
      {/* Name */}
      <div className="font-display text-[26px] font-semibold text-brand-dark">
        {product.name}
      </div>
      {/* Price block */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="font-body text-2xl font-bold text-brand-deeprose">
          {formatPrice(activePrice)}
        </span>
        {product.discount_price && (
          <>
            <span className="font-body text-base text-brand-muted line-through">
              {formatPrice(product.price)}
            </span>
            <span className="badge-sale text-sm">
              {discountPercent(product.price, product.discount_price)}% tejaysiz
            </span>
          </>
        )}
      </div>
      {/* Rating row */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={14}
              className={i <= 4 ? "fill-brand-gold text-brand-gold" : "text-brand-border"}
            />
          ))}
        </div>
        <span className="font-body text-sm text-brand-muted">4.8 (124 ta sharh)</span>
      </div>
      {/* Stock indicator */}
      {typeof product.stock === "number" && (
        <div className="flex items-center gap-2 mt-1 text-[13px] font-body">
          <span
            className={
              product.stock > 10
                ? "w-2 h-2 rounded-full bg-green-500 inline-block"
                : product.stock > 0
                ? "w-2 h-2 rounded-full bg-orange-400 inline-block"
                : "w-2 h-2 rounded-full bg-red-400 inline-block"
            }
          />
          {product.stock > 10 && <span className="text-green-600">Mavjud</span>}
          {product.stock > 0 && product.stock <= 10 && (
            <span className="text-orange-600">Kam qoldi — {product.stock} ta</span>
          )}
          {product.stock === 0 && <span className="text-red-500">Tugagan</span>}
        </div>
      )}
    </div>
  );
}
