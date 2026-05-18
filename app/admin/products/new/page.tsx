'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminNav from '@/components/admin/AdminNav'
import ProductForm, { type ProductPayload } from '@/components/admin/ProductForm'

export default function NewProductPage() {
  const router = useRouter()
  const [isAuthed,     setIsAuthed]     = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Auth guard ─────────────────────────────────────────────────────────
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

  // ── Create product ─────────────────────────────────────────────────────
  const handleCreate = useCallback(async (payload: ProductPayload) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Xatolik yuz berdi')
        return
      }
      toast.success("Mahsulot qo'shildi! 🎉")
      router.push('/admin/products')
    } catch {
      toast.error('Internet aloqasini tekshiring')
    } finally {
      setIsSubmitting(false)
    }
  }, [router])

  // ── Guard: don't render until authed ──────────────────────────────────
  if (!isAuthed) {
    return <div className="min-h-screen bg-[#1A1218]" />
  }

  return (
    <div className="min-h-screen bg-[#1A1218]">
      <AdminNav onLogout={handleLogout} />

      {/* Sticky page header */}
      <div className="sticky top-[56px] z-20 bg-[#1A1218]/95 backdrop-blur-xl border-b border-[#3D2A36] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-[#2C1F28] text-[#9B7B85] hover:text-white transition-colors"
          aria-label="Orqaga"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-display text-xl text-white">Yangi mahsulot</h1>
      </div>

      {/* Form content */}
      <div className="max-w-2xl mx-auto px-4 py-5 pb-32">
        <ProductForm
          onSubmit={handleCreate}
        />
      </div>

      {/* Sticky submit bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1218]/95 backdrop-blur-xl border-t border-[#3D2A36] px-4 py-3 flex gap-3 z-30"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-[#3D2A36] text-[#9B7B85] rounded-xl py-3 font-medium hover:bg-[#2C1F28] transition-colors"
        >
          Bekor qilish
        </button>
        <button
          type="submit"
          form="product-form"
          disabled={isSubmitting}
          className="flex-[2] bg-brand-deeprose text-white rounded-xl py-3 font-medium hover:bg-[#C05A7A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Saqlanmoqda...
            </>
          ) : (
            'Mahsulotni saqlash'
          )}
        </button>
      </div>
    </div>
  )
}