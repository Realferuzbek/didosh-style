'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronDown, Phone, MessageCircle, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import AdminNav from '@/components/admin/AdminNav'
import { cn, formatPrice } from '@/lib/utils'
import type { Order, OrderItem } from '@/lib/types'

// ── Types ──────────────────────────────────────────────────────────────────
type OrderStatus = Order['status']
type ExpandedOrder = Order & { order_items?: OrderItem[] }

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, {
  label: string
  bg: string
  text: string
  next: OrderStatus | null
  nextLabel: string | null
}> = {
  pending:   { label: 'Yangi',          bg: 'bg-amber-500/20',  text: 'text-amber-400',  next: 'confirmed', nextLabel: 'Tasdiqlash'    },
  confirmed: { label: 'Tasdiqlangan',   bg: 'bg-blue-500/20',   text: 'text-blue-400',   next: 'shipped',   nextLabel: 'Yuborildi'    },
  shipped:   { label: 'Yuborildi',      bg: 'bg-purple-500/20', text: 'text-purple-400', next: 'delivered', nextLabel: 'Yetkazildi ✓' },
  delivered: { label: 'Yetkazildi ✓',  bg: 'bg-green-500/20',  text: 'text-green-400',  next: null,        nextLabel: null           },
  cancelled: { label: 'Bekor qilindi', bg: 'bg-red-500/20',    text: 'text-red-400',    next: null,        nextLabel: null           },
}

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

// ── Date formatter ─────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const months = ['yan','fev','mar','apr','may','iyn','iyl','avg','sen','okt','noy','dek']
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${months[d.getMonth()]}, ${h}:${m}`
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={cn('text-[11px] font-medium rounded-full px-2.5 py-1', cfg.bg, cfg.text)}>
      {cfg.label}
    </span>
  )
}

// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const router = useRouter()

  // Auth
  const [isAuthed, setIsAuthed] = useState(false)
  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') !== 'true') {
      router.replace('/admin')
    } else {
      setIsAuthed(true)
    }
  }, [router])

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('admin_auth')
    router.replace('/admin')
  }, [router])

  // Data
  const [orders,        setOrders]        = useState<Order[]>([])
  const [isLoading,     setIsLoading]     = useState(true)
  const [search,        setSearch]        = useState('')
  const [filterStatus,  setFilterStatus]  = useState<OrderStatus | 'all'>('all')
  const [expandedId,    setExpandedId]    = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<ExpandedOrder | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [updatingId,    setUpdatingId]    = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      if (Array.isArray(data)) setOrders(data)
    } catch {
      toast.error('Buyurtmalar yuklanmadi')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthed) fetchOrders()
  }, [isAuthed, fetchOrders])

  // Status update
  const handleStatusUpdate = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })
      if (!res.ok) { toast.error('Xatolik'); return }
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      setExpandedOrder(prev => prev?.id === orderId ? { ...prev, status: newStatus } : prev)
      toast.success(`${STATUS_CONFIG[newStatus].label} ✓`)
    } catch {
      toast.error('Internet aloqasini tekshiring')
    } finally {
      setUpdatingId(null)
    }
  }, [])

  // Expand / collapse
  const handleExpand = useCallback(async (order: Order) => {
    if (expandedId === order.id) {
      setExpandedId(null)
      setExpandedOrder(null)
      return
    }
    setExpandedId(order.id)
    setExpandedOrder(null)
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`)
      const data = await res.json()
      setExpandedOrder(data)
    } catch {
      toast.error('Tafsilotlar yuklanmadi')
    } finally {
      setLoadingDetail(false)
    }
  }, [expandedId])

  // Stats
  const stats = useMemo(() => ({
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue:   orders
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => s + o.total_amount, 0),
  }), [orders])

  // Filtered list
  const filtered = useMemo(() => orders.filter(order => {
    const q = search.toLowerCase().trim()
    const matchSearch = !q ||
      order.customer_name.toLowerCase().includes(q) ||
      order.customer_phone.includes(q) ||
      order.order_number.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || order.status === filterStatus
    return matchSearch && matchStatus
  }), [orders, search, filterStatus])

  if (!isAuthed) return <div className="min-h-screen bg-[#1A1218]" />

  return (
    <div className="min-h-screen bg-[#1A1218]">
      <AdminNav onLogout={handleLogout} />

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <div className="sticky top-[56px] z-20 bg-[#1A1218]/95 backdrop-blur-xl border-b border-[#3D2A36]">
        {/* Title row */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 rounded-xl hover:bg-[#2C1F28] text-[#9B7B85] hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-display text-xl text-white flex-1">
            Buyurtmalar
            {orders.length > 0 && (
              <span className="ml-2 text-sm font-body text-[#9B7B85] font-normal">
                ({orders.length} ta)
              </span>
            )}
          </h1>
          {stats.pending > 0 && (
            <span className="bg-amber-500 text-white text-[11px] font-bold rounded-full px-2 py-0.5 animate-pulse">
              {stats.pending} yangi
            </span>
          )}
        </div>

        {/* Search */}
        <div className="px-4 pb-2 relative">
          <Search size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-[#5A4050]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ism, telefon yoki DS-raqam..."
            className="w-full bg-[#2C1F28] border border-[#3D2A36] rounded-xl pl-9 pr-9 py-2.5 text-white placeholder:text-[#5A4050] focus:border-brand-deeprose focus:outline-none text-[14px] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-7 top-1/2 -translate-y-1/2 text-[#9B7B85] hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setFilterStatus('all')}
            className={cn(
              'rounded-full px-3 py-1.5 text-[12px] font-medium shrink-0 transition-colors',
              filterStatus === 'all'
                ? 'bg-brand-deeprose text-white'
                : 'bg-[#2C1F28] text-[#9B7B85] border border-[#3D2A36]'
            )}
          >
            Barchasi ({orders.length})
          </button>
          {ALL_STATUSES.map(s => {
            const count = orders.filter(o => o.status === s).length
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[12px] font-medium shrink-0 transition-colors',
                  filterStatus === s
                    ? 'bg-brand-deeprose text-white'
                    : cn('bg-[#2C1F28] border border-[#3D2A36]', STATUS_CONFIG[s].text)
                )}
              >
                {STATUS_CONFIG[s].label} {count > 0 && `(${count})`}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────── */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar">
        {[
          { icon: '📦', label: 'Jami', value: stats.total, cls: 'text-[#9B7B85]' },
          { icon: '⏳', label: 'Yangi', value: stats.pending, cls: stats.pending > 0 ? 'text-amber-400' : 'text-[#9B7B85]' },
          { icon: '✅', label: 'Yetkazildi', value: stats.delivered, cls: 'text-green-400' },
          { icon: '💰', label: 'Tushum', value: formatPrice(stats.revenue), cls: 'text-green-400' },
        ].map(s => (
          <div
            key={s.label}
            className="bg-[#2C1F28] border border-[#3D2A36] rounded-2xl px-3 py-2 shrink-0 flex items-center gap-2"
          >
            <span className="text-base">{s.icon}</span>
            <div>
              <div className={cn('text-sm font-semibold', s.cls)}>{s.value}</div>
              <div className="text-[10px] text-[#5A4050]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Order list ────────────────────────────────────────────────── */}
      <div className="px-4 pb-8 space-y-3">
        {isLoading ? (
          // Skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#2C1F28] rounded-2xl h-[110px] skeleton" />
          ))
        ) : filtered.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-5xl">{search ? '🔍' : '📋'}</span>
            <p className="text-white text-lg font-semibold font-display">
              {search ? 'Natija topilmadi' : "Hali buyurtmalar yo'q"}
            </p>
            <p className="text-[#9B7B85] text-sm text-center max-w-[220px]">
              {search
                ? `"${search}" bo'yicha hech narsa topilmadi`
                : 'Buyurtmalar kelganda bu yerda ko\'rinadi'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-1 text-brand-deeprose text-sm underline"
              >
                Qidiruvni tozalash
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map(order => {
              const cfg = STATUS_CONFIG[order.status]
              const isExpanded = expandedId === order.id

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#2C1F28] rounded-2xl border border-[#3D2A36] overflow-hidden"
                >
                  {/* ── Card header (always visible) ──────────────────── */}
                  <div className="p-4 space-y-2">
                    {/* Row 1: order# + status + advance button */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white text-[13px] font-bold font-body">
                        {order.order_number}
                      </span>
                      <StatusBadge status={order.status} />
                      <span className="text-[#5A4050] text-[11px] ml-auto shrink-0">
                        {formatDate(order.created_at)}
                      </span>
                      {cfg.next && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, cfg.next!)}
                          disabled={updatingId === order.id}
                          className="flex items-center gap-1.5 bg-brand-deeprose/20 hover:bg-brand-deeprose text-brand-deeprose hover:text-white text-[11px] font-medium rounded-xl px-3 py-1.5 transition-colors disabled:opacity-50 shrink-0"
                        >
                          {updatingId === order.id ? <Spinner /> : null}
                          {cfg.nextLabel}
                        </button>
                      )}
                    </div>

                    {/* Row 2: customer name + phone */}
                    <div className="flex items-center gap-2">
                      <span className="text-white text-[14px] font-medium">
                        {order.customer_name}
                      </span>
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="text-brand-deeprose text-[13px] hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        {order.customer_phone}
                      </a>
                    </div>

                    {/* Row 3: address */}
                    <p className="text-[#9B7B85] text-[12px] line-clamp-1">
                      📍 {order.delivery_city} · {order.delivery_address}
                    </p>

                    {/* Row 4: total + expand */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-white text-[15px] font-semibold">
                        {formatPrice(order.total_amount)}
                      </span>
                      <button
                        onClick={() => handleExpand(order)}
                        className="flex items-center gap-1 text-[#9B7B85] hover:text-white text-[12px] transition-colors"
                      >
                        Tafsilotlar
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      </button>
                    </div>
                  </div>

                  {/* ── Expanded detail ────────────────────────────────── */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="border-t border-[#3D2A36] p-4 space-y-4">

                          {/* Order items */}
                          {loadingDetail && expandedId === order.id ? (
                            <div className="space-y-2">
                              {[1, 2].map(i => (
                                <div key={i} className="h-14 skeleton rounded-xl" />
                              ))}
                            </div>
                          ) : expandedOrder?.order_items?.length ? (
                            <div className="space-y-2">
                              <p className="text-[#9B7B85] text-[11px] uppercase tracking-wider">
                                Mahsulotlar
                              </p>
                              {expandedOrder.order_items.map(item => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 bg-[#1A1218] rounded-xl p-2.5"
                                >
                                  {/* Image or placeholder */}
                                  {item.product_image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={item.product_image}
                                      alt={item.product_name}
                                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-[#2C1F28] flex items-center justify-center shrink-0">
                                      <span className="text-[#9B7B85] text-lg">👗</span>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-[13px] font-medium line-clamp-1">
                                      {item.product_name}
                                    </p>
                                    <p className="text-[#9B7B85] text-[11px] mt-0.5">
                                      O&apos;lcham: {item.size}
                                      {item.color && ` · ${item.color}`}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-white text-[13px] font-semibold">
                                      {formatPrice(item.price_at_order)}
                                    </p>
                                    <p className="text-[#9B7B85] text-[11px]">
                                      × {item.quantity}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {/* Notes */}
                          {order.notes && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                              <p className="text-amber-400 text-[12px]">
                                📝 {order.notes}
                              </p>
                            </div>
                          )}

                          {/* Full status change */}
                          <div>
                            <p className="text-[#9B7B85] text-[11px] uppercase tracking-wider mb-2">
                              Statusni o&apos;zgartirish
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {ALL_STATUSES.map(s => {
                                const scfg = STATUS_CONFIG[s]
                                const isCurrent = expandedOrder?.status === s || order.status === s
                                return (
                                  <button
                                    key={s}
                                    onClick={() => handleStatusUpdate(order.id, s)}
                                    disabled={isCurrent || updatingId === order.id}
                                    className={cn(
                                      'rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors',
                                      isCurrent
                                        ? cn(scfg.bg, scfg.text, 'ring-1 ring-white/20')
                                        : 'bg-[#1A1218] text-[#9B7B85] hover:bg-[#3D2A36] hover:text-white',
                                      'disabled:cursor-not-allowed'
                                    )}
                                  >
                                    {scfg.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2 pt-1">
                            <a
                              href={`tel:${order.customer_phone}`}
                              className="flex-1 flex items-center justify-center gap-2 bg-[#1A1218] hover:bg-[#2C1F28] border border-[#3D2A36] rounded-xl py-2.5 text-white text-[13px] font-medium transition-colors"
                            >
                              <Phone size={15} />
                              Qo&apos;ng&apos;iroq
                            </a>
                            <a
                              href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/30 rounded-xl py-2.5 text-[#25D366] text-[13px] font-medium transition-colors"
                            >
                              <MessageCircle size={15} />
                              WhatsApp
                            </a>
                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                              <button
                                onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                disabled={updatingId === order.id}
                                className="flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl px-3 py-2.5 text-red-400 text-[13px] transition-colors disabled:opacity-50"
                              >
                                Bekor
                              </button>
                            )}
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}