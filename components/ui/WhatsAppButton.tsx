'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  return (
    <motion.button
      type="button"
      aria-label="WhatsApp orqali aloqa"
      onClick={() => window.open('https://wa.me/998901234567', '_blank')}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      whileHover="hover"
      className="group fixed bottom-[88px] right-4 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white/30 [will-change:transform]"
    >
      <motion.span
        initial={{ opacity: 0, x: 8 }}
        variants={{ hover: { opacity: 1, x: 0 } }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="pointer-events-none absolute right-[60px] hidden whitespace-nowrap rounded-full bg-brand-dark px-3 py-1.5 font-body text-xs font-medium text-brand-cream shadow-card md:block"
      >
        Yozing bizga 💬
      </motion.span>
      <MessageCircle size={25} strokeWidth={2.4} />
    </motion.button>
  )
}
