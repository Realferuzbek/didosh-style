
"use client"

import { useState, useEffect } from 'react'
import LoginForm from '@/components/admin/LoginForm'
import AdminNav from '@/components/admin/AdminNav'

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check sessionStorage on mount
    const auth = sessionStorage.getItem('admin_auth')
    setIsAuthed(auth === 'true')
    setIsChecking(false)
  }, [])

  function handleLogout() {
    sessionStorage.removeItem('admin_auth')
    setIsAuthed(false)
  }

  // While checking auth state, show nothing (prevents flash)
  if (isChecking) {
    return <div className="min-h-screen bg-[#1A1218]" />
  }

  // Not authenticated → show login
  if (!isAuthed) {
    return <LoginForm onSuccess={() => setIsAuthed(true)} />
  }

  // Authenticated → show admin dashboard shell
  return (
    <>
      <AdminNav onLogout={handleLogout} />
      <main className="p-4 md:p-6 max-w-screen-xl mx-auto">
        {/* Dashboard content — placeholder for P6B */}
        <div className="mt-4">
          <h1 className="font-display text-3xl text-white mb-2">Bosh sahifa</h1>
          <p className="text-[#9B7B85] text-sm">
            Mahsulotlar va buyurtmalarni boshqaring.
          </p>
          {/* Quick stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Jami mahsulotlar", value: "8", icon: "👗" },
              { label: "Yangi buyurtmalar", value: "0", icon: "📦" },
              { label: "Bugun tushum", value: "0 so'm", icon: "💰" },
              { label: "Jami buyurtmalar", value: "0", icon: "📋" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#2C1F28] rounded-2xl p-4 border border-[#3D2A36]"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-white font-semibold text-xl">{stat.value}</div>
                <div className="text-[#9B7B85] text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Navigation cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <a
              href="/admin/products"
              className="bg-[#2C1F28] border border-[#3D2A36] rounded-2xl p-6 flex items-center gap-4 hover:border-brand-deeprose transition-colors group"
            >
              <div className="w-12 h-12 bg-brand-deeprose/20 rounded-xl flex items-center justify-center text-2xl">
                👗
              </div>
              <div>
                <div className="text-white font-semibold text-base group-hover:text-brand-rose transition-colors">
                  Mahsulotlarni boshqarish
                </div>
                <div className="text-[#9B7B85] text-sm mt-0.5">
                  Qo&#39;shish, tahrirlash, o&#39;chirish
                </div>
              </div>
              <div className="ml-auto text-[#9B7B85]">→</div>
            </a>

            <a
              href="/admin/orders"
              className="bg-[#2C1F28] border border-[#3D2A36] rounded-2xl p-6 flex items-center gap-4 hover:border-brand-deeprose transition-colors group"
            >
              <div className="w-12 h-12 bg-brand-deeprose/20 rounded-xl flex items-center justify-center text-2xl">
                📋
              </div>
              <div>
                <div className="text-white font-semibold text-base group-hover:text-brand-rose transition-colors">
                  Buyurtmalar
                </div>
                <div className="text-[#9B7B85] text-sm mt-0.5">
                  Barcha buyurtmalarni ko&#39;rish
                </div>
              </div>
              <div className="ml-auto text-[#9B7B85]">→</div>
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
