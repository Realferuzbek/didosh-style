'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

type StatItem = {
  id: string
  value: number
  suffix: string
  label: string
  icon: string
}

const DEFAULT_STATS: StatItem[] = [
  { id: 'years',     value: 15,    suffix: '+', label: 'Yillik tajriba',         icon: '⭐' },
  { id: 'customers', value: 10000, suffix: '+', label: 'Mamnun mijozlar',        icon: '💝' },
  { id: 'return',    value: 90,    suffix: '%', label: 'Qaytib kelish darajasi', icon: '🔄' },
  { id: 'quality',   value: 95,    suffix: '%', label: 'Sifat reytingi',         icon: '✨' },
  { id: 'products',  value: 500,   suffix: '+', label: 'Mahsulot turlari',       icon: '👗' },
  { id: 'cities',    value: 3,     suffix: '',  label: 'Manba shaharlari',       icon: '🌍' },
]

function CountUpNumber({ value }: { value: number }) {
  const ref        = useRef<HTMLSpanElement | null>(null)
  const rafRef     = useRef<number | null>(null)
  const [display, setDisplay]       = useState(0)
  const [animated, setAnimated]     = useState(false)

  useEffect(() => {
    if (animated) { setDisplay(value); return }
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setAnimated(true)
        const start    = performance.now()
        const duration = 1800
        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1)
          const eased    = 1 - Math.pow(1 - progress, 3)
          setDisplay(Math.round(value * eased))
          if (progress < 1) {
            rafRef.current = requestAnimationFrame(tick)
          }
        }
        rafRef.current = requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.35 },
    )
    observer.observe(node)

    return () => {
      observer.disconnect()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [animated, value])

  return <span ref={ref}>{display.toLocaleString('uz-UZ')}</span>
}

export default function StatsSection() {
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS)

  useEffect(() => {
    let mounted = true
    // Use the public /api/stats endpoint — avoids direct browser Supabase calls
    fetch('/api/stats')
      .then(r => r.json())
      .then(({ value }) => {
        if (!mounted || !value) return
        try {
          const parsed = JSON.parse(value)
          // Admin saves { header, items: StatItem[] } — support both formats
          if (parsed?.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
            setStats(parsed.items)
          } else if (Array.isArray(parsed) && parsed.length > 0) {
            setStats(parsed)
          }
        } catch { /* fall through to defaults */ }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <section className="w-full bg-[linear-gradient(160deg,#2C1810_0%,#4A2828_40%,#2C1810_100%)] px-4 py-12">
      <div className="mb-10 text-center">
        <div className="inline-flex rounded-full bg-white/10 px-4 py-1.5 font-body text-[12px] uppercase tracking-wider text-brand-rose backdrop-blur">
          🏆 Bizning yutuqlarimiz
        </div>
        <h2 className="mt-3 text-center font-display text-[38px] text-white md:text-[48px]">
          Biz raqamlarda
        </h2>
        <p className="mt-2 text-center font-body text-[14px] text-brand-rose/70">
          Yillar davomida qurilgan ishonch
        </p>
      </div>

      <div className="mx-auto mt-2 grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/[0.08] p-5 text-center backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="mb-3 text-3xl">{stat.icon}</div>
            <div className="font-display text-[42px] font-semibold leading-none text-white">
              <CountUpNumber value={stat.value} />
              <span className="text-[28px] text-brand-rose">{stat.suffix}</span>
            </div>
            <div className="mt-2 font-body text-[12px] leading-tight text-brand-rose/80">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <div className="mx-auto mb-4 h-px w-24 bg-brand-rose/20" />
        <p className="font-body text-[12px] uppercase tracking-widest text-brand-rose/50">
          Toshkent · Bishkek · Xitoy — eng yaxshi manbalardan
        </p>
      </div>
    </section>
  )
}
