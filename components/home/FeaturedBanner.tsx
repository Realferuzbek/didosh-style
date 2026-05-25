'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Banner {
  id: string
  image_url: string | null
  title: string | null
  subtitle: string | null
}

// Hardcoded fallback shown when no active banner exists in the DB
const FALLBACK = {
  title:    'Yangi Kolleksiya',
  subtitle: '2026 yoz chegirmalari boshlandi — shoshiling!',
  badge:    '💫 Faqat bizda',
}

export default function FeaturedBanner() {
  const [banner, setBanner] = useState<Banner | null>(null)

  useEffect(() => {
    fetch('/api/banners')
      .then(r => r.json())
      .then((data: Banner[]) => {
        if (Array.isArray(data) && data.length > 0) setBanner(data[0])
      })
      .catch(() => {})
  }, [])

  const title    = banner?.title    ?? FALLBACK.title
  const subtitle = banner?.subtitle ?? FALLBACK.subtitle

  return (
    <section className="page-container py-6">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[20px] px-6 py-8 shadow-card md:px-8"
        style={{ background: 'linear-gradient(135deg, #2C1810 0%, #4A2828 100%)' }}
      >
        <div className="relative z-10 max-w-[70%]">
          <p className="inline-flex rounded-full border border-brand-gold/30 bg-white/10 px-3 py-1 font-body text-xs font-semibold uppercase tracking-widest text-brand-gold backdrop-blur-sm">
            {FALLBACK.badge}
          </p>
          <h2 className="mt-2 font-display text-[32px] font-semibold italic leading-tight text-white">
            {title}
          </h2>
          <p className="mt-2 font-body text-sm text-[#E8B4C8]">
            {subtitle}
          </p>
          <Link
            href="/catalog"
            className="mt-5 inline-flex rounded-btn bg-brand-deeprose px-5 py-2.5 font-body text-sm font-medium text-white transition-transform duration-150 active:scale-95"
          >
            Hoziroq ko&apos;ring
          </Link>
        </div>

        <div className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 text-[72px] opacity-20">
          ✿
        </div>
      </motion.div>
    </section>
  )
}
