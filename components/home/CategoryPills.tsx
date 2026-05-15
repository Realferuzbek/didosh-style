'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { label: 'Barchasi', emoji: '🛍️', slug: 'barchasi' },
  { label: "Ko'ylaklar", emoji: '👗', slug: 'koyilaklar' },
  { label: 'Koftalar', emoji: '🧥', slug: 'koftalar' },
  { label: 'Yubkalar', emoji: '🌸', slug: 'yubkalar' },
  { label: 'Palto', emoji: '🧣', slug: 'palto-kurtka' },
  { label: 'Liboslar', emoji: '✨', slug: 'liboslar' },
  { label: 'Aksessuarlar', emoji: '💍', slug: 'aksessuarlar' },
]

export default function CategoryPills() {
  const [activeSlug, setActiveSlug] = useState(CATEGORIES[0].slug)

  return (
    <section className="bg-brand-cream py-4">
      <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 py-1">
        {CATEGORIES.map((category, index) => {
          const isActive = activeSlug === category.slug

          return (
            <motion.button
              key={category.slug}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 28,
                delay: index * 0.05,
              }}
              onClick={() => setActiveSlug(category.slug)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 font-body text-sm font-medium shadow-sm transition-all duration-200 [will-change:transform]',
                isActive
                  ? 'scale-105 text-white'
                  : 'text-brand-dark backdrop-blur-lg'
              )}
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #D4698A, #E8B4C8)',
                      boxShadow: '0 4px 15px rgba(212, 105, 138, 0.35)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(232,180,200,0.4)',
                      backdropFilter: 'blur(8px)',
                    }
              }
            >
              <span aria-hidden>{category.emoji}</span>
              {category.label}
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
