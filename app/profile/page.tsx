'use client'

import { useState } from 'react'
import { Search, Package, Phone, MessageCircle, ChevronRight, CheckCircle, Truck, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'
import { cn, formatPrice } from '@/lib/utils'
import type { Order } from '@/lib/types'

type OrderStatus = Order['status']

const STATUS_INFO: Record<OrderStatus, { label: string; icon: typeof Clock; color: string }> = {
  pending:   { label: 'Yangi buyurtma',   icon: Clock,        color: 'text-amber-500'  },
  confirmed: { label: 'Tasdiqlangan',     icon: CheckCircle,  color: 'text-blue-500'   },
  shipped:   { label: 'Yetkazilmoqda',    icon: Truck,        color: 'text-purple-500' },
  delivered: { label: 'Yetkazildi ✓',    icon: CheckCircle,  color: 'text-green-500'  },
  cancelled: { label: 'Bekor qilindi',   icon: XCircle,      color: 'text-red-500'    },
}

export default function ProfilePage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  async function handleTrack() {
    const q = orderNumber.trim().toUpperCase()
    if (!q) return
    setIsLoading(true)
    setNotFound(false)
    setOrder(null)
    try {
      // Public search by order_number — needs a public API endpoint
      const res = await fetch(`/api/orders/track?number=${encodeURIComponent(q)}`)
      if (!res.ok) { setNotFound(true); return }
      const data = await res.json()
      setOrder(data)
    } catch {
      setNotFound(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-with-nav">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-brand-cream/90 backdrop-blur-xl border-b border-brand-border/40 px-4 h-[52px] flex items-center">
        <h1 className="font-display text-[22px] font-semibold text-brand-dark">Profil</h1>
      </div>

      <main className="page-container py-6 space-y-6">

        {/* Order tracking */}
        <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blush flex items-center justify-center">
              <Package size={20} className="text-brand-deeprose" />
            </div>
            <div>
              <h2 className="font-body font-semibold text-brand-dark text-[16px]">
                Buyurtmani kuzatish
              </h2>
              <p className="text-brand-muted text-[13px]">DS-raqam orqali tekshiring</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleTrack()}
              placeholder="DS-0001"
              className="input-field flex-1"
              maxLength={10}
            />
            <button
              onClick={handleTrack}
              disabled={isLoading || !orderNumber.trim()}
              className="bg-brand-deeprose text-white rounded-btn px-4 py-3 font-medium text-sm disabled:opacity-50 flex items-center gap-1.5 shrink-0 hover:bg-[#C05A7A] transition-colors"
            >
              {isLoading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : <Search size={16} />}
              Qidirish
            </button>
          </div>

          {/* Result */}
          {notFound && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              &quot;{orderNumber}&quot; raqamli buyurtma topilmadi
            </div>
          )}

          {order && (() => {
            const cfg = STATUS_INFO[order.status as OrderStatus]
            const Icon = cfg.icon
            return (
              <div className="bg-brand-blush rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-dark">{order.order_number}</span>
                  <span className="text-brand-muted text-sm">
                    {new Date(order.created_at).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
                <div className={cn('flex items-center gap-2 font-medium', cfg.color)}>
                  <Icon size={18} />
                  {cfg.label}
                </div>
                <div className="text-brand-dark font-semibold text-lg">
                  {formatPrice(order.total_amount)}
                </div>
                <div className="text-brand-muted text-sm">
                  📍 {order.delivery_city}, {order.delivery_address}
                </div>
              </div>
            )
          })()}
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border/60">
            <h2 className="font-body font-semibold text-brand-dark text-[16px]">Biz bilan bog&apos;laning</h2>
          </div>
          <a
            href="https://wa.me/998901234567"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-4 hover:bg-brand-blush transition-colors border-b border-brand-border/40"
          >
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center">
              <MessageCircle size={20} className="text-[#25D366]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-brand-dark text-sm">WhatsApp</p>
              <p className="text-brand-muted text-[12px]">+998 90 123 45 67</p>
            </div>
            <ChevronRight size={18} className="text-brand-muted" />
          </a>
          <a
            href="tel:+998901234567"
            className="flex items-center gap-3 px-5 py-4 hover:bg-brand-blush transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-blush flex items-center justify-center">
              <Phone size={20} className="text-brand-deeprose" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-brand-dark text-sm">Qo&apos;ng&apos;iroq</p>
              <p className="text-brand-muted text-[12px]">+998 90 123 45 67</p>
            </div>
            <ChevronRight size={18} className="text-brand-muted" />
          </a>
        </div>

        {/* Brand info */}
        <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-card text-center space-y-2">
          <p className="font-display text-2xl font-semibold text-brand-dark">Didosh Style</p>
          <p className="text-brand-muted text-sm">Elegantlik · Zamonaviylik · Siz uchun</p>
          <Link
            href="/catalog"
            className="inline-block mt-2 text-brand-deeprose text-sm font-medium underline"
          >
            Katalogni ko&apos;rish →
          </Link>
        </div>

      </main>
    </div>
  )
}