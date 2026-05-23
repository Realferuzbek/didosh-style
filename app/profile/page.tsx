'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package2, Phone, MapPin, Navigation, ChevronRight,
  LogOut, Clock, CheckCircle, XCircle, Truck,
} from 'lucide-react'
import { useAuth } from '@/lib/useAuth'
import OTPModal from '@/components/auth/OTPModal'
import { formatPrice } from '@/lib/utils'

/* ── Types ─────────────────────────────────────────────── */
interface OrderItem {
  product_image?: string | null
  product_name: string
  size: string
  quantity: number
  price_at_order: number
}

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

interface UserOrder {
  id: string
  order_number: string
  status: OrderStatus
  created_at: string
  total_amount: number
  delivery_city: string
  delivery_address: string
  order_items?: OrderItem[]
}

/* ── Status config ──────────────────────────────────────── */
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending:   { label: 'Yangi',       color: 'bg-amber-100 text-amber-700',   icon: Clock },
  confirmed: { label: 'Tasdiqlandi', color: 'bg-blue-100 text-blue-700',     icon: CheckCircle },
  shipped:   { label: 'Yuborildi',   color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { label: 'Yetkazildi',  color: 'bg-green-100 text-green-700',   icon: CheckCircle },
  cancelled: { label: 'Bekor',       color: 'bg-red-100 text-red-600',       icon: XCircle },
}

/* ── Contact rows ───────────────────────────────────────── */
const CONTACTS = [
  {
    icon: <Package2 size={20} className="text-white" />,
    iconBg: 'linear-gradient(135deg,#229ED9,#1A8FC0)',
    label: 'Telegram yozing',
    value: '@didosh_style',
    href: 'https://t.me/didosh_style',
  },
  {
    icon: <Phone size={20} className="text-brand-deeprose" />,
    iconBg: '#F9EAF0',
    label: "Qo'ng'iroq qiling",
    value: '+998 94 470 10 76',
    href: 'tel:+998944701076',
  },
  {
    icon: <MapPin size={20} className="text-[#EA4335]" />,
    iconBg: '#FEE8E6',
    label: 'Google Maps',
    value: "Do'konimizni toping 📍",
    href: 'https://maps.app.goo.gl/oCNbEteMkiTJyc6j6',
  },
  {
    icon: <Navigation size={20} className="text-[#FF6600]" />,
    iconBg: '#FFF0E6',
    label: 'Yandex Maps',
    value: "Yo'nalish olish 🗺️",
    href: 'https://yandex.ru/maps?whatshere%5Bpoint%5D=65.93493786463408%2C39.96012788167869&whatshere%5Bzoom%5D=16.0&ll=65.9349378646341%2C39.960127870713286&z=16.0&si=fvng3auxkp56xu89er1xt63k7r',
  },
]

/* ── Component ──────────────────────────────────────────── */
export default function ProfilePage() {
  const { token, isAuthenticated, isLoading: authLoading, login, logout } = useAuth()

  const [showOTPModal, setShowOTPModal] = useState(false)
  const [activeOrders, setActiveOrders] = useState<UserOrder[]>([])
  const [historyOrders, setHistoryOrders] = useState<UserOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  useEffect(() => {
    if (!isAuthenticated || !token) return
    setOrdersLoading(true)
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setActiveOrders(data.activeOrders ?? [])
        setHistoryOrders(data.historyOrders ?? [])
      })
      .catch(() => {})
      .finally(() => setOrdersLoading(false))
  }, [isAuthenticated, token])

  const currentOrders = activeTab === 'active' ? activeOrders : historyOrders

  return (
    <main className="page-with-nav pb-8 bg-brand-cream min-h-screen">

      {/* ── HEADER ── */}
      <div
        className="border-b border-brand-border px-4 pt-6 pb-5"
        style={{ background: 'linear-gradient(135deg,#F9EAF0,#FFF8F5)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl text-brand-dark">Profil</h1>
            <p className="font-body text-sm text-brand-muted mt-0.5">
              {isAuthenticated ? "Salom! 👋 Buyurtmalaringiz tayyor" : "Kirish yoki ro'yxatdan o'ting"}
            </p>
          </div>
          {isAuthenticated && (
            <button onClick={logout} className="flex items-center gap-1 text-brand-muted text-xs mt-1">
              <LogOut size={14} /> Chiqish
            </button>
          )}
        </div>
      </div>

      {/* ── SKELETON ── */}
      {authLoading && (
        <div className="space-y-3 mt-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-3xl bg-white animate-pulse h-24 mx-4" />
          ))}
        </div>
      )}

      {/* ── NOT LOGGED IN ── */}
      {!isAuthenticated && !authLoading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-5 bg-white rounded-3xl border border-brand-border shadow-sm p-6 text-center"
        >
          <motion.span
            className="text-5xl mb-3 inline-block"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >🌸</motion.span>
          <p className="font-display text-xl text-brand-dark">Buyurtmalaringizni kuzating</p>
          <p className="font-body text-sm text-brand-muted mt-2 mb-5">
            Telefon raqamingiz orqali kiring — barcha buyurtmalaringiz shu yerda saqlanadi
          </p>
          <div className="flex flex-col gap-2 text-left mb-5">
            {['Buyurtma holati real vaqtda', 'Buyurtmalar tarixi', 'Eksklyuziv aksiyalar'].map(b => (
              <div key={b} className="flex items-center gap-2 text-sm text-brand-dark">
                <span className="text-brand-deeprose font-bold">✓</span> {b}
              </div>
            ))}
          </div>
          <button className="w-full btn-primary" onClick={() => setShowOTPModal(true)}>
            📱 Telefon orqali kirish
          </button>
          <p className="text-xs text-brand-muted mt-3 italic">Parol shart emas — faqat SMS kod</p>
        </motion.div>
      )}

      {/* ── LOGGED IN: ORDERS ── */}
      {isAuthenticated && !authLoading && (
        <div>
          {/* Tab switcher */}
          <div className="mx-4 mt-5 flex gap-2">
            {(['active', 'history'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-body text-sm font-medium rounded-2xl transition-colors ${
                  activeTab === tab
                    ? 'bg-brand-deeprose text-white'
                    : 'bg-white text-brand-muted border border-brand-border'
                }`}
              >
                {tab === 'active' ? 'Faol buyurtmalar' : 'Tarix'}
                {tab === 'active' && activeOrders.length > 0 && (
                  <span className="ml-2 bg-brand-rose text-brand-dark text-xs px-2 py-0.5 rounded-full font-semibold">
                    {activeOrders.length}
                  </span>
                )}
                {tab === 'history' && historyOrders.length > 0 && (
                  <span className="ml-2 bg-brand-rose text-brand-dark text-xs px-2 py-0.5 rounded-full font-semibold">
                    {historyOrders.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'active' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {ordersLoading ? (
                <div className="space-y-3 mt-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="mx-4 h-28 rounded-3xl bg-white animate-pulse" />
                  ))}
                </div>
              ) : currentOrders.length === 0 ? (
                <div className="mx-4 mt-3 bg-white rounded-3xl border border-brand-border p-8 text-center">
                  {activeTab === 'active' ? (
                    <>
                      <div className="text-4xl mb-2">📦</div>
                      <p className="font-display text-lg text-brand-dark mb-2">Faol buyurtma yo&apos;q</p>
                      <Link href="/catalog" className="btn-primary inline-block mt-2">Xarid qilish →</Link>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl mb-2">🕐</div>
                      <p className="font-display text-lg text-brand-dark mb-2">Buyurtmalar tarixi bo&apos;sh</p>
                      <p className="text-sm text-brand-muted">Siz hali buyurtma bermagansiz</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3 mt-3">
                  {currentOrders.map((order) => {
                    const isExpanded = expandedOrder === order.id
                    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
                    const StatusIcon = cfg.icon
                    return (
                      <div
                        key={order.id}
                        className="mx-4 bg-white rounded-3xl border border-brand-border shadow-sm overflow-hidden"
                      >
                        {/* Card header */}
                        <div
                          className="px-5 py-4 flex items-center justify-between cursor-pointer select-none"
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        >
                          <div>
                            <p className="font-body font-bold text-[15px] text-brand-dark">{order.order_number}</p>
                            <p className="text-xs text-brand-muted mt-0.5">
                              {order.created_at
                                ? new Date(order.created_at).toLocaleDateString('uz-UZ', {
                                    year: 'numeric', month: 'short', day: 'numeric',
                                  })
                                : ''}
                            </p>
                          </div>
                          <span className={`${cfg.color} text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1`}>
                            <StatusIcon size={12} />
                            {cfg.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <p className="font-body font-bold text-brand-deeprose text-[15px]">
                              {formatPrice(order.total_amount)}
                            </p>
                            <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronRight size={16} className="text-brand-muted" />
                            </motion.span>
                          </div>
                        </div>

                        {/* Expanded items */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div className="border-t border-brand-border" />
                              <div className="px-5 py-3 space-y-3">
                                {(order.order_items ?? []).map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3">
                                    {item.product_image ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={item.product_image}
                                        alt={item.product_name}
                                        className="w-12 h-12 rounded-xl object-cover"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-xl bg-brand-blush shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-body text-sm text-brand-dark font-medium truncate">
                                        {item.product_name}
                                      </p>
                                      <p className="text-xs text-brand-muted">O&apos;lcham: {item.size}</p>
                                    </div>
                                    <p className="font-body text-sm font-semibold text-brand-dark shrink-0">
                                      {item.quantity} × {formatPrice(item.price_at_order)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <p className="px-5 pb-4 text-xs text-brand-muted">
                                📍 {order.delivery_city} · {order.delivery_address}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ── CONTACT CARD ── */}
      <div className="mx-4 mt-4 rounded-3xl border border-brand-border overflow-hidden bg-white">
        <p className="px-5 pt-5 pb-3 font-body font-semibold text-[15px] text-brand-dark">
          Biz bilan bog&apos;laning
        </p>
        <div className="divide-y divide-brand-border">
          {CONTACTS.map((c, i) => (
            <a
              key={i}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-5 py-4 hover:bg-brand-blush transition-colors"
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: c.iconBg }}
              >
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[13px] font-semibold text-brand-dark">{c.label}</p>
                <p className="font-body text-[11px] text-brand-muted mt-0.5">{c.value}</p>
              </div>
              <ChevronRight size={16} className="text-brand-muted shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* ── BRANDING CARD ── */}
      <div
        className="mx-4 mt-4 mb-6 rounded-3xl overflow-hidden border border-brand-border"
        style={{ background: 'linear-gradient(135deg,#FFF8F5 0%,#F9EAF0 50%,#F0DDE6 100%)' }}
      >
        <div className="px-6 py-6 text-center">
          <p className="text-2xl mb-3">🌸</p>
          <p className="font-display text-3xl text-brand-dark font-semibold">Didosh Style</p>
          <p className="font-body text-[12px] text-brand-muted tracking-wider mt-1">
            Elegantlik · Zamonaviylik · Siz uchun
          </p>
          <div className="w-12 h-px bg-brand-border mx-auto my-4" />
          <Link
            href="/catalog"
            className="btn-primary !w-auto px-6 text-[13px] inline-flex items-center"
          >
            Katalogni ko&apos;ring →
          </Link>
        </div>
      </div>

      {/* ── OTP MODAL ── */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onSuccess={(newToken, userPhone) => {
          login(newToken, userPhone)
          setShowOTPModal(false)
        }}
        title="Profilingizga kiring"
        subtitle="Buyurtmalaringizni ko'rish uchun telefon raqamingizni kiriting"
      />
    </main>
  )
}