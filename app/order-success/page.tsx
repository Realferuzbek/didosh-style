'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Link from 'next/link'

const CONFETTI_COLORS = ['#E8B4C8', '#C9A84C', '#D4698A', '#86efac', '#F9EAF0']
const DOTS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${10 + (i * 4.2) % 80}%`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  duration: 2 + (i % 3) * 0.5,
  delay: (i % 8) * 0.1,
  size: 6 + (i % 3) * 3,
}))

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {DOTS.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full"
          style={{ left: dot.left, bottom: '-10px', width: dot.size, height: dot.size, backgroundColor: dot.color }}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: -700, opacity: 0 }}
          transition={{ duration: dot.duration, delay: dot.delay, ease: [0.4, 0, 0.2, 1] }}
        />
      ))}
    </div>
  )
}

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderNumber = searchParams.get('order') ?? 'DS-0001'

  // Auto-redirect to profile after 5s so user sees their order status
  useEffect(() => {
    const timer = setTimeout(() => router.push('/profile'), 5000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center px-6 py-12 relative">
      <Confetti />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full space-y-5">

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center"
        >
          <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
            <Check size={48} className="text-green-500" strokeWidth={2.5} />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="font-display text-[28px] font-semibold text-brand-dark leading-tight"
        >
          Buyurtmangiz qabul qilindi!
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="bg-brand-blush rounded-2xl px-8 py-4 w-full"
        >
          <p className="text-[13px] text-brand-muted mb-1">Buyurtma raqami</p>
          <p className="font-display text-[32px] font-bold text-brand-deeprose">{orderNumber}</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-[15px] text-brand-muted leading-relaxed"
        >
          Tez orada siz bilan bog&#39;lanamiz. Buyurtma 1–3 ish kuni ichida yetkaziladi.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.95 }}
          className="flex items-center gap-2 flex-wrap justify-center"
        >
          {[{ icon: '📦', text: '1–3 kun' }, { icon: '💵', text: 'Naqd pul' }, { icon: '📞', text: "Qo'ng'iroq" }].map((pill) => (
            <span key={pill.text} className="bg-white border border-brand-border rounded-full px-3 py-1.5 text-xs font-body">
              {pill.icon} {pill.text}
            </span>
          ))}
        </motion.div>

        {/* Primary: Go to profile to track order */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.05 }}
          className="flex flex-col gap-3 w-full"
        >
          <Link href="/profile" className="btn-primary flex items-center justify-center gap-2">
            📦 Buyurtmamni kuzatish
          </Link>

          {/* Auto-redirect notice */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-xs text-brand-muted text-center"
          >
            5 soniyadan so&#39;ng avtomatik o&#39;tkaziladi...
          </motion.p>

          <div className="flex gap-2">
            <Link href="/" className="flex-1 btn-secondary text-center text-sm">
              Bosh sahifa
            </Link>
            <Link href="/catalog" className="flex-1 btn-secondary text-center text-sm">
              Katalog
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-cream" />}>
      <OrderSuccessContent />
    </Suspense>
  )
}