"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function EmptyCart() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <div className="text-[64px] mb-4">🛍️</div>
  <div className="font-display text-[24px] font-semibold text-brand-dark mb-2">Savatchangiz bo&#39;sh</div>
  <div className="text-[15px] text-brand-muted mb-6">Yoqtirgan kiyimlaringizni savatchaga qo&#39;shing</div>
        <Link href="/catalog" className="btn-primary max-w-[240px] mx-auto">
          Xarid qilish
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
