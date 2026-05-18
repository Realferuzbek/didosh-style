'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import type { Product, Category } from '@/lib/types'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46']
const MAX_IMAGES = 6

export interface ProductPayload {
  name: string
  description: string | null
  price: number
  discount_price: number | null
  category_id: string | null
  images: string[]
  sizes: string[]
  colors: string[]
  stock: number
  is_featured: boolean
  is_active: boolean
}

interface ProductFormProps {
  initialData?: Partial<Product>
  onSubmit: (data: ProductPayload) => Promise<void>
  // isSubmitting handled by parent page sticky bar
  // submitLabel handled by parent page sticky bar
}

// ── Image compression (client-side, no library needed) ─────────────────────
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()

    img.onload = () => {
      // Revoke immediately after load — prevents memory leak
      URL.revokeObjectURL(objectUrl)

      const MAX = 1200
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height / width) * MAX); width = MAX }
        else { width = Math.round((width / height) * MAX); height = MAX }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(file); return }
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return }
          resolve(new File([blob], `image.jpg`, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        0.85 // 85% quality — excellent visually, ~60% smaller file
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file) // fallback: upload original
    }

    img.src = objectUrl
  })
}

// ── Toggle component (reused for is_active and is_featured) ────────────────
function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <span className="text-[13px] text-[#9B7B85]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-deeprose',
          value ? 'bg-brand-deeprose' : 'bg-[#3D2A36]'
        )}
      >
        <motion.div
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
          animate={{ x: value ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </label>
  )
}


// ── Section wrapper — defined at MODULE SCOPE to prevent remount on re-render ─
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#2C1F28] rounded-2xl p-4 border border-[#3D2A36] space-y-4">
      <h3 className="text-white font-semibold text-[15px]">{title}</h3>
      {children}
    </div>
  )
}

// ── Main form ──────────────────────────────────────────────────────────────
export default function ProductForm({
  initialData,
  onSubmit,


}: ProductFormProps) {
  const [name,          setName]          = useState(initialData?.name ?? '')
  const [description,   setDescription]   = useState(initialData?.description ?? '')
  const [price,         setPrice]         = useState(initialData?.price?.toString() ?? '')
  const [discountPrice, setDiscountPrice] = useState(initialData?.discount_price?.toString() ?? '')
  const [categoryId,    setCategoryId]    = useState(initialData?.category_id ?? '')
  const [images,        setImages]        = useState<string[]>(initialData?.images ?? [])
  const [sizes,         setSizes]         = useState<string[]>(initialData?.sizes ?? [])
  const [colors,        setColors]        = useState<string[]>(initialData?.colors ?? [])
  const [colorInput,    setColorInput]    = useState('')
  const [stock,         setStock]         = useState(initialData?.stock?.toString() ?? '0')
  const [isFeatured,    setIsFeatured]    = useState(initialData?.is_featured ?? false)
  const [isActive,      setIsActive]      = useState(initialData?.is_active ?? true)
  const [categories,    setCategories]    = useState<Category[]>([])
  const [uploadingIdx,  setUploadingIdx]  = useState<number | null>(null)

  // Fetch categories once on mount
  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => { if (!cancelled) setCategories(data) })
      .catch(() => toast.error('Kategoriyalar yuklanmadi'))
    return () => { cancelled = true }
  }, []) // empty deps — runs only once

  // ── Image upload ────────────────────────────────────────────────────────
  const handleImageUpload = useCallback(async (file: File, slotIndex: number) => {
    setUploadingIdx(slotIndex)
    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressed)

      const res  = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) { toast.error(data.error ?? 'Yuklashda xatolik'); return }

      setImages(prev => {
        const updated = [...prev]
        updated[slotIndex] = data.url
        return updated
      })
      toast.success('Rasm yuklandi ✓')
    } catch {
      toast.error('Internet aloqasini tekshiring')
    } finally {
      setUploadingIdx(null)
    }
  }, [])

  const handleRemoveImage = useCallback((idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }, [])

  // ── Sizes ───────────────────────────────────────────────────────────────
  const handleToggleSize = useCallback((size: string) => {
    setSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
  }, [])

  // ── Colors ──────────────────────────────────────────────────────────────
  const handleAddColor = useCallback(() => {
    const color = colorInput.trim()
    if (!color) return
    setColors(prev => (prev.includes(color) ? prev : [...prev, color]))
    setColorInput('')
  }, [colorInput])

  const handleRemoveColor = useCallback((color: string) => {
    setColors(prev => prev.filter(c => c !== color))
  }, [])

  // ── Discount preview (memoized via derived value, no useMemo needed) ────
  const priceNum    = Number(price)
  const discountNum = Number(discountPrice)
  const showDiscount =
    price && discountPrice && discountNum > 0 && discountNum < priceNum
  const discountPercent = showDiscount
    ? Math.round(((priceNum - discountNum) / priceNum) * 100)
    : 0
  const discountSaving = showDiscount ? formatPrice(priceNum - discountNum) : ''
  // formatPrice already appends " so'm" — no need to add it again

  // ── Validation ──────────────────────────────────────────────────────────
  function validate(): string | null {
    if (!name.trim())                       return 'Mahsulot nomini kiriting'
    if (!price || priceNum <= 0)            return 'Narxni to\'g\'ri kiriting'
    if (discountPrice && discountNum >= priceNum)
                                            return 'Chegirma narxi asosiy narxdan past bo\'lishi kerak'
    if (images.filter(Boolean).length === 0) return "Kamida 1 ta rasm qo'shing"
    if (sizes.length === 0)                 return "Kamida 1 ta o'lcham tanlang"
    if (Number(stock) < 0)                  return "Noto'g'ri miqdor"
    return null
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const error = validate()
    if (error) { toast.error(error); return }

    await onSubmit({
      name:           name.trim(),
      description:    description.trim() || null,
      price:          priceNum,
      discount_price: discountPrice ? discountNum : null,
      category_id:    categoryId || null,
      images:         images.filter(Boolean), // strip empty slots
      sizes,
      colors,
      stock:          Math.max(0, Number(stock)),
      is_featured:    isFeatured,
      is_active:      isActive,
    })
  }

  // ── Dark input class (reused across fields) ─────────────────────────────
  const darkInput =
    'bg-[#1A1218] border border-[#3D2A36] rounded-xl px-4 py-3 text-white ' +
    'placeholder:text-[#5A4050] focus:border-brand-deeprose focus:outline-none ' +
    'w-full text-[15px] transition-colors duration-150'

  return (
    <form id="product-form" onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* ── 1. Images ───────────────────────────────────────────────────── */}
      <Section title="📸 Rasmlar (6 tagacha)">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {Array.from({ length: MAX_IMAGES }).map((_, i) => {
            const hasImage = Boolean(images[i])
            const isUploading = uploadingIdx === i

            return (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden flex items-center justify-center bg-[#1A1218] border-2 border-dashed border-[#3D2A36]"
              >
                {hasImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={images[i]}
                      alt={`Rasm ${i + 1}`}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                    {i === 0 && (
                      <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[9px] rounded px-1 py-0.5 text-center font-medium tracking-wide">
                        ASOSIY
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center transition-colors z-10"
                      aria-label="Rasmni o'chirish"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : isUploading ? (
                  <svg
                    className="animate-spin h-7 w-7 text-brand-deeprose"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-label="Yuklanmoqda"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  // No `capture` attribute — lets user choose camera OR gallery
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-[#2C1F28] transition-colors">
                    <Plus size={24} className="text-[#5A4050]" />
                    <span className="text-[#5A4050] text-[10px] mt-1 text-center leading-tight px-1">
                      Rasm<br />qo&apos;shish
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      aria-label={`${i + 1}-rasm yuklash`}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, i)
                        // Reset input so same file can be re-selected
                        e.target.value = ''
                      }}
                    />
                  </label>
                )}
              </div>
            )
          })}
        </div>
        <p className="text-[11px] text-[#5A4050]">
          Birinchi rasm asosiy rasm bo&apos;ladi · JPG, PNG, WEBP · 5MB gacha
        </p>
      </Section>

      {/* ── 2. Basic info ────────────────────────────────────────────────── */}
      <Section title="📝 Asosiy ma'lumot">
        <div className="space-y-1.5">
          <label className="text-[13px] text-[#9B7B85]">Mahsulot nomi *</label>
          <input
            type="text"
            className={darkInput}
            placeholder="Gul naqshli yozgi ko'ylak"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={200}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] text-[#9B7B85]">Tavsif</label>
          <textarea
            rows={3}
            className={cn(darkInput, 'resize-none')}
            placeholder="Mahsulot haqida qisqacha..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={1000}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] text-[#9B7B85]">Kategoriya</label>
          <select
            className={cn(darkInput, 'cursor-pointer')}
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
          >
            <option value="">Kategoriyasiz</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </Section>

      {/* ── 3. Pricing ───────────────────────────────────────────────────── */}
      <Section title="💰 Narx">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] text-[#9B7B85]">Asosiy narx (so&apos;m) *</label>
            <input
              type="number"
              min={0}
              step={1000}
              className={darkInput}
              placeholder="189000"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-[#9B7B85]">Chegirma narxi (so&apos;m)</label>
            <input
              type="number"
              min={0}
              step={1000}
              className={darkInput}
              placeholder="149000 (ixtiyoriy)"
              value={discountPrice}
              onChange={e => setDiscountPrice(e.target.value)}
            />
          </div>
        </div>
        {showDiscount && (
          <p className="text-[13px] text-brand-deeprose font-medium">
            💡 Chegirma: {discountPercent}% — {discountSaving} tejaysiz
          </p>
        )}
      </Section>

      {/* ── 4. Sizes ─────────────────────────────────────────────────────── */}
      <Section title="📏 O'lchamlar *">
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map(size => (
            <button
              key={size}
              type="button"
              onClick={() => handleToggleSize(size)}
              className={cn(
                'border rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150',
                sizes.includes(size)
                  ? 'bg-brand-deeprose text-white border-brand-deeprose'
                  : 'bg-[#1A1218] text-[#9B7B85] border-[#3D2A36] hover:border-[#9B7B85]'
              )}
            >
              {size}
            </button>
          ))}
        </div>
        {sizes.length > 0 && (
          <p className="text-[12px] text-[#9B7B85]">
            Tanlangan: {sizes.join(', ')}
          </p>
        )}
      </Section>

      {/* ── 5. Colors ────────────────────────────────────────────────────── */}
      <Section title="🎨 Ranglar">
        <div className="flex gap-2">
          <input
            type="text"
            className={cn(darkInput, 'flex-1')}
            placeholder="Masalan: Qizil, Ko'k, Oq"
            value={colorInput}
            onChange={e => setColorInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); handleAddColor() }
            }}
            maxLength={50}
          />
          <button
            type="button"
            onClick={handleAddColor}
            disabled={!colorInput.trim()}
            className="bg-brand-deeprose disabled:opacity-40 text-white rounded-xl px-4 flex items-center gap-1 hover:bg-[#C05A7A] transition-colors shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <span
                key={color}
                className="bg-[#1A1218] border border-[#3D2A36] rounded-full px-3 py-1 text-sm text-white flex items-center gap-1.5"
              >
                {color}
                <button
                  type="button"
                  onClick={() => handleRemoveColor(color)}
                  className="text-[#9B7B85] hover:text-red-400 transition-colors"
                  aria-label={`${color} rangini o'chirish`}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}
      </Section>

      {/* ── 6. Stock & toggles ───────────────────────────────────────────── */}
      <Section title="📦 Ombor va sozlamalar">
        <div className="space-y-1.5">
          <label className="text-[13px] text-[#9B7B85]">Ombordagi miqdor *</label>
          <input
            type="number"
            min={0}
            step={1}
            className={cn(darkInput, 'max-w-[180px]')}
            placeholder="10"
            value={stock}
            onChange={e => setStock(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-4 pt-1">
          <Toggle
            label="Faol — foydalanuvchilarga ko'rinadi"
            value={isActive}
            onChange={setIsActive}
          />
          <Toggle
            label="Featured — bosh sahifada ko'rsatish"
            value={isFeatured}
            onChange={setIsFeatured}
          />
        </div>
      </Section>

      {/* ── Sticky submit bar ─────────────────────────────────────────────── */}
      {/* Rendered inside the form for layout; actual button is in parent page */}
    </form>
  )
}