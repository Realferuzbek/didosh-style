"use client";

import { motion } from "framer-motion";
import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/lib/types";

interface SimilarProductsProps {
  products: Product[];
}

export default function SimilarProducts({ products }: SimilarProductsProps) {
  return (
    <section className="mt-8">
      <motion.h2
        className="section-title px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
  O&#39;xshash mahsulotlar
      </motion.h2>
      <div className="flex overflow-x-auto gap-3 px-4 py-3 hide-scrollbar">
        {products.map((product, i) => (
          <div key={product.id} className="min-w-[160px] max-w-[160px]">
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
