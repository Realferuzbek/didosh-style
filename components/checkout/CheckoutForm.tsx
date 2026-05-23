'use client'

import { useState, useEffect, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import { ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import OTPModal from '@/components/auth/OTPModal'
import { useAuth } from '@/lib/useAuth'

type FormData = {
  name: string
  phone: string
  city: string
  address: string
  notes: string
}
type FormErrors = Partial<Record<keyof FormData, string>>

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  const local = digits.startsWith('998') ? digits.slice(3) : digits
  let result = '+998 '
  if (local.length > 0) result += local.slice(0, 2)
  if (local.length >= 3) result += ' ' + local.slice(2, 5)
  if (local.length >= 6) result += ' ' + local.slice(5, 7)
  if (local.length >= 8) result += ' ' + local.slice(7, 9)
  return result.trim()
}

export default function CheckoutForm() {
  const router = useRouter()
  const cartItems = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const clearCart = useCartStore((s) => s.clearCart)
  const { token, phone: authPhone, isAuthenticated, login } = useAuth()

  const [form, setForm] = useState<FormData>({
    name: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState(false)

  useEffect(() => {
    if (authPhone) {
      setForm(f => f.phone ? f : { ...f, phone: formatPhone(authPhone) })
    }
  }, [authPhone])

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!form.name.trim() || form.name.trim().length < 2)
      newErrors.name = "Ism kamida 2 ta harf bo'lishi kerak"
    const digits = form.phone.replace(/\D/g, '')
    if (digits.length < 12)
      newErrors.phone = "To'g'ri telefon raqam kiriting"
    if (!form.city.trim())
      newErrors.city = 'Shahar yoki tumanni kiriting'
    if (!form.address.trim() || form.address.trim().length < 10)
      newErrors.address = "To'liq manzilni kiriting (kamida 10 ta belgi)"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return

    // If not authenticated, show OTP modal first
    if (!isAuthenticated) {
      setPendingSubmit(true)
      setShowOTPModal(true)
      return
    }

    // Already authenticated — submit directly
    await submitOrder(token)
  }

  async function submitOrder(userToken: string | null) {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userToken ? { 'Authorization': `Bearer ${userToken}` } : {}),
        },
        body: JSON.stringify({
          customer_name: form.name.trim(),
          customer_phone: form.phone,
          delivery_city: form.city.trim(),
          delivery_address: form.address.trim(),
          notes: form.notes.trim() || null,
          items: cartItems,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Xatolik yuz berdi')
        return
      }
      clearCart()
      router.push(`/order-success?order=${data.order_number}`)
    } catch {
      toast.error('Internet aloqasini tekshiring')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAuthSuccess(newToken: string, userPhone: string) {
    login(newToken, userPhone)
    setShowOTPModal(false)
    if (pendingSubmit) {
      setPendingSubmit(false)
      // Small delay to let modal close gracefully
      setTimeout(() => {
        void submitOrder(newToken)
      }, 400)
    }
  }

  return (
    <>
    <form className="space-y-5 pb-8" onSubmit={handleSubmit} autoComplete="on">

      {/* Ism Familiya */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-brand-dark font-body">
          Ism Familiya <span className="text-brand-deeprose">*</span>
        </label>
        <input
          className={cn('input-field', errors.name && 'border-red-400 focus:border-red-400 focus:ring-red-200')}
          type="text"
          autoComplete="name"
          placeholder="Dilnoza Karimova"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        {errors.name && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400">
            {errors.name}
          </motion.p>
        )}
      </div>

      {/* Telefon */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-brand-dark font-body">
          Telefon raqam <span className="text-brand-deeprose">*</span>
        </label>
        {isAuthenticated && authPhone && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-2">
            <span className="text-green-500 text-sm">✓</span>
            <span className="font-body text-xs text-green-700">
              Tasdiqlangan: {formatPhone(authPhone)}
            </span>
          </div>
        )}
        <input
          className={cn('input-field', errors.phone && 'border-red-400 focus:border-red-400 focus:ring-red-200')}
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+998 90 123 45 67"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
        />
        {errors.phone && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400">
            {errors.phone}
          </motion.p>
        )}
      </div>

      {/* Shahar */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-brand-dark font-body">
          Shahar / Tuman <span className="text-brand-deeprose">*</span>
        </label>
        <input
          className={cn('input-field', errors.city && 'border-red-400 focus:border-red-400 focus:ring-red-200')}
          type="text"
          autoComplete="address-level2"
          placeholder="Toshkent, Yunusobod"
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
        />
        {errors.city && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400">
            {errors.city}
          </motion.p>
        )}
      </div>

      {/* Manzil */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-brand-dark font-body">
          {"To'liq manzil"} <span className="text-brand-deeprose">*</span>
        </label>
        <textarea
          className={cn('input-field', errors.address && 'border-red-400 focus:border-red-400 focus:ring-red-200')}
          autoComplete="street-address"
          rows={3}
          placeholder={"Ko'cha, uy raqami, mo'ljal"}
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
        {errors.address && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400">
            {errors.address}
          </motion.p>
        )}
      </div>

      {/* Izoh */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-brand-dark font-body">Izoh</label>
        <textarea
          className="input-field"
          rows={2}
          placeholder="Qo'shimcha ma'lumot (ixtiyoriy)"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>

      {/* To'lov */}
      <div className="bg-white rounded-2xl border border-brand-border p-4 space-y-2">
        <p className="text-[15px] font-semibold text-brand-dark">{"To'lov usuli"}</p>
        <div className="flex items-start gap-3">
          <div className="w-4 h-4 mt-0.5 rounded-full border-2 border-brand-deeprose flex items-center justify-center shrink-0">
            <div className="w-2 h-2 rounded-full bg-brand-deeprose" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-dark">Naqd pul — yetkazib berganda</p>
            <p className="text-xs text-brand-muted mt-0.5">{"To'lovni kuryer kelganda naqd pul bilan amalga oshirasiz"}</p>
          </div>
          <span className="ml-auto text-xl">💵</span>
        </div>
      </div>

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-brand-border/50 px-4 py-3 flex items-center gap-3"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex flex-col min-w-[90px]">
          <span className="text-[12px] text-brand-muted font-body">Jami:</span>
          <span className="text-[18px] font-bold text-brand-deeprose font-body">{formatPrice(totalPrice)}</span>
        </div>
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={{ scale: 0.97 }}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Yuborilmoqda...
            </>
          ) : (
            <>
              <ShoppingBag size={20} />
              Buyurtmani tasdiqlash
            </>
          )}
        </motion.button>
      </div>

    </form>
    <OTPModal
      isOpen={showOTPModal}
      onClose={() => { setShowOTPModal(false); setPendingSubmit(false) }}
      onSuccess={handleAuthSuccess}
      initialPhone={form.phone}
      title="Buyurtma berish"
      subtitle="Buyurtmangizni tasdiqlash uchun telefon raqamingizni kiriting"
    />
    </>
  )
}
