"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import toast from "react-hot-toast"
import { ChevronLeft, Pencil, Trash2, Search } from "lucide-react"
import AdminNav from "@/components/admin/AdminNav"
import { formatPrice, cn } from "@/lib/utils"
import type { Product } from "@/lib/types"

export default function AdminProductsPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth")
    if (auth !== "true") {
      router.replace("/admin")
    } else {
      setIsAuthed(true)
    }
  }, [router])

  async function fetchProducts() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/products")
      const data = await res.json()
      setProducts(data)
    } catch {
      toast.error("Mahsulotlarni yuklashda xatolik")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthed) fetchProducts()
  }, [isAuthed])

  async function handleToggleActive(product: Product) {
    setTogglingId(product.id)
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, is_active: !product.is_active }),
      })
      if (!res.ok) throw new Error()
      setProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p)
      )
      toast.success(product.is_active ? "Yashirildi" : "Ko'rsatildi")
    } catch {
      toast.error("Xatolik yuz berdi")
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" mahsulotini o'chirishni tasdiqlaysizmi?`)) return
    setDeletingId(id)
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success("Mahsulot o'chirildi")
    } catch {
      toast.error("O'chirishda xatolik")
    } finally {
      setDeletingId(null)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_auth")
    router.replace("/admin")
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  // Stats
  const total = products.length
  const active = products.filter(p => p.is_active).length
  const inactive = total - active

  return (
    <div className="min-h-screen bg-[#1A1218]">
      <AdminNav onLogout={handleLogout} />

      {/* Top bar */}
      <div className="sticky top-[56px] z-20 bg-[#1A1218]/90 backdrop-blur-xl border-b border-[#3D2A36] px-4 py-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => router.push("/admin")}
            className="p-2 rounded-xl hover:bg-[#2C1F28] text-[#9B7B85] hover:text-white transition"
            aria-label="Orqaga"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-lg">Mahsulotlar</span>
            <span className="bg-[#2C1F28] border border-[#3D2A36] rounded-full px-2 py-0.5 text-xs text-[#9B7B85]">
              {total}
            </span>
          </div>
          <button
            onClick={() => router.push("/admin/products/new")}
            className="bg-brand-deeprose text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#C05A7A] transition-colors"
          >
            ＋ Yangi mahsulot
          </button>
        </div>
        <div className="relative mt-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#2C1F28] border border-[#3D2A36] rounded-xl px-4 py-2.5 text-white placeholder:text-[#5A4050] focus:border-brand-deeprose focus:outline-none w-full text-[14px] pl-10"
            placeholder="Mahsulot nomini qidiring..."
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A4050]" />
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto hide-scrollbar">
        <div className="bg-[#2C1F28] border border-[#3D2A36] rounded-full px-3 py-1 text-[12px] text-[#9B7B85] flex items-center gap-1">
          👗 {total} jami
        </div>
        <div className="bg-[#2C1F28] border border-brand-deeprose rounded-full px-3 py-1 text-[12px] text-brand-deeprose flex items-center gap-1">
          ✅ {active} faol
        </div>
        <div className="bg-[#2C1F28] border border-[#3D2A36] rounded-full px-3 py-1 text-[12px] text-[#9B7B85] flex items-center gap-1">
          🔴 {inactive} yashirin
        </div>
      </div>

      {/* Products list */}
      <div className="px-4 py-3 space-y-2 pb-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#2C1F28] rounded-2xl h-[72px] skeleton"
            />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-5xl mb-2">📦</div>
            <div className="text-white text-xl font-semibold mb-1">Mahsulotlar topilmadi</div>
            <div className="text-[#9B7B85] text-sm mb-4">Yangi mahsulot qo&#39;shing</div>
            <button
              onClick={() => router.push("/admin/products/new")}
              className="bg-brand-deeprose text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#C05A7A] transition-colors"
            >
              ＋ Yangi mahsulot
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
              >
                <div className="bg-[#2C1F28] rounded-2xl p-3 flex items-center gap-3 border border-[#3D2A36] hover:border-[#5A4050] transition-colors">
                  {/* Image */}
                  {product.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-[#3D2A36] rounded-xl flex items-center justify-center text-2xl">👗</div>
                  )}
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-[15px] truncate">{product.name}</div>
                    <div className="flex items-center gap-2 text-[#9B7B85] text-[13px] mt-0.5">
                      <span>{product.categories?.name || "Kategoriyasiz"}</span>
                      <span>·</span>
                      <span>{formatPrice(product.discount_price ?? product.price)}</span>
                      <span>·</span>
                      {/* Stock badge */}
                      {product.stock === 0 ? (
                        <span className="bg-red-500/20 text-red-400 rounded-full px-2 py-0.5 text-[11px]">Tugagan</span>
                      ) : product.stock <= 5 ? (
                        <span className="bg-orange-500/20 text-orange-400 rounded-full px-2 py-0.5 text-[11px]">Kam: {product.stock} ta</span>
                      ) : (
                        <span className="bg-green-500/20 text-green-400 rounded-full px-2 py-0.5 text-[11px]">{product.stock} ta</span>
                      )}
                      {product.discount_price && (
                        <span className="ml-2 bg-brand-deeprose/20 text-brand-deeprose rounded-full px-2 py-0.5 text-[11px]">chegirma</span>
                      )}
                    </div>
                  </div>
                  {/* Toggle active */}
                  <div className="flex items-center gap-1">
                    {togglingId === product.id ? (
                      <span className="w-11 h-6 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-brand-deeprose" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleActive(product)}
                        disabled={togglingId === product.id}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0",
                          product.is_active ? "bg-brand-deeprose" : "bg-[#3D2A36]"
                        )}
                        aria-label="Faollikni o'zgartirish"
                      >
                        <motion.div
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
                          animate={{ x: product.is_active ? 20 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                    )}
                    {/* Edit */}
                    <button
                      onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                      className="p-2 rounded-xl hover:bg-[#3D2A36] text-[#9B7B85] hover:text-white transition"
                      aria-label="Tahrirlash"
                    >
                      <Pencil size={18} />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-2 rounded-xl hover:bg-red-400/10 text-[#9B7B85] hover:text-red-400 transition"
                      aria-label="O'chirish"
                      disabled={deletingId === product.id}
                    >
                      {deletingId === product.id ? (
                        <svg className="animate-spin h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}