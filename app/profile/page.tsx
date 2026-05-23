
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Package2, Search, Phone, MapPin, Navigation, ChevronRight,
  LogOut, Clock, CheckCircle, XCircle, Truck, ShoppingBag
} from 'lucide-react'
import useAuth from '@/lib/useAuth'
import OTPModal from '@/components/auth/OTPModal'
import { formatPrice } from '@/lib/utils'

const STATUS_CONFIG = {
  pending:   { label: 'Yangi',       color: 'bg-amber-100 text-amber-700',   icon: Clock },
  confirmed: { label: 'Tasdiqlandi', color: 'bg-blue-100 text-blue-700',     icon: CheckCircle },
  shipped:   { label: 'Yuborildi',   color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { label: 'Yetkazildi',  color: 'bg-green-100 text-green-700',   icon: CheckCircle },
  cancelled: { label: 'Bekor',       color: 'bg-red-100 text-red-600',       icon: XCircle },
}

export default function ProfilePage() {
  const { token, phone, isAuthenticated, isLoading: authLoading, login, logout } = useAuth()
  const [showOTPModal, setShowOTPModal]   = useState(false)
  const [activeOrders, setActiveOrders]   = useState<any[]>([])
  const [historyOrders, setHistoryOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [activeTab, setActiveTab]         = useState<'active' | 'history'>('active')

  useEffect(() => {
    if (!isAuthenticated || !token) return
    setOrdersLoading(true)
    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setActiveOrders(data.activeOrders ?? [])
        setHistoryOrders(data.historyOrders ?? [])
      })
      .catch(() => {})
      .finally(() => setOrdersLoading(false))
  }, [isAuthenticated, token])

  // Contact and branding data (EXACT as before)
  const contacts = [
    {
      icon: <Package2 size={18} className="text-brand-deeprose" />, label: 'Telegram',
      value: 't.me/didoshstyle', href: 'https://t.me/didoshstyle'
    },
    {
      icon: <Phone size={18} className="text-brand-deeprose" />, label: 'Telefon',
      value: '+998 99 123 45 67', href: 'tel:+998991234567'
    },
    {
      icon: <MapPin size={18} className="text-brand-deeprose" />, label: 'Google Maps',
      value: 'Didosh Style', href: 'https://maps.google.com/?q=Didosh+Style'
    },
    {
      icon: <Navigation size={18} className="text-brand-deeprose" />, label: 'Yandex Maps',
      value: 'Didosh Style', href: 'https://yandex.com/maps/?text=Didosh+Style'
    },
  ]

  return (
    <main className="page-with-nav pb-8 bg-brand-cream min-h-screen">
      {/* SECTION 1 — Page header */}
      <div
        className="border-b border-brand-border px-4 pt-6 pb-5"
        style={{ background: 'linear-gradient(135deg, #F9EAF0, #FFF8F5)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl text-brand-dark">Profil</h1>
            <div className="font-body text-sm text-brand-muted mt-0.5">
              {isAuthenticated
                ? "Salom! 👋 Buyurtmalaringiz tayyor"
                : "Kirish yoki ro&#39;yxatdan o&#39;ting"}
            </div>
          </div>
          {isAuthenticated && (
            <button
              onClick={logout}
              className="flex items-center gap-1 text-brand-muted text-xs mt-1"
            >
              <LogOut size={14} /> Chiqish
            </button>
          )}
        </div>
      </div>

      {/* SECTION 2 — CONDITIONAL: AUTH STATE */}
      {authLoading && (
        <div>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="rounded-3xl bg-white animate-pulse h-24 mx-4 mt-4"
            />
          ))}
        </div>
      )}

      {!isAuthenticated && !authLoading && (
        <div className="mx-4 mt-5 bg-white rounded-3xl border border-brand-border shadow-sm p-6 text-center">
          <motion.span
            className="text-5xl mb-3 inline-block"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >🌸</motion.span>
          <div className="font-display text-xl text-brand-dark">Buyurtmalaringizni kuzating</div>
          <div className="font-body text-sm text-brand-muted mt-2 mb-5">
            Telefon raqamingiz orqali kiring — barcha buyurtmalaringiz shu yerda saqlanadi
          </div>
          <div className="mb-2 flex flex-col gap-2 text-left">
            <div className="flex items-center gap-2 text-sm text-brand-dark"><span className="text-brand-deeprose font-bold">✓</span> Buyurtma holati real vaqtda</div>
            <div className="flex items-center gap-2 text-sm text-brand-dark"><span className="text-brand-deeprose font-bold">✓</span> Buyurtmalar tarixi</div>
            <div className="flex items-center gap-2 text-sm text-brand-dark"><span className="text-brand-deeprose font-bold">✓</span> Eksklyuziv aksiyalar</div>
          </div>
          <button
            className="mt-5 w-full btn-primary"
            onClick={() => setShowOTPModal(true)}
          >📱 Telefon orqali kirish</button>
          <div className="text-xs text-brand-muted mt-3 italic">
            Parol shart emas — faqat SMS kod
          </div>
        </div>
      )}

      {isAuthenticated && !authLoading && (
        <div>
          {/* Tab switcher */}
          <div className="mx-4 mt-5 flex gap-2">
            <button
              className={`px-4 py-2 font-body text-sm font-medium rounded-2xl ${activeTab === 'active' ? 'bg-brand-deeprose text-white' : 'bg-white text-brand-muted border border-brand-border'}`}
              onClick={() => setActiveTab('active')}
            >
              Faol buyurtmalar
              {activeOrders.length > 0 && (
                <span className="ml-2 inline-block bg-brand-rose text-brand-dark text-xs px-2 py-0.5 rounded-full font-semibold">
                  {activeOrders.length}
                </span>
              )}
            </button>
            <button
              className={`px-4 py-2 font-body text-sm font-medium rounded-2xl ${activeTab === 'history' ? 'bg-brand-deeprose text-white' : 'bg-white text-brand-muted border border-brand-border'}`}
              onClick={() => setActiveTab('history')}
            >
              Tarix
              {historyOrders.length > 0 && (
                <span className="ml-2 inline-block bg-brand-rose text-brand-dark text-xs px-2 py-0.5 rounded-full font-semibold">
                  {historyOrders.length}
                </span>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'active' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'active' ? 10 : -10 }}
              transition={{ duration: 0.2 }}
            >
              {ordersLoading ? (
                <div>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="mx-4 mt-3 h-28 rounded-3xl bg-white animate-pulse" />
                  ))}
                </div>
              ) : (
                <div>
                  {((activeTab === 'active' ? activeOrders : historyOrders).length === 0) ? (
                    <div className="mx-4 mt-3 bg-white rounded-3xl border border-brand-border p-8 text-center">
                      {activeTab === 'active' ? (
                        <>
                          <div className="text-4xl mb-2">📦</div>
                          <div className="font-display text-lg text-brand-dark mb-2">Faol buyurtma yo&#39;q</div>
                          <Link href="/catalog" className="btn-primary inline-block mt-2">Xarid qilish →</Link>
                        </>
                      ) : (
                        <>
                          <div className="text-4xl mb-2">🕐</div>
                          <div className="font-display text-lg text-brand-dark mb-2">Buyurtmalar tarixi bo&#39;sh</div>
                          <div className="text-sm text-brand-muted">Siz hali buyurtma bermagansiz</div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div>
                      {(activeTab === 'active' ? activeOrders : historyOrders).map((order: any) => {
                        const isExpanded = expandedOrder === order.id
                        const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock
                        return (
                          <div
                            key={order.id}
                            className="mx-4 mt-3 bg-white rounded-3xl border border-brand-border shadow-sm overflow-hidden"
                          >
                            <div
                              className="px-5 py-4 flex items-center justify-between cursor-pointer select-none"
                              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            >
                              <div>
                                <div className="font-body font-bold text-[15px] text-brand-dark">DS-{order.id?.toString().padStart(4, '0')}</div>
                                <div className="text-xs text-brand-muted mt-0.5">{order.created_at ? new Date(order.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</div>
                              </div>
                              <span className={`${STATUS_CONFIG[order.status]?.color || ''} text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1`}>
                                <StatusIcon size={14} className="inline-block mr-1" />
                                {STATUS_CONFIG[order.status]?.label || 'Holat nomaʼlum'}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="font-body font-bold text-brand-deeprose text-[15px]">{formatPrice(order.total_amount)}</div>
                                <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                                  <ChevronRight size={16} className="text-brand-muted" />
                                </motion.span>
                              </div>
                            </div>
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
                                    {order.items?.map((item: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-3">
                                        {item.product_image ? (
                                          <img src={item.product_image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                        ) : (
                                          <div className="w-12 h-12 rounded-xl bg-brand-blush" />
                                        )}
                                        <div>
                                          <div className="font-body text-sm text-brand-dark font-medium">{item.product_name}</div>
                                          <div className="text-xs text-brand-muted">O&#39;lcham: {item.size}</div>
                                        </div>
                                        <div className="ml-auto font-body text-sm font-semibold text-brand-dark">
                                          {item.quantity} × {formatPrice(item.price_at_order)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="px-5 pb-4 text-xs text-brand-muted">
                                    📍 {order.delivery_city} · {order.delivery_address}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* SECTION 3 — Contact card (EXACT as before) */}
      <div className="mx-4 mt-4 rounded-3xl border border-brand-border overflow-hidden bg-white">
  <div className="px-5 pt-5 pb-3 font-body font-semibold text-[15px]">Biz bilan bog&#39;laning</div>
        <div className="divide-y divide-brand-border">
          {contacts.map((c, i) => (
            <a
              key={i}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 hover:bg-brand-blush transition-colors"
            >
              {c.icon}
              <span className="font-body text-sm text-brand-dark">{c.label}</span>
              <span className="ml-auto font-body text-xs text-brand-muted">{c.value}</span>
            </a>
          ))}
        </div>
      </div>

      {/* SECTION 4 — Branding card (EXACT as before) */}
      <div
        className="mx-4 mt-4 mb-6 rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #D4698A 0%, #E8B4C8 100%)' }}
      >
        <div className="px-6 py-6 text-center">
          <div className="font-display text-2xl text-white mb-1">Didosh Style</div>
          <div className="font-body text-sm text-white mb-3">Elegantlik · Zamonaviylik · Siz uchun</div>
          <Link href="/catalog" className="btn-primary bg-white text-brand-deeprose hover:bg-brand-blush font-body font-semibold px-5 py-2 rounded-2xl inline-block mt-2">
            Katalogga o&#39;tish
          </Link>
        </div>
      </div>

      {/* OTP MODAL */}
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
