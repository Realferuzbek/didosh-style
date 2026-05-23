'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const previewCards = [
  {
    name: "Gul ko'ylak",
    price: "149 000 so'm",
    className: 'left-12 top-1/2 -rotate-6',
    background: 'linear-gradient(145deg, #E8B4C8, #F9EAF0)',
    watermark: '🌸',
    delay: 0,
  },
  {
    name: 'Yangi libos',
    price: "199 000 so'm",
    className: 'right-12 top-[38%] rotate-6',
    background: 'linear-gradient(145deg, #D4698A, #E8B4C8)',
    watermark: '✨',
    delay: 0.4,
  },
]

export default function HeroSection() {
  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16"
      style={{
        background:
          'linear-gradient(160deg, #FFF8F5 0%, #F9EAF0 40%, #F0DDE6 100%)',
      }}
    >
      <div className="pointer-events-none absolute -right-24 top-4 z-0 h-[350px] w-[350px] rounded-full bg-[#E8B4C8]/45 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-16 -left-20 z-0 h-[250px] w-[250px] rounded-full bg-[#C9A84C]/35 blur-[60px]" />
      <div className="pointer-events-none absolute right-8 top-1/2 z-0 h-[180px] w-[180px] rounded-full bg-[#D4698A]/40 blur-[50px]" />
      <div className="pointer-events-none absolute -left-[50px] -top-[50px] z-0 h-[200px] w-[200px] rounded-full bg-[#C9A84C]/15 blur-[70px]" />

      {previewCards.map((card) => (
        <motion.div
          key={card.name}
          className={`absolute z-10 hidden w-[140px] rounded-card bg-white p-2 shadow-card lg:block ${card.className}`}
          animate={{ y: [-8, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: card.delay,
          }}
          style={{ willChange: 'transform' }}
        >
          <div
            className="relative aspect-[3/4] overflow-hidden rounded-xl"
            style={{ background: card.background }}
          >
            <div
              className="absolute inset-0 opacity-35"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 24px 24px, rgba(255,255,255,0.32) 2px, transparent 2.5px)',
                backgroundSize: '42px 42px',
              }}
            />
            <span className="absolute bottom-2 right-2 text-[32px] opacity-30">
              {card.watermark}
            </span>
          </div>
          <div className="-mt-8 rounded-b-xl bg-white/75 px-2 pb-2 pt-3 backdrop-blur-lg">
            <p className="truncate font-body text-xs font-medium text-brand-dark">
              {card.name}
            </p>
            <p className="font-body text-sm font-semibold text-brand-deeprose">
              {card.price}
            </p>
          </div>
        </motion.div>
      ))}

      <div className="relative z-20 mx-auto flex max-w-3xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="mb-6 rounded-full px-4 py-2 font-body text-[13px] font-medium text-brand-dark shadow-card"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(212, 105, 138, 0.3)',
            backdropFilter: 'blur(12px)',
          }}
        >
          ✨ 2026 Yoz Kolleksiyasi
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.4, ease: 'easeOut' }}
          className="font-display font-semibold leading-[0.82] tracking-normal"
        >
          <span className="block text-[68px] text-brand-dark md:text-[100px]">
            Didosh
          </span>
          <span className="block text-[72px] italic text-brand-deeprose md:text-[108px]">
            Style
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
          className="mt-7 font-body text-[15px] uppercase tracking-[0.12em] text-brand-muted md:text-lg"
        >
          Elegantlik · Zamonaviylik · Siz uchun
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85, ease: 'easeOut' }}
          className="mt-3 font-display italic text-[18px] md:text-[22px] text-brand-deeprose/80 tracking-wide"
        >
          Moda o&apos;tadi — did qoladi
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.8, ease: 'easeOut' }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/catalog" className="btn-primary !w-auto px-5 sm:px-6">
            Kolleksiyani ko&apos;ring →
          </Link>
          <Link href="/catalog" className="btn-secondary !w-auto px-5 sm:px-6">
            Yangiliklarni ko&apos;ring
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-brand-muted"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform' }}
      >
        <ChevronDown size={18} />
        <motion.span
          className="font-body text-[11px] font-medium"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          Pastga suring
        </motion.span>
      </motion.div>
    </section>
  )
}
