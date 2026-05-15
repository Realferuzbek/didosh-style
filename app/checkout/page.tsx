'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import OrderSummary from '@/components/checkout/OrderSummary'

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)

  useEffect(() => {
    if (items.length === 0) router.replace('/cart')
  }, [items.length, router])

  if (items.length === 0) return null

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 h-[52px] flex items-center justify-between px-4 bg-brand-cream/90 backdrop-blur-xl border-b border-brand-border/40">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-brand-blush active:scale-95"
        >
          <ChevronLeft size={22} className="text-brand-dark" />
        </button>
        <span className="font-display text-[20px] font-semibold text-brand-dark">Buyurtma</span>
        <div className="w-9" />
      </header>

      {/* Content */}
      <main className="page-container py-5 pb-[96px] space-y-5">
        <OrderSummary />
        <CheckoutForm />
      </main>
    </>
  )
}